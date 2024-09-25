import { Worker } from "bullmq";

import { Config } from "../../../config/config";
import { bullMQConnection } from "../../../config/bull-mq.config";
import {
  NotificationInterface,
  // MarkNotificationAsReadInterface,
} from "../../../interfaces/notification.interface";
import {
  createNotifications,
  // markNotificationsAsRead,
} from "../../../services/v1/notification.services";
import { JobBatch } from "../../../classes/job-batch.class";
import { logger } from "../../../logger/index.logger";

const notificationAddBatch = new JobBatch<NotificationInterface>({});
// const notificationReadBatch = new JobBatch<MarkNotificationAsReadInterface>({});

export const notificationWorker = new Worker(
  "notification",
  async (job) => {
    try {
      const jobName = job.name;

      switch (jobName) {
        case "add-notification":
          notificationAddBatch.addJob({ job: job.data });
          break;

        // case "notification-read":
        //   notificationReadBatch.addJob({ job: job.data });
        //   break;

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

export const notificationBatchProcessor = setInterval(async () => {
  try {
    const jobsToBeProcessedForAdd = notificationAddBatch.getJobs();

    if (Config.WORKERS_LOG_ENABLED)
      logger.info(`add notification batch: ${jobsToBeProcessedForAdd.length}`);

    if (jobsToBeProcessedForAdd.length > 0) {
      await createNotifications({
        notifications: jobsToBeProcessedForAdd,
      });

      notificationAddBatch.updateLastProcessed();
    }
    notificationAddBatch.processingEnd();

    // const jobsToBeProcessedForRead = notificationReadBatch.getJobs();
    // console.log("read notification batch", jobsToBeProcessedForRead.length);

    // if (jobsToBeProcessedForRead.length > 0) {
    //   await markNotificationsAsRead({
    //     jobs: jobsToBeProcessedForRead,
    //   });

    //   notificationReadBatch.updateLastProcessed();
    // }
    // notificationReadBatch.processingEnd();
  } catch (error) {
    logger.error("Error in notification batch processor", error);
  }
}, 2000);

notificationWorker.on("error", (err) => {
  logger.error(`[Worker: notificationWorker] - Error: ${err.message}`);
});
