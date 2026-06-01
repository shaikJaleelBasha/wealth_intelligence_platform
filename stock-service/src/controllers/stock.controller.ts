import { Request, Response } from "express";
import pool from "../config/db";
import * as stockService from "../services/stock.service";

/*
|--------------------------------------------------------------------------
| ADD STOCK
|--------------------------------------------------------------------------
*/

export const addStock = async (req: Request, res: Response) => {
  try {
    const stock = await stockService.createStock(req.body);

    return res.status(201).json(stock);
  } catch (error: any) {
    console.log("ADD STOCK ERROR:", error);

    return res.status(500).json({
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

    return res.status(200).json(stocks);
  } catch (error: any) {
    console.log("GET STOCKS ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE STOCK
|--------------------------------------------------------------------------
*/

export const updateStock = async (req: Request, res: Response) => {
  try {
    const stock = await stockService.modifyStock(
      Number(req.params.stockId),
      req.body,
    );

    return res.status(200).json(stock);
  } catch (error: any) {
    console.log("UPDATE STOCK ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET STOCK HISTORY
|--------------------------------------------------------------------------
*/

export const getStockHistory = async (req: Request, res: Response) => {
  try {
    const stockId = Number(req.params.stockId);

    if (!stockId) {
      return res.status(400).json({
        message: "Invalid stock id",
      });
    }

    const result = await pool.query(
      `
      SELECT
        ROUND(price::numeric,2) AS price,

        ROUND(
          change_amount::numeric,
          2
        ) AS change_amount,

        ROUND(
          change_percentage::numeric,
          2
        ) AS change_percentage,

        TO_CHAR(
          created_at,
          'HH24:MI'
        ) AS date

      FROM stock_price_history

      WHERE stock_id = $1

      ORDER BY created_at DESC

      LIMIT 100
      `,
      [stockId],
    );

    /*
    |--------------------------------------------------------------------------
    | OLDEST -> NEWEST FOR GRAPH
    |--------------------------------------------------------------------------
    */

    const history = result.rows.reverse();

    return res.status(200).json(history);
  } catch (error: any) {
    console.log("GET STOCK HISTORY ERROR:", error);

    return res.status(500).json({
      message: error.message || "Unable to fetch stock history",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CLEAN OLD HISTORY (OPTIONAL)
|--------------------------------------------------------------------------
*/

export const clearOldHistory = async (req: Request, res: Response) => {
  try {
    await pool.query(`
      DELETE FROM stock_price_history
      WHERE created_at <
      NOW() - INTERVAL '30 days'
    `);

    return res.status(200).json({
      success: true,
      message: "Old stock history deleted",
    });
  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};
