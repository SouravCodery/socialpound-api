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
import { persistentRedisClient } from "../../config/redis-persistent.config";

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
    await commentQueue.add("add-comment", {
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

    throw new HttpError(500, "Something went wrong in comment addition");
  }
};

export const addComment = async ({
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
    const postExists = await Post.exists({ _id: post, isDeleted: false });

    if (!postExists) {
      throw new HttpError(404, "Post not found");
    }

    if (commentOn === "Comment") {
      const parentCommentExists = await Comment.findOne({
        _id: parentComment,
        isDeleted: false,
      }).select("commentOn");

      if (!parentCommentExists) {
        throw new HttpError(404, "Parent comment not found");
      }

      if (parentCommentExists.commentOn !== "Post") {
        throw new HttpError(400, "Reply to a comment reply is not allowed");
      }
    }

    const newComment = new Comment({
      commentOn,
      post,
      parentComment,
      user,
      text,
    });

    await newComment.save();

    return new HttpResponse({
      status: 201,
      message: "Comment added successfully",
    });
  } catch (error) {
    logger.error("[Service: addComment] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, "Something went wrong in comment addition");
  }
};

const getMultipleCommentsCounters = async ({
  comments,
}: {
  comments: CommentWithIdInterface[];
}) => {
  try {
    const multi = persistentRedisClient.multi();

    comments.forEach((comment) => {
      multi.hGetAll(`Comment:${comment?._id}:counter`);
    });

    let counters = await multi.exec();
    return counters;
  } catch (error) {
    logger.error("[Service: getCommentCounters] - Something went wrong", error);

    return [];
  }
};

const getCommentsWithCounters = async ({
  comments,
}: {
  comments: CommentWithIdInterface[];
}) => {
  try {
    const counters = await getMultipleCommentsCounters({ comments });
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
      .populate("user", "username profilePicture")
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

    throw new HttpError(500, "Something went wrong in fetching comments");
  }
};
