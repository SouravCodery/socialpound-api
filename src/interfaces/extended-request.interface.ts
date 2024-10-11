import { Request } from "express";

export interface AuthenticatedUserRequestInterface extends Request {
  user: {
    id: number;
    email: string;
    fullName: string;
  };
  userId: number;
}
