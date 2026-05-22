import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt";
import pool from "../config/db";

/*
|--------------------------------------------------------------------------
| MOCK USER
|--------------------------------------------------------------------------
|
| Replace with Supabase query later
|
*/

const users = [
  {
    user_id: 1,
    email: "admin@gmail.com",
    password: "$2a$10$7EqJtq98hPqEX7fNZaFWoOHi",
    role: "ADMIN",
  },
  {
    user_id: 2,
    email: "investor@gmail.com",
    password: "$2a$10$7EqJtq98hPqEX7fNZaFWoOHi",
    role: "INVESTOR",
  },
];

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

export const login = async (req: Request, res: Response) => {

  try {
     const client = await pool.connect();
     const { email, password } = req.body;


    const findEMailResult = await client.query(
      `SELECT user_id, email, password_hash, role_id FROM users WHERE email = $1`,
      [email],
    );

    console.log("findEMailResult:", findEMailResult.rows);

    if (findEMailResult.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password no user found with this email create the account",
      });
    }
    const user = findEMailResult.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    const token = generateToken({
      user_id: user.user_id,
      email: user.email,
      role_id: user.role_id,
    });

    console.log("Generated JWT token:", token);

    return res.status(200).json({
      message: "Login successful",
      token,
    });



    
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};





export const registerUser = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const {
      email,
      password,
      role,

      // investor fields (optional for all roles)
      first_name,
      last_name,
      phone,
      dob,
      pan_number,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "email, password, role are required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK EXISTING USER
    |--------------------------------------------------------------------------
    */
    const existingUser = await client.query(
      `SELECT user_id FROM users WHERE email = $1`,
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GET ROLE
    |--------------------------------------------------------------------------
    */
    const normalizedRole = role.trim().toUpperCase();

    const roleResult = await client.query(
      `SELECT role_id, role_name FROM roles WHERE role_name = $1`,
      [normalizedRole],
    );

    if (roleResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const roleData = roleResult.rows[0];

    /*
    |--------------------------------------------------------------------------
    | HASH PASSWORD
    |--------------------------------------------------------------------------
    */
    const hashedPassword = await bcrypt.hash(password, 10);

    /*
    |--------------------------------------------------------------------------
    | START TRANSACTION
    |--------------------------------------------------------------------------
    */
    await client.query("BEGIN");

    /*
    |--------------------------------------------------------------------------
    | INSERT USER (ALL ROLES)
    |--------------------------------------------------------------------------
    */
    const userResult = await client.query(
      `INSERT INTO users (role_id, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING user_id, email, role_id`,
      [roleData.role_id, email, hashedPassword],
    );

    const user = userResult.rows[0];

    /*
    |--------------------------------------------------------------------------
    | INSERT INVESTOR PROFILE (ONLY IF ROLE IS INVESTOR)
    |--------------------------------------------------------------------------
    */
    let investor = null;

    if (
      roleData.role_name === "INVESTOR" &&
      (first_name || last_name || phone || dob || pan_number)
    ) {
      const investorResult = await client.query(
        `INSERT INTO investors (
          user_id,
          first_name,
          last_name,
          phone,
          dob,
          pan_number
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
          user.user_id,
          first_name || null,
          last_name || null,
          phone || null,
          dob || null,
          pan_number || null,
        ],
      );

      investor = investorResult.rows[0];
    }

    /*
    |--------------------------------------------------------------------------
    | COMMIT
    |--------------------------------------------------------------------------
    */
    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
        investor, // null for non-investor users
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    client.release();
  }
};