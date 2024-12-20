import express from "express";

import * as userController from "../../controllers/v1/user.controllers";
import * as userValidationSchemas from "../../validators/user-routes.validators";

import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { cacheMiddleware } from "../../middlewares/cache.middleware";

const userRouter = express.Router();

userRouter.post(
  "/sign-in",
  validate(userValidationSchemas.signInValidatorSchema),
  userController.signIn
);

userRouter.use(authMiddleware);

userRouter.get(
  "/:username",
  validate(userValidationSchemas.getUserValidatorSchema),
  cacheMiddleware({ isAuthenticatedUserSpecificRequest: false }),
  userController.getUserByUsername
);

userRouter.delete("/", userController.deleteUser);

export default userRouter;
