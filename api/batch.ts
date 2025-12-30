import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import handler from "../src/controllers/batchController";
const router = express.Router();

router.get("/test", handler.test);

const app = express();
app.use(
  cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);
const limiter = new rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
app.use(express.json({ type: ["application/json", "text/plain"] })); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use("/batch", router);
export { router };
export default app;
// export default function handler(request: any, response: any) {
//   return app(request, response);
// }
