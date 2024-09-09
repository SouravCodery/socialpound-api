import { ObjectId, Document, Types } from "mongoose";
import { SoftDeleteInterface } from "./soft-delete.interface";

export interface LikeInterface {
  likeOn: "Post" | "Comment";

  post: ObjectId;
  comment: ObjectId | null;

  liker: ObjectId;
}

export interface LikeDocumentInterface
  extends Document,
    LikeInterface,
    SoftDeleteInterface {}

export interface LikeWithIdInterface extends LikeInterface {
  _id: Types.ObjectId;
}
