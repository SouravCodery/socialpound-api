import { OAuth2Client } from "google-auth-library";

import { UserModel } from "../../models/user.model";
import Post from "../../models/post.model";
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
import { UserWithIdInterface } from "../../interfaces/user.interface";
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

    const existingUser = await UserModel.findOne({
      sub,
      isDeleted: false,
    }).select("_id email fullName profilePicture");

    const user =
      existingUser ??
      new UserModel({
        username: email,
        email: email,
        fullName: name,
        sub: sub,
        profilePicture: picture ?? "",
      });

    if (existingUser) {
      if (email && existingUser.email !== email) existingUser.email = email;

      if (name && existingUser.fullName !== name) existingUser.fullName = name;

      if (picture && existingUser.profilePicture !== picture)
        existingUser.profilePicture = picture;
    }

    await user.save();

    //response
    const status = existingUser ? 200 : 201;

    const message = existingUser
      ? "Google Sign in successful"
      : "Google Sign up successful";

    const toastMessage = existingUser
      ? "Welcome back to Socialpound"
      : "Welcome to Socialpound";

    const userData = {
      _id: user._id,
      email: user.email,
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
        user: userData,
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

export const getUserByEmail = async ({ email }: { email: string }) => {
  try {
    const cacheKey = getCacheKey({
      prefix: "user",
      params: {
        email,
      },
    });
    const cachedUser = await getCache({
      key: cacheKey,
    });
    if (cachedUser) {
      return cachedUser as UserWithIdInterface;
    }

    const user = await UserModel.findOne({
      email,
      isDeleted: false,
    })
      .select("username")
      .lean<UserWithIdInterface>();

    if (!user) {
      throw new Error("[Service: getUserByEmail] - User not found");
    }

    await setCache({
      key: cacheKey,
      value: user,
      ttl: "ONE_HOUR",
    });
    return user;
  } catch (error) {
    logger.error("[Service: getUserByEmail] - Something went wrong", error);

    throw error;
  }
};

export const getUserByUsername = async ({ username }: { username: string }) => {
  try {
    const user = await UserModel.findOne({
      username,
      isDeleted: false,
    })
      .select(
        "username email fullName bio profilePicture bio postsCount followersCount followingCount"
      )
      .lean<UserWithIdInterface>();

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
    await UserModel.updateOne(
      { _id: user },
      {
        $inc: {
          postsCount: incrementBy,
        },
      },
      {
        runValidators: true,
      }
    );

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

export const deleteUser = async ({ userId }: { userId: string }) => {
  try {
    const user = await UserModel.findOneAndUpdate(
      {
        _id: userId,
        isDeleted: false,
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      },
      {
        runValidators: true,
      }
    )
      .select("_id username")
      .lean();

    if (!user) {
      throw new HttpError({
        status: 404,
        message: "[Service: deleteUser] - User not found",
      });
    }

    await Post.updateMany(
      {
        user: userId,
      },
      {
        $set: {
          isUserDeleted: true,
        },
      },
      {
        runValidators: true,
      }
    );

    deleteAPICache({
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
            email: user.username,
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
