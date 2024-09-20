import { Constants } from "../../constants/constants";
import { redisCacheClient } from "../../config/redis-cache.config";
import { logger } from "../../logger/index.logger";

export const getCache = async ({
  key,
}: {
  key: string;
}): Promise<object | null> => {
  try {
    const data = await redisCacheClient.get(key);
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
  ttl = "ONE_HOUR",
}: {
  key: string;
  value: Object;
  ttl?: "ONE_MINUTE" | "FIVE_MINUTES" | "ONE_HOUR" | "ONE_DAY";
}): Promise<boolean> => {
  try {
    const stringValue = JSON.stringify(value);
    const result = await redisCacheClient.set(key, stringValue, {
      EX: Constants.DURATION[ttl],
    });

    logger.info(`Cache set for key ${key}:`, result);
    return true;
  } catch (error) {
    logger.error(`[Service: setCache] - Something went wrong`, error);

    return false;
  }
};

export const delCache = async ({ key }: { key: string }): Promise<boolean> => {
  try {
    const result = await redisCacheClient.del(key);

    logger.info(`Cache deleted for key ${key}:`, result);
    return true;
  } catch (error) {
    logger.error(`[Service: delCache] - Something went wrong`, error);
    return false;
  }
};
