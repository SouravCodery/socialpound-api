import { ObjectId } from "mongoose";

interface CommentInterface {
  commentOn: "Post" | "Comment";

  post: ObjectId;
  parentComment: ObjectId | null;

  user: ObjectId;

  text: string;

  likesCount: number;
  repliesCount: number;

  isDeleted: boolean;
  deletedAt: Date | null;
}

export interface CommentDocumentInterface extends Document, CommentInterface {}
