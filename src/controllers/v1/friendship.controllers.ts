import { Request, Response, NextFunction } from "express";

import { HttpError } from "../../classes/http-error.class";
import { AuthenticatedUserRequestInterface } from "../../interfaces/extended-request.interface";
import * as friendshipServices from "../../services/v1/friendship.services";
import { logger } from "../../logger/index.logger";

const sendFriendRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requesterId = (req as AuthenticatedUserRequestInterface).userId;
    const { receiverId } = req.body;

    const sendFriendRequestResponse =
      await friendshipServices.sendFriendRequest({
        requesterId,
        receiverId,
      });

    return res
      .status(sendFriendRequestResponse.getStatus())
      .json(sendFriendRequestResponse.getResponse());
  } catch (error) {
    logger.error(
      "[Controller: sendFriendRequest] - Something went wrong",
      error
    );

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError({
        status: 500,
        message: "[Controller: sendFriendRequest] - Something went wrong",
      })
    );
  }
};

const respondToFriendRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const receiverId = (req as AuthenticatedUserRequestInterface).userId;
    const { requesterId, status } = req.body;

    const respondFriendRequestResponse =
      await friendshipServices.respondToFriendRequest({
        requesterId,
        receiverId: receiverId,
        status,
      });

    return res
      .status(respondFriendRequestResponse.getStatus())
      .json(respondFriendRequestResponse.getResponse());
  } catch (error) {
    logger.error(
      "[Controller: respondToFriendRequest] - Something went wrong",
      error
    );

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError({
        status: 500,
        message: "[Controller: respondToFriendRequest] - Something went wrong",
      })
    );
  }
};

const getFriendsList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedUserRequestInterface).userId;

    const friendsListResponse = await friendshipServices.getFriendsList({
      userId,
    });

    return res
      .status(friendsListResponse.getStatus())
      .json(friendsListResponse.getResponse());
  } catch (error) {
    logger.error("[Controller: getFriendsList] - Something went wrong", error);

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError({
        status: 500,
        message: "[Controller: getFriendsList] - Something went wrong",
      })
    );
  }
};

const getPendingFriendRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedUserRequestInterface).userId;

    const pendingRequestsResponse =
      await friendshipServices.getPendingFriendRequests({
        userId,
      });

    return res
      .status(pendingRequestsResponse.getStatus())
      .json(pendingRequestsResponse.getResponse());
  } catch (error) {
    logger.error(
      "[Controller: getPendingFriendRequests] - Something went wrong",
      error
    );

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError({
        status: 500,
        message:
          "[Controller: getPendingFriendRequests] - Something went wrong",
      })
    );
  }
};

export {
  sendFriendRequest,
  respondToFriendRequest,
  getFriendsList,
  getPendingFriendRequests,
};
