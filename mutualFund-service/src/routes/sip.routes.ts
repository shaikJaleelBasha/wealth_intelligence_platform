import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { addSip, getMySips, updateSip } from "../controllers/sip.controller";

const router = Router();

router.post("/", authenticate, authorize("INVESTOR"), addSip);
router.get("/", authenticate, authorize("INVESTOR"), getMySips);
router.put("/:sipId/status", authenticate, authorize("INVESTOR"), updateSip);

export default router;
