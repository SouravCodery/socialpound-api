import app from "./app";
import connectToDatabase from "./src/config/database.config";
import { Config } from "./src/config/config";

import { persistentRedisClient } from "./src/config/redis-persistent.config";
import { cacheRedisClient } from "./src/config/redis-cache.config";

import { logger } from "./src/logger/index.logger";

const port = Config.PORT;

(async () => {
  try {
    await Promise.all([
      connectToDatabase(),
      persistentRedisClient.connect(),
      cacheRedisClient.connect(),
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
