import Joi from "joi";

export const signInValidatorSchema = {
  bodySchema: Joi.object({
    token: Joi.string().required(),
  }),
};

export const getUserValidatorSchema = {
  paramsSchema: Joi.object({
    username: Joi.string().required(),
  }),
};
