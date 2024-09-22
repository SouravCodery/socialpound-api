import { UserModel } from "../../models/user.model";
import Post from "../../models/post.model";

import {
  deleteAPICache,
  deleteCache,
  getCache,
  setCache,
} from "./redis-cache.services";
import { getCacheKey } from "../../helpers/cache.helpers";
import { decodeSignedUserDataJWT } from "../../helpers/jwt.helpers";
import { HttpError } from "../../classes/http-error.class";
import { HttpResponse } from "../../classes/http-response.class";
import { OAuthUserInterface } from "../../interfaces/oauth.interface";
import { UserWithIdInterface } from "../../interfaces/user.interface";
import { logger } from "../../logger/index.logger";

export const signIn = async ({
  decodedAuthToken,
  signedUserDataJWT,
}: {
  decodedAuthToken: OAuthUserInterface;
  signedUserDataJWT: string;
}) => {
  try {
    const userDataGoogle = decodeSignedUserDataJWT({ signedUserDataJWT });

    if (decodedAuthToken.email !== userDataGoogle.user.email) {
      throw new HttpError({ status: 401, message: "User is not authorized" });
    }

    const existingUser = await UserModel.findOne({
      email: decodedAuthToken.email,
      isDeleted: false,
    });

    //creating a new user if the user does not exist
    if (!existingUser) {
      const newUser = new UserModel({
        username: decodedAuthToken.email,
        email: decodedAuthToken.email,
        fullName: decodedAuthToken.name,

        googleAuthUser: {
          user: userDataGoogle.user,
          profile: userDataGoogle.profile,
        },
      });

      await newUser.save();

      return new HttpResponse({
        status: 201,
        message: "Google Sign-Up Successful",
        toastMessage: "Welcome to Socialpound",
      });
    }

    if (
      userDataGoogle &&
      userDataGoogle.user.email &&
      userDataGoogle.profile.email
    ) {
      existingUser.googleAuthUser = {
        user: userDataGoogle.user,
        profile: userDataGoogle.profile,
      };

      await existingUser.save();

      return new HttpResponse({
        status: 200,
        message: "Google Sign-In Successful",
        data: { user: existingUser },
        toastMessage: "Welcome back to Socialpound",
      });
    }

    return new HttpResponse({
      status: 200,
      message: "Sign-In Successful",
    });
  } catch (error) {
    logger.error("[Service: signIn] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError({
      status: 500,
      message: "Something went wrong in Sign-In",
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
