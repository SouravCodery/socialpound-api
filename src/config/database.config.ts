import mongoose from "mongoose";
import config from "./config";
import { logger } from "../logger/index.logger";

const connectToDatabase = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
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
