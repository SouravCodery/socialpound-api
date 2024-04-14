import { Document } from "mongoose";

import { GoogleAuthUserInterface } from "./google-auth-user.interface";
import { GitHubAuthUserInterface } from "./github-auth-user.interface";

export interface UserInterface {
  username: string;
  email: string;
  fullName?: string;
  profilePicture?: string;
  bio?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  googleAuthUser?: GoogleAuthUserInterface;
  githubAuthUser?: GitHubAuthUserInterface;
  isPrivate: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface UserDocumentInterface extends Document, UserInterface {}
