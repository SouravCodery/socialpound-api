import { HttpError } from "../../classes/http-error.class";
import { decodeSignedUserDataJWT } from "../../helpers/jwt.helpers";
import { OAuthUserInterface } from "../../interfaces/user.interfaces";
import { logger } from "../../logger/index.logger";

import UserModel, { GoogleAuthModel } from "../../models/user.model";

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

    const userAlreadyExists = await UserModel.findOne({
      email: decodedAuthToken.email,
    }).select("");

    if (
      userAlreadyExists &&
      userDataOAuth.user.email &&
      userDataOAuth.profile.email &&
      userDataOAuth.account.providerAccountId
    ) {
      if (userAlreadyExists.googleAuth) {
        userAlreadyExists.googleAuth.user = userDataOAuth.user;
        userAlreadyExists.googleAuth.account = userDataOAuth.account;
        userAlreadyExists.googleAuth.profile = userDataOAuth.profile;
      } else {
        userAlreadyExists.set({ googleAuth: userDataOAuth });
      }

      return await userAlreadyExists.save();
    }

    const newUser = new UserModel({
      username: decodedAuthToken.email,
      email: decodedAuthToken.email,
      fullName: decodedAuthToken.name,
      profilePicture: decodedAuthToken.image,
      googleAuth: new GoogleAuthModel(userDataOAuth),
    });

    return await newUser.save();
  } catch (error) {
    logger.error("Something went wrong in the signIn service", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, "Something went wrong in signIn");
  }
};
