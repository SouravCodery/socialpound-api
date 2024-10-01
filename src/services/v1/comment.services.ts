import { FilterQuery } from "mongoose";

import { Config } from "../../config/config";
import Comment from "../../models/comment.model";
import Post from "../../models/post.model";
import { HttpError } from "../../classes/http-error.class";
import { HttpResponse } from "../../classes/http-response.class";
import {
  CommentInterface,
  CommentWithIdInterface,
} from "./../../interfaces/comment.interface";
import { NotificationJobInterface } from "../../interfaces/notification.interface";

import { commentQueue } from "../../mq/bull-mq/index.bull-mq";
import {
  getLikeAndCommentsCountInBulk,
  incrementLikeOrCommentCountInBulk,
} from "./redis-key-value-store.services";
import { deleteAPICache } from "./redis-cache.services";
import {
  addNotificationsToQueue,
  deleteNotifications,
} from "./notification.services";
import { logger } from "../../logger/index.logger";

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
      isUserDeleted: false,
    })
      .select("_id user")
      .lean();

    const existingPostsMap = new Map(
      postExists.map((post) => [post._id.toString(), post])
    );

    const commentsToBeInserted = comments
      .filter((comment) => existingPostsMap.has(comment.post.toString()))
      .map((comment) => {
        return {
          ...comment,
          postBy: existingPostsMap.get(comment.post.toString())?.user,
        };
      });

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
    const successfullyInsertedCommentsPostId = successfullyInsertedComments.map(
      (comment) => comment.post.toString()
    );

    await incrementLikeOrCommentCountInBulk({
      entityType: "Post",
      ids: successfullyInsertedCommentsPostId,
      countType: "commentsCount",
    });

    //cache purge
    await deleteAPICache({
      keys: successfullyInsertedCommentsPostId.map((postId) => ({
        url: "/v1/comment",
        params: { postId },
        query: {},
        authenticatedUserId: null,
      })),
    });

    //notification addition begins
    const notificationJobs: NotificationJobInterface[] = [];

    successfullyInsertedComments.forEach((comment) => {
      const recipient = existingPostsMap.get(comment.post.toString())?.user;

      if (recipient && comment.user.toString() !== recipient.toString()) {
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
  limit = Config.PAGINATION_LIMIT,
}: {
  postId: string;
  cursor?: string;
  limit?: number;
}) => {
  try {
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
        select: "username email fullName profilePicture",
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

//todo: Do this via queue in batches
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
    }).select("user post postBy");

    if (!comment) {
      throw new HttpError({
        status: 404,
        message: "[Service: deleteCommentById] - Comment not found",
      });
    }

    if (
      (comment?.user?.toString() === user ||
        comment?.postBy?.toString() === user) === false
    ) {
      throw new HttpError({
        status: 403,
        message:
          "[Service: deleteCommentById] - Unauthorized to delete this comment",
      });
    }

    await comment.softDelete();

    await deleteNotifications({
      comment: commentId,
    });

    const postId = comment.post.toString();
    await incrementLikeOrCommentCountInBulk({
      entityType: "Post",
      ids: [postId],
      countType: "commentsCount",
      incrementBy: -1,
    });

    // cache purge
    await deleteAPICache({
      keys: [
        {
          url: "/v1/comment",
          params: { postId },
          query: {},
          authenticatedUserId: null,
        },
      ],
    });

    return new HttpResponse({
      status: 200,
      message: "Comment deleted successfully",
      toastMessage: "Comment deleted successfully",
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
