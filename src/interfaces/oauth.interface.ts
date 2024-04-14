export interface OAuthUserInterface {
  id: string;
  name: string;
  email: string;
  image: string;
}

interface OAuthAccountInterface {
  access_token: string;
  token_type: string;
  scope: string;
  type: string;
  providerAccountId: string;
}

export interface GoogleAccountInterface extends OAuthAccountInterface {
  provider: "google";

  id_token: string;
  expires_in: number;
  expires_at: number;
}

export interface GitHubAccountInterface extends OAuthAccountInterface {
  provider: "github";
}
