import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  username: string;
  email: string;
  fullName?: string;
  profilePicture?: string;
  bio?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  isPrivate: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    fullName: { type: String },
    profilePicture: { type: String },
    bio: { type: String },
    postsCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
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

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
