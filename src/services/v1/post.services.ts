import { FilterQuery } from "mongoose";
import { HttpError } from "../../classes/http-error.class";
import { HttpResponse } from "../../classes/http-response.class";

import { logger } from "../../logger/index.logger";
import Post from "../../models/post.model";

import {
  PostInterface,
  PostWithIdInterface,
} from "./../../interfaces/post.interface";

import { getLikeAndCommentsCountInBulk } from "./persistent-redis.services";
import { incrementPostsCountForUser } from "./user.services";

export const createPost = async ({
  user,
  content,
  caption,
}: {
  user: PostInterface["user"];
  content: PostInterface["content"];
  caption: PostInterface["caption"];
}) => {
  try {
    const newPost = new Post({
      user,
      content,
      caption,
    });

    await newPost.save();
    await incrementPostsCountForUser({ user: user.toString() });

    return new HttpResponse({
      status: 201,
      message: "Post created successfully",
    });
  } catch (error) {
    logger.error("[Service: createPost] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, "[Service: createPost] - Something went wrong");
  }
};

const getPostsWithCounters = async ({
  posts,
}: {
  posts: PostWithIdInterface[];
}) => {
  try {
    const counters = await getLikeAndCommentsCountInBulk({
      entityType: "Post",
      ids: posts.map((post) => post._id.toString()),
    });

    const postsWithCounters = posts.map((post, index) => {
      const count = (counters?.[index] ?? {}) as {
        likesCount: string;
        commentsCount: string;
      };

      return {
        ...post,
        likesCount: Number(count?.likesCount ?? 0),
        commentsCount: Number(count?.commentsCount ?? 0),
      };
    });

    return postsWithCounters;
  } catch (error) {
    logger.error(
      "[Service: getPostsWithCounters] - Something went wrong",
      error
    );

    return null;
  }
};

export const getPosts = async ({
  userId,
  cursor,
  limit = 10,
}: {
  userId?: string;
  cursor?: string;
  limit?: number;
}) => {
  try {
    //todo: Caching
    const query: FilterQuery<PostInterface> = {
      isDeleted: false,
    };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    if (userId) {
      query.user = userId;
    }

    const posts = await Post.find(query)
      .limit(limit)
      .sort({ _id: -1 })
      .populate("user", "username fullName profilePicture -_id")
      .select("-createdAt -updatedAt -__v")
      .lean();

    const nextCursor =
      posts.length >= limit ? posts[posts.length - 1]._id.toString() : null;

    const postsWithCounters = (await getPostsWithCounters({ posts })) ?? posts;

    return new HttpResponse({
      status: 200,
      message: "Posts fetched successfully",
      data: {
        posts: postsWithCounters,
        nextCursor,
      },
    });
  } catch (error) {
    logger.error("[Service: getPosts] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, "Something went wrong in fetching posts");
  }
};

export const deletePostById = async ({
  user,
  postId,
}: {
  user: string;
  postId: string;
}) => {
  try {
    const post = await Post.findOneAndUpdate(
      {
        _id: postId,
        user,
        isDeleted: false,
      },
      {
        $set: {
          isDeleted: true,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .select("user")
      .lean();

    if (!post) {
      throw new HttpError(404, "[Service: deletePostById] - Post not found");
    }

    if (post?.user) {
      await incrementPostsCountForUser({
        user: post.user.toString(),
        incrementBy: -1,
      });
    }

    return new HttpResponse({
      status: 200,
      message: "Posts deleted successfully",
    });
  } catch (error) {
    logger.error("[Service: deletePostById] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(
      500,
      "[Service: deletePostById] - Something went wrong"
    );
  }
};
