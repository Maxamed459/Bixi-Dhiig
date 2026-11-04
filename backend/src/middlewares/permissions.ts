import { Request, Response, NextFunction } from "express";
import type { AdminPermission } from "../generated/prisma/enums.js";
import { hasAnyPermission } from "../lib/permissions.js";

const noAccess = (res: Response) =>
  res.status(403).json({
    success: false,
    message: "You don't have permission to perform this action",
  });

/**
 * Requires the authenticated ADMIN to hold at least one of the given permissions.
 * Superadmins pass automatically. Must run after `authenticate` and `authorizeRoles("ADMIN")`.
 */
export const authorizePermission =
  (...permissions: AdminPermission[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.role !== "ADMIN" || !hasAnyPermission(req.user, permissions)) {
      return noAccess(res);
    }

    next();
  };

/** Only superadmins may use the route. */
export const authorizeSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (!req.user.isSuperAdmin) {
    return noAccess(res);
  }

  next();
};
