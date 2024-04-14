import mongoose, { Schema } from "mongoose";
import {
  UserDocumentInterface,
  GoogleAuthDocumentInterface,
} from "../interfaces/user.interfaces";

export const GoogleAuthSchema: Schema<GoogleAuthDocumentInterface> = new Schema(
  {
    user: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      image: { type: String, required: true },
    },
    account: {
      access_token: { type: String, required: true },
      expires_in: { type: Number, required: true },
      scope: { type: String, required: true },
      token_type: { type: String, required: true },
      id_token: { type: String, required: true },
      expires_at: { type: Number, required: true },
      provider: {
        type: String,
        required: true,
        default: "google",
        enum: ["google"],
      },
      type: { type: String, required: true },
      providerAccountId: { type: String, required: true },
    },
    profile: {
      iss: { type: String, required: true },
      azp: { type: String, required: true },
      aud: { type: String, required: true },
      sub: { type: String, required: true },
      email: { type: String, required: true },
      email_verified: { type: Boolean, required: true },
      at_hash: { type: String, required: true },
      name: { type: String, required: true },
      picture: { type: String, required: true },
      given_name: { type: String, required: true },
      family_name: { type: String, required: true },
      iat: { type: Number, required: true },
      exp: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

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
    googleAuth: GoogleAuthSchema,
    isPrivate: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
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

export const GoogleAuthModel = mongoose.model<GoogleAuthDocumentInterface>(
  "GoogleAuthModel",
  GoogleAuthSchema
);

export default UserModel;
