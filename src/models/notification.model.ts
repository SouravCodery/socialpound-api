import { Schema, model } from "mongoose";

import { NotificationDocumentInterface } from "../interfaces/notification.interface";
import { softDeletePlugin } from "./plugins/soft-delete-plugin";
import baseSchemaOptions from "./base-schema-options";

const notificationSchema: Schema<NotificationDocumentInterface> = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "like-on-post",
        "like-on-comment",
        "comment",
        "reply",
        "add-friend",
      ],
      required: true,
    },

    post: { type: Schema.Types.ObjectId, ref: "Post", default: null },
    comment: { type: Schema.Types.ObjectId, ref: "Comment", default: null },

    read: { type: Boolean, default: false },
  },
  baseSchemaOptions
);

notificationSchema.index({ recipient: 1, read: 1 });

//todo: enable this on scale
// notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

notificationSchema.pre("validate", function (next) {
  if (
    (this.type === "like-on-comment" ||
      this.type === "comment" ||
      this.type === "reply") &&
    !this.comment
  ) {
    next(new Error(`comment is required when type is 'comment'`));
  } else if (this.type === "like-on-post" && !this.post) {
    next(new Error(`post is required when type is 'like-on-post'`));
  } else {
    next();
  }
});

notificationSchema.plugin(softDeletePlugin);

const Notification = model<NotificationDocumentInterface>(
  "Notification",
  notificationSchema
);
export default Notification;
