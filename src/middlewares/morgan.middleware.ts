import morgan, { StreamOptions, TokenIndexer } from "morgan";
import { IncomingMessage, ServerResponse } from "http";
import { logger } from "../logger/winston.logger";

const jsonFormat = (
  tokens: TokenIndexer<IncomingMessage, ServerResponse>,
  req: IncomingMessage,
  res: ServerResponse
) => {
  const tokenPayload =
    (req.headers.authorization ?? ".")?.split(".")?.[1] ?? "";

  const forwardedFor = (req.headers["x-forwarded-for"] as string) ?? "";
  const clientIp = forwardedFor
    ? forwardedFor?.split(",")?.[0]?.trim()
    : tokens["remote-addr"](req, res);

  return JSON.stringify({
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    content_length: tokens.res(req, res, "content-length"),
    response_time: tokens["response-time"](req, res) + " ms",
    timestamp: new Date().toISOString(),
    user: tokenPayload,
    ip: clientIp,
  });
};
const stream: StreamOptions = {
  write: (message: string) => {
    logger.http("server requests", JSON.parse(message));
  },
};

export const morganMiddleware = morgan(jsonFormat, { stream });
