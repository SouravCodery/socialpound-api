import { Schema, model } from "mongoose";

import baseSchemaOptions from "./base-schema-options";
import { CommentDocumentInterface } from "./../interfaces/comment.interface";

import { softDeletePlugin } from "./plugins/soft-delete-plugin";

const commentSchema: Schema<CommentDocumentInterface> = new Schema(
  {
    commentOn: { type: String, enum: ["Post", "Comment"], required: true },

    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    text: { type: String, maxLength: 2200, required: true },

    likesCount: { type: Number, default: 0, required: true },
    repliesCount: { type: Number, default: 0, required: true },
  },
  baseSchemaOptions
);

commentSchema.pre("validate", function (next) {
  if (this.commentOn === "Comment" && !this.parentComment) {
    next(new Error(`parentComment is required when likeOn is 'Comment'`));
  } else {
    next();
  }
});

commentSchema.plugin(softDeletePlugin);

//todo: Add compound index on commentOn, post and parentComment

const Comment = model<CommentDocumentInterface>("Comment", commentSchema);
export default Comment;
