import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";

import { getUserById } from "../services/v1/user.services";
import { HttpError } from "../classes/http-error.class";
import { UserTokenPayloadInterface } from "../interfaces/user.interface";
import { Config } from "../config/config";
import { logger } from "../logger/index.logger";

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(
        new HttpError({
          status: 401,
          message: "User is not authorized for calls, Refresh to try again",
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

    socket.data.user = user;
    socket.data.userId = user._id?.toString();

    next();
  } catch (error) {
    logger.error("Something went wrong in socketAuthMiddleware", error);

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
