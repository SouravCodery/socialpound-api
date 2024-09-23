import { Request, Response, NextFunction } from "express";

import * as likeServices from "../../services/v1/like.services";
import { setAPICache } from "../../services/v1/redis-cache.services";
import { logger } from "../../logger/index.logger";
import { HttpError } from "../../classes/http-error.class";
import { AuthenticatedUserRequestInterface } from "../../interfaces/extended-request.interface";

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
      new HttpError({
        status: 500,
        message: "[Controller: likePostOrComment] - Something went wrong",
      })
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

    const likes = await likeServices.getLikesByPostId({
      postId,
      cursor: cursor?.toString(),
    });

    await setAPICache({
      url: req.baseUrl,
      params: req.params,
      query: req.query,
      authenticatedUserId: null,
      value: likes.getResponse(),
    });

    return res.status(likes.getStatus()).json(likes.getResponse());
  } catch (error) {
    logger.error(
      "[Controller: getLikesByPostId] - Something went wrong",
      error
    );

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError({
        status: 500,
        message: "[Controller: getLikesByPostId] - Something went wrong",
      })
    );
  }
};

export const getPostsLikedByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as AuthenticatedUserRequestInterface).userId;

    const likes = await likeServices.getPostLikedByUser({
      user,
    });

    await setAPICache({
      url: req.baseUrl,
      params: req.params,
      query: req.query,
      authenticatedUserId: user,
      value: likes.getResponse(),
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
      new HttpError({
        status: 500,
        message: "[Controller: getPostsLikedByUser] - Something went wrong",
      })
    );
  }
};

export const unlikePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const liker = (req as AuthenticatedUserRequestInterface).userId;
    const { postId } = req.params;

    const likePostResponse = await likeServices.unlikePost({
      post: postId,
      liker,
    });

    //skipping notification removal of like for now
    return res
      .status(likePostResponse.getStatus())
      .json(likePostResponse.getResponse());
  } catch (error) {
    logger.error("[Controller: unlikePost] - Something went wrong", error);

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError({
        status: 500,
        message: "[Controller: unlikePost] - Something went wrong",
      })
    );
  }
};
