import { FilterQuery } from "mongoose";

import { Config } from "../../config/config";
import Post from "../../models/post.model";
import { HttpError } from "../../classes/http-error.class";
import { HttpResponse } from "../../classes/http-response.class";
import {
  PostInterface,
  PostWithIdInterface,
} from "./../../interfaces/post.interface";

import { getLikeAndCommentsCountInBulk } from "./redis-key-value-store.services";
import { deleteAPICache } from "./redis-cache.services";
import { incrementPostsCountForUser } from "./user.services";
import { logger } from "../../logger/index.logger";

export const createPost = async ({
  user,
  username,
  content,
  caption,
}: {
  user: PostInterface["user"];
  username: string;
  content: PostInterface["content"];
  caption: PostInterface["caption"];
}) => {
  try {
    const newPost = new Post({
      user,
      content,
      caption,
    });
    const userId = user.toString();

    await newPost.save();
    await incrementPostsCountForUser({ user: userId });
    await deleteAPICache({
      keys: [
        {
          url: "/v1/post",
          params: {
            userId,
          },
          query: {},
          authenticatedUserId: null,
        },
        {
          url: "/v1/user",
          params: {
            username,
          },
          query: {},
          authenticatedUserId: null,
        },
      ],
    });

    return new HttpResponse({
      status: 201,
      message: "Post created successfully",
    });
  } catch (error) {
    logger.error("[Service: createPost] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError({
      status: 500,
      message: "[Service: createPost] - Something went wrong",
    });
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
  limit = Config.PAGINATION_LIMIT,
}: {
  userId?: string;
  cursor?: string;
  limit?: number;
}) => {
  try {
    //todo: Caching
    const query: FilterQuery<PostInterface> = {
      isDeleted: false,
      isUserDeleted: false,
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
      .populate({
        path: "user",
        select: "username email fullName profilePicture",
        match: { isDeleted: false },
      })
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

    throw new HttpError({
      status: 500,
      message: "Something went wrong in fetching posts",
    });
  }
};

export const deletePostById = async ({
  user,
  username,
  postId,
}: {
  user: string;
  username: string;
  postId: string;
}) => {
  try {
    const post = await Post.findOneAndUpdate(
      {
        _id: postId,
        user,
        isDeleted: false,
        isUserDeleted: false,
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
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
      throw new HttpError({
        status: 404,
        message: "[Service: deletePostById] - Post not found",
      });
    }

    if (post?.user) {
      const userId = post.user.toString();

      await incrementPostsCountForUser({
        user: userId,
        incrementBy: -1,
      });

      await deleteAPICache({
        keys: [
          {
            url: "/v1/post",
            params: {
              userId,
            },
            query: {},
            authenticatedUserId: null,
          },
          {
            url: "/v1/user",
            params: {
              username,
            },
            query: {},
            authenticatedUserId: null,
          },
        ],
      });
    }

    return new HttpResponse({
      status: 200,
      message: "Posts deleted successfully",
      toastMessage: "Post deleted successfully",
    });
  } catch (error) {
    logger.error("[Service: deletePostById] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError({
      status: 500,
      message: "[Service: deletePostById] - Something went wrong",
    });
  }
};
