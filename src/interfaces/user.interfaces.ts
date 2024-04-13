import { Document } from "mongoose";

export interface GoogleAuthInterface extends Document {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
  account: {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
    id_token: string;
    expires_at: number;
    provider: string;
    type: string;
    providerAccountId: string;
  };
  profile: {
    iss: string;
    azp: string;
    aud: string;
    sub: string;
    email: string;
    email_verified: boolean;
    at_hash: string;
    name: string;
    picture: string;
    given_name: string;
    family_name: string;
    iat: number;
    exp: number;
  };
}

export interface UserInterface extends Document {
  username: string;
  email: string;
  fullName?: string;
  profilePicture?: string;
  bio?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  googleAuth?: GoogleAuthInterface;
  isPrivate: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
}
