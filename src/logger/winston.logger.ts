import path from "path";
import fs from "fs";
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const errorLogsDir = path.join(process.cwd(), "logs", "errors");
const httpLogsDir = path.join(process.cwd(), "logs", "http");
const combinedLogsDir = path.join(process.cwd(), "logs", "combined");

[errorLogsDir, httpLogsDir, combinedLogsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const consoleFormat = format.combine(
  format.colorize({ all: true }),
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : "";
    return `[${timestamp}] ${level}: ${message} ${metaString}`;
  })
);

const httpFilter = format((info) => {
  return info.level === "http" ? info : false;
});

export const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),

  transports: [
    new DailyRotateFile({
      filename: path.join(errorLogsDir, "error.%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "10m",
      maxFiles: "14d",
      zippedArchive: true,
    }),

    new DailyRotateFile({
      filename: path.join(combinedLogsDir, "combined.%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "info",
      maxSize: "20m",
      maxFiles: "14d",
      zippedArchive: true,
    }),

    new DailyRotateFile({
      filename: path.join(httpLogsDir, "http.%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "http",
      maxSize: "10m",
      maxFiles: "14d",
      zippedArchive: true,
      format: format.combine(httpFilter()),
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: consoleFormat,
      level: "silly",
    })
  );
}
