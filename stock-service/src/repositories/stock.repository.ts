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

    data.current_price,

    data.available_quantity,

    stockId,
  ];

  const result = await pool.query(query, values);

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