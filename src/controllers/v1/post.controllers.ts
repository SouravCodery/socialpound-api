import { Request, Response, NextFunction } from "express";
import { logger } from "../../logger/index.logger";

import * as postServices from "../../services/v1/post.services";
import { HttpError } from "../../classes/http-error.class";

const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createPostResponse = await postServices.createPost({});

    return res
      .status(createPostResponse.getStatus())
      .json(createPostResponse.getResponse());
  } catch (error) {
    logger.error("[Controller: createPost] - Something went wrong", error);

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError(500, "[Controller: createPost] - Something went wrong")
    );
  }
};

export { createPost };
