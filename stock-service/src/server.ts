import dotenv from "dotenv";

import cron from "node-cron";

import app from "./app";

import pool from "./config/db";

import { runMarketSimulation } from "./jobs/market.job";

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/

dotenv.config();

/*
|--------------------------------------------------------------------------
| PORT
|--------------------------------------------------------------------------
*/

const port = process.env.PORT || 5002;

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

async function startServer() {
  try {
    /*
    |--------------------------------------------------------------------------
    | DATABASE CONNECTION TEST
    |--------------------------------------------------------------------------
    */

    await pool.query("SELECT 1");

    console.log("DATABASE CONNECTED SUCCESSFULLY");

    /*
    |--------------------------------------------------------------------------
    | START EXPRESS SERVER
    |--------------------------------------------------------------------------
    */

    app.listen(port, () => {
      console.log(`SERVER RUNNING ON PORT ${port}`);
    });

    /*
    |--------------------------------------------------------------------------
    | MARKET ENGINE
    |--------------------------------------------------------------------------
    |
    | TESTING:
    | Every 1 minute
    |
    | PRODUCTION:
    | Use "0 0 * * *"
    |--------------------------------------------------------------------------
    */

    cron.schedule("*/15 9-14 * * 1-5", async () => {
      console.log("RUNNING MARKET ENGINE");

      await runMarketSimulation();
    });

    console.log("MARKET ENGINE INITIALIZED");
  } catch (error) {
    console.error("STARTUP ERROR:", error);

    process.exit(1);
  }
}

/*
|--------------------------------------------------------------------------
| RUN SERVER
|--------------------------------------------------------------------------
*/

startServer();
