// Persistent Redis instance on port 6380

// docker run -d \
//   --name redis-key-value-store \
//   -p 6380:6379 \
//   redis:latest \
//   redis-server --appendonly yes --appendfsync everysec --maxmemory-policy noeviction

import { createClient } from "redis";
import { Config } from "./config";

import { logger } from "../logger/index.logger";

export const redisKeyValueStoreClient = createClient({
  url: Config.REDIS_KEY_VALUE_STORE_URL,
});

redisKeyValueStoreClient.on("error", (err) => {
  logger.error("Redis Key Value Store Error", err);

  if (err.code === "ECONNREFUSED") {
    process.exit(1);
  }
});
