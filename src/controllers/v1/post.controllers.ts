import { Request, Response, NextFunction } from "express";
import { logger } from "../../logger/index.logger";

import * as postServices from "../../services/v1/post.services";
import { HttpError } from "../../classes/http-error.class";

import { AuthenticatedUserRequestInterface } from "../../interfaces/extended-request.interface";
import { setAPICache } from "../../services/v1/redis-cache.services";

const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthenticatedUserRequestInterface).user._id;
    const username = (req as AuthenticatedUserRequestInterface).user.username;
    const { content, caption } = req.body;

    const createPostResponse = await postServices.createPost({
      user,
      username,
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
      new HttpError({
        status: 500,
        message: "[Controller: createPost] - Something went wrong",
      })
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

    await setAPICache({
      url: req.baseUrl,
      params: req.params,
      query: req.query,
      authenticatedUserId: null,
      value: posts.getResponse(),
      ttl: "ONE_HOUR",
    });

    return res.status(posts.getStatus()).json(posts.getResponse());
  } catch (error) {
    logger.error("[Controller: getUserFeed] - Something went wrong", error);

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError({
        status: 500,
        message: "[Controller: getUserFeed] - Something went wrong",
      })
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

    await setAPICache({
      url: req.baseUrl,
      params: req.params,
      query: req.query,
      authenticatedUserId: null,
      value: posts.getResponse(),
      ttl: "ONE_HOUR",
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
      new HttpError({
        status: 500,
        message: "[Controller: getPostsByUserId] - Something went wrong",
      })
    );
  }
};

const deletePostById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as AuthenticatedUserRequestInterface).userId;
    const username = (req as AuthenticatedUserRequestInterface).user.username;
    const { postId } = req.params;

    const result = await postServices.deletePostById({
      user,
      postId,
      username,
    });

    return res.status(result.getStatus()).json(result.getResponse());
  } catch (error) {
    logger.error("[Controller: deletePostById] - Something went wrong", error);

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError({
        status: 500,
        message: "[Controller: deletePostById] - Something went wrong",
      })
    );
  }
};

export { createPost, getUserFeed, getPostsByUserId, deletePostById };
