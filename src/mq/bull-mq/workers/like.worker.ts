import { Worker } from "bullmq";

import { Config } from "../../../config/config";
import { bullMQConnection } from "../../../config/bull-mq.config";
import { likePosts } from "./../../../services/v1/like.services";
import { JobBatch } from "../../../classes/job-batch.class";
import { LikeInterface } from "../../../interfaces/like.interface";
import { logger } from "../../../logger/index.logger";

const likePostBatch = new JobBatch<LikeInterface>({});

export const likeWorker = new Worker(
  "like",
  async (job) => {
    try {
      const jobName = job.name;

      switch (jobName) {
        case "like-Post":
          likePostBatch.addJob({ job: job.data });
          break;

        default:
          break;
      }
    } catch (error) {
      logger.error("Error in like worker", error);
      throw error;
    }
  },
  {
    connection: bullMQConnection,
  }
);

export const likePostBatchTimeout = setInterval(async () => {
  try {
    const jobsToBeProcessed = likePostBatch.getJobs();

    if (Config.WORKERS_LOG_ENABLED)
      logger.info(`like batch: ${jobsToBeProcessed.length}`);

    if (jobsToBeProcessed.length > 0) {
      await likePosts({ likes: jobsToBeProcessed });
      likePostBatch.updateLastProcessed();
    }

    likePostBatch.processingEnd();
  } catch (error) {
    logger.error("Error in likePostBatch processor", error);
  }
}, 2000);

likeWorker.on("error", (err) => {
  logger.error(`[Worker: likeWorker] - Error: ${err.message}`);
});
