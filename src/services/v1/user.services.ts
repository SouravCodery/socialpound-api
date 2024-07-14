import { HttpError } from "../../classes/http-error.class";
import { decodeSignedUserDataJWT } from "../../helpers/jwt.helpers";

import { logger } from "../../logger/index.logger";

import { OAuthUserInterface } from "../../interfaces/oauth.interface";
import { GitHubAuthUserInterface } from "../../interfaces/github-auth-user.interface";
import { GoogleAuthUserInterface } from "./../../interfaces/google-auth-user.interface";

import UserModel from "../../models/user.model";
import { HttpResponse } from "../../classes/http-response.class";
import { UserDocumentInterface } from "../../interfaces/user.interface";

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
        ? "Google SignUp Successful"
        : "GitHub SignUp Successful";

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
        message: "Google SignIn Successful",
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
        message: "GitHub SignIn Successful",
        data: { user: existingUser },
      });
    }

    return new HttpResponse({
      status: 200,
      message: "SignIn Successful",
    });
  } catch (error) {
    logger.error("Something went wrong in the signIn service", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, "Something went wrong in signIn");
  }
};
