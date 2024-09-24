import { Schema, model } from "mongoose";

import { UserDocumentInterface } from "../interfaces/user.interface";
import baseSchemaOptions from "./base-schema-options";
import { softDeletePlugin } from "./plugins/soft-delete-plugin";

const userSchema: Schema<UserDocumentInterface> = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    fullName: { type: String, default: "" },
    sub: { type: String, required: true },

    profilePicture: { type: String, default: "" },
    bio: { type: String, default: "" },

    postsCount: { type: Number, default: 0, required: true, min: 0 },
    followersCount: { type: Number, default: 0, required: true, min: 0 },
    followingCount: { type: Number, default: 0, required: true, min: 0 },

    isPrivate: { type: Boolean, default: true, required: true },
  },
  baseSchemaOptions
);

userSchema.index(
  { sub: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
userSchema.index(
  { username: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

userSchema.plugin(softDeletePlugin);

export const UserModel = model<UserDocumentInterface>("User", userSchema);
