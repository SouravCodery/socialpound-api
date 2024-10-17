import { Request, Response, NextFunction } from "express";

import { HttpError } from "../../classes/http-error.class";
import { AuthenticatedUserRequestInterface } from "../../interfaces/extended-request.interface";
import * as friendshipServices from "../../services/v1/friendship.services";
import { setAPICache } from "../../services/v1/redis-cache.services";

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
    const { cursor } = req.query;

    const friendsListResponse = await friendshipServices.getFriendsList({
      userId,
      cursor: cursor?.toString(),
    });

    await setAPICache({
      url: req.baseUrl,
      params: req.params,
      query: req.query,
      authenticatedUserId: userId,
      value: friendsListResponse.getResponse(),
      ttl: "FIVE_MINUTES",
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
    const { cursor } = req.query;

    const pendingRequestsResponse =
      await friendshipServices.getPendingFriendRequests({
        userId,
        cursor: cursor?.toString(),
      });

    await setAPICache({
      url: req.baseUrl,
      params: req.params,
      query: req.query,
      authenticatedUserId: userId,
      value: pendingRequestsResponse.getResponse(),
      ttl: "FIVE_MINUTES",
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

const friendshipStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedUserRequestInterface).userId;
    const { otherUser } = req.params;

    const isFriendResponse = await friendshipServices.friendshipStatus({
      userId,
      otherUser,
    });

    return res
      .status(isFriendResponse.getStatus())
      .json(isFriendResponse.getResponse());
  } catch (error) {
    logger.error("[Controller: friendshipStatus] - Something went wrong", error);

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError({
        status: 500,
        message: "[Controller: friendshipStatus] - Something went wrong",
      })
    );
  }
};

export {
  sendFriendRequest,
  respondToFriendRequest,
  getFriendsList,
  getPendingFriendRequests,
  friendshipStatus,
};
