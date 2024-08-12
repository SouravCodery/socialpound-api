import { Worker } from "bullmq";

import { bullMQConnection } from "../../../config/bull-mq.config";
import { addComment } from "../../../services/v1/comment.services";

import { logger } from "../../../logger/index.logger";
import { incrementLikesCommentCount } from "../../../services/v1/persistent-redis.services";

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

      const redisOperations = [
        incrementLikesCommentCount({
          entity: "Post",
          id: post,
          countType: "commentsCount",
        }),
      ];

      if (commentOn === "Comment") {
        redisOperations.push(
          incrementLikesCommentCount({
            entity: "Comment",
            id: parentComment,
            countType: "commentsCount",
          })
        );
      }

      await Promise.all(redisOperations);
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
