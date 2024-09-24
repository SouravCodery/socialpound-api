import { Request } from "express";
import { UserWithIdInterface } from "./user.interface";

export interface AuthenticatedUserRequestInterface extends Request {
  user: UserWithIdInterface;
  userId: string;
}
