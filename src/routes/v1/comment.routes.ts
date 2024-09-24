import express from "express";

import * as commentController from "../../controllers/v1/comment.controllers";
import * as commentValidationSchemas from "../../validators/comment-routes.validators";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { cacheMiddleware } from "../../middlewares/cache.middleware";

const commentRouter = express.Router();
commentRouter.use(authMiddleware);

commentRouter.post(
  "/",
  validate(commentValidationSchemas.addCommentValidatorSchema),
  commentController.addComment
);

commentRouter.get(
  "/post/:postId",
  validate(commentValidationSchemas.getCommentsByPostIdValidatorSchema),
  cacheMiddleware({ isAuthenticatedUserSpecificRequest: false }),
  commentController.getCommentsByPostId
);

//todo: Add getCommentsByCommentId
// commentRouter.post(
//   "/replies/:commentId",
//   validate(commentValidationSchemas.addCommentValidatorSchema),
//   commentController.getCommentsByCommentId
// );

commentRouter.delete(
  "/:commentId",
  validate(commentValidationSchemas.deleteCommentByIdValidatorSchema),
  commentController.deleteCommentById
);

export default commentRouter;
