import express from "express";

import * as userController from "../../controllers/v1/user.controllers";
import * as userValidationSchemas from "../../schemas/user-routes.validators";

import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";

const userRouter = express.Router();

userRouter.post(
  "/sign-in",
  authMiddleware,
  validate(userValidationSchemas.signInSchema),
  userController.signIn
);

export default userRouter;
