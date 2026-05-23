import express from "express";
import dotenv from "dotenv";
import app from "./app";
import pool from "./config/db";

dotenv.config();

const port = process.env.PORT || 5002;

//start server by the creaing the pool connection which is config in the db.ts file and then create the users table in the database by calling the createUsersTable function from the dataBaseTableCreation.ts file

dotenv.config();

async function startServer() {
  try {
    // ✔ just test connection (DO NOT CONNECT MANUALLY)
    await pool.query("SELECT 1");
    console.log("Database connected successfully");

    // ❌ REMOVE THESE IN PRODUCTION (Supabase handles schema)
    // await createDatabase();
    // await createUsersTable();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
}

startServer();
