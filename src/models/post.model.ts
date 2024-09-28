import { Schema, model } from "mongoose";

import { PostDocumentInterface } from "./../interfaces/post.interface";
import { softDeletePlugin } from "./plugins/soft-delete-plugin";
import baseSchemaOptions from "./base-schema-options";

const postSchema: Schema<PostDocumentInterface> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    content: [
      {
        type: {
          type: String,
          enum: ["image", "video"],
          required: true,
        },
        url: { type: String, required: true },
        aspectRatio: { type: Number, required: true, default: 1 },
      },
    ],

    caption: { type: String, maxLength: 2200, default: "" },

    isUserDeleted: { type: Boolean, default: false },
  },
  baseSchemaOptions
);

postSchema.plugin(softDeletePlugin);

const Post = model<PostDocumentInterface>("Post", postSchema);
export default Post;
