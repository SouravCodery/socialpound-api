import Joi from "joi";

export const getNotificationsByUserValidatorSchema = {
  querySchema: Joi.object({
    cursor: Joi.string().alphanum().length(24).optional(),
  }),
};

export const addMarkNotificationAsReadValidatorSchema = {
  paramsSchema: Joi.object({
    notificationId: Joi.string().alphanum().length(24).required(),
  }),
  querySchema: Joi.object({
    cursor: Joi.string().alphanum().length(24).optional(),
  }),
};
