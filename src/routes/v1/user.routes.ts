import express from "express";

import * as userController from "../../controllers/v1/user.controllers";
import * as userValidationSchemas from "../../validators/user-routes.validators";

import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { userMiddleware } from "../../middlewares/user.middleware";

const userRouter = express.Router();

userRouter.post(
  "/sign-in",
  authMiddleware,
  validate(userValidationSchemas.signInValidatorSchema),
  userController.signIn
);

userRouter.use(authMiddleware);
userRouter.use(userMiddleware);

userRouter.get("/:username", userController.getUserByUsername);

userRouter.delete("/", userController.deleteUser);

export default userRouter;
