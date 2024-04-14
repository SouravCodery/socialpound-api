import mongoose, { Schema } from "mongoose";
import { UserDocumentInterface } from "../interfaces/user.interfaces";

import { GoogleAuthUserSchema } from "./google-auth-user.model";
import { GitHubAuthUserSchema } from "./github-auth-user.model";

const UserSchema: Schema<UserDocumentInterface> = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    fullName: { type: String },
    profilePicture: { type: String, required: true },
    bio: { type: String, default: "" },
    postsCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    googleAuthUser: { type: GoogleAuthUserSchema, default: null },
    githubAuthUser: { type: GitHubAuthUserSchema, default: null },
    isPrivate: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false, select: false },
    deletedAt: { type: Date, select: false },
  },
  { timestamps: true }
);

// Soft delete method
UserSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Ensure unique username and email only for active users
UserSchema.index(
  { username: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } }
);
UserSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } }
);

// Apply the uniqueValidator plugin to user schema.
import uniqueValidator from "mongoose-unique-validator";
UserSchema.plugin(uniqueValidator, {
  message: "Error, expected {PATH} to be unique.",
});

const UserModel = mongoose.model<UserDocumentInterface>("User", UserSchema);

export default UserModel;
