import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import {
  getFunds,
  getFundHistory,
  addFund,
  updateNav,
  removeFund,
  investFund,
  redeemFund,
  getTransactions,
} from "../controllers/mutualfund.controller";

const router = Router();

// Public / Authenticated reads
router.get("/", authenticate, getFunds);
router.get("/:fundId/history", authenticate, getFundHistory);

// Investor portfolio transactions
router.post("/buy", authenticate, authorize("INVESTOR"), investFund);
router.post("/sell", authenticate, authorize("INVESTOR"), redeemFund);
router.get("/transactions", authenticate, authorize("INVESTOR"), getTransactions);

// Admin controls
router.post("/", authenticate, authorize("ADMIN"), addFund);
router.put("/:fundId/nav", authenticate, authorize("ADMIN"), updateNav);
router.delete("/:fundId", authenticate, authorize("ADMIN"), removeFund);

export default router;
