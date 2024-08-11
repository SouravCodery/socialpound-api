import Joi from "joi";

export const addCommentValidatorSchema = {
  bodySchema: Joi.object({
    commentOn: Joi.string().valid("Post", "Comment").required(),

    post: Joi.string().required(),

    parentComment: Joi.when("commentOn", {
      is: "Comment",
      then: Joi.string().required(),
      otherwise: Joi.string().allow(null),
    }),

    text: Joi.string().trim().max(2200).required(),
  }),
};
