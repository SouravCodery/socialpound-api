import { Worker } from "bullmq";

import { bullMQConnection } from "../../../config/bull-mq.config";
import { addCommentsOnPosts } from "../../../services/v1/comment.services";

import { logger } from "../../../logger/index.logger";
import { JobBatch } from "../../../classes/job-batch.class";
import { CommentInterface } from "../../../interfaces/comment.interface";

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

    if (jobsToBeProcessed.length <= 0) {
      console.log("Nothing to process: commentOnPostBatch");
      commentOnPostBatch.processingEnd();
      return;
    }

    await addCommentsOnPosts({ comments: jobsToBeProcessed });
    commentOnPostBatch.processingEnd();
  } catch (error) {
    logger.error("Error in commentOnPostBatch processor", error);
  }
}, 2000);

commentWorker.on("completed", (job) => {
  logger.info(`[Worker: commentWorker] - ${job.name} ${job.id} has completed!`);
});

commentWorker.on("failed", (job, err) => {
  logger.error(
    `[Worker: commentWorker] - ${job?.name} ${job?.id} has failed with ${err.message}`
  );
});
