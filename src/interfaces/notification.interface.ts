import { ObjectId, Document, Types } from "mongoose";
import { SoftDeleteInterface } from "./soft-delete.interface";

type NotificationTypes =
  | "like-on-post"
  | "like-on-comment"
  | "comment"
  | "reply"
  | "add-friend";

export interface NotificationInterface {
  recipient: ObjectId;
  sender: ObjectId;
  type: NotificationTypes;

  post: ObjectId | null;
  comment: ObjectId | null;

  read: boolean;
  createdAt: Date;
}

export interface NotificationDocumentInterface
  extends Document,
    NotificationInterface {}

export interface NotificationWithIdInterface extends NotificationInterface {
  _id: Types.ObjectId;
}
