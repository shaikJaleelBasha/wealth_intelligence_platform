import express from "express";

import cors from "cors";

import stockRoutes from "./routes/stock.routes";

import transactionRoutes from "./routes/transaction.routes";

import holdingRoutes from "./routes/holding.routes";

const app = express();

app.use(cors());

app.use(express.json());

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

app.use("/api/stocks", stockRoutes);

app.use("/api/transactions", transactionRoutes);

app.use("/api/holdings", holdingRoutes);




export default app;