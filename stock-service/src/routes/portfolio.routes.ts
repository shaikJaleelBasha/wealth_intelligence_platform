import express from "express";

import { authenticate } from "../middlewares/auth.middleware";

import { authorize } from "../middlewares/role.middleware";

import { getMyPortfolios } from "../controllers/portfolio.controller";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET MY PORTFOLIOS
|--------------------------------------------------------------------------
*/

router.get(
  "/my-portfolios",
  authenticate,
  authorize("INVESTOR"),
  getMyPortfolios,
);

export default router;
