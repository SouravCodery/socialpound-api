// Cache Redis instance on port 6380

// docker run -d \
//   --name redis-cache \
//   -p 6380:6379 \
//   redis:latest \
//   redis-server --appendonly no --save "" --maxmemory-policy allkeys-lru

import { createClient } from "redis";
import { Config } from "./config";

import { logger } from "../logger/index.logger";

export const cacheRedisClient = createClient({
  url: Config.REDIS_CACHE_URL,
});

cacheRedisClient.on("error", (err) => {
  logger.error("Cache Redis Client Error", err);

  if (err.code === "ECONNREFUSED") {
    process.exit(1);
  }
});
