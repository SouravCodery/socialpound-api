import express from "express";

import * as postController from "../../controllers/v1/post.controllers";
import * as postValidationSchemas from "../../validators/post-routes.validators";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { cacheMiddleware } from "../../middlewares/cache.middleware";

import { validate } from "../../middlewares/validate.middleware";

const postRouter = express.Router();
postRouter.use(authMiddleware);

postRouter.post(
  "/",
  validate(postValidationSchemas.createPostValidatorSchema),
  postController.createPost
);

postRouter.get(
  "/",
  validate(postValidationSchemas.getUserFeedValidatorSchema),
  cacheMiddleware({ isAuthenticatedUserSpecificRequest: false }),
  postController.getUserFeed
);

postRouter.get(
  "/:userId",
  validate(postValidationSchemas.getPostsByUserIdValidatorSchema),
  cacheMiddleware({ isAuthenticatedUserSpecificRequest: false }),
  postController.getPostsByUserId
);

postRouter.delete(
  "/:postId",
  validate(postValidationSchemas.deletePostByIdValidatorSchema),
  postController.deletePostById
);

export default postRouter;
