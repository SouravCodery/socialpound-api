import Joi from "joi";

export const createPostValidatorSchema = {
  bodySchema: Joi.object({
    content: Joi.array()
      .items(
        Joi.object({
          type: Joi.string().valid("image", "video").required(),
          url: Joi.string().trim().required(),
          aspectRatio: Joi.number().required().default(1).min(0.33).max(3),
        })
      )
      .required()
      .max(10),

    caption: Joi.string().trim().max(2200).default(""),
  }),
};
