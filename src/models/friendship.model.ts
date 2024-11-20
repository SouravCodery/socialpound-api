import { Schema, model } from "mongoose";

import { FriendshipDocumentInterface } from "../interfaces/friendship.interface";
import { softDeletePlugin } from "./plugins/soft-delete-plugin";
import baseSchemaOptions from "./base-schema-options";

const friendshipSchema: Schema<FriendshipDocumentInterface> = new Schema(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["requested", "accepted", "rejected"],
      required: true,
      default: "requested",
    },
  },
  baseSchemaOptions
);

friendshipSchema.index({ requester: 1, receiver: 1 }, { unique: true });
friendshipSchema.plugin(softDeletePlugin);

const Friendship = model<FriendshipDocumentInterface>(
  "Friendship",
  friendshipSchema
);

export default Friendship;
