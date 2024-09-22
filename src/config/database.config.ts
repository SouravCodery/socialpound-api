import mongoose from "mongoose";
import { Config } from "./config";

import { logger } from "../logger/index.logger";

const connectToDatabase = async () => {
  try {
    await mongoose.connect(Config.MONGODB_URI, {
      autoIndex: true,
    });
    logger.info("MongoDB connected successfully!");
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Something went wrong in connectToDatabase!", error.message);
    } else {
      logger.error("Something went wrong in connectToDatabase!", error);
    }

    process.exit(1);
  }
};

export default connectToDatabase;
