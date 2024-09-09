import { Queue } from "bullmq";
import { bullMQConnection } from "../../../config/bull-mq.config";

export const commentQueue = new Queue("comment", {
  connection: bullMQConnection,
});
