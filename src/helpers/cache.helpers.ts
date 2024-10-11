import { Config } from "../config/config";

export const getAPICacheKey = ({
  url,
  params,
  query,
  authenticatedUserId,
}: {
  url: string;
  params: object;
  query: object;
  authenticatedUserId: number | null;
}): string => {
  const processedUrl = url.replaceAll("/", ":");

  const processedParam = Object.entries(params)
    .map(([key, value]) => `${key}:${value}`)
    .join(":");

  const processedQuery = Object.entries(query)
    .map(([key, value]) => `${key}:${value}`)
    .join(":");

  const authenticatedUserPart = authenticatedUserId
    ? `userId:${authenticatedUserId}`
    : "";

  let cacheKey = `${Config.NODE_ENV}:api-cache${processedUrl}`;

  if (processedParam) {
    cacheKey += `:${processedParam}`;
  }

  if (authenticatedUserId) {
    cacheKey += `:${authenticatedUserPart}`;
  }

  if (processedQuery) {
    cacheKey += `:${processedQuery}`;
  } else {
    cacheKey += `:cursor:none`;
  }

  return cacheKey;
};

export const getCacheKey = ({
  prefix,
  params,
}: {
  prefix: "user" | "post";
  params: object;
}): string => {
  const processedParam = Object.entries(params)
    .map(([key, value]) => `${key}:${value}`)
    .join(":");

  let cacheKey = `${Config.NODE_ENV}:service-cache:${prefix}:${processedParam}`;

  return cacheKey;
};
