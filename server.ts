import app from "./app";
import connectToDatabase from "./src/config/database.config";
import config from "./src/config/config";
import { logger } from "./src/logger/index.logger";

const port = config.PORT;

connectToDatabase().then(() => {
  app.listen(port, () => {
    logger.info(`Instagram Clone API listening on: ${port}`);
  });
});
