import express, { Request, Response, NextFunction } from "express";

const app = express();

app.get("/", (req, res) => {
  return res.json({ message: "Instagram Clone API | @SouravCodery" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).send("Internal Server Error");
});

export default app;
