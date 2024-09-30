import Joi from "joi";

const supportedImageTypes = ["image/webp", "image/jpeg", "image/jpg"];

const MIN_FILE_SIZE = 1024; //1KB
const MAX_FILE_SIZE = 5 * 1024 * 1024; //5MB

export const getSignedUrlValidatorSchema = {
  bodySchema: Joi.object({
    size: Joi.number()
      .required()
      .min(MIN_FILE_SIZE)
      .max(MAX_FILE_SIZE)
      .messages({
        "number.base": "File size must be a number.",
        "number.min": `File size must be at least ${MIN_FILE_SIZE / 1024} KB.`,
        "number.max": `File size must be less than ${
          MAX_FILE_SIZE / (1024 * 1024)
        } MB.`,
        "any.required": "File size is required.",
      }),
    type: Joi.string()
      .required()
      .valid(...supportedImageTypes)
      .messages({
        "string.base": "File type must be a string.",
        "any.only": `File type must be one of the following: ${supportedImageTypes.join(
          ", "
        )}.`,
        "any.required": "File type is required.",
      }),
  }),
};
