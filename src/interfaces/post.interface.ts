import { Document, Types } from "mongoose";
import { SoftDeleteInterface } from "./soft-delete.interface";

interface ContentInterface {
  type: "image" | "video";
  url: string;
}

export interface PostInterface {
  user: Types.ObjectId;
  content: ContentInterface[];
  caption: string;
  likesCount: number;
  commentsCount: number;
}

export interface PostDocumentInterface
  extends Document,
    PostInterface,
    SoftDeleteInterface {}
