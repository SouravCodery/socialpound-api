import { Request, Response, NextFunction } from "express";
import { logger } from "../../logger/index.logger";

import * as awsSignedUrlServices from "../../services/v1/aws-presigned-url.services";
import { HttpError } from "../../classes/http-error.class";

import { AuthenticatedUserRequestInterface } from "../../interfaces/extended-request.interface";

const getPresignedUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as AuthenticatedUserRequestInterface).user._id.toString();
    const { size, type } = req.body;

    const getSignedUrlResponse = await awsSignedUrlServices.getPresignedUrl({
      user,
      size,
      type,
    });

    return res
      .status(getSignedUrlResponse.getStatus())
      .json(getSignedUrlResponse.getResponse());
  } catch (error) {
    logger.error("[Controller: getPresignedUrl] - Something went wrong", error);

    if (error instanceof HttpError) {
      return next(error);
    }

    return next(
      new HttpError({
        status: 500,
        message: "[Controller: getPresignedUrl] - Something went wrong",
      })
    );
  }
};

export { getPresignedUrl };
