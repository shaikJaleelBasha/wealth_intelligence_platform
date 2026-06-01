import express from "express";
import { getInvestors, updateKyc } from "../controllers/auth.controller";

const router = express.Router();

router.get("/", getInvestors);
router.put("/:investorId/kyc", updateKyc);

export default router;
