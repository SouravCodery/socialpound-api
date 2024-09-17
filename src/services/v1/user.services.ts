import { HttpError } from "../../classes/http-error.class";
import { decodeSignedUserDataJWT } from "../../helpers/jwt.helpers";

import { logger } from "../../logger/index.logger";

import { OAuthUserInterface } from "../../interfaces/oauth.interface";
import { GitHubAuthUserInterface } from "../../interfaces/github-auth-user.interface";
import { GoogleAuthUserInterface } from "./../../interfaces/google-auth-user.interface";

import { UserModel } from "../../models/user.model";
import { HttpResponse } from "../../classes/http-response.class";
import {
  UserDocumentInterface,
  UserWithIdInterface,
} from "../../interfaces/user.interface";

export const signIn = async ({
  decodedAuthToken,
  signedUserDataJWT,
}: {
  decodedAuthToken: OAuthUserInterface;
  signedUserDataJWT: string;
}) => {
  try {
    const userDataOAuth = decodeSignedUserDataJWT({ signedUserDataJWT });

    if (decodedAuthToken.email !== userDataOAuth.user.email) {
      throw new HttpError(401, "User is not authorized");
    }

    const userDataGoogle =
      userDataOAuth.account.provider === "google"
        ? (userDataOAuth as GoogleAuthUserInterface)
        : null;

    const userDataGitHub =
      userDataOAuth.account.provider === "github"
        ? (userDataOAuth as GitHubAuthUserInterface)
        : null;

    const existingUser: UserDocumentInterface | null = await UserModel.findOne({
      email: decodedAuthToken.email,
      isDeleted: false,
    });

    //creating a new user if the user does not exist
    if (!existingUser) {
      const newUser = new UserModel({
        username: decodedAuthToken.email,
        email: decodedAuthToken.email,
        fullName: decodedAuthToken.name,

        profilePicture: decodedAuthToken.image,

        googleAuthUser: userDataGoogle,
        githubAuthUser: userDataGitHub,
      });

      await newUser.save();

      const message = userDataGoogle
        ? "Google Sign-Up Successful"
        : "GitHub Sign-Up Successful";

      return new HttpResponse({
        status: 201,
        message,
        toastMessage: "Welcome to Socialpound",
      });
    }

    //updating the existing user with the new auth data
    if (
      userDataGoogle &&
      userDataGoogle.user.email &&
      userDataGoogle.profile.email &&
      userDataGoogle.account.providerAccountId
    ) {
      existingUser.profilePicture = userDataGoogle.user.image;
      existingUser.googleAuthUser = userDataGoogle;

      await existingUser.save();

      return new HttpResponse({
        status: 200,
        message: "Google Sign-In Successful",
        data: { user: existingUser },
        toastMessage: "Welcome back to Socialpound",
      });
    }

    if (
      userDataGitHub &&
      userDataGitHub.user.email &&
      userDataGitHub.profile.email &&
      userDataGitHub.account.providerAccountId
    ) {
      existingUser.profilePicture = userDataGitHub.user.image;
      existingUser.githubAuthUser = userDataGitHub;

      await existingUser.save();

      return new HttpResponse({
        status: 200,
        message: "GitHub Sign-In Successful",
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

    throw new HttpError(500, "Something went wrong in Sign-In");
  }
};

export const getUserByEmail = async ({ email }: { email: string }) => {
  try {
    if (!email) {
      throw new Error("[Service: getUserByEmail] - email is required");
    }

    const user = await UserModel.findOne({
      email,
      isDeleted: false,
    }).lean<UserWithIdInterface>();
    if (!user) {
      throw new Error("[Service: getUserByEmail] - User not found");
    }

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
      throw new HttpError(404, "User not found");
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

    throw new HttpError(500, "Something went wrong in getting user");
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
        new: true,
        runValidators: true,
      }
    )
      .select("_id")
      .lean();

    if (!user) {
      throw new HttpError(404, "[Service: deleteUser] - User not found");
    }

    return new HttpResponse({
      status: 200,
      message: "User deleted successfully",
    });
  } catch (error) {
    logger.error("[Service: deleteUser] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, "[Service: deleteUser] - Something went wrong");
  }
};
