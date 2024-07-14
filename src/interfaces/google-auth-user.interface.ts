import { OAuthUserInterface } from "./oauth.interface";
import { GoogleAccountInterface } from "./oauth.interface";

interface GoogleProfileInterface {
  aud: string;
  azp: string;
  email: string;
  email_verified: boolean;
  exp: number;
  family_name?: string;
  given_name: string;
  hd?: string;
  iat: number;
  iss: string;
  jti?: string;
  locale?: string;
  name: string;
  nbf?: number;
  picture: string;
  sub: string;
}

export interface GoogleAuthUserInterface {
  user: OAuthUserInterface;
  account: GoogleAccountInterface;
  profile: GoogleProfileInterface;
}
