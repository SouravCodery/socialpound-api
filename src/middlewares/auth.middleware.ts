import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

import { logger } from "../logger/index.logger";

import { HttpError } from "../classes/http-error.class";
import { OAuthUserInterface } from "../interfaces/user.interfaces";

declare global {
  namespace Express {
    interface Request {
      decodedAuthToken?: any;
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
      process.env.AUTH_JWT_SECRET_KEY || ""
    ) as OAuthUserInterface;

    req.decodedAuthToken = decodedAuthToken;

    next();
  } catch (error) {
    logger.error("Something went wrong in authMiddleware", error);

    return next(new HttpError(401, "Invalid Token"));
  }
};
