import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { HttpError } from "../classes/http-error.class";
import { logger } from "../logger/index.logger";

export const validate = ({
  bodySchema,
  headersSchema,
  querySchema,
  paramsSchema,
}: {
  bodySchema?: Joi.ObjectSchema;
  headersSchema?: Joi.ObjectSchema;
  querySchema?: Joi.ObjectSchema;
  paramsSchema?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (headersSchema) {
        const { error, value } = headersSchema.validate(req.headers);
        req.headers = value;

        if (error) {
          return next(new HttpError(422, error.details[0].message));
        }
      }

      if (bodySchema) {
        const { error, value } = bodySchema.validate(req.body);
        req.body = value;

        if (error) {
          return next(new HttpError(422, error.details[0].message));
        }
      }

      if (querySchema) {
        const { error, value } = querySchema.validate(req.query);
        req.query = value;

        if (error) {
          return next(new HttpError(422, error.details[0].message));
        }
      }

      if (paramsSchema) {
        const { error, value } = paramsSchema.validate(req.params);
        req.params = value;

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
