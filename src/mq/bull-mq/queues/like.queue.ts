import { Queue } from "bullmq";
import {
  bullMQConnection,
  bullMQDefaultJobOptions,
} from "../../../config/bull-mq.config";
import { logger } from "../../../logger/index.logger";

export const likeQueue = new Queue("like", {
  connection: bullMQConnection,
  defaultJobOptions: bullMQDefaultJobOptions,
});

likeQueue.on("error", (err) => {
  logger.error(`[Worker: likeQueue] - Error: ${err.message}`);
});
