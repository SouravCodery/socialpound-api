import { Schema } from "mongoose";

export const softDeletePlugin = (schema: Schema) => {
  schema.add({
    isDeleted: { type: Boolean, default: false, select: false, required: true },
    deletedAt: { type: Date, default: null, select: false },
  });

  schema.methods.softDelete = function () {
    this.isDeleted = true;
    this.deletedAt = new Date();

    return this.save();
  };
};
