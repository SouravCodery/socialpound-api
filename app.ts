import express from "express";
import cors from "cors";
import compression from "compression";

import router from "./src/routes/";
import { morganMiddleware } from "./src/middlewares/morgan.middleware";

const app = express();

app.disable("x-powered-by");
app.use(compression());
app.use(morganMiddleware);
app.use(cors());

app.use(express.json());
app.use("/", router);

export default app;
