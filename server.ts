import app from "./app";
import connectToDatabase from "./src/config/database.config";
import config from "./src/config/config";

const port = config.PORT;

connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Instagram Clone API listening on: ${port}`);
  });
});
