import express, { Request, Response, NextFunction } from "express";

import v1Router from "./v1/";
import { HttpError } from "../classes/http-error.class";
import { logger } from "../logger/index.logger";

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({ message: "Socialpound API | @SouravCodery" });
});

router.use("/v1", v1Router);

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      message: err.message,
      toastMessage:
        "Something went wrong processing your request. Please try again later. 🤒",
    });
  }

  logger.error("[Error handling middleware] - Unhandled error", err);

  return res.status(500).json({
    message: "Internal Server Error",
    toastMessage: "Internal Server Error 🤒",
  });
});

router.use((req: Request, res: Response) => {
  return res.status(404).json({
    message: "Invalid Route",
  });
});

export default router;
