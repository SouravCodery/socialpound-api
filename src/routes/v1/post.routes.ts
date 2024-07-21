import express from "express";

import * as postController from "../../controllers/v1/post.controllers";
import * as postValidationSchemas from "../../validators/post-routes.validators";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { userMiddleware } from "../../middlewares/user.middleware";
import { validate } from "../../middlewares/validate.middleware";

const postRouter = express.Router();

postRouter.use(authMiddleware);
postRouter.use(userMiddleware);

postRouter.post(
  "/",
  validate(postValidationSchemas.createPostValidatorSchema),
  postController.createPost
);

postRouter.get("/", postController.getAllPosts);

export default postRouter;
