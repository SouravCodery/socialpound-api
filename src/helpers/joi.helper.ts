import { Request, Response, NextFunction } from "express";
import Joi from "joi";

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
    if (headersSchema) {
      const { error } = headersSchema.validate(req.headers);

      if (error)
        return res.status(422).json({ error: error.details[0].message });
    }

    if (bodySchema) {
      const { error } = bodySchema.validate(req.body);

      if (error)
        return res.status(422).json({ error: error.details[0].message });
    }

    if (querySchema) {
      const { error } = querySchema.validate(req.query);

      if (error)
        return res.status(422).json({ error: error.details[0].message });
    }

    next();
  };
};
