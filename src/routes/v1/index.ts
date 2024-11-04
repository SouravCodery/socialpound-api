import express from "express";

import userRouter from "./user.routes";
import postRouter from "./post.routes";
import likeRouter from "./like.routes";
import commentRouter from "./comment.routes";
import awsSignedUrlRouter from "./aws-presigned-url.routes";
import notificationRouter from "./notification.routes";
import friendshipRouter from "./friendship.routes";

const v1Router = express.Router();

v1Router.use("/user", userRouter);
v1Router.use("/post", postRouter);
v1Router.use("/like", likeRouter);
v1Router.use("/comment", commentRouter);
v1Router.use("/notification", notificationRouter);
v1Router.use("/aws-presigned-url", awsSignedUrlRouter);
v1Router.use("/friendship", friendshipRouter);

export default v1Router;
