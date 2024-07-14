import { ObjectId, Document } from "mongoose";

interface LikeInterface {
  likeOn: "Post" | "Comment";

  post: ObjectId;
  comment?: ObjectId | null;

  user: ObjectId;

  isDeleted?: boolean;
  deletedAt?: Date;
}

export interface LikeDocumentInterface extends Document, LikeInterface {}
