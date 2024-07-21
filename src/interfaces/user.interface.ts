import { Document, Types } from "mongoose";

import { GoogleAuthUserInterface } from "./google-auth-user.interface";
import { GitHubAuthUserInterface } from "./github-auth-user.interface";
import { SoftDeleteInterface } from "./soft-delete.interface";

export interface UserInterface {
  username: string;
  email: string;
  fullName: string;

  profilePicture: string;
  bio: string;

  postsCount: number;
  followersCount: number;
  followingCount: number;

  googleAuthUser: GoogleAuthUserInterface | null;
  githubAuthUser: GitHubAuthUserInterface | null;

  isPrivate: boolean;
}

export interface UserDocumentInterface
  extends Document,
    UserInterface,
    SoftDeleteInterface {}

export interface UserWithIdInterface extends UserInterface {
  _id: Types.ObjectId;
}
