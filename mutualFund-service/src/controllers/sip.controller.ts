import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import * as sipService from "../services/sip.service";

export const addSip = async (req: AuthRequest, res: Response) => {
  try {
    const sip = await sipService.createSip(req.user, req.body);
    return res.status(201).json({
      success: true,
      message: "SIP registered successfully",
      sip,
    });
  } catch (error: any) {
    console.error("ADD SIP ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getMySips = async (req: AuthRequest, res: Response) => {
  try {
    const sips = await sipService.fetchMySips(req.user);
    return res.status(200).json(sips);
  } catch (error: any) {
    console.error("GET MY SIPS ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateSip = async (req: AuthRequest, res: Response) => {
  try {
    const sipId = Number(req.params.sipId);
    const { status } = req.body;

    if (!sipId || !status) {
      return res.status(400).json({ message: "Invalid parameters" });
    }

    const sip = await sipService.updateSipStatus(req.user, sipId, status);
    return res.status(200).json({
      success: true,
      message: `SIP status updated to ${status}`,
      sip,
    });
  } catch (error: any) {
    console.error("UPDATE SIP STATUS ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};
