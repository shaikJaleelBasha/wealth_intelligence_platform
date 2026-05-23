import { Request, Response } from "express";
import * as stockService from "../services/stock.service";


// url: /admin/stocks/add
export const addStock = async (req: Request, res: Response) => {
  try {

    console.log("Received stock data:", req.body); // Debugging log
    const stock = await stockService.createStock(req.body);

    res.status(201).json(stock);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getStocks = async (req: Request, res: Response) => {
  try {
    const stocks = await stockService.fetchStocks();

    res.json(stocks);
  } catch (error: any) {
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
