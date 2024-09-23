import { Queue } from "bullmq";
import {
  bullMQConnection,
  bullMQDefaultJobOptions,
} from "../../../config/bull-mq.config";
import { logger } from "../../../logger/index.logger";

export const commentQueue = new Queue("comment", {
  connection: bullMQConnection,
  defaultJobOptions: bullMQDefaultJobOptions,
});

commentQueue.on("error", (err) => {
  logger.error(`[Worker: commentQueue] - Error: ${err.message}`);
});
