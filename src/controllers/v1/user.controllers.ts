import { Request, Response, NextFunction } from "express";

import { logger } from "../../logger/index.logger";
import { HttpError } from "../../classes/http-error.class";

import * as userServices from "../../services/v1/user.services";

import { AuthenticatedRequestInterface } from "../../interfaces/extended-request.interface";

const signIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { decodedAuthToken } = req as AuthenticatedRequestInterface;
    const { signedUserDataJWT } = req.body;

    const signInResponse = await userServices.signIn({
      decodedAuthToken,
      signedUserDataJWT,
    });

    return res
      .status(signInResponse.getStatus())
      .json(signInResponse.getResponse());
  } catch (error) {
    logger.error("[Controller: signIn] - Something went wrong", error);

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(new HttpError(500, "Something went wrong in Sign-In"));
  }
};

export { signIn };
