import express, { Request, Response, NextFunction } from "express";
import v1Router from "./v1/";

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({ message: "Instagram Clone API | @SouravCodery" });
});

router.use("/v1", v1Router);

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).send("Internal Server Error");
});

export default router;
