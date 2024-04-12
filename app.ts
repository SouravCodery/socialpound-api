import express from "express";
import router from "./src/routes/";
import cors from "cors";

const app = express();

app.disable("x-powered-by");

app.use(cors());
app.use(express.json());
app.use("/", router);

export default app;
