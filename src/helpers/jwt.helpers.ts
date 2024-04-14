import jwt from "jsonwebtoken";

import { logger } from "../logger/index.logger";
import { HttpError } from "../classes/http-error.class";
import { GoogleAuthInterface } from "../interfaces/user.interfaces";

export const decodeSignedUserDataJWT = ({
  signedUserDataJWT,
}: {
  signedUserDataJWT: string;
}) => {
  try {
    return jwt.verify(
      signedUserDataJWT,
      process.env.USER_DATA_SECRET_KEY || ""
    ) as GoogleAuthInterface;
  } catch (error) {
    logger.error("Something went wrong in decodedSignedUserDataJWT", error);
    throw new HttpError(401, "Invalid User Data");
  }
};
