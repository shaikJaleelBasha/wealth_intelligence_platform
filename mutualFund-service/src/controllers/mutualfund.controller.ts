import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import * as fundService from "../services/mutualfund.service";

export const getFunds = async (req: Request, res: Response) => {
  try {
    const funds = await fundService.getAllFunds();
    return res.status(200).json(funds);
  } catch (error: any) {
    console.error("GET FUNDS ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getFundHistory = async (req: Request, res: Response) => {
  try {
    const fundId = Number(req.params.fundId);
    if (!fundId) {
      return res.status(400).json({ message: "Invalid fund ID" });
    }
    const history = await fundService.getNavHistory(fundId);
    return res.status(200).json(history);
  } catch (error: any) {
    console.error("GET FUND HISTORY ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const addFund = async (req: AuthRequest, res: Response) => {
  try {
    const fund = await fundService.createFund(req.body);
    return res.status(201).json(fund);
  } catch (error: any) {
    console.error("ADD FUND ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateNav = async (req: AuthRequest, res: Response) => {
  try {
    const fundId = Number(req.params.fundId);
    const { nav } = req.body;
    if (!fundId || nav === undefined) {
      return res.status(400).json({ message: "Invalid fund ID or NAV value" });
    }
    const fund = await fundService.updateFundNav(fundId, Number(nav));
    return res.status(200).json(fund);
  } catch (error: any) {
    console.error("UPDATE NAV ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const removeFund = async (req: AuthRequest, res: Response) => {
  try {
    const fundId = Number(req.params.fundId);
    await fundService.deleteFund(fundId);
    return res.status(200).json({ success: true, message: "Mutual fund deleted" });
  } catch (error: any) {
    console.error("DELETE FUND ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const investFund = async (req: AuthRequest, res: Response) => {
  try {
    const result = await fundService.buyFund(req.user, req.body);
    return res.status(201).json(result);
  } catch (error: any) {
    console.error("INVEST FUND ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const redeemFund = async (req: AuthRequest, res: Response) => {
  try {
    const result = await fundService.sellFund(req.user, req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("REDEEM FUND ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const history = await fundService.fetchTransactionHistory(req.user);
    return res.status(200).json(history);
  } catch (error: any) {
    console.error("GET TRANSACTIONS ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};
