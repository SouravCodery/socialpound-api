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
    logger.error("[Service: addLike] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, "Something went wrong in comment addition");
  }
};

export const likePosts = async ({ likes }: { likes: LikeInterface[] }) => {
  try {
    const postExists = await Post.find({
      _id: { $in: likes.map((like) => like.post) },
      isDeleted: { $ne: true },
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
      console.log(error);
      if (error?.insertedDocs) {
        successfullyInsertedLikes = error?.insertedDocs;
      }
    }

    const postIsForCounterIncrements = successfullyInsertedLikes.map((like) =>
      like.post.toString()
    );

    return new HttpResponse({
      status: 201,
      message: "Likes added successfully",
      data: successfullyInsertedLikes,
    });
  } catch (error) {
    logger.error("[Service: likePosts] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, "Something went wrong in liking post");
  }
};
