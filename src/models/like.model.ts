import { Schema, model } from "mongoose";

import { LikeDocumentInterface } from "./../interfaces/like.interface";
import { softDeletePlugin } from "./plugins/soft-delete-plugin";
import baseSchemaOptions from "./base-schema-options";

const likeSchema: Schema<LikeDocumentInterface> = new Schema(
  {
    likeOn: { type: String, enum: ["Post", "Comment"], required: true },

    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    comment: { type: Schema.Types.ObjectId, ref: "Comment", default: null },

    liker: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  baseSchemaOptions
);

likeSchema.index(
  { post: 1, liker: 1, comment: 1 },
  {
    unique: true,
    partialFilterExpression: { comment: { $ne: null } },
  }
);

likeSchema.index(
  { post: 1, liker: 1 },
  {
    unique: true,
    partialFilterExpression: { comment: null },
  }
);

likeSchema.pre("validate", function (next) {
  if (this.likeOn === "Comment" && !this.comment) {
    next(new Error(`comment is required when likeOn is 'Comment'`));
  } else {
    next();
  }
});

likeSchema.plugin(softDeletePlugin);

const Like = model<LikeDocumentInterface>("Like", likeSchema);
export default Like;
