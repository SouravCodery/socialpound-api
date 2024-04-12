import { Request, Response, NextFunction } from "express";
import { logger } from "../../logger/index.logger";

const signIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info("Triggered!", req.body);
    return res.json("Hey from signIn!");
  } catch (error) {
    logger.error("Something went wrong in the signIn", error);
  }
};

export { signIn };
