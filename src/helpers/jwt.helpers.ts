import jwt from "jsonwebtoken";

import { logger } from "../logger/index.logger";
import { HttpError } from "../classes/http-error.class";
import { GoogleAuthUserInterface } from "./../interfaces/google-auth-user.interface";
import { GitHubAuthUserInterface } from "../interfaces/github-auth-user.interface";

export const decodeSignedUserDataJWT = ({
  signedUserDataJWT,
}: {
  signedUserDataJWT: string;
}) => {
  try {
    const decodedSignedUserData = jwt.verify(
      signedUserDataJWT,
      process.env.USER_DATA_SECRET_KEY || ""
    ) as GoogleAuthUserInterface | GitHubAuthUserInterface;

    if (decodedSignedUserData.account.provider === "github") {
      return decodedSignedUserData as GitHubAuthUserInterface;
    }

    return decodedSignedUserData as GoogleAuthUserInterface;
  } catch (error) {
    logger.error("Something went wrong in decodedSignedUserDataJWT", error);
    throw new HttpError(401, "Invalid User Data");
  }
};
