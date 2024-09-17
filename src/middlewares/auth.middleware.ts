import { AuthenticatedRequestInterface } from "./../interfaces/extended-request.interface";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { logger } from "../logger/index.logger";

import { HttpError } from "../classes/http-error.class";
import { OAuthUserInterface } from "../interfaces/oauth.interface";

import { Config } from "../config/config";

export const authMiddleware = (
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
        new HttpError({ status: 401, message: "User is not authorized" })
      );
    }

    const decodedAuthToken = jwt.verify(
      token,
      Config.AUTH_JWT_SECRET_KEY || ""
    ) as OAuthUserInterface;

    (req as AuthenticatedRequestInterface).decodedAuthToken = decodedAuthToken;

    next();
  } catch (error) {
    logger.error("Something went wrong in authMiddleware", error);

    return next(new HttpError({ status: 401, message: "Invalid Token" }));
  }
};
