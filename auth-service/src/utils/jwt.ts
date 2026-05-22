import jwt, { Secret, SignOptions } from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET: Secret = process.env.JWT_SECRET!;

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
  "1d") as SignOptions["expiresIn"];

  
export const generateToken = (user: any) => {
  console.log("JWT_SECRET:", JWT_SECRET);
  console.log("jwt  hidden user:", user);
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      role_id: user.role_id,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    },
  );
};
