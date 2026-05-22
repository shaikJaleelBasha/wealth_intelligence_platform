import pool from "../config/db";

//create database if it is not exsists in the postgresql supabase database

export const createDatabase = async () => {
  try {
    const dbName = "wealth_intelligence_db";

    // check if database exists
    const checkResult = await pool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName],
    );

    if (checkResult.rowCount === 0) {
      await pool.query(`CREATE DATABASE ${dbName}`);
      console.log("Database created successfully");
    } else {
      console.log("Database already exists");
    }
  } catch (error) {
    console.error("Error creating database:", error);
  }
};
// i want to write the raw sql query to create the separate users table in the postgresql supabase database

/*
   it consists of the following columns:
   1. user_id: primary key, auto-incrementing integer  
   2. role_id: integer, foreign key referencing the roles table
   3. email: string, unique
   4. password: string
   5. status: boolean, [active, inactive, suspended]
   6. created_at: timestamp, default to current time
*/


 export const createUsersTable = async () => {
  try {
    // Create ENUM type first
    await pool.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1
              FROM pg_type
              WHERE typname = 'user_status'
          ) THEN
              CREATE TYPE user_status AS ENUM (
                  'ACTIVE',
                  'INACTIVE',
                  'SUSPENDED'
              );
          END IF;
      END
      $$;
    `);

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
          user_id SERIAL PRIMARY KEY,
          role_id INTEGER REFERENCES roles(role_id),
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          status user_status DEFAULT 'ACTIVE',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Users table created successfully");
  } catch (error) {
    console.error("Error creating users table:", error);
  }
};

// separately i want to create the roles table in the postgresql supabase database which will be referenced by the roles table


/*

  in the roles table we will have the following columns:
1. role_id: primary key, auto-incrementing integer
2. role_name: string, unique


 */


