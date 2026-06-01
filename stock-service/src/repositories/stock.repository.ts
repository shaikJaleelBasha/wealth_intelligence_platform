import pool from "../config/db";

import { PoolClient } from "pg";






/*
|--------------------------------------------------------------------------
| INSERT STOCK
|--------------------------------------------------------------------------
*/

export const insertStock = async (data: any) => {
  const query = `
      INSERT INTO stocks
      (
        symbol,
        company_name,
        exchange,
        sector,
        industry,
        isin_number,
        market_cap,
        current_price,
        available_quantity,
        is_active
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,true
      )
      RETURNING *
    `;

  const values = [
    data.symbol,

    data.company_name,

    data.exchange,

    data.sector,

    data.industry,

    data.isin_number,

    data.market_cap,

    data.current_price,

    data.available_quantity,
  ];

  const result = await pool.query(query, values);

  /*
    |--------------------------------------------------------------------------
    | CREATE INITIAL GRAPH HISTORY
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
        0,
        0,
        NOW()
      )
    `,
    [result.rows[0].stock_id, data.current_price],
  );

  return result.rows[0];
};



/*
|--------------------------------------------------------------------------
| GET ALL STOCKS
|--------------------------------------------------------------------------
*/

// export const getAllStocks = async () => {
//   const result = await pool.query(`
//         SELECT
//           s.*,

//           COALESCE(
//             (
//               SELECT
//                 change_amount

//               FROM stock_price_history

//               WHERE stock_id =
//                     s.stock_id

//               ORDER BY created_at DESC

//               LIMIT 1
//             ),
//             0
//           ) AS change_amount,

//           COALESCE(
//             (
//               SELECT
//                 change_percentage

//               FROM stock_price_history

//               WHERE stock_id =
//                     s.stock_id

//               ORDER BY created_at DESC

//               LIMIT 1
//             ),
//             0
//           ) AS change_percentage

//         FROM stocks s

//         ORDER BY stock_id DESC
//       `);

//       console.log(result.rows);

//   return result.rows;
// };
export const getAllStocks = async () => {
  const result = await pool.query(`
    SELECT
      s.*,

      COALESCE(
      (
        SELECT change_amount
        FROM stock_price_history
        WHERE stock_id = s.stock_id
        ORDER BY created_at DESC
        LIMIT 1
      ),
      0
      ) AS change_amount,

      COALESCE(
      (
        SELECT change_percentage
        FROM stock_price_history
        WHERE stock_id = s.stock_id
        ORDER BY created_at DESC
        LIMIT 1
      ),
      0
      ) AS change_percentage

    FROM stocks s

    ORDER BY stock_id DESC
  `);

  return result.rows;
};
/*
|--------------------------------------------------------------------------
| UPDATE STOCK
|--------------------------------------------------------------------------
*/

export const updateStock = async (stockId: number, data: any) => {
  // 1. Get current stock price before update to compute history metrics
  const oldStockResult = await pool.query("SELECT current_price FROM stocks WHERE stock_id = $1", [stockId]);
  const oldPrice = oldStockResult.rows.length > 0 ? Number(oldStockResult.rows[0].current_price) : 0;
  const newPrice = Number(data.current_price);

  // 2. Perform the stock details update
  const query = `
      UPDATE stocks
      SET
        company_name = $1,
        exchange = $2,
        sector = $3,
        industry = $4,
        market_cap = $5,
        current_price = $6,
        available_quantity = $7,
        updated_at = NOW()
      WHERE stock_id = $8
      RETURNING *
    `;

  const values = [
    data.company_name,
    data.exchange,
    data.sector,
    data.industry,
    data.market_cap,
    newPrice,
    data.available_quantity,
    stockId,
  ];

  const result = await pool.query(query, values);

  // 3. Create price history point and cascade update holdings if price changed
  if (oldPrice !== newPrice) {
    const changeAmount = newPrice - oldPrice;
    const changePercentage = oldPrice > 0 ? ((changeAmount / oldPrice) * 100).toFixed(2) : "0.00";

    await pool.query(
      `
      INSERT INTO stock_price_history (stock_id, price, change_amount, change_percentage, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      `,
      [stockId, newPrice, changeAmount, changePercentage]
    );

    // 4. Update the investor holdings table so P&L details show in real-time
    await pool.query(
      `
      UPDATE holdings
      SET
        current_market_price = $1,
        current_value = quantity * $1,
        unrealized_profit = (quantity * $1) - total_invested,
        last_updated = NOW()
      WHERE asset_type = 'STOCK' AND asset_id = $2
      `,
      [newPrice, stockId]
    );
  }

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| DELETE STOCK
|--------------------------------------------------------------------------
*/

export const deleteStock = async (stockId: number) => {
  await pool.query(
    `
      DELETE FROM stocks
      WHERE stock_id = $1
    `,
    [stockId],
  );
};

/*
|--------------------------------------------------------------------------
| GET STOCK BY ISIN
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| REDUCE MARKET STOCK
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| INCREASE MARKET STOCK
|--------------------------------------------------------------------------
*/


export const increaseMarketStock = async (
  client: PoolClient,
  stockId: number,
  quantity: number,
) => {
  await client.query(
    `
    UPDATE stocks
    SET
      available_quantity =
        available_quantity + $1,

      updated_at = NOW()

    WHERE stock_id = $2
    `,
    [quantity, stockId],
  );
};