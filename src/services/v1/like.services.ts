import { FilterQuery } from "mongoose";
import { HttpError } from "../../classes/http-error.class";
import { HttpResponse } from "../../classes/http-response.class";

import { logger } from "../../logger/index.logger";

import Like from "../../models/like.model";
import Post from "../../models/post.model";
import { likeQueue } from "../../mq/bull-mq/index.bull-mq";

import {
  LikeDocumentInterface,
  LikeInterface,
} from "../../interfaces/like.interface";
import { incrementLikeOrCommentCountInBulk } from "./persistent-redis.services";

export const addLikeToQueue = async ({
  likeOn,
  post,
  comment,
  liker,
}: {
  likeOn: LikeInterface["likeOn"];
  post: LikeInterface["post"];
  comment: LikeInterface["comment"];
  liker: LikeInterface["liker"];
}) => {
  try {
    const jobName = `like-${likeOn}`;

    await likeQueue.add(jobName, {
      likeOn,
      post,
      comment,
      liker,
    });

    return new HttpResponse({
      status: 202,
      message: "Like addition request added to the queue",
    });
  } catch (error) {
    logger.error("[Service: addLikeToQueue] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(
      500,
      "[Service: addLikeToQueue] - Something went wrong"
    );
  }
};

export const likePosts = async ({ likes }: { likes: LikeInterface[] }) => {
  try {
    const postExists = await Post.find({
      _id: { $in: likes.map((like) => like.post) },
      isDeleted: false,
    }).select("_id");

    const existingPostsSet = new Set(
      postExists.map((post) => post._id.toString())
    );

    const likesToBeInserted = likes.filter((like) =>
      existingPostsSet.has(like.post.toString())
    );

    let successfullyInsertedLikes: LikeDocumentInterface[] = [];
    try {
      successfullyInsertedLikes = await Like.insertMany(likesToBeInserted, {
        ordered: false,
      });
    } catch (error: any) {
      if (error?.insertedDocs) {
        successfullyInsertedLikes = error?.insertedDocs;
      }
    }

    const postIsForCounterIncrements = successfullyInsertedLikes.map((like) =>
      like.post.toString()
    );

    await incrementLikeOrCommentCountInBulk({
      entityType: "Post",
      ids: postIsForCounterIncrements,
      countType: "likesCount",
    });

    return new HttpResponse({
      status: 201,
      message: "Likes added successfully",
    });
  } catch (error) {
    logger.error("[Service: likePosts] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, "[Service: likePosts] - Something went wrong");
  }
};

export const getLikesByPostId = async ({
  postId,
  cursor,
  limit = 20,
}: {
  postId: string;
  cursor?: string;
  limit?: number;
}) => {
  try {
    const query: FilterQuery<LikeInterface> = {
      post: postId,
      likeOn: "Post",
      isDeleted: false,
    };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const likes = await Like.find(query)
      .limit(limit)
      .sort({ _id: -1 })
      .populate("liker", "username fullName profilePicture -_id")
      .select("liker")
      .lean();

    const nextCursor =
      likes.length >= limit ? likes[likes.length - 1]._id.toString() : null;

    return new HttpResponse({
      status: 200,
      message: "Likes fetched successfully",
      data: {
        likes,
        nextCursor,
      },
    });
  } catch (error) {
    logger.error("[Service: getLikesByPostId] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(
      500,
      "[Service: getLikesByPostId] - Something went wrong"
    );
  }
};

export const getPostLikedByUser = async ({ user }: { user: string }) => {
  try {
    const query: FilterQuery<LikeInterface> = {
      liker: user,
      likeOn: "Post",
      isDeleted: false,
    };

    const likes = await Like.find(query)
      .limit(1000)
      .sort({ _id: -1 })
      .select("post -_id")
      .lean();

    const postIds = likes.map((like) => like.post);

    return new HttpResponse({
      status: 200,
      message: "Likes fetched successfully",
      data: {
        likes: postIds,
      },
    });
  } catch (error) {
    logger.error("[Service: getPostLikedByUser] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(
      500,
      "[Service: getPostLikedByUser] - Something went wrong"
    );
  }
};

export const unlikePost = async ({
  post,
  liker,
}: {
  post: string;
  liker: string;
}) => {
  try {
    const query: FilterQuery<LikeInterface> = {
      post,
      liker,
      likeOn: "Post",
    };

    const result = await Like.deleteOne(query);

    if (result.deletedCount === 1) {
      await incrementLikeOrCommentCountInBulk({
        entityType: "Post",
        ids: [post],
        countType: "likesCount",
        incrementBy: -1,
      });
    }

    return new HttpResponse({
      status: 200,
      message: "Post unlike successful",
    });
  } catch (error) {
    logger.error("[Service: unlikePost] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, "[Service: unlikePost] - Something went wrong");
  }
};
