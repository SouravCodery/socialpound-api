import { Queue } from "bullmq";
import { bullMQConnection } from "../../../config/bull-mq.config";

export const notificationQueue = new Queue("notification", {
  connection: bullMQConnection,
});
