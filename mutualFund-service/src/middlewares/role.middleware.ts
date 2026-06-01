import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

const roleMap: Record<number, string> = {
  1: "ADMIN",
  2: "INVESTOR",
  3: "SUPPORT",
};

export const authorize =
  (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    const roleId = req.user?.role_id;
    const userRole = roleMap[roleId];

    if (!userRole) {
      return res.status(403).json({
        message: "Invalid role",
      });
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    next();
  };
