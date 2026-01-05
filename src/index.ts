import express from "express";
import cors from "cors";
import morgan from "morgan";
import graphql, { apolloServer } from "../api/graphql";
import batch, { router as batchRouter } from "../api/batch";
import rateLimit from "express-rate-limit";
import path from "path";
import cron from "node-cron";
import handler from "./controllers/batchController";

// @ts-ignore
import dotenv from "dotenv";

dotenv.config();

const port = process.env.port || 5000;

const app = express();
app.use(express.json({ type: ["application/json"] })); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(
  cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});
const limiter = new rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 1000 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(graphql, batch);
app.use(batchRouter);
// apolloServer.applyMiddleware({ app, path: "/" });

app.listen(port, () => {
  console.log("app is listening");
});
app.use(morgan("combined"));

// cron.schedule("* 10 * * *", handler.fileSyncCron);

export default app;
