import { Request, Response } from "express";

import * as stockService from "../services/stock.service";

/*
|--------------------------------------------------------------------------
| ADD STOCK
|--------------------------------------------------------------------------
*/

export const addStock = async (req: Request, res: Response) => {
  try {
    const stock = await stockService.createStock(req.body);

    res.status(201).json(stock);
  } catch (error: any) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET STOCKS
|--------------------------------------------------------------------------
*/

export const getStocks = async (req: Request, res: Response) => {
  try {
    const stocks = await stockService.fetchStocks();

    res.status(200).json(stocks);
  } catch (error: any) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    const stock = await stockService.modifyStock(
      Number(req.params.stockId),
      req.body,
    );

    res.json(stock);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};