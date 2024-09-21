import { Request, Response, NextFunction } from "express";

import * as commentServices from "../../services/v1/comment.services";
import { setAPICache } from "../../services/v1/redis-cache.services";
import { logger } from "../../logger/index.logger";
import { HttpError } from "../../classes/http-error.class";
import { AuthenticatedUserRequestInterface } from "../../interfaces/extended-request.interface";

export const addComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as AuthenticatedUserRequestInterface).user._id;
    const { commentOn, post, parentComment, text } = req.body;

    const addCommentResponse = await commentServices.addCommentToQueue({
      commentOn,
      post,
      parentComment,
      user,
      text,
    });

    return res
      .status(addCommentResponse.getStatus())
      .json(addCommentResponse.getResponse());
  } catch (error) {
    logger.error("[Controller: addComment] - Something went wrong", error);

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError({
        status: 500,
        message: "[Controller: addComment] - Something went wrong",
      })
    );
  }
};

export const getCommentsByPostId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const postId = req.params.postId;
    const { cursor } = req.query;

    const comments = await commentServices.getCommentsByPostId({
      postId,
      cursor: cursor?.toString(),
    });

    await setAPICache({
      url: req.baseUrl,
      params: req.params,
      query: req.query,
      authenticatedUserId: null,
      value: comments.getResponse(),
    });

    return res.status(comments.getStatus()).json(comments.getResponse());
  } catch (error) {
    logger.error(
      "[Controller: getCommentsByPostId] - Something went wrong",
      error
    );

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError({
        status: 500,
        message: "[Controller: getCommentsByPostId] - Something went wrong",
      })
    );
  }
};

export const deleteCommentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as AuthenticatedUserRequestInterface).user._id.toString();
    const { commentId } = req.params;

    const result = await commentServices.deleteCommentById({ user, commentId });

    return res.status(result.getStatus()).json(result.getResponse());
  } catch (error) {
    logger.error(
      "[Controller: deleteCommentById] - Something went wrong",
      error
    );

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError({
        status: 500,
        message: "[Controller: deleteCommentById] - Something went wrong",
      })
    );
  }
};
