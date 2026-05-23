import { Request, Response } from "express";
import * as transactionService from "../services/transaction.service";

export const buyStock = async (req: Request, res: Response) => {
  try {
    const response = await transactionService.buyStock(req.body);

    res.status(201).json(response);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};
