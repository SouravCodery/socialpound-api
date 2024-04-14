import { Request, Response, NextFunction } from "express";
import { logger } from "../../logger/index.logger";

import * as userServices from "../../services/v1/user.services";
import { HttpError } from "../../classes/http-error.class";

const signIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { decodedAuthToken } = req;
    const { signedUserDataJWT } = req.body;

    const signInResult = await userServices.signIn({
      decodedAuthToken,
      signedUserDataJWT,
    });

    return res.json({ message: "User Signed In Successfully", signInResult });
  } catch (error) {
    logger.error("Something went wrong in the signIn controller", error);

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(new HttpError(500, "Something went wrong in signIn"));
  }
};

export { signIn };
