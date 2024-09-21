import express from "express";

import * as likeController from "../../controllers/v1/like.controllers";
import * as likeValidationSchemas from "../../validators/like-routes.validators";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { userMiddleware } from "../../middlewares/user.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { cacheMiddleware } from "../../middlewares/cache.middleware";

const likeRouter = express.Router();

likeRouter.use(authMiddleware);
likeRouter.use(userMiddleware);

likeRouter.post(
  "/",
  validate(likeValidationSchemas.likePostOrCommentValidatorSchema),
  likeController.likePostOrComment
);

likeRouter.get(
  "/post/user",
  validate({}),
  cacheMiddleware({ isAuthenticatedUserSpecificRequest: true }),
  likeController.getPostsLikedByUser
);

likeRouter.get(
  "/post/:postId",
  validate(likeValidationSchemas.getLikesByPostIdValidatorSchema),
  cacheMiddleware({ isAuthenticatedUserSpecificRequest: false }),
  likeController.getLikesByPostId
);

likeRouter.delete(
  "/post/:postId",
  validate(likeValidationSchemas.unlikePostValidatorSchema),
  likeController.unlikePost
);

export default likeRouter;
