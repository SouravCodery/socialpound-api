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
  MONGODB_URI: getEnvironmentVariable("MONGODB_URI", "string"),
  PORT: getEnvironmentVariable("PORT", "number"),

  AUTH_JWT_SECRET_KEY: getEnvironmentVariable("AUTH_JWT_SECRET_KEY", "string"),
  USER_DATA_SECRET_KEY: getEnvironmentVariable(
    "USER_DATA_SECRET_KEY",
    "string"
  ),

  REDIS_PERSISTENT_URL: getEnvironmentVariable(
    "REDIS_PERSISTENT_URL",
    "string"
  ),
  REDIS_CACHE_URL: getEnvironmentVariable("REDIS_CACHE_URL", "string"),

  REDIS_BULL_MQ_HOST: getEnvironmentVariable("REDIS_BULL_MQ_HOST", "string"),
  REDIS_BULL_MQ_PORT: getEnvironmentVariable("REDIS_BULL_MQ_PORT", "number"),
} as const;
