import express from "express";

import * as friendshipController from "../../controllers/v1/friendship.controllers";
import * as friendshipValidationSchemas from "../../validators/friendship-routes.validators";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { cacheMiddleware } from "../../middlewares/cache.middleware";

import { validate } from "../../middlewares/validate.middleware";

const friendshipRouter = express.Router();
friendshipRouter.use(authMiddleware);

friendshipRouter.post(
  "/request",
  validate(friendshipValidationSchemas.sendFriendRequestValidatorSchema),
  friendshipController.sendFriendRequest
);

friendshipRouter.patch(
  "/respond",
  validate(friendshipValidationSchemas.respondToFriendRequestValidatorSchema),
  friendshipController.respondToFriendRequest
);

friendshipRouter.get(
  "/list",
  validate(friendshipValidationSchemas.getFriendsListValidatorSchema),
  cacheMiddleware({ isAuthenticatedUserSpecificRequest: true }),
  friendshipController.getFriendsList
);

friendshipRouter.get(
  "/requests",
  validate(friendshipValidationSchemas.getPendingFriendRequestsValidatorSchema),
  cacheMiddleware({ isAuthenticatedUserSpecificRequest: true }),
  friendshipController.getPendingFriendRequests
);

friendshipRouter.get(
  "/status/:otherUser",
  validate(friendshipValidationSchemas.isFriendValidatorSchema),
  friendshipController.friendshipStatus
);

friendshipRouter.delete(
  "/cancel-request/:userId",
  validate(friendshipValidationSchemas.cancelRequestValidatorSchema),
  friendshipController.cancelFriendRequest
);

friendshipRouter.delete(
  "/unfriend/:userId",
  validate(friendshipValidationSchemas.unfriendValidatorSchema),
  friendshipController.unfriend
);

export default friendshipRouter;
