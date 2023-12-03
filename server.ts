import express, { Request, Response } from "express";

const app = express();
const port = 3001;

app.get("/", (req: Request, res: Response) => {
  return res.json({ message: "Instagram Clone API | @SouravCodery" });
});

app.listen(port, () => {
  console.log(`Instagram Clone API listening on: ${port}`);
});
