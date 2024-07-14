import { Schema, model } from "mongoose";

import baseSchemaOptions from "./base-schema-options";
import { LikeDocumentInterface } from "./../interfaces/like.interface";

import { softDeletePlugin } from "./plugins/soft-delete-plugin";

const likeSchema: Schema<LikeDocumentInterface> = new Schema(
  {
    likeOn: { type: String, enum: ["Post", "Comment"], required: true },

    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    comment: { type: Schema.Types.ObjectId, ref: "Comment", default: null },

    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  baseSchemaOptions
);

likeSchema.pre("validate", function (next) {
  if (this.likeOn === "Comment" && !this.comment) {
    next(new Error(`comment is required when likeOn is 'Comment'`));
  } else {
    next();
  }
});

likeSchema.plugin(softDeletePlugin);

const Like = model("Like", likeSchema);
export default Like;
