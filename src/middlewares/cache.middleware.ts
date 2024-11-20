import { Request, Response, NextFunction } from "express";
import { getAPICache } from "../services/v1/redis-cache.services";

import { AuthenticatedUserRequestInterface } from "./../interfaces/extended-request.interface";
import { Config } from "../config/config";
import { logger } from "../logger/index.logger";

export function cacheMiddleware({
  isAuthenticatedUserSpecificRequest,
}: {
  isAuthenticatedUserSpecificRequest: boolean;
}) {
  return async function (req: Request, res: Response, next: NextFunction) {
    if (req.method === "OPTIONS" || req.method !== "GET") {
      return next();
    }

    if (Config.REDIS_CACHE_ENABLED === false) {
      return next();
    }

    try {
      const authenticatedUserId = isAuthenticatedUserSpecificRequest
        ? (req as AuthenticatedUserRequestInterface)?.userId
        : null;

      //todo: Make changes to the cache key
      //it works for routes like /a/:id but not for /a/b
      //this results into rewriting the cache for /friendship/list and /friendship/requests
      //req.baseUrl only returns /a, Example: /friendship not /friendship/list

      const cachedData = await getAPICache({
        url: req.baseUrl,
        params: req.params,
        query: req.query,
        authenticatedUserId,
      });

      if (cachedData) {
        res.setHeader("Accelerated", "true");
        return res.status(200).json(cachedData);
      }
    } catch (error) {
      logger.error(
        `[Middleware: cacheMiddleware] - Error fetching cache for ${req.originalUrl}`,
        error
      );
    }

    next();
  };
}
