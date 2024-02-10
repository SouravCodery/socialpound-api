import { LoggerInterface } from "./../interfaces/logger.interface";

export const LogColors = {
  Reset: "\x1b[0m",
  FgWhite: "\x1b[37m",
  BgBlue: "\x1b[44m",
  BgRed: "\x1b[41m",
  BgCyan: "\x1b[46m",
  BgYellow: "\x1b[43m",
};

export class ConsoleLogger implements LoggerInterface {
  info(message: string, ...meta: any[]): void {
    console.log(
      `${LogColors.FgWhite}${LogColors.BgBlue}%s${LogColors.Reset}`,
      message,
      ...meta,
      "\n"
    );
  }

  error(message: string, ...meta: any[]): void {
    console.error(
      `${LogColors.FgWhite}${LogColors.BgRed}%s${LogColors.Reset}`,
      message,
      ...meta,
      "\n"
    );
  }

  debug(message: string, ...meta: any[]): void {
    console.debug(
      `${LogColors.FgWhite}${LogColors.BgCyan}%s${LogColors.Reset}`,
      message,
      ...meta,
      "\n"
    );
  }

  warn(message: string, ...meta: any[]): void {
    console.warn(
      `${LogColors.FgWhite}${LogColors.BgYellow}%s${LogColors.Reset}`,
      message,
      ...meta,
      "\n"
    );
  }
}
