import express from "express";
import cors from "cors";

import stockRoutes from "./routes/stock.routes";
import transactionRoutes from "./routes/transaction.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/stocks", stockRoutes);
app.use("/api/transactions", transactionRoutes);

export default app;
