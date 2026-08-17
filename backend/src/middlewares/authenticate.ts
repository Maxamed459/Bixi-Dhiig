import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { verifyJwtToken } from "../lib/jwt.js";
import { JWT_ACCESS_SECRET } from "../config/dotenv.js";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authorization.split(" ")[1];

    if (!JWT_ACCESS_SECRET) {
      throw new Error("JWT_ACCESS_SECRET is not available please provide it");
    }

    const payload = await verifyJwtToken(token, JWT_ACCESS_SECRET);

    const userId = payload.sub as string;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    req.user = user;

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
