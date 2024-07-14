import { Schema, model } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

import { UserDocumentInterface } from "../interfaces/user.interface";

import { GoogleAuthUserSchema } from "./google-auth-user.model";
import { GitHubAuthUserSchema } from "./github-auth-user.model";

import baseSchemaOptions from "./base-schema-options";
import { softDeletePlugin } from "./plugins/soft-delete-plugin";

const UserSchema: Schema<UserDocumentInterface> = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    fullName: { type: String, default: "", required: true },

    profilePicture: { type: String, required: true },
    bio: { type: String, default: "" },

    postsCount: { type: Number, default: 0, required: true },
    followersCount: { type: Number, default: 0, required: true },
    followingCount: { type: Number, default: 0, required: true },

    googleAuthUser: { type: GoogleAuthUserSchema, default: null },
    githubAuthUser: { type: GitHubAuthUserSchema, default: null },

    isPrivate: { type: Boolean, default: true, required: true },
  },
  baseSchemaOptions
);

UserSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();

  return this.save();
};

UserSchema.index(
  { username: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } }
);
UserSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } }
);

UserSchema.plugin(uniqueValidator, {
  message: "{PATH} must be unique.",
});

UserSchema.plugin(softDeletePlugin);

const UserModel = model<UserDocumentInterface>("User", UserSchema);

export default UserModel;
