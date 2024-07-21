import Joi from "joi";

export const signInValidatorSchema = {
  bodySchema: Joi.object({
    signedUserDataJWT: Joi.string().required(),
  }),
  headersSchema: Joi.object({
    authorization: Joi.string().required(),
  }).unknown(),
};
