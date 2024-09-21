import { redisCacheClient } from "../../config/redis-cache.config";
import { getCacheKey } from "../../helpers/cache.helpers";

import { Constants } from "../../constants/constants";
import { logger } from "../../logger/index.logger";
import { APICacheKeyParamsInterface } from "../../interfaces/redis-cache.interface";

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
  value: APICacheKeyParamsInterface["value"];
  ttl?: APICacheKeyParamsInterface["ttl"];
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

export const deleteCache = async ({
  key,
}: {
  key: string;
}): Promise<boolean> => {
  try {
    const result = await redisCacheClient.del(key);

    logger.info(`Cache deleted for key ${key}:`, result);
    return true;
  } catch (error) {
    logger.error(`[Service: delCache] - Something went wrong`, error);
    return false;
  }
};

export const getAPICache = async ({
  url,
  params,
  query,
  authenticatedUserId,
}: {
  url: string;
  params: object;
  query: object;
  authenticatedUserId: string | null;
}) => {
  try {
    const cacheKey = getCacheKey({
      url,
      params,
      query,
      authenticatedUserId,
    });

    return await getCache({ key: cacheKey });
  } catch (error) {
    logger.error(`[Service: getAPICache] - Something went wrong`, error);
    return null;
  }
};

export const setAPICache = async ({
  url,
  params,
  query,
  authenticatedUserId,

  value,
  ttl = "ONE_HOUR",
}: APICacheKeyParamsInterface) => {
  try {
    const cacheKey = getCacheKey({
      url,
      params,
      query,
      authenticatedUserId,
    });

    return await setCache({ key: cacheKey, value, ttl });
  } catch (error) {
    logger.error(`[Service: setAPICache] - Something went wrong`, error);
    return false;
  }
};

export const deleteAPICache = async ({
  url,
  params,
  query,
  authenticatedUserId,
}: APICacheKeyParamsInterface) => {
  try {
    const cacheKey = getCacheKey({
      url,
      params,
      query,
      authenticatedUserId,
    });

    return await deleteCache({ key: cacheKey });
  } catch (error) {
    logger.error(`[Service: deleteAPICache] - Something went wrong`, error);
    return false;
  }
};
