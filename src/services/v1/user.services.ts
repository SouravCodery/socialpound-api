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
  UserInterface,
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

    const user = await UserModel.findOne({ email }).lean<UserInterface>();
    if (!user) {
      throw new Error("[Service: getUserByEmail] - User not found");
    }

    return user;
  } catch (error) {
    logger.error("[Service: getUserByEmail] - Something went wrong", error);

    throw error;
  }
};
