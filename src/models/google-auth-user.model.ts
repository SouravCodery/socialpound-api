import { OAuthUserSchema } from "./oauth-user.model";

const GoogleAccountSchema = {
  access_token: { type: String, required: true },
  token_type: { type: String, required: true },
  scope: { type: String, required: true },
  type: { type: String, required: true },
  providerAccountId: { type: String, required: true },
  provider: {
    type: String,
    required: true,
    default: "google",
    enum: ["google"],
  },
  id_token: { type: String, required: true },
  expires_in: { type: Number, required: true },
  expires_at: { type: Number, required: true },
};

const GoogleProfileSchema = {
  aud: { type: String, required: true },
  azp: { type: String, required: true },
  email: { type: String, required: true },
  email_verified: { type: Boolean, required: true },
  exp: { type: Number, required: true },
  family_name: { type: String },
  given_name: { type: String, required: true },
  hd: { type: String },
  iat: { type: Number, required: true },
  iss: { type: String, required: true },
  jti: { type: String },
  locale: { type: String },
  name: { type: String, required: true },
  nbf: { type: Number },
  picture: { type: String, required: true },
  sub: { type: String, required: true },
};

export const GoogleAuthUserSchema = {
  user: OAuthUserSchema,
  profile: GoogleProfileSchema,
};
