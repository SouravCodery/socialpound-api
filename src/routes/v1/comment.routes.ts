import express from "express";

import * as commentController from "../../controllers/v1/comment.controllers";
import * as commentValidationSchemas from "../../validators/comment-routes.validators";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { userMiddleware } from "../../middlewares/user.middleware";
import { validate } from "../../middlewares/validate.middleware";

const commentRouter = express.Router();

commentRouter.use(authMiddleware);
commentRouter.use(userMiddleware);

commentRouter.post(
  "/",
  validate(commentValidationSchemas.addCommentValidatorSchema),
  commentController.addComment
);

export default commentRouter;
