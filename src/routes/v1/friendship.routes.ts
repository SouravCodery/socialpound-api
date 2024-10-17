import express from "express";

import * as friendshipController from "../../controllers/v1/friendship.controllers";
import * as friendshipValidationSchemas from "../../validators/friendship-routes.validators";

import { authMiddleware } from "../../middlewares/auth.middleware";

import { validate } from "../../middlewares/validate.middleware";

const friendshipRouter = express.Router();
friendshipRouter.use(authMiddleware);

friendshipRouter.post(
  "/request",
  validate(friendshipValidationSchemas.sendFriendRequestValidatorSchema),
  friendshipController.sendFriendRequest
);

friendshipRouter.put(
  "/respond",
  validate(friendshipValidationSchemas.respondToFriendRequestValidatorSchema),
  friendshipController.respondToFriendRequest
);

friendshipRouter.get("/list", friendshipController.getFriendsList);

friendshipRouter.get(
  "/requests",
  friendshipController.getPendingFriendRequests
);

export default friendshipRouter;
