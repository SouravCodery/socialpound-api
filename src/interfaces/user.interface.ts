import { Document, ObjectId } from "mongoose";
import { SoftDeleteInterface } from "./soft-delete.interface";

export interface UserInterface {
  username: string;
  email: string;
  fullName: string;
  sub: string;

  profilePicture: string;
  bio: string;

  postsCount: number;
  followersCount: number;
  followingCount: number;

  isPrivate: boolean;

  lastLogin: Date;
}

export interface UserDocumentInterface
  extends Document,
    UserInterface,
    SoftDeleteInterface {}

export interface UserWithIdInterface extends UserInterface {
  _id: ObjectId;
}

export interface UserTokenPayloadInterface {
  id: number;
  email: string;
  fullName: string;
  profilePicture: string;
}
