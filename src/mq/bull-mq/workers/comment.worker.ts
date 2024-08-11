import { Worker } from "bullmq";

import { bullMQConnection } from "../../../config/bull-mq.config";
import { addComment } from "../../../services/v1/comment.services";

import { logger } from "../../../logger/index.logger";

export const commentWorker = new Worker(
  "comment",
  async (job) => {
    try {
      const jobName = job.name;

      if (jobName !== "add-comment") {
        return;
      }

      const { commentOn, post, parentComment, user, text } = job.data;

      await addComment({
        commentOn,
        post,
        parentComment,
        user,
        text,
      });
    } catch (error) {
      logger.error("Error in comment worker", error);
      throw error;
    }
  },
  {
    connection: bullMQConnection,
  }
);

commentWorker.on("completed", (job) => {
  logger.info(`[Worker: commentWorker] - ${job.name} ${job.id} has completed!`);
});

commentWorker.on("failed", (job, err) => {
  logger.error(
    `[Worker: commentWorker] - ${job?.name} ${job?.id} has failed with ${err.message}`
  );
});
