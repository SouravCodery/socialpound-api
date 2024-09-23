import { DefaultJobOptions } from "bullmq";
import { Config } from "./config";

export const bullMQConnection = {
  host: Config.REDIS_BULL_MQ_HOST,
  port: Config.REDIS_BULL_MQ_PORT,
};

export const bullMQDefaultJobOptions: DefaultJobOptions = {
  removeOnComplete: 10,
  removeOnFail: 500,
  attempts: 2,
  backoff: {
    type: "exponential",
    delay: 10000,
  },
};
