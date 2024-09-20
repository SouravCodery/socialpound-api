import app from "./app";
import connectToDatabase from "./src/config/database.config";
import { Config } from "./src/config/config";

import { redisKeyValueStoreClient } from "./src/config/redis-key-value-store.config";
import { redisCacheClient } from "./src/config/redis-cache.config";

import { logger } from "./src/logger/index.logger";

import "./src/mq/bull-mq/index.bull-mq";

const port = Config.PORT;

(async () => {
  try {
    await Promise.all([
      connectToDatabase(),
      redisKeyValueStoreClient.connect(),
      redisCacheClient.connect(),
    ]);

    logger.info("Connected to persistentRedis and cacheRedis");

    app.listen(port, () => {
      logger.info(`Socialpound API listening on: ${port}`);
    });
  } catch (error) {
    logger.error("Error during server setup", error);

    process.exit(1);
  }
})();
