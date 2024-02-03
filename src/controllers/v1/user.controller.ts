import { Request, Response, NextFunction } from "express";

const signIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Triggered!", req.body);
    return res.json("Hey from signIn!");
  } catch (error) {
    console.log(error);
  }
};

export { signIn };
