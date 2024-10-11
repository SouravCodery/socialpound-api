import Joi from "joi";

export const likePostOrCommentValidatorSchema = {
  bodySchema: Joi.object({
    likeOn: Joi.string().valid("Post", "Comment").required(),
    post: Joi.number().required(),
    comment: Joi.when("likeOn", {
      is: "Comment",
      then: Joi.number().required(),
      otherwise: Joi.string().allow(null),
    }),
  }),
};

export const getLikesByPostIdValidatorSchema = {
  paramsSchema: Joi.object({
    postId: Joi.number().required(),
  }),
  querySchema: Joi.object({
    cursor: Joi.number().optional(),
  }),
};

export const unlikePostValidatorSchema = {
  paramsSchema: Joi.object({
    postId: Joi.number().required(),
  }),
};
