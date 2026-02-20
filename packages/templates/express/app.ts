import express from "express";
import cors from "cors";
import helmet from "helmet";
import rootRouter from "./routes";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/api", rootRouter);

app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
