import jwt from "jsonwebtoken";

import { logger } from "../logger/index.logger";
import { HttpError } from "../classes/http-error.class";
import { GoogleAuthUserInterface } from "./../interfaces/google-auth-user.interface";
import { GitHubAuthUserInterface } from "../interfaces/github-auth-user.interface";

import { Config } from "../config/config";

export const decodeSignedUserDataJWT = ({
  signedUserDataJWT,
}: {
  signedUserDataJWT: string;
}) => {
  try {
    const decodedSignedUserData = jwt.verify(
      signedUserDataJWT,

      Config.USER_DATA_SECRET_KEY || ""
    ) as GoogleAuthUserInterface;

    return decodedSignedUserData;
  } catch (error) {
    logger.error("Something went wrong in decodedSignedUserDataJWT", error);
    throw new HttpError({ status: 401, message: "Invalid User Data" });
  }
};
