import app from "./app";

import {
  connectToDatabase,
  disconnectFromDatabase,
} from "./src/config/database.config";
import { Config } from "./src/config/config";
import { redisKeyValueStoreClient } from "./src/config/redis-key-value-store.config";
import { redisCacheClient } from "./src/config/redis-cache.config";

import "./src/mq/bull-mq/index.bull-mq";
import { logger } from "./src/logger/index.logger";
import { gracefulWorkersShutdown } from "./src/mq/bull-mq/index.bull-mq";

const port = Config.PORT;

(async () => {
  try {
    await Promise.all([
      connectToDatabase(),
      redisKeyValueStoreClient.connect(),
      redisCacheClient.connect(),
    ]);

    logger.info("Connected to redis cache and redis key-value store");

    const server = app.listen(port, () => {
      logger.info(`Socialpound API listening on: ${port}`);
    });

    function closeServer() {
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      });
    }

    let isShuttingDown = false;

    const gracefulShutdown = async (signal: "SIGINT" | "SIGTERM") => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      const forceShutdownTimer = setTimeout(() => {
        logger.warn("Forcing shutdown due to timeout.", signal);
        process.exit(1);
      }, 10000);

      try {
        logger.info("Shutting down server...", signal);

        await closeServer();
        await gracefulWorkersShutdown(signal);

        await Promise.all([
          disconnectFromDatabase(),
          redisKeyValueStoreClient.disconnect(),
          redisCacheClient.disconnect(),
        ]);

        clearTimeout(forceShutdownTimer);
        logger.info("Disconnected from redis cache and redis key-value store");
        logger.info("Server shut down successfully!", signal);
        process.exit(0);
      } catch (error) {
        logger.error("Error during graceful shutdown", signal, error);
        process.exit(1);
      }
    };

    process.on("SIGINT", gracefulShutdown); //SIGINT (Signal Interrupt) (CTRL+C)
    process.on("SIGTERM", gracefulShutdown); //SIGTERM (Signal Terminate) (kill)
  } catch (error) {
    logger.error("Error during server setup", error);

    process.exit(1);
  }
})();
