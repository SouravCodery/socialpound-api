import { likeWorker, likePostBatchTimeout } from "./like.worker";
import { commentWorker, commentOnPostBatchTimeout } from "./comment.worker";
import {
  notificationWorker,
  notificationBatchProcessor,
} from "./notification.worker";
import { wait } from "../../../helpers/misc.helpers";
import { logger } from "../../../logger/index.logger";

const gracefulWorkersShutdown = async (signal: "SIGINT" | "SIGTERM") => {
  logger.info(`Received ${signal}, closing workers`);

  await Promise.all([
    likeWorker.close(),
    commentWorker.close(),
    notificationWorker.close(),
    //Adding delay to ensure batches are processed
    wait(4000),
  ]);

  clearInterval(likePostBatchTimeout);
  clearInterval(commentOnPostBatchTimeout);
  clearInterval(notificationBatchProcessor);
};

export {
  likeWorker,
  commentWorker,
  notificationWorker,
  gracefulWorkersShutdown,
};
