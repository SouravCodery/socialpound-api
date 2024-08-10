// Persistent Redis instance on port 6379

// docker run -d \
//   --name redis-persistent \
//   -p 6379:6379 \
//   redis:latest \
//   redis-server --appendonly yes --appendfsync everysec --maxmemory-policy noeviction

import { createClient } from "redis";
import { Config } from "./config";

import { logger } from "../logger/index.logger";

export const persistentRedisClient = createClient({
  url: Config.REDIS_PERSISTENT_URL,
});

persistentRedisClient.on("error", (err) =>
  logger.error("Persistent Redis Client Error", err)
);
