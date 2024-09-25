import path from "path";
import fs from "fs";
import { createLogger, format, transports } from "winston";

const logsDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const consoleFormat = format.combine(
  format.colorize({ all: true }), // Colorize the console output
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Add timestamp
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
    new transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
    }),
    new transports.File({
      filename: path.join(logsDir, "combined.log"),
      level: "info",
    }),
    new transports.File({
      filename: path.join(logsDir, "http.log"),
      level: "http",
      format: format.combine(httpFilter()),
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: consoleFormat,
    })
  );
}
