import { SchemaOptions } from "mongoose";

const baseSchemaOptions: SchemaOptions = {
  timestamps: true,
  autoIndex: process.env.NODE_ENV !== "production",
};

export default baseSchemaOptions;
