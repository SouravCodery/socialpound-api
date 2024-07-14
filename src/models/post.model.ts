import { Schema, model } from "mongoose";
import baseSchemaOptions from "./base-schema-options";

const postSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    content: [
      {
        type: {
          type: String,
          enum: ["image", "video"],
          required: true,
        },
        url: { type: String, required: true },
      },
    ],

    caption: { type: String, maxLength: 2200, default: "", required: true },

    likesCount: { type: Number, default: 0, required: true },
    commentsCount: { type: Number, default: 0, required: true },

    isDeleted: { type: Boolean, default: false, select: false, required: true },
    deletedAt: { type: Date, default: null, select: false },
  },
  baseSchemaOptions
);

const Post = model("Post", postSchema);
export default Post;
