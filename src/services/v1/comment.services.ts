import { FilterQuery } from "mongoose";
import { HttpError } from "../../classes/http-error.class";
import { HttpResponse } from "../../classes/http-response.class";

import { logger } from "../../logger/index.logger";

import Comment from "../../models/comment.model";
import Post from "../../models/post.model";
import { commentQueue } from "../../mq/bull-mq/index.bull-mq";

import {
  CommentDocumentInterface,
  CommentInterface,
} from "./../../interfaces/comment.interface";

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

export const getCommentsByPostId = async ({
  postId,
  cursor,
}: {
  postId: string;
  cursor?: string;
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
      .limit(10)
      .sort({ _id: -1 })
      .populate("user", "userName profilePicture")
      .lean();

    const nextCursor = comments.length
      ? comments[comments.length - 1]._id.toString()
      : null;

    return new HttpResponse({
      status: 200,
      message: "Comments fetched successfully",
      data: {
        comments,
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
