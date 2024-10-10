import { PrismaClient } from "@prisma/client";
import { logger } from "../logger/index.logger";

const prisma = new PrismaClient();

const connectToDatabase = async () => {
  try {
    await prisma.$connect();
    logger.info("PostgreSQL connected successfully!");
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
    await prisma.$disconnect();
    logger.info("PostgreSQL disconnected successfully!");
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

export { connectToDatabase, disconnectFromDatabase, prisma };
