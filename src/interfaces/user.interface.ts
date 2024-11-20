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
  friendsCount: number;

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

export interface PopulatedUserInterface {
  _id: string;
  email: string;
  username: string;
  fullName: string;
  profilePicture: string;
}

export interface UserTokenPayloadInterface {
  _id: string;
  email: string;
  fullName: string;
  profilePicture: string;
}
