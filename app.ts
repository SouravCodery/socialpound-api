import express from "express";
import router from "./src/routes/";
import cors from "cors";
import compression from "compression";

const app = express();

app.use(compression());
app.disable("x-powered-by");
app.use(cors());

app.use(express.json());
app.use("/", router);

export default app;
