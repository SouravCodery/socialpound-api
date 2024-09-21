import { Request } from "express";

import { UserWithIdInterface } from "./user.interface";
import { OAuthUserInterface } from "./oauth.interface";

export interface AuthenticatedRequestInterface extends Request {
  decodedAuthToken: OAuthUserInterface;
}

export interface AuthenticatedUserRequestInterface
  extends AuthenticatedRequestInterface {
  user: UserWithIdInterface;
  userId: string;
}
