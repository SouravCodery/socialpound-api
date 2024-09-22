import { Document, ObjectId, Types } from "mongoose";
import { SoftDeleteInterface } from "./soft-delete.interface";

interface ContentInterface {
  type: "image" | "video";
  url: string;
  aspectRatio: number;
}

export interface PostInterface {
  user: ObjectId;
  content: ContentInterface[];
  caption: string;
}

export interface PostDocumentInterface
  extends Document,
    PostInterface,
    SoftDeleteInterface {}

export interface PostWithIdInterface extends PostInterface {
  _id: Types.ObjectId;
}
