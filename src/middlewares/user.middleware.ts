import { Request, Response, NextFunction } from "express";

import {
  AuthenticatedRequestInterface,
  AuthenticatedUserRequestInterface,
} from "./../interfaces/extended-request.interface";

import { logger } from "../logger/index.logger";
import { HttpError } from "../classes/http-error.class";

import { getUserByEmail } from "../services/v1/user.services";

export const userMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.method === "OPTIONS") {
      return next();
    }

    if (!(req as AuthenticatedRequestInterface).decodedAuthToken) {
      return next(new HttpError(401, "Decoded token not found"));
    }

    const { email } = (req as AuthenticatedRequestInterface).decodedAuthToken;
    const user = await getUserByEmail({ email });

    (req as AuthenticatedUserRequestInterface).user = user;

    next();
  } catch (error) {
    logger.error("[Middleware: userMiddleware] - Something went wrong", error);

    return next(new HttpError(401, "Invalid Token"));
  }
};
