import { Queue, DefaultJobOptions } from "bullmq";
import { bullMQConnection } from "../../../config/bull-mq.config";

export const likeQueue = new Queue("like", {
  connection: bullMQConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: 2000,
  },
});
