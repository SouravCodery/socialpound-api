import express from "express";
import userRouter from "./user.route";

const v1Router = express.Router();

v1Router.use("/user", userRouter);

export default v1Router;
