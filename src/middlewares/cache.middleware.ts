import { Request, Response, NextFunction } from "express";
import { getCache } from "../services/v1/redis-cache.services";
import { Config } from "../config/config";
import { logger } from "../logger/index.logger";

export const cacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  if (Config.REDIS_CACHE_ENABLED === false) {
    return next();
  }

  try {
    const cacheKey = req.originalUrl;
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
  } finally {
    logger.info("Checking!");
  }

  next();
};
