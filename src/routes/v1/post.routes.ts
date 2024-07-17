import express from "express";

import * as postController from "../../controllers/v1/post.controllers";
import { authMiddleware } from "../../middlewares/auth.middleware";

const postRouter = express.Router();

postRouter.post("/add-post", authMiddleware, postController.addPost);

export default postRouter;
