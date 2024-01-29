import express, { Request, Response, NextFunction } from "express";
const router = express.Router();

router.get("/", (req, res) => {
  return res.json({ message: "Instagram Clone API | @SouravCodery" });
});

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).send("Internal Server Error");
});

export default router;
