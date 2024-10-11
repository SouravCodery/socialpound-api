import { prisma } from "../../config/database.config";
import {
  Post as PostType,
  PostContent as PostContentType,
} from "@prisma/client";
import { Config } from "../../config/config";
import { HttpError } from "../../classes/http-error.class";
import { HttpResponse } from "../../classes/http-response.class";
import { getLikeAndCommentsCountInBulk } from "./redis-key-value-store.services";
import { deleteAPICache } from "./redis-cache.services";
import { incrementPostsCountForUser } from "./user.services";
import { logger } from "../../logger/index.logger";
import { deleteNotifications } from "./notification.services";

export const createPost = async ({
  user,
  username,
  content,
  caption,
}: {
  user: PostType["userId"];
  username: string;
  content: PostContentType[];
  caption: PostType["caption"];
}) => {
  try {
    const newPost = await prisma.post.create({
      data: {
        userId: Number(user),
        content: {
          createMany: {
            data: content,
          },
        },
        caption,
      },
    });

    await incrementPostsCountForUser({ user: Number(user) });
    await deleteAPICache({
      keys: [
        {
          url: "/v1/post",
          params: {},
          query: {},
          authenticatedUserId: null,
        },
        {
          url: "/v1/post",
          params: {
            userId: user,
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

const getPostsWithCounters = async ({ posts }: { posts: { id: number }[] }) => {
  try {
    const counters = await getLikeAndCommentsCountInBulk({
      entityType: "Post",
      ids: posts.map((post) => post.id),
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
    const posts = await prisma.post.findMany({
      where: {
        isDeleted: false,
        isUserDeleted: false,
        ...(cursor ? { id: { lt: Number(cursor) } } : {}),
        ...(userId ? { userId: Number(userId) } : {}),
        user: {
          isDeleted: false,
        },
      },
      take: limit,
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        caption: true,
        user: {
          select: {
            username: true,
            email: true,
            fullName: true,
            profilePicture: true,
          },
        },
        content: true,
      },
    });

    const nextCursor =
      posts.length >= limit ? posts[posts.length - 1].id.toString() : null;

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

//todo: Do this via queue in batches
export const deletePostById = async ({
  user,
  username,
  postId,
}: {
  user: number;
  username: string;
  postId: string;
}) => {
  try {
    const post = await prisma.post.findFirst({
      where: {
        id: Number(postId),
        userId: Number(user),
        isDeleted: false,
        isUserDeleted: false,
      },
      select: {
        userId: true,
      },
    });

    if (!post) {
      throw new HttpError({
        status: 404,
        message:
          "[Service: deletePostById] - Post not found or already deleted",
      });
    }

    await prisma.post.update({
      where: { id: Number(postId) },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await deleteNotifications({
      post: postId,
    });

    await incrementPostsCountForUser({
      user: post.userId,
      incrementBy: -1,
    });

    await deleteAPICache({
      keys: [
        {
          url: "/v1/post",
          params: {},
          query: {},
          authenticatedUserId: null,
        },
        {
          url: "/v1/post",
          params: {
            userId: post.userId,
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
      status: 200,
      message: "Post deleted successfully",
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
