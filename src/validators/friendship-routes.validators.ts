import Joi from "joi";

export const sendFriendRequestValidatorSchema = {
  bodySchema: Joi.object({
    receiverId: Joi.string().alphanum().length(24).required(),
  }),
};

export const respondToFriendRequestValidatorSchema = {
  bodySchema: Joi.object({
    requesterId: Joi.string().alphanum().length(24).required(),
    status: Joi.string().valid("accepted", "rejected").required(),
  }),
};

export const getPendingFriendRequestsValidatorSchema = {
  querySchema: Joi.object({
    cursor: Joi.string().alphanum().optional(),
  }),
};
