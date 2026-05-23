import express from "express";

import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

import { buyStock } from "../controllers/transaction.controller";

const router = express.Router();

router.post("/buy", authenticate, authorize("INVESTOR"), buyStock);

export default router;
