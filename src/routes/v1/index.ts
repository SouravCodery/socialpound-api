import express from "express";
import userRouter from "./user.routes";
import postRouter from "./post.routes";

const v1Router = express.Router();

v1Router.use("/user", userRouter);
v1Router.use("/post", postRouter);

export default v1Router;
