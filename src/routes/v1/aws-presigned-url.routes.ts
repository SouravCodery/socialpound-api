import express from "express";

import * as awsSignedUrlController from "../../controllers/v1/aws-presigned-url.controllers";
import * as awsSignedUrlValidationSchemas from "../../validators/aws-presigned-url-routes.validators";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";

const awsPreSignedUrlRouter = express.Router();
awsPreSignedUrlRouter.use(authMiddleware);

awsPreSignedUrlRouter.post(
  "/",
  validate(awsSignedUrlValidationSchemas.getSignedUrlValidatorSchema),
  awsSignedUrlController.getPresignedUrl
);

export default awsPreSignedUrlRouter;
