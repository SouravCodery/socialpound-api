import express, { Request, Response, NextFunction } from "express";
import v1Router from "./v1/";
import { HttpError } from "../classes/http-error.class";

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({ message: "Socialpound API | @SouravCodery" });
});

router.use("/v1", v1Router);

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
      },
    });
  }

  return res.status(500).json({
    error: {
      message: "Internal Server Error",
    },
  });
});

export default router;
