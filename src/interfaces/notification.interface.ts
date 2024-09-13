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
  comment: Types.ObjectId | null;

  read: boolean;
  createdAt: Date;
}

export interface NotificationDocumentInterface
  extends Document,
    NotificationInterface {}

export interface NotificationWithIdInterface extends NotificationInterface {
  _id: Types.ObjectId;
}

export interface NotificationJobInterface {
  name: "add-notification";
  data: {
    recipient: NotificationInterface["recipient"];
    sender: NotificationInterface["sender"];
    type: NotificationInterface["type"];
    post?: NotificationInterface["post"];
    comment?: NotificationInterface["comment"];
  };
}

export interface MarkNotificationAsReadInterface {
  notificationId: string;
  recipient: string;
}
