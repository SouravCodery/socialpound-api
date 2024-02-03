import express from "express";

import * as userController from "./../../controllers/v1/user.controller";

const userRouter = express.Router();
userRouter.post("/signIn", userController.signIn);

export default userRouter;
