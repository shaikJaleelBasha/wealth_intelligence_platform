import express from "express";

import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

import {
  addStock,
  getStockHistory,
  getStocks,
  updateStock,
  deleteStock,
} from "../controllers/stock.controller";

const router = express.Router();


router.post("/create", authenticate, authorize("ADMIN"), addStock);



router.get("/", authenticate, getStocks);


router.put("/:stockId", authenticate, authorize("ADMIN"), updateStock);

router.delete("/:stockId", authenticate, authorize("ADMIN"), deleteStock);

router.get("/:stockId/history", authenticate, getStockHistory);

export default router;
