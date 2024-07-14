import { Schema, model } from "mongoose";
import baseSchemaOptions from "./base-schema-options";

import { CommentDocumentInterface } from "./../interfaces/comment.interface";

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

    isDeleted: { type: Boolean, default: false, select: false, required: true },
    deletedAt: { type: Date, default: null, select: false },
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

const Comment = model("Comment", commentSchema);
export default Comment;
