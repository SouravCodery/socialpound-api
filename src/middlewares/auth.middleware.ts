import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { getUserById } from "../services/v1/user.services";
import { HttpError } from "../classes/http-error.class";
import { AuthenticatedUserRequestInterface } from "./../interfaces/extended-request.interface";
import { UserTokenPayloadInterface } from "../interfaces/user.interface";
import { Config } from "../config/config";
import { logger } from "../logger/index.logger";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.method === "OPTIONS") {
      return next();
    }

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(
        new HttpError({
          status: 401,
          message: "User is not authorized",
          toastMessage: "Please sign in again",
        })
      );
    }

    const decodedAuthToken = jwt.verify(
      token,
      Config.AUTH_JWT_SECRET_KEY
    ) as UserTokenPayloadInterface;

    const { _id: userId } = decodedAuthToken;
    const user = await getUserById({ userId });

    (req as AuthenticatedUserRequestInterface).user = user;
    (req as AuthenticatedUserRequestInterface).userId = user?._id?.toString();

    next();
  } catch (error) {
    logger.error("Something went wrong in authMiddleware", error);

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError({
        status: 401,
        message: "Invalid Token",
        toastMessage: "Please sign in again",
      })
    );
  }
};
