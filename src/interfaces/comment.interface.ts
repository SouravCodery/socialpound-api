import { ObjectId, Types } from "mongoose";
import { SoftDeleteInterface } from "./soft-delete.interface";

export interface CommentInterface {
  commentOn: "Post" | "Comment";

  post: ObjectId;
  parentComment: ObjectId | null;

  user: ObjectId;

  text: string;
}

export interface CommentDocumentInterface
  extends Document,
    CommentInterface,
    SoftDeleteInterface {}

export interface CommentWithIdInterface extends CommentInterface {
  _id: Types.ObjectId;
}
