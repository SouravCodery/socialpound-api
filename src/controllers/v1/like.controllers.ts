import { Request, Response, NextFunction } from "express";
import { logger } from "../../logger/index.logger";

import { AuthenticatedUserRequestInterface } from "../../interfaces/extended-request.interface";
import * as likeServices from "../../services/v1/like.services";
import { HttpError } from "../../classes/http-error.class";

export const likePostOrComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const liker = (req as AuthenticatedUserRequestInterface).user._id;
    const { likeOn, post, comment } = req.body;

    const likePostResponse = await likeServices.addLikeToQueue({
      likeOn,
      post,
      comment,
      liker,
    });

    return res
      .status(likePostResponse.getStatus())
      .json(likePostResponse.getResponse());
  } catch (error) {
    logger.error(
      "[Controller: likePostOrComment] - Something went wrong",
      error
    );

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError(
        500,
        "[Controller: likePostOrComment] - Something went wrong"
      )
    );
  }
};

export const getLikesByPostId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const postId = req.params.postId;
    const { cursor } = req.query;

    const comments = await likeServices.getLikesByPostId({
      postId,
      cursor: cursor?.toString(),
    });

    return res.status(comments.getStatus()).json(comments.getResponse());
  } catch (error) {
    logger.error(
      "[Controller: getLikesByPostId] - Something went wrong",
      error
    );

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError(
        500,
        "[Controller: getLikesByPostId] - Something went wrong"
      )
    );
  }
};

export const getPostsLikedByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as AuthenticatedUserRequestInterface).user._id.toString();

    const likes = await likeServices.getPostLikedByUser({
      user,
    });

    return res.status(likes.getStatus()).json(likes.getResponse());
  } catch (error) {
    logger.error(
      "[Controller: getPostsLikedByUser] - Something went wrong",
      error
    );

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError(
        500,
        "[Controller: getPostsLikedByUser] - Something went wrong"
      )
    );
  }
};
