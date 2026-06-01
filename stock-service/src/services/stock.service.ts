import * as stockRepository from "../repositories/stock.repository";

import pool from "../config/db";

export const createStock = async (data: any) => {
  return await stockRepository.insertStock(data);
};

export const fetchStocks = async () => {
  return await stockRepository.getAllStocks();
};

export const modifyStock = async (stockId: number, data: any) => {
  return await stockRepository.updateStock(stockId, data);
};

import { PoolClient } from "pg";

export const getStockByIsin = async (
  client: PoolClient,
  isinNumber: string,
) => {
  const result = await client.query(
    `
    SELECT *
    FROM stocks
    WHERE isin_number = $1
  `,
    [isinNumber],
  );

  return result.rows[0];
};

export const reduceMarketStock = async (
  client: PoolClient,
  stockId: number,
  quantity: number,
) => {
  await client.query(
    `
    UPDATE stocks
    SET
      available_quantity =
        available_quantity - $1,
      updated_at = NOW()
    WHERE stock_id = $2
  `,
    [quantity, stockId],
  );
};

export const getAllStocks = async () => {
  const result = await pool.query(`
        SELECT
          s.*,

          COALESCE(
            (
              SELECT
                change_amount
              FROM stock_price_history
              WHERE stock_id =
                    s.stock_id
              ORDER BY created_at DESC
              LIMIT 1
            ),
            0
          ) AS change_amount

        FROM stocks s

        ORDER BY stock_id DESC
      `);

  return result.rows;
};