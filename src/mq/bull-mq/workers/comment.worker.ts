import { Worker } from "bullmq";
import { bullMQConnection } from "../../../config/bull-mq.config";

export const commentWorker = new Worker(
  "comment",
  async (job) => {
    console.log(job.id);
  },
  {
    connection: bullMQConnection,
  }
);

commentWorker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

commentWorker.on("failed", (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
});
