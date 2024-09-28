import express from "express";

import * as notificationController from "../../controllers/v1/notification.controllers";
import * as notificationValidationSchemas from "../../validators/notification-routes.validators";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { cacheMiddleware } from "../../middlewares/cache.middleware";

const notificationRouter = express.Router();
notificationRouter.use(authMiddleware);

notificationRouter.get(
  "/",
  validate(notificationValidationSchemas.getNotificationsByUserValidatorSchema),
  cacheMiddleware({ isAuthenticatedUserSpecificRequest: true }),
  notificationController.getNotificationsByUser
);

// notificationRouter.patch(
//   "/:notificationId",
//   validate(
//     notificationValidationSchemas.addMarkNotificationAsReadValidatorSchema
//   ),
//   notificationController.addMarkNotificationAsRead
// );

export default notificationRouter;
