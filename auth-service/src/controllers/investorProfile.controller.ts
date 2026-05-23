import { Request, Response } from "express";
import pool from "../config/db";

/*
|--------------------------------------------------------------------------
| GET INVESTOR PROFILE WITH ROLE
|--------------------------------------------------------------------------
| - Fetch investor profile + role
| - Fill default values if columns are NULL/empty
| - Update investors table automatically
|--------------------------------------------------------------------------
*/

export const getInvestorProfiles = async (req: Request, res: Response) => {
  const { user_id } = req.params;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /*
    |--------------------------------------------------------------------------
    | GET INVESTOR + ROLE
    |--------------------------------------------------------------------------
    | Assumption:
    | investors.user_id = users.user_id
    | users.role_id = roles.role_id
    |--------------------------------------------------------------------------
    */

    const result = await client.query(
      `
      SELECT 
        i.*,
        r.role_name
      FROM investors i
      LEFT JOIN users u 
        ON i.user_id = u.user_id
      LEFT JOIN roles r
        ON u.role_id = r.role_id
      WHERE i.user_id = $1
      `,
      [user_id],
    );

    // Investor not found
    if (result.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Investor profile not found",
      });
    }

    let investor = result.rows[0];

    /*
    |--------------------------------------------------------------------------
    | DEFAULT VALUES
    |--------------------------------------------------------------------------
    */

    const defaultValues: Record<string, any> = {
      first_name: "Unknown",
      last_name: "Unknown",
      role_name: "Investor",
      phone: "0000000000",
      risk_profile: "Moderate",
      kyc_status: "Pending",
      address: "Not Provided",
      city: "Not Provided",
      state: "Not Provided",
      country: "India",
    };

    /*
    |--------------------------------------------------------------------------
    | CHECK NULL / EMPTY FIELDS
    |--------------------------------------------------------------------------
    */

    const updates: string[] = [];
    const values: any[] = [];

    let index = 1;

    Object.entries(defaultValues).forEach(([key, value]) => {
      if (
        investor[key] === null ||
        investor[key] === undefined ||
        investor[key] === ""
      ) {
        updates.push(`${key} = $${index}`);
        values.push(value);

        // Update response object also
        investor[key] = value;

        index++;
      }
    });

    /*
    |--------------------------------------------------------------------------
    | UPDATE INVESTOR TABLE IF EMPTY VALUES EXIST
    |--------------------------------------------------------------------------
    */

    if (updates.length > 0) {
      values.push(user_id);

      await client.query(
        `
        UPDATE investors
        SET ${updates.join(", ")}
        WHERE user_id = $${index}
        `,
        values,
      );
    }

    await client.query("COMMIT");

    /*
    |--------------------------------------------------------------------------
    | SUCCESS RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,
      message: "Investor profile fetched successfully",
      data: {
        investor_id: investor.investor_id,
        user_id: investor.user_id,
        first_name: investor.first_name,
        last_name: investor.last_name,
        phone: investor.phone,
        dob: investor.dob,
        pan_number: investor.pan_number,
        risk_profile: investor.risk_profile,
        kyc_status: investor.kyc_status,
        address: investor.address,
        city: investor.city,
        state: investor.state,
        country: investor.country,
        role: investor.role_name,
        created_at: investor.created_at,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error fetching investor profile:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error,
    });
  } finally {
    client.release();
  }
};
