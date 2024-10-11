import Joi from "joi";

export const getNotificationsByUserValidatorSchema = {
  querySchema: Joi.object({
    cursor: Joi.number().optional(),
  }),
};

export const addMarkNotificationAsReadValidatorSchema = {
  paramsSchema: Joi.object({
    notificationId: Joi.number().required(),
  }),
  querySchema: Joi.object({
    cursor: Joi.number().optional(),
  }),
};
