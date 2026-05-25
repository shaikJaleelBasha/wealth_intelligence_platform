import { Response } from "express";

import { AuthRequest } from "../middlewares/auth.middleware";

import * as transactionService from "../services/transaction.service";

/*
|--------------------------------------------------------------------------
| BUY STOCK
|--------------------------------------------------------------------------
*/

export const buyStock = async (req: AuthRequest, res: Response) => {
  try {
    const result = await transactionService.buyStock(req.user, req.body);

    res.status(201).json(result);
  } catch (error: any) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| SELL STOCK
|--------------------------------------------------------------------------
*/

export const sellStock = async (req: AuthRequest, res: Response) => {
  try {
    const result = await transactionService.sellStock(req.user, req.body);

    res.status(201).json(result);
  } catch (error: any) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| ORDER HISTORY
|--------------------------------------------------------------------------
*/

export const getOrderHistory = async (req: AuthRequest, res: Response) => {
  try {
    const result = await transactionService.orderHistory(req.user);

    res.status(200).json(result);
  } catch (error: any) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
