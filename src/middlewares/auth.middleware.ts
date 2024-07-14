import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { logger } from "../logger/index.logger";

import { HttpError } from "../classes/http-error.class";
import { OAuthUserInterface } from "../interfaces/oauth.interface";
import { UserInterface } from "./../interfaces/user.interface";

import { Config } from "../config/config";

declare global {
  namespace Express {
    interface Request {
      decodedAuthToken?: any;
      user?: UserInterface;
    }
  }
}

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
      return next(new HttpError(401, "User is not authorized"));
    }

    const decodedAuthToken = jwt.verify(
      token,
      Config.AUTH_JWT_SECRET_KEY || ""
    ) as OAuthUserInterface;

    req.decodedAuthToken = decodedAuthToken;

    next();
  } catch (error) {
    logger.error("Something went wrong in authMiddleware", error);

    return next(new HttpError(401, "Invalid Token"));
  }
};
