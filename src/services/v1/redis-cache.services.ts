import { promisify } from "util";

import { CONSTANTS } from "../../contants/constants";
import { redisCacheClient } from "../../config/redis-cache.config";
import { logger } from "../../logger/index.logger";

const getRedisAsync = promisify(redisCacheClient.get).bind(redisCacheClient);
const setRedisAsync = promisify(redisCacheClient.set).bind(redisCacheClient);
const delRedisAsync = promisify(redisCacheClient.del).bind(redisCacheClient);

export const getCache = async ({
  key,
}: {
  key: string;
}): Promise<object | null> => {
  try {
    const data = await getRedisAsync(key);
    const parsedData = data ? JSON.parse(data) : null;

    return parsedData;
  } catch (error) {
    logger.error(`[Service: getCache] - Something went wrong`, error);
    return null;
  }
};

export const setCache = async ({
  key,
  value,
  ttl = CONSTANTS.DURATION.ONE_HOUR,
}: {
  key: string;
  value: Object;
  ttl?: number;
}): Promise<void> => {
  try {
    const stringValue = JSON.stringify(value);
    const result = await setRedisAsync(key, stringValue, "EX", ttl);

    logger.info(`Cache set for key ${key}:`, result);
  } catch (error) {
    logger.error(`[Service: setCache] - Something went wrong`, error);
  }
};

export const delCache = async ({ key }: { key: string }): Promise<void> => {
  try {
    const result = await delRedisAsync(key);

    logger.info(`Cache deleted for key ${key}:`, result);
  } catch (error) {
    logger.error(`[Service: delCache] - Something went wrong`, error);
  }
};
