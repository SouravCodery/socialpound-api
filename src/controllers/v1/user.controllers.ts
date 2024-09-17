import { AuthenticatedUserRequestInterface } from "./../../interfaces/extended-request.interface";
import { AuthenticatedRequestInterface } from "../../interfaces/extended-request.interface";

import { Request, Response, NextFunction } from "express";

import { logger } from "../../logger/index.logger";
import { HttpError } from "../../classes/http-error.class";

import * as userServices from "../../services/v1/user.services";

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

const getUserByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const username = `${req.params.username}@gmail.com`;

    const getUserResponse = await userServices.getUserByUsername({
      username,
    });

    return res
      .status(getUserResponse.getStatus())
      .json(getUserResponse.getResponse());
  } catch (error) {
    logger.error(
      "[Controller: getUserByUsername] - Something went wrong",
      error
    );

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(new HttpError(500, "Something went wrong in getting user"));
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (
      req as AuthenticatedUserRequestInterface
    ).user._id.toString();

    const result = await userServices.deleteUser({ userId });

    return res.status(result.getStatus()).json(result.getResponse());
  } catch (error) {
    logger.error("[Controller: deleteUser] - Something went wrong", error);

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError(500, "[Controller: deleteUser] - Something went wrong")
    );
  }
};

export { signIn, getUserByUsername, deleteUser };
