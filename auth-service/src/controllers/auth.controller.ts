
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



/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

export const login = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { email, password_hash } = req.body;

    /*
        |--------------------------------------------------------------------------
        | GET USER + ROLE
        |--------------------------------------------------------------------------
        */

    const userResult = await client.query(
      `
            SELECT

                u.user_id,
                u.email,
                u.password_hash,
                u.role_id,

                r.role_name

            FROM users u

            JOIN roles r
            ON u.role_id = r.role_id

            WHERE u.email = $1
            `,

      [email],
    );

    /*
        |--------------------------------------------------------------------------
        | USER NOT FOUND
        |--------------------------------------------------------------------------
        */

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,

        message: "Invalid email or password",
      });
    }

    const user = userResult.rows[0];

    /*
        |--------------------------------------------------------------------------
        | PASSWORD CHECK
        |--------------------------------------------------------------------------
        */

    const isPasswordValid = await bcrypt.compare(
      password_hash,

      user.password_hash,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,

        message: "Invalid email or password",
      });
    }

    /*
        |--------------------------------------------------------------------------
        | FETCH ROLE PROFILE
        |--------------------------------------------------------------------------
        */

    let profileData = null;

    /*
        |--------------------------------------------------------------------------
        | INVESTOR PROFILE
        |--------------------------------------------------------------------------
        */

    if (user.role_name === "INVESTOR") {
      const investorResult = await client.query(
        `
                    SELECT

                        investor_id,
                        user_id,
                        first_name,
                        last_name,
                        phone,
                        dob,
                        risk_profile,
                        kyc_status,
                        address,
                        city,
                        state,
                        country,
                        created_at,
                        updated_at

                    FROM investors

                    WHERE user_id = $1
                    `,

        [user.user_id],
      );

      profileData = investorResult.rows[0] || null;
    } else if (user.role_name === "ADMIN") {

    /*
        |--------------------------------------------------------------------------
        | ADMIN PROFILE
        |--------------------------------------------------------------------------
        */
      const adminResult = await client.query(
        `
                    SELECT

                        admin_id,
                        user_id,
                        first_name,
                        last_name,
                        phone,
                        department,
                        created_at

                    FROM admins

                    WHERE user_id = $1
                    `,

        [user.user_id],
      );

      profileData = adminResult.rows[0] || null;
    } else if (user.role_name === "SUPPORT") {

    /*
        |--------------------------------------------------------------------------
        | SUPPORT PROFILE
        |--------------------------------------------------------------------------
        */
      const supportResult = await client.query(
        `
                    SELECT

                        support_id,
                        user_id,
                        first_name,
                        last_name,
                        phone,
                        shift_timing,
                        created_at

                    FROM supports

                    WHERE user_id = $1
                    `,

        [user.user_id],
      );

      profileData = supportResult.rows[0] || null;
    }

    /*
        |--------------------------------------------------------------------------
        | JWT PAYLOAD
        |--------------------------------------------------------------------------
        */

    const tokenPayload = {
      user_id: user.user_id,

      email: user.email,

      role_id: user.role_id,

      role_name: user.role_name,

      profile: profileData,
    };

    /*
        |--------------------------------------------------------------------------
        | GENERATE TOKEN
        |--------------------------------------------------------------------------
        */

    const token = generateToken(tokenPayload);

    console.log("Generated JWT token:", token);
    /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

    return res.status(200).json({
      success: true,

      message: "Login successful",

      token,

      user: {
        user_id: user.user_id,

        email: user.email,

        role_id: user.role_id,

        role_name: user.role_name,
      },

      profile: profileData,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: "Server error",
    });
  } finally {
    client.release();
  }
};




/*
|--------------------------------------------------------------------------
| REGISTER USER
|--------------------------------------------------------------------------
*/

export const registerUser = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /*
    |--------------------------------------------------------------------------
    | REQUEST BODY
    |--------------------------------------------------------------------------
    */

    const {
      email,
      password,
      role_name,

      first_name,
      last_name,
      phone,

      city,
      state,
      country,

      risk_profile,
    } = req.body;

    console.log("Registration Data:", req.body);

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!email || !password || !role_name) {
      return res.status(400).json({
        success: false,

        message: "Required fields missing",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK USER EXISTS
    |--------------------------------------------------------------------------
    */

    const existingUser = await client.query(
      `
        SELECT *
        FROM users
        WHERE email = $1
      `,
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
    | NORMALIZE ROLE
    |--------------------------------------------------------------------------
    */

    const normalizedRole = role_name.trim().toUpperCase();

    /*
    |--------------------------------------------------------------------------
    | GET ROLE
    |--------------------------------------------------------------------------
    */

    const roleResult = await client.query(
      `
        SELECT role_id, role_name
        FROM roles
        WHERE role_name = $1
      `,
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
    | CREATE USER
    |--------------------------------------------------------------------------
    */

    const userResult = await client.query(
      `
        INSERT INTO users
        (
          role_id,
          email,
          password_hash,
          status,
          created_at
        )
        VALUES
        (
          $1,
          $2,
          $3,
          'ACTIVE',
          NOW()
        )
        RETURNING *
      `,
      [roleData.role_id, email, hashedPassword],
    );

    const user = userResult.rows[0];

    let profileData = null;

    /*
    |--------------------------------------------------------------------------
    | INVESTOR REGISTRATION
    |--------------------------------------------------------------------------
    */

    if (normalizedRole === "INVESTOR") {
      /*
      |--------------------------------------------------------------------------
      | CREATE INVESTOR PROFILE
      |--------------------------------------------------------------------------
      */

      const investorResult = await client.query(
        `
          INSERT INTO investors
          (
            user_id,
            first_name,
            last_name,
            phone,
            risk_profile,
            kyc_status,
            city,
            state,
            country,
            created_at,
            updated_at
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            'VERIFIED',
            $6,
            $7,
            $8,
            NOW(),
            NOW()
          )
          RETURNING *
        `,
        [
          user.user_id,

          first_name || null,

          last_name || null,

          phone || null,

         risk_profile || "HIGH",

          city || null,

          state || null,

          country || null,
        ],
      );

      const investor = investorResult.rows[0];

      profileData = investor;

      /*
      |--------------------------------------------------------------------------
      | AUTO CREATE PORTFOLIO
      |--------------------------------------------------------------------------
      */

      await client.query(
        `
        INSERT INTO portfolios
        (
          investor_id,
          portfolio_name,
          portfolio_type,
          total_investment,
          current_value,
          created_at,
          updated_at
        )
        VALUES
        (
          $1,
          'Primary Portfolio',
          'LONG_TERM',
          0,
          0,
          NOW(),
          NOW()
        )
      `,
        [investor.investor_id],
      );
    } else if (normalizedRole === "ADMIN") {

    /*
    |--------------------------------------------------------------------------
    | ADMIN REGISTRATION
    |--------------------------------------------------------------------------
    */
      const adminResult = await client.query(
        `
          INSERT INTO admins
          (
            user_id,
            first_name,
            last_name,
            phone,
            department,
            created_at
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            'STOCK_MANAGEMENT',
            NOW()
          )
          RETURNING *
        `,
        [user.user_id, first_name || null, last_name || null, phone || null],
      );

      profileData = adminResult.rows[0];
    }

    /*
    |--------------------------------------------------------------------------
    | GENERATE TOKEN
    |--------------------------------------------------------------------------
    */

    const token = generateToken({
      user_id: user.user_id,

      email: user.email,

      role_id: user.role_id,

      role_name: normalizedRole,
    });

    /*
    |--------------------------------------------------------------------------
    | COMMIT
    |--------------------------------------------------------------------------
    */

    await client.query("COMMIT");

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,

      message: "Registration Successful",

      token,

      user: {
        user_id: user.user_id,

        email: user.email,

        role_id: user.role_id,

        role_name: normalizedRole,
      },

      profile: profileData,
    });
  } catch (error: any) {
    /*
    |--------------------------------------------------------------------------
    | ROLLBACK
    |--------------------------------------------------------------------------
    */

    await client.query("ROLLBACK");

    console.log(error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  } finally {
    client.release();
  }
};


