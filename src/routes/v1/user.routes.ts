import express from "express";

import * as userController from "../../controllers/v1/user.controllers";
import * as userValidationSchemas from "../../schemas/user-routes.validators";

import { validate } from "../../helpers/joi.helper";

const userRouter = express.Router();

userRouter.post(
  "/sign-in",
  validate(userValidationSchemas.signInSchema),
  userController.signIn
);

export default userRouter;
