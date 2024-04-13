import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { HttpError } from "../classes/http-error.class";
import { logger } from "../logger/index.logger";

export const validate = ({
  bodySchema,
  headersSchema,
  querySchema,
}: {
  bodySchema?: Joi.ObjectSchema;
  headersSchema?: Joi.ObjectSchema;
  querySchema?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (headersSchema) {
        const { error } = headersSchema.validate(req.headers);

        if (error) {
          return next(new HttpError(422, error.details[0].message));
        }
      }

      if (bodySchema) {
        const { error } = bodySchema.validate(req.body);

        if (error) {
          return next(new HttpError(422, error.details[0].message));
        }
      }

      if (querySchema) {
        const { error } = querySchema.validate(req.query);

        if (error) {
          return next(new HttpError(422, error.details[0].message));
        }
      }

      next();
    } catch (error) {
      logger.error("Something went wrong in validate middleware", error);

      return next(new HttpError(500, "Internal Server Error"));
    }
  };
};
