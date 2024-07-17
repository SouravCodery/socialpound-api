import { HttpError } from "../../classes/http-error.class";
import { HttpResponse } from "../../classes/http-response.class";

import { logger } from "../../logger/index.logger";

export const createPost = async ({}: {}) => {
  try {
    return new HttpResponse({
      status: 200,
      message: "Post creation Successful",
    });
  } catch (error) {
    logger.error("[Service: createPost] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, "Something went wrong in post creation");
  }
};
