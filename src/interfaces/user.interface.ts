import { Document } from "mongoose";

import { GoogleAuthUserInterface } from "./google-auth-user.interface";
import { GitHubAuthUserInterface } from "./github-auth-user.interface";
import { SoftDeleteInterface } from "./soft-delete.interface";

interface UserInterface {
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
