import express from "express";

import {
  buyStock,
  sellStock,
  getOrderHistory,
} from "../controllers/transaction.controller";

import { authenticate } from "../middlewares/auth.middleware";

import { authorize } from "../middlewares/role.middleware";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| BUY STOCK
|--------------------------------------------------------------------------
*/

router.post("/buy", authenticate, authorize("INVESTOR"), buyStock);

/*
|--------------------------------------------------------------------------
| SELL STOCK
|--------------------------------------------------------------------------
*/

router.post("/sell", authenticate, authorize("INVESTOR"), sellStock);

/*
|--------------------------------------------------------------------------
| ORDER HISTORY
|--------------------------------------------------------------------------
*/

router.get("/history", authenticate, authorize("INVESTOR"), getOrderHistory);

export default router;
