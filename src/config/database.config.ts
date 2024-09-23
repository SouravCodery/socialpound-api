import mongoose from "mongoose";
import { Config } from "./config";
import { logger } from "../logger/index.logger";

const connectToDatabase = async () => {
  try {
    await mongoose.connect(Config.MONGODB_URI);
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

const disconnectFromDatabase = async () => {
  try {
    await mongoose.disconnect();

    logger.info("MongoDB disconnected successfully!");
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        "Something went wrong in disconnectFromDatabase!",
        error.message
      );
    } else {
      logger.error("Something went wrong in disconnectFromDatabase!", error);
    }
  }
};

export { connectToDatabase, disconnectFromDatabase };
