import Joi from "joi";

export const addCommentValidatorSchema = {
  bodySchema: Joi.object({
    commentOn: Joi.string().valid("Post", "Comment").required(),

    post: Joi.number().required(),

    parentComment: Joi.when("commentOn", {
      is: "Comment",
      then: Joi.number().required(),
      otherwise: Joi.number().allow(null),
    }),

    text: Joi.string().trim().max(2200).required(),
  }),
};

export const getCommentsByPostIdValidatorSchema = {
  paramsSchema: Joi.object({
    postId: Joi.number().required(),
  }),
  querySchema: Joi.object({
    cursor: Joi.number().optional(),
  }),
};

export const deleteCommentByIdValidatorSchema = {
  paramsSchema: Joi.object({
    commentId: Joi.number().required(),
  }),
};
