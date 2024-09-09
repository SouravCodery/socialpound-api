import Joi from "joi";

export const likePostOrCommentValidatorSchema = {
  bodySchema: Joi.object({
    likeOn: Joi.string().valid("Post", "Comment").required(),
    post: Joi.string().alphanum().length(24).required(),
    comment: Joi.when("likeOn", {
      is: "Comment",
      then: Joi.string().alphanum().length(24).required(),
      otherwise: Joi.string().allow(null),
    }),
  }),
};
