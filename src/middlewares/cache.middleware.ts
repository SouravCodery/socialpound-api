import { Request, Response, NextFunction } from "express";
import { getCache } from "../services/v1/redis-cache.services";
import { getCacheKey } from "../helpers/cache.helpers";
import { Config } from "../config/config";
import { logger } from "../logger/index.logger";

export function cacheMiddleware({
  authenticatedUserId,
}: {
  authenticatedUserId: string | null;
}) {
  return async function (req: Request, res: Response, next: NextFunction) {
    if (req.method === "OPTIONS") {
      return next();
    }

    if (Config.REDIS_CACHE_ENABLED === false) {
      return next();
    }

    try {
      const cacheKey = getCacheKey({
        url: req.baseUrl,
        params: req.params,
        query: req.query,
        authenticatedUserId,
      });

      const cachedData = await getCache({ key: cacheKey });

      if (cachedData) {
        logger.info(`[Cache Hit] - Cache found for ${cacheKey}`);

        res.setHeader("Accelerated", "true");
        return res.status(200).json(cachedData);
      }

      logger.info(`[Cache Miss] - No cache found for ${cacheKey}`);
    } catch (error) {
      logger.error(
        `[Middleware: cacheMiddleware] - Error fetching cache for ${req.originalUrl}`,
        error
      );
    }

    next();
  };
}
