import express from "express";

import { authenticate } from "../middlewares/auth.middleware";

import { authorize } from "../middlewares/role.middleware";

import { getHoldings } from "../controllers/holding.controller";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET HOLDINGS
|--------------------------------------------------------------------------
*/

router.get("/", authenticate, authorize("INVESTOR"), getHoldings);

export default router;
