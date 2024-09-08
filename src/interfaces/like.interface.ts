import { ObjectId, Document } from "mongoose";
import { SoftDeleteInterface } from "./soft-delete.interface";

interface LikeInterface {
  likeOn: "Post" | "Comment";

  post: ObjectId;
  comment: ObjectId | null;

  author: ObjectId;
  liker: ObjectId;
}

export interface LikeDocumentInterface
  extends Document,
    LikeInterface,
    SoftDeleteInterface {}
