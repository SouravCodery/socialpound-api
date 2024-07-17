import { HttpError } from "../../classes/http-error.class";
import { HttpResponse } from "../../classes/http-response.class";

import { logger } from "../../logger/index.logger";

export const addPost = async ({}: {}) => {
  try {
    return new HttpResponse({
      status: 200,
      message: "Post creation Successful",
    });
  } catch (error) {
    logger.error("Something went wrong in the addPost service", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, "Something went wrong in addPost");
  }
};
