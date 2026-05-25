import pool from "../config/db";

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

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| GET ALL STOCKS
|--------------------------------------------------------------------------
*/

export const getAllStocks = async () => {
  const result = await pool.query(`
        SELECT *
        FROM stocks
        ORDER BY stock_id DESC
      `);

  return result.rows;
};


/*
|--------------------------------------------------------------------------
| UPDATE STOCK
|--------------------------------------------------------------------------
*/

export const updateStock =
  async (
    stockId: number,
    data: any
  ) => {
    /*
    |--------------------------------------------------------------------------
    | QUERY
    |--------------------------------------------------------------------------
    */

    const query = `
      UPDATE stocks
      SET
        symbol = $1,
        company_name = $2,
        exchange = $3,
        sector = $4,
        industry = $5,
        isin_number = $6,
        market_cap = $7,
        current_price = $8,
        available_quantity = $9,
        updated_at = NOW()

      WHERE stock_id = $10

      RETURNING *
    `;

    /*
    |--------------------------------------------------------------------------
    | VALUES
    |--------------------------------------------------------------------------
    */

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

      stockId,
    ];

    /*
    |--------------------------------------------------------------------------
    | EXECUTE
    |--------------------------------------------------------------------------
    */

    const result =
      await pool.query(
        query,
        values
      );

    /*
    |--------------------------------------------------------------------------
    | NOT FOUND
    |--------------------------------------------------------------------------
    */

    if (
      result.rows.length === 0
    ) {
      throw new Error(
        "Stock not found"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | RETURN
    |--------------------------------------------------------------------------
    */

    return result.rows[0];
  };