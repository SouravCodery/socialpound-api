import { HttpError } from "../../classes/http-error.class";
import { HttpResponse } from "../../classes/http-response.class";

import { logger } from "../../logger/index.logger";
import Post from "../../models/post.model";

import { PostInterface } from "./../../interfaces/post.interface";

export const createPost = async ({
  user,
  content,
  caption,
}: {
  user: PostInterface["user"];
  content: PostInterface["content"];
  caption: PostInterface["caption"];
}) => {
  try {
    const newPost = new Post({
      user,
      content,
      caption,
    });

    await newPost.save();

    return new HttpResponse({
      status: 201,
      message: "Post created successfully",
    });
  } catch (error) {
    logger.error("[Service: createPost] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, "Something went wrong in post creation");
  }
};

export const getAllPosts = async () => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePicture -_id")
      .select("-createdAt -updatedAt -__v")
      .lean();

    return new HttpResponse({
      status: 200,
      message: "Posts fetched successfully",

      data: posts,
    });
  } catch (error) {
    logger.error("[Service: getAllPosts] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, "Something went wrong in fetching all the posts");
  }
};
