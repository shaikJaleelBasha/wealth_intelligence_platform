import  pool  from "../config/db";

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
      is_active
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true)
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
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const getAllStocks = async () => {
  const result = await pool.query(`
    SELECT * FROM stocks
    ORDER BY stock_id DESC
  `);

  return result.rows;
};

export const updateStock = async (stockId: number, data: any) => {
  const query = `
    UPDATE stocks
    SET
      company_name=$1,
      exchange=$2,
      sector=$3,
      industry=$4,
      market_cap=$5,
      current_price=$6,
      updated_at=NOW()
    WHERE stock_id=$7
    RETURNING *
  `;

  const values = [
    data.company_name,
    data.exchange,
    data.sector,
    data.industry,
    data.market_cap,
    data.current_price,
    stockId,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};
