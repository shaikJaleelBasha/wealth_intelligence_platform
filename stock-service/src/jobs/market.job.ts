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

    res.status(200).json(stock);
  } catch (error: any) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| STOCK HISTORY
|--------------------------------------------------------------------------
*/

export const getStockHistory = async (req: Request, res: Response) => {
  try {
    const stockId = Number(req.params.stockId);

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
    | GRAPH SHOULD SHOW OLDEST → NEWEST
    |--------------------------------------------------------------------------
    */

    const history = result.rows.reverse();

    res.status(200).json(history);
  } catch (error: any) {
    console.log("GET STOCK HISTORY ERROR:", error);

    res.status(500).json({
      message: error.message || "Unable to fetch stock history",
    });
  }
};

/*
|--------------------------------------------------------------------------
| MARKET SIMULATION ENGINE
|--------------------------------------------------------------------------
*/

export const runMarketSimulation = async () => {
  try {
    console.log("MARKET ENGINE STARTED");

    const stockResult = await pool.query(`
      SELECT *
      FROM stocks
    `);

    const stocks = stockResult.rows;

    for (const stock of stocks) {
      const currentPrice = Number(stock.current_price);

      /*
      |--------------------------------------------------------------------------
      | RANDOM DAILY MOVEMENT
      | -2% TO +2%
      |--------------------------------------------------------------------------
      */

      const percentageMove = Math.random() * 4 - 2;

      let newPrice = currentPrice + (currentPrice * percentageMove) / 100;

      /*
      |--------------------------------------------------------------------------
      | MINIMUM PRICE
      |--------------------------------------------------------------------------
      */

      if (newPrice < 50) {
        newPrice = 50;
      }

      const changeAmount = newPrice - currentPrice;

      const changePercentage = ((changeAmount / currentPrice) * 100).toFixed(2);

      /*
      |--------------------------------------------------------------------------
      | UPDATE STOCK PRICE
      |--------------------------------------------------------------------------
      */

      await pool.query(
        `
        UPDATE stocks
        SET
          current_price = $1,
          updated_at = NOW()
        WHERE stock_id = $2
      `,
        [newPrice, stock.stock_id],
      );

      /*
      |--------------------------------------------------------------------------
      | INSERT PRICE HISTORY
      |--------------------------------------------------------------------------
      */

      await pool.query(
        `
        INSERT INTO stock_price_history
        (
          stock_id,
          price,
          change_amount,
          change_percentage,
          created_at
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          NOW()
        )
      `,
        [stock.stock_id, newPrice, changeAmount, changePercentage],
      );

      /*
      |--------------------------------------------------------------------------
      | UPDATE HOLDINGS
      |--------------------------------------------------------------------------
      |
      | Profit/Loss should compare
      | CURRENT PRICE vs BUY PRICE
      |--------------------------------------------------------------------------
      */

      await pool.query(
        `
        UPDATE holdings
        SET
          current_market_price = $1,

          current_value =
            quantity * $1,

          unrealized_profit =
            (
              quantity * $1
            )
            -
            (
              quantity *
              average_buy_price
            ),

          last_updated = NOW()

        WHERE asset_type = 'STOCK'
        AND asset_id = $2
      `,
        [newPrice, stock.stock_id],
      );

      console.log(`${stock.symbol}: ₹${currentPrice} -> ₹${newPrice}`);
    }

    console.log("MARKET ENGINE COMPLETED");
  } catch (error) {
    console.log("MARKET ENGINE ERROR:", error);
  }
};
