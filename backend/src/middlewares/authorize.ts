import { Request, Response, NextFunction } from "express";
import { Role } from "../generated/prisma/enums.js";

/**
 * Role-based access control. Must run after `authenticate` (needs req.user set).
 * Usage: router.post("/", authenticate, authorizeRoles("ADMIN"), handler)
 */
export const authorizeRoles =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to perform this action",
      });
    }

    next();
  };
