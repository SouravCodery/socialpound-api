import express from "express";

import * as postController from "../../controllers/v1/post.controllers";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { userMiddleware } from "../../middlewares/user.middleware";

const postRouter = express.Router();

postRouter.use(authMiddleware);
postRouter.use(userMiddleware);

postRouter.post("/", authMiddleware, postController.createPost);

export default postRouter;
