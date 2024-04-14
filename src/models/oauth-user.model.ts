import { Schema } from "mongoose";
import { OAuthUserInterface } from "../interfaces/oauth.interface";

export const OAuthUserSchema = {
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  image: { type: String, required: true },
};
