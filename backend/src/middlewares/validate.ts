import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

/**
 * Generic request-body validator. On success, replaces req.body with the parsed
 * (and therefore trimmed/typed) value so controllers can trust it downstream.
 */
export const validateBody =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req.body = result.data;
    next();
  };

/**
 * Same idea for query strings. Express 5's req.query is read-only in some setups, so
 * instead of reassigning it we stash the parsed/coerced result on res.locals.query for
 * controllers to read from.
 */
export const validateQuery =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    res.locals.query = result.data;
    next();
  };
