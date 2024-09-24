import jwt from "jsonwebtoken";

import { Config } from "../config/config";
import { logger } from "../logger/index.logger";

export const signAPIToken = ({ user }: { user: Object }) => {
  try {
    const signedAPIToken = jwt.sign(user, Config.AUTH_JWT_SECRET_KEY, {
      expiresIn: Config.AUTH_JWT_EXPIRES_IN,
    });

    return signedAPIToken;
  } catch (error) {
    logger.error("Something went wrong in signAPIToken", error);
    throw error;
  }
};
