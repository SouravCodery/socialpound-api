import { Worker } from "bullmq";
import { bullMQConnection } from "../../../config/bull-mq.config";

import {
  createNotifications,
  markNotificationsAsRead,
} from "../../../services/v1/notification.services";
import {
  NotificationInterface,
  MarkNotificationAsReadInterface,
} from "../../../interfaces/notification.interface";

import { logger } from "../../../logger/index.logger";
import { JobBatch } from "../../../classes/job-batch.class";

const notificationAddBatch = new JobBatch<NotificationInterface>({
  batchInterval: 3000,
  batchSize: 100,
});
const notificationReadBatch = new JobBatch<MarkNotificationAsReadInterface>({
  batchInterval: 3000,
  batchSize: 100,
});

export const notificationWorker = new Worker(
  "notification",
  async (job) => {
    try {
      const jobName = job.name;

      switch (jobName) {
        case "add-notification":
          notificationAddBatch.addJob({ job: job.data });
          break;

        case "notification-read":
          notificationReadBatch.addJob({ job: job.data });
          break;

        default:
          throw new Error(`Unknown job name: ${jobName}`);
      }
    } catch (error) {
      logger.error("Error in notification worker", error);
      throw error;
    }
  },
  {
    connection: bullMQConnection,
  }
);
