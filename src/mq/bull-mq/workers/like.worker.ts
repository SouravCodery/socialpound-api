import { Worker } from "bullmq";

import { bullMQConnection } from "../../../config/bull-mq.config";
import { likePosts } from "./../../../services/v1/like.services";

import { logger } from "../../../logger/index.logger";
import { JobBatch } from "../../../classes/job-batch.class";
import { LikeInterface } from "../../../interfaces/like.interface";

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

    if (jobsToBeProcessed.length <= 0) {
      console.log("Nothing to process: likePostBatch");
      likePostBatch.processingEnd();
      return;
    }

    await likePosts({ likes: jobsToBeProcessed });
    likePostBatch.processingEnd();
  } catch (error) {
    logger.error("Error in likePostBatch processor", error);
  }
}, 2000);

likeWorker.on("completed", (job) => {
  logger.info(`[Worker: likeWorker] - ${job.name} ${job.id} has completed!`);
});

likeWorker.on("failed", (job, err) => {
  logger.error(
    `[Worker: likeWorker] - ${job?.name} ${job?.id} has failed with ${err.message}`
  );
});
