import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import investorRoutes from "./routes/investor.routes";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/investors", investorRoutes);

export default app;
