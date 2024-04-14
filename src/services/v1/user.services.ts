import { HttpError } from "../../classes/http-error.class";
import { decodeSignedUserDataJWT } from "../../helpers/jwt.helpers";

import { logger } from "../../logger/index.logger";

import { OAuthUserInterface } from "../../interfaces/oauth.interface";
import { GitHubAuthUserInterface } from "../../interfaces/github-auth-user.interface";
import { GoogleAuthUserInterface } from "./../../interfaces/google-auth-user.interface";

import UserModel from "../../models/user.model";

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

    const existingUser = await UserModel.findOne({
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

      return await newUser.save();
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

      return await existingUser.save();
    }

    if (
      userDataGitHub &&
      userDataGitHub.user.email &&
      userDataGitHub.profile.email &&
      userDataGitHub.account.providerAccountId
    ) {
      existingUser.profilePicture = userDataGitHub.user.image;
      existingUser.githubAuthUser = userDataGitHub;

      return await existingUser.save();
    }
  } catch (error) {
    logger.error("Something went wrong in the signIn service", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, "Something went wrong in signIn");
  }
};
