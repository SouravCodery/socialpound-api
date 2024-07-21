import { Request, Response, NextFunction } from "express";
import { logger } from "../../logger/index.logger";

import * as postServices from "../../services/v1/post.services";
import { HttpError } from "../../classes/http-error.class";

import { AuthenticatedUserRequestInterface } from "../../interfaces/extended-request.interface";

const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthenticatedUserRequestInterface).user._id;
    const { content, caption } = req.body;

    const createPostResponse = await postServices.createPost({
      user,
      content,
      caption,
    });

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

const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const getAllPostsResponse = await postServices.getAllPosts();

    return res
      .status(getAllPostsResponse.getStatus())
      .json(getAllPostsResponse.getResponse());
  } catch (error) {
    logger.error("[Controller: getAllPosts] - Something went wrong", error);

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError(500, "[Controller: getAllPosts] - Something went wrong")
    );
  }
};

export { createPost, getAllPosts };
