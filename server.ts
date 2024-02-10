import app from "./app";
import connectToDatabase from "./src/config/database.config";

const port = 3001;

connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Instagram Clone API listening on: ${port}`);
  });
});
