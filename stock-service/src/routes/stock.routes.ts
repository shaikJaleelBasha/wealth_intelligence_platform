import express from "express";

import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

import {
  addStock,
  getStocks,
  updateStock,
} from "../controllers/stock.controller";

const router = express.Router();

router.post("/create", authenticate, authorize("ADMIN"), addStock);

router.get("/", authenticate, getStocks);

router.put("/:stockId", authenticate, authorize("ADMIN"), updateStock);

export default router;
