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

  if (value === undefined) {
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

interface Config {
  MONGODB_URI: string;
  PORT: number;

  AUTH_JWT_SECRET_KEY: string;
  USER_DATA_SECRET_KEY: string;
}

export const Config: Readonly<Config> = Object.freeze({
  MONGODB_URI: getEnvironmentVariable("MONGODB_URI", "string"),
  PORT: getEnvironmentVariable("PORT", "number"),

  AUTH_JWT_SECRET_KEY: getEnvironmentVariable("AUTH_JWT_SECRET_KEY", "string"),
  USER_DATA_SECRET_KEY: getEnvironmentVariable(
    "USER_DATA_SECRET_KEY",
    "string"
  ),
});
