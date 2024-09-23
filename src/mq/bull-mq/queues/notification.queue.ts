import { Queue } from "bullmq";
import {
  bullMQConnection,
  bullMQDefaultJobOptions,
} from "../../../config/bull-mq.config";
import { logger } from "../../../logger/index.logger";

export const notificationQueue = new Queue("notification", {
  connection: bullMQConnection,
  defaultJobOptions: bullMQDefaultJobOptions,
});

notificationQueue.on("error", (err) => {
  logger.error(`[Worker: notificationQueue] - Error: ${err.message}`);
});
