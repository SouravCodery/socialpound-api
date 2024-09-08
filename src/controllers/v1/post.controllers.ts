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

const getUserFeed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //todo: once the feed generation is implemented, update this controller to fetch user specific feed
    const { cursor } = req.query;

    const posts = await postServices.getPosts({
      cursor: cursor?.toString(),
    });

    return res.status(posts.getStatus()).json(posts.getResponse());
  } catch (error) {
    logger.error("[Controller: getUserFeed] - Something went wrong", error);

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError(500, "[Controller: getUserFeed] - Something went wrong")
    );
  }
};

const getPostsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId;
    const { cursor } = req.query;

    const posts = await postServices.getPosts({
      userId,
      cursor: cursor?.toString(),
    });

    return res.status(posts.getStatus()).json(posts.getResponse());
  } catch (error) {
    logger.error(
      "[Controller: getPostsByUserId] - Something went wrong",
      error
    );

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError(
        500,
        "[Controller: getPostsByUserId] - Something went wrong"
      )
    );
  }
};

export { createPost, getUserFeed, getPostsByUserId };
