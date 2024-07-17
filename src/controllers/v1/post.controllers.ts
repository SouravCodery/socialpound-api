import { Request, Response, NextFunction } from "express";
import { logger } from "../../logger/index.logger";

import * as postServices from "../../services/v1/post.services";
import { HttpError } from "../../classes/http-error.class";

const addPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const addPostResponse = await postServices.addPost({});

    return res
      .status(addPostResponse.getStatus())
      .json(addPostResponse.getResponse());
  } catch (error) {
    logger.error("Something went wrong in the addPost controller", error);

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(new HttpError(500, "Something went wrong in addPost"));
  }
};

export { addPost };
