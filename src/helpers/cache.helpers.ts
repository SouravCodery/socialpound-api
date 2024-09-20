import { Config } from "../config/config";

export const getCacheKey = ({
  url,
  params,
  query,
  authenticatedUserId,
}: {
  url: string;
  params: object;
  query: object;
  authenticatedUserId: string | null;
}): string => {
  const processedUrl = url.replaceAll("/", ":");

  const processedParam = Object.entries(params)
    .map(([key, value]) => `${key}:${value}`)
    .join(":");

  const processedQuery = Object.entries(query)
    .map(([key, value]) => `${key}:${value}`)
    .join(":");

  const authenticatedUserPart = authenticatedUserId
    ? `${authenticatedUserId}`
    : "";

  let cacheKey = `${Config.NODE_ENV}:api-cache${processedUrl}`;

  if (processedParam) {
    cacheKey += `:${processedParam}`;
  }

  if (processedQuery) {
    cacheKey += `:${processedQuery}`;
  } else {
    cacheKey += `:cursor:none`;
  }

  if (authenticatedUserId) {
    cacheKey += `:${authenticatedUserPart}`;
  }

  return cacheKey;
};
