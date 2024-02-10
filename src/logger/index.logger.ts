import { LoggerInterface } from "./../interfaces/logger.interface";
import { ConsoleLogger } from "./console-logger.logger";

export const Logger = (): LoggerInterface => {
  return new ConsoleLogger();
};
