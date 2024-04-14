import app from "./app";
import connectToDatabase from "./src/config/database.config";
import { Config } from "./src/config/config";

import { logger } from "./src/logger/index.logger";

const port = Config.PORT;

connectToDatabase().then(() => {
  app.listen(port, () => {
    logger.info(`Instagram Clone API listening on: ${port}`);
  });
});
