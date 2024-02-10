import { LoggerInterface } from "./../interfaces/logger.interface";
import { ConsoleLogger } from "./console-logger.logger";

const Logger = (): LoggerInterface => {
  return new ConsoleLogger();
};

export const logger = Logger();
