import { OAuth2Client } from "google-auth-library";
import { prisma } from "../../config/database.config";
import {
  deleteAPICache,
  deleteCache,
  getCache,
  setCache,
} from "./redis-cache.services";
import { signAPIToken } from "../../helpers/jwt.helpers";
import { getCacheKey } from "../../helpers/cache.helpers";
import { HttpError } from "../../classes/http-error.class";
import { HttpResponse } from "../../classes/http-response.class";
import { Config } from "../../config/config";
import { logger } from "../../logger/index.logger";

const googleClient = new OAuth2Client(Config.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async ({
  googleToken,
}: {
  googleToken: string;
}) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: Config.GOOGLE_CLIENT_ID,
    });
    const userPayloadGoogle = ticket.getPayload();

    if (!userPayloadGoogle) {
      throw new HttpError({
        status: 400,
        message: "Invalid Google Token",
        toastMessage: "Google Login Failed!",
      });
    }

    if (userPayloadGoogle.email_verified !== true) {
      throw new HttpError({
        status: 400,
        message: "Email not verified",
        toastMessage: "Email not verified",
      });
    }

    return {
      userPayloadGoogle,
    };
  } catch (error) {
    logger.error("[Service: verifyGoogleToken] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError({
      status: 500,
      message: "Something went wrong in Google Token verification",
      toastMessage: "Something went wrong in Google Token verification",
    });
  }
};

export const signIn = async ({ googleToken }: { googleToken: string }) => {
  try {
    const { userPayloadGoogle } = await verifyGoogleToken({ googleToken });
    const { sub, email, name, picture } = userPayloadGoogle;

    const existingUser = await prisma.user.findFirst({
      where: { sub, isDeleted: false },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        profilePicture: true,
      },
    });

    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            email: email ?? existingUser.email,
            username: email ?? existingUser.username,
            fullName: name ?? existingUser.fullName,
            profilePicture: picture ?? existingUser.profilePicture,
            lastLogin: new Date(),
          },
        })
      : await prisma.user.create({
          data: {
            username: email ?? "",
            email: email ?? "",
            fullName: name,
            sub: sub,
            profilePicture: picture ?? "",
            lastLogin: new Date(),
          },
        });

    const status = existingUser ? 200 : 201;
    const message = existingUser
      ? "Google Sign in successful"
      : "Google Sign up successful";
    const toastMessage = existingUser
      ? "Welcome back to Socialpound"
      : "Welcome to Socialpound";

    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      profilePicture: user.profilePicture,
    };

    const serverAPIToken = signAPIToken({
      user: userData,
    });

    return new HttpResponse({
      status,
      message,
      data: {
        user: btoa(btoa(JSON.stringify(userData))),
        token: serverAPIToken,
      },
      toastMessage,
    });
  } catch (error) {
    logger.error("[Service: signIn] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError({
      status: 500,
      message: "Something went wrong in Sign in",
      toastMessage: "Something went wrong in Sign in",
    });
  }
};

export const getUserById = async ({ userId }: { userId: number }) => {
  try {
    const cacheKey = getCacheKey({
      prefix: "user",
      params: { userId },
    });
    const cachedUser = (await getCache({ key: cacheKey })) as {
      id: number;
      username: string;
      email: string;
      fullName: string;
    } | null;

    if (cachedUser) {
      return cachedUser;
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
      },
    });

    if (!user) {
      throw new Error("[Service: getUserById] - User not found");
    }

    await setCache({
      key: cacheKey,
      value: user,
      ttl: "ONE_HOUR",
    });
    return user;
  } catch (error) {
    logger.error("[Service: getUserById] - Something went wrong", error);
    throw error;
  }
};

export const getUserByUsername = async ({ username }: { username: string }) => {
  try {
    const user = await prisma.user.findFirst({
      where: { username, isDeleted: false },
      select: {
        username: true,
        email: true,
        fullName: true,
        bio: true,
        profilePicture: true,
        postsCount: true,
        followersCount: true,
        followingCount: true,
      },
    });

    if (!user) {
      throw new HttpError({
        status: 404,
        message: "User not found",
        toastMessage: "User not found",
      });
    }

    return new HttpResponse({
      status: 200,
      data: { user },
      message: "User fetched successfully",
    });
  } catch (error) {
    logger.error("[Service: getUserByUsername] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError({
      status: 500,
      message: "Something went wrong in getting user",
    });
  }
};

export const incrementPostsCountForUser = async ({
  user,
  incrementBy = 1,
}: {
  user: string;
  incrementBy?: number;
}) => {
  try {
    await prisma.user.update({
      where: { id: Number(user) },
      data: {
        postsCount: {
          increment: incrementBy,
        },
      },
    });

    return {
      message: "Posts count incremented successfully",
    };
  } catch (error) {
    logger.error(
      "[Service: incrementPostsCountForUser] - Something went wrong",
      error
    );
  }
};

export const deleteUser = async ({ userId }: { userId: number }) => {
  try {
    const user = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
      },
    });

    if (!user) {
      throw new HttpError({
        status: 404,
        message: "[Service: deleteUser] - User not found",
      });
    }

    await prisma.post.updateMany({
      where: {
        userId: Number(userId),
      },
      data: {
        isUserDeleted: true,
      },
    });

    deleteAPICache({
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
            userId,
          },
          query: {},
          authenticatedUserId: null,
        },
        {
          url: "/v1/user",
          params: {
            username: user.username,
          },
          query: {},
          authenticatedUserId: null,
        },
      ],
    });

    deleteCache({
      keys: [
        getCacheKey({
          prefix: "user",
          params: {
            userId: user.id,
          },
        }),
      ],
    });

    return new HttpResponse({
      status: 200,
      message: "User deleted successfully",
    });
  } catch (error) {
    logger.error("[Service: deleteUser] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError({
      status: 500,
      message: "[Service: deleteUser] - Something went wrong",
    });
  }
};
