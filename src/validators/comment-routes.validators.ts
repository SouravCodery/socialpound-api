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

export const getCommentsByPostIdValidatorSchema = {
  paramsSchema: Joi.object({
    postId: Joi.string().alphanum().length(24).required(),
  }),
  querySchema: Joi.object({
    cursor: Joi.string().alphanum().length(24).optional(),
  }),
};

export const deleteCommentByIdValidatorSchema = {
  paramsSchema: Joi.object({
    commentId: Joi.string().alphanum().length(24).required(),
  }),
};
