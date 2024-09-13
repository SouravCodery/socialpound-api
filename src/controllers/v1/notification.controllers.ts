import { Request, Response, NextFunction } from "express";
import { logger } from "../../logger/index.logger";

import { AuthenticatedUserRequestInterface } from "../../interfaces/extended-request.interface";
import { HttpError } from "../../classes/http-error.class";
import * as notificationServices from "../../services/v1/notification.services";

export const addMarkNotificationAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const recipient = (
      req as AuthenticatedUserRequestInterface
    ).user._id.toString();
    const { notificationId } = req.params;

    const addMarkNotificationAsReadResponse =
      await notificationServices.addMarkNotificationAsReadToQueue({
        notificationId,
        recipient,
      });

    return res
      .status(addMarkNotificationAsReadResponse.getStatus())
      .json(addMarkNotificationAsReadResponse.getResponse());
  } catch (error) {
    logger.error(
      "[Controller: addMarkNotificationAsRead] - Something went wrong",
      error
    );

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError(
        500,
        "[Controller: addMarkNotificationAsRead] - Something went wrong"
      )
    );
  }
};

export const getNotificationsByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const recipient = (
      req as AuthenticatedUserRequestInterface
    ).user._id.toString();
    const { cursor } = req.query;

    const notifications = await notificationServices.getNotificationsByUser({
      recipient,
      cursor: cursor?.toString(),
    });

    return res
      .status(notifications.getStatus())
      .json(notifications.getResponse());
  } catch (error) {
    logger.error(
      "[Controller: getNotificationsByUser] - Something went wrong",
      error
    );

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError(
        500,
        "[Controller: getNotificationsByUser] - Something went wrong"
      )
    );
  }
};
