import { Worker } from "bullmq";

import { Config } from "../../../config/config";
import { bullMQConnection } from "../../../config/bull-mq.config";
import { JobBatch } from "../../../classes/job-batch.class";
import { CommentInterface } from "../../../interfaces/comment.interface";
import { addCommentsOnPosts } from "../../../services/v1/comment.services";
import { logger } from "../../../logger/index.logger";

const commentOnPostBatch = new JobBatch<CommentInterface>({});

export const commentWorker = new Worker(
  "comment",
  async (job) => {
    try {
      const jobName = job.name;

      switch (jobName) {
        case "comment-on-Post":
          commentOnPostBatch.addJob({ job: job.data });
          break;

        default:
          break;
      }
    } catch (error) {
      logger.error("Error in comment worker", error);
      throw error;
    }
  },
  {
    connection: bullMQConnection,
  }
);

export const commentOnPostBatchTimeout = setInterval(async () => {
  try {
    const jobsToBeProcessed = commentOnPostBatch.getJobs();

    if (Config.WORKERS_LOG_ENABLED)
      logger.info(`comment batch: ${jobsToBeProcessed.length}`);

    if (jobsToBeProcessed.length > 0) {
      await addCommentsOnPosts({ comments: jobsToBeProcessed });
      commentOnPostBatch.updateLastProcessed();
    }

    commentOnPostBatch.processingEnd();
  } catch (error) {
    logger.error("Error in commentOnPostBatch processor", error);
  }
}, 2000);

commentWorker.on("error", (err) => {
  logger.error(`[Worker: commentWorker] - Error: ${err.message}`);
});
