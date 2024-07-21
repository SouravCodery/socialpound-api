import Joi from "joi";

export const createPostValidatorSchema = {
  bodySchema: Joi.object({
    content: Joi.array()
      .items(
        Joi.object({
          type: Joi.string().valid("image", "video").required(),
          url: Joi.string().uri().required(),
        })
      )
      .required()
      .max(10),

    caption: Joi.string().max(2200).default(""),
  }),
};
