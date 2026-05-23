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

export const registerUser = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const {
      email,
      password,
      role_name,

      first_name,
      last_name,
      phone,

      // investor fields
      dob,
      pan_number
    } = req.body;

    console.log("Registration data received:", req.body);

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
    | NORMALIZE ROLE
    |--------------------------------------------------------------------------
    */

    const normalizedRole = role_name.trim().toUpperCase();
    console.log("Normalized role:", normalizedRole);

    /*
    |--------------------------------------------------------------------------
    | CHECK EXISTING USER
    |--------------------------------------------------------------------------
    */

    const existingUser = await client.query(
      `
        SELECT user_id
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

    console.log("Role query result:", roleResult.rows);

    if (roleResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const roleData = roleResult.rows[0];

    console.log("Role data fetched:", roleData);

    /*
    |--------------------------------------------------------------------------
    | HASH PASSWORD
    |--------------------------------------------------------------------------
    */

    const hashedPassword = await bcrypt.hash(password, 10);

    /*
    |--------------------------------------------------------------------------
    | BEGIN TRANSACTION
    |--------------------------------------------------------------------------
    */

    await client.query("BEGIN");

    /*
    |--------------------------------------------------------------------------
    | INSERT USER
    |--------------------------------------------------------------------------
    */

    const userResult = await client.query(
      `
        INSERT INTO users (

          role_id,
          email,
          password_hash

        )

        VALUES ($1, $2, $3)

        RETURNING *
      `,
      [roleData.role_id, email, hashedPassword],
    );

    const user = userResult.rows[0];

    let profileData = null;

    /*
    |--------------------------------------------------------------------------
    | INVESTOR PROFILE
    |--------------------------------------------------------------------------
    */

    if (normalizedRole === "INVESTOR") {
      const investorResult = await client.query(
        `
          INSERT INTO investors (

            user_id,
            first_name,
            last_name,
            phone,
            dob,
            pan_number

          )

          VALUES ($1, $2, $3, $4, $5, $6)

          RETURNING *
        `,
        [
          user.user_id,
          first_name || null,
          last_name || null,
          phone || null,
          dob || null,
          pan_number || null,
        ],
      );

      profileData = investorResult.rows[0];
    } else if (normalizedRole === "ADMIN") {

    /*
    |--------------------------------------------------------------------------
    | ADMIN PROFILE
    |--------------------------------------------------------------------------
    */
      const adminResult = await client.query(
        `
          INSERT INTO admins (

            user_id,
            first_name,
            last_name,
            phone,
            dob,
            pan_number

          )

          VALUES ($1, $2, $3, $4, $5, $6)

          RETURNING *
        `,
        [
          user.user_id,
          first_name || null,
          last_name || null,
          phone || null,
          dob || null,
          pan_number || null,
        ],
      );

      profileData = adminResult.rows[0];

       console.log("Admin profile created:", profileData);


    } else if (normalizedRole === "SUPPORT") {

    /*
    |--------------------------------------------------------------------------
    | SUPPORT PROFILE
    |--------------------------------------------------------------------------
    */
      const supportResult = await client.query(
        `
          INSERT INTO supports (

            user_id,
            first_name,
            last_name,
            phone,
            dob,
            pan_number

          )

          VALUES ($1, $2, $3, $4, $5, $6)

          RETURNING *
        `,
        [
          user.user_id,
          first_name || null,
          last_name || null,
          phone || null,
          dob || null,
          pan_number || null,
        ],
      );

      profileData = supportResult.rows[0];
        console.log("Support profile created:", profileData);
    }

    /*
    |--------------------------------------------------------------------------
    | COMMIT
    |--------------------------------------------------------------------------
    */

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,

      message: `${normalizedRole} registered successfully`,

      data: {
        user,

        profile: profileData,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.log(error);

    return res.status(500).json({
      success: false,

      message: "Internal server error",
    });
  } finally {
    client.release();
  }
};