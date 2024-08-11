import { Request, Response, NextFunction } from "express";
import { logger } from "../../logger/index.logger";

import * as commentServices from "../../services/v1/comment.services";

import { HttpError } from "../../classes/http-error.class";

import { AuthenticatedUserRequestInterface } from "../../interfaces/extended-request.interface";

const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthenticatedUserRequestInterface).user._id;
    const { commentOn, post, parentComment, text } = req.body;

    const addCommentResponse = await commentServices.addComment({
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
      new HttpError(500, "[Controller: addComment] - Something went wrong")
    );
  }
};

export { addComment };
