import { FilterQuery } from "mongoose";
import { HttpError } from "../../classes/http-error.class";
import { HttpResponse } from "../../classes/http-response.class";

import { logger } from "../../logger/index.logger";

import Comment from "../../models/comment.model";
import Post from "../../models/post.model";
import { commentQueue } from "../../mq/bull-mq/index.bull-mq";

import {
  CommentInterface,
  CommentWithIdInterface,
} from "./../../interfaces/comment.interface";
import {
  getLikeAndCommentsCountInBulk,
  incrementLikeOrCommentCountInBulk,
} from "./persistent-redis.services";
import { addNotificationsToQueue } from "./notification.services";
import { NotificationJobInterface } from "../../interfaces/notification.interface";
import { PostInterface } from "../../interfaces/post.interface";

export const addCommentToQueue = async ({
  commentOn,

  post,
  parentComment,
  user,

  text,
}: {
  commentOn: CommentInterface["commentOn"];

  post: CommentInterface["post"];
  parentComment: CommentInterface["parentComment"];
  user: CommentInterface["user"];

  text: CommentInterface["text"];
}) => {
  try {
    await commentQueue.add(`comment-on-${commentOn}`, {
      commentOn,

      post,
      parentComment,
      user,

      text,
    });

    return new HttpResponse({
      status: 202,
      message: "Comment creation request added to the queue",
      toastMessage: "Your comment will reflect soon",
    });
  } catch (error) {
    logger.error("[Service: addComment] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError({
      status: 500,
      message: "Something went wrong in comment addition",
    });
  }
};

export const addCommentsOnPosts = async ({
  comments,
}: {
  comments: CommentInterface[];
}) => {
  try {
    //db insert begins
    const postExists = await Post.find({
      _id: { $in: comments.map((comment) => comment.post) },
      isDeleted: false,
    })
      .select("_id user")
      .lean();

    const existingPostsMap = new Map(
      postExists.map((post) => [post._id.toString(), post])
    );

    const commentsToBeInserted = comments.filter((comment) =>
      existingPostsMap.has(comment.post.toString())
    );

    let successfullyInsertedComments: CommentWithIdInterface[] = [];
    try {
      successfullyInsertedComments = await Comment.insertMany(
        commentsToBeInserted,
        {
          ordered: false,
        }
      );
    } catch (error: any) {
      if (error?.insertedDocs) {
        successfullyInsertedComments = error?.insertedDocs;
      }
    }

    //kv increment begins
    const postIsForCounterIncrements = successfullyInsertedComments.map(
      (comment) => comment.post.toString()
    );

    await incrementLikeOrCommentCountInBulk({
      entityType: "Post",
      ids: postIsForCounterIncrements,
      countType: "commentsCount",
    });

    //notification addition begins
    const notificationJobs: NotificationJobInterface[] = [];

    successfullyInsertedComments.forEach((comment) => {
      const recipient = existingPostsMap.get(comment.post.toString())?.user;

      if (recipient && comment.user !== recipient) {
        notificationJobs.push({
          name: "add-notification",
          data: {
            recipient,
            sender: comment.user,
            type: "comment",
            post: comment.post,
            comment: comment._id,
          },
        });
      }
    });

    await addNotificationsToQueue({
      jobs: notificationJobs,
    });

    return new HttpResponse({
      status: 201,
      message: "Comments added successfully",
    });
  } catch (error) {
    logger.error("[Service: addCommentsOnPosts] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError({
      status: 500,
      message: "Something went wrong while adding comments",
    });
  }
};

const getCommentsWithCounters = async ({
  comments,
}: {
  comments: CommentWithIdInterface[];
}) => {
  try {
    const counters = await getLikeAndCommentsCountInBulk({
      entityType: "Comment",
      ids: comments.map((comment) => comment._id.toString()),
    });

    const commentsWithCounters = comments.map((comment, index) => {
      const count = (counters?.[index] ?? {}) as {
        likesCount: string;
        commentsCount: string;
      };

      return {
        ...comment,
        likesCount: Number(count?.likesCount ?? 0),
        commentsCount: Number(count?.commentsCount ?? 0),
      };
    });

    return commentsWithCounters;
  } catch (error) {
    logger.error(
      "[Service: getCommentsWithCounters] - Something went wrong",
      error
    );

    return null;
  }
};

export const getCommentsByPostId = async ({
  postId,
  cursor,
  limit = 20,
}: {
  postId: string;
  cursor?: string;
  limit?: number;
}) => {
  try {
    //todo: Caching and Bringing likesCount and repliesCount from Redis
    const query: FilterQuery<CommentInterface> = {
      post: postId,
      commentOn: "Post",
      isDeleted: false,
    };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const comments = await Comment.find(query)
      .limit(limit)
      .sort({ _id: -1 })
      .populate({
        path: "user",
        select: "username fullName profilePicture",
        match: { isDeleted: false },
      })
      .lean();

    const nextCursor =
      comments.length >= limit
        ? comments[comments.length - 1]._id.toString()
        : null;

    const commentsWithCounters =
      (await getCommentsWithCounters({ comments })) ?? comments;

    return new HttpResponse({
      status: 200,
      message: "Comments fetched successfully",
      data: {
        comments: commentsWithCounters,
        nextCursor,
      },
    });
  } catch (error) {
    logger.error(
      "[Service: getCommentsByPostId] - Something went wrong",
      error
    );

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError({
      status: 500,
      message: "Something went wrong in fetching comments",
    });
  }
};

export const deleteCommentById = async ({
  user,
  commentId,
}: {
  user: string;
  commentId: string;
}) => {
  try {
    const comment = await Comment.findOne({
      _id: commentId,
      isDeleted: false,
    })
      .select("user post")
      .populate<{ post: PostInterface }>({
        path: "post",
        select: "user",
        match: { isDeleted: false },
      });

    if (!comment) {
      throw new HttpError({
        status: 404,
        message: "[Service: deleteCommentById] - Comment not found",
      });
    }

    if (
      (comment.user.toString() === user ||
        comment.post.user.toString() === user) === false
    ) {
      throw new HttpError({
        status: 403,
        message:
          "[Service: deleteCommentById] - Unauthorized to delete this comment",
      });
    }

    await comment.softDelete();

    if (comment?.post) {
      await incrementLikeOrCommentCountInBulk({
        entityType: "Post",
        ids: [comment.post.toString()],
        countType: "commentsCount",
        incrementBy: -1,
      });
    }

    return new HttpResponse({
      status: 200,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    logger.error("[Service: deleteCommentById] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError({
      status: 500,
      message: "[Service: deleteCommentById] - Something went wrong",
    });
  }
};
