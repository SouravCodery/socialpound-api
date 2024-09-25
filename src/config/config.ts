import "dotenv/config";

type TypeMap = {
  string: string;
  number: number;
  boolean: boolean;
};

const getEnvironmentVariable = <TKey extends keyof TypeMap>(
  key: string,
  type: TKey,
  defaultValue?: TypeMap[TKey]
): TypeMap[TKey] => {
  const value = String(process.env[key] ?? defaultValue);

  if (value === "undefined") {
    throw new Error(`Environment variable ${key} is not set!`);
  }

  switch (type) {
    case "string":
      return value as TypeMap[TKey];

    case "number":
      const parsedNumber = Number(value);
      if (isNaN(parsedNumber)) {
        throw new Error(`Environment variable ${key} is not a valid number`);
      }
      return parsedNumber as TypeMap[TKey];

    case "boolean":
      return (value.toLowerCase() === "true") as TypeMap[TKey];

    default:
      return value as TypeMap[TKey];
  }
};

export const Config = {
  NODE_ENV: getEnvironmentVariable("NODE_ENV", "string"),

  MONGODB_URI: getEnvironmentVariable("MONGODB_URI", "string"),
  PORT: getEnvironmentVariable("PORT", "number"),

  REDIS_KEY_VALUE_STORE_URL: getEnvironmentVariable(
    "REDIS_KEY_VALUE_STORE_URL",
    "string"
  ),
  REDIS_CACHE_ENABLED: getEnvironmentVariable("REDIS_CACHE_ENABLED", "boolean"),
  REDIS_CACHE_URL: getEnvironmentVariable("REDIS_CACHE_URL", "string"),
  REDIS_BULL_MQ_HOST: getEnvironmentVariable("REDIS_BULL_MQ_HOST", "string"),
  REDIS_BULL_MQ_PORT: getEnvironmentVariable("REDIS_BULL_MQ_PORT", "number"),

  AWS_REGION: getEnvironmentVariable("AWS_REGION", "string"),
  AWS_BUCKET_NAME: getEnvironmentVariable("AWS_BUCKET_NAME", "string"),

  AUTH_JWT_SECRET_KEY: getEnvironmentVariable("AUTH_JWT_SECRET_KEY", "string"),
  AUTH_JWT_EXPIRES_IN: getEnvironmentVariable("AUTH_JWT_EXPIRES_IN", "string"),
  GOOGLE_CLIENT_ID: getEnvironmentVariable("GOOGLE_CLIENT_ID", "string"),

  PAGINATION_LIMIT: getEnvironmentVariable("PAGINATION_LIMIT", "number"),
} as const;
