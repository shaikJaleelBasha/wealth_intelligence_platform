import dotenv from "dotenv";
import app from "./app";
import pool from "./config/db";
import { initSchema } from "./config/schema";
import { initSipJob } from "./jobs/sip.job";

dotenv.config();

const port = process.env.PORT || 5001;

async function startServer() {
  try {
    /*
    |--------------------------------------------------------------------------
    | DATABASE CONNECTION & SCHEMA INITIALIZATION
    |--------------------------------------------------------------------------
    */
    await pool.query("SELECT 1");
    console.log("MUTUAL FUNDS DATABASE CONNECTED SUCCESSFULLY");

    // Automatically check schema & run seeds
    await initSchema();

    /*
    |--------------------------------------------------------------------------
    | AUTOMATED SIP CRON ENGINE
    |--------------------------------------------------------------------------
    */
    initSipJob();

    /*
    |--------------------------------------------------------------------------
    | START EXPRESS SERVER
    |--------------------------------------------------------------------------
    */
    app.listen(port, () => {
      console.log(`MUTUAL FUNDS SERVICE RUNNING ON PORT ${port}`);
    });
  } catch (error) {
    console.error("MUTUAL FUNDS STARTUP ERROR:", error);
    process.exit(1);
  }
}

startServer();
