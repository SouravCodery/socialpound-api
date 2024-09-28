// Cache Redis instance on port 6380

// docker run -d \
//   --name redis-cache \
//   -p 6379:6379 \
//   redis:latest \
//   redis-server --appendonly no --save "" --maxmemory-policy allkeys-lru

import { createClient } from "redis";
import { Config } from "./config";

import { logger } from "../logger/index.logger";

export const redisCacheClient = createClient({
  url: Config.REDIS_CACHE_URL,
});

redisCacheClient.on("error", (err) => {
  logger.error("Redis Cache Client Error", err);

  if (err.code === "ECONNREFUSED") {
    process.exit(1);
  }
});
