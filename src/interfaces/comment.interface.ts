import { ObjectId } from "mongoose";
import { SoftDeleteInterface } from "./soft-delete.interface";

export interface CommentInterface {
  commentOn: "Post" | "Comment";

  post: ObjectId;
  parentComment: ObjectId | null;

  user: ObjectId;

  text: string;

  likesCount: number;
  repliesCount: number;
}

export interface CommentDocumentInterface
  extends Document,
    CommentInterface,
    SoftDeleteInterface {}
