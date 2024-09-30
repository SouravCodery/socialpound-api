import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { HttpError } from "../classes/http-error.class";
import { logger } from "../logger/index.logger";

export const validate = ({
  bodySchema = Joi.object({}),
  headersSchema,
  querySchema = Joi.object({}),
  paramsSchema = Joi.object({}),
}: {
  bodySchema?: Joi.ObjectSchema;
  headersSchema?: Joi.ObjectSchema;
  querySchema?: Joi.ObjectSchema;
  paramsSchema?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (headersSchema) {
        const { error } = headersSchema.validate(req.headers);

        if (error) {
          return next(
            new HttpError({
              status: 422,
              message: error.details[0].message,
              toastMessage: error.details[0].message,
            })
          );
        }
      }

      if (bodySchema) {
        const { error, value } = bodySchema.validate(req.body);
        req.body = value;

        if (error) {
          return next(
            new HttpError({
              status: 422,
              message: error.details[0].message,
              toastMessage: error.details[0].message,
            })
          );
        }
      }

      if (querySchema) {
        const { error } = querySchema.validate(req.query);

        if (error) {
          return next(
            new HttpError({
              status: 422,
              message: error.details[0].message,
              toastMessage: error.details[0].message,
            })
          );
        }
      }

      if (paramsSchema) {
        const { error } = paramsSchema.validate(req.params);

        if (error) {
          return next(
            new HttpError({
              status: 422,
              message: error.details[0].message,
              toastMessage: error.details[0].message,
            })
          );
        }
      }

      next();
    } catch (error) {
      logger.error("Something went wrong in validate middleware", error);

      return next(
        new HttpError({ status: 500, message: "Internal Server Error" })
      );
    }
  };
};
