import { Request, Response, NextFunction } from "express";

import sql from "../utils/database";
import { Limit } from "../utils/types";

interface Requests {
  count: number;
}

export const checkLimits = async (
  { key }: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const [limit] = await sql<
    Limit[]
  >`SELECT * FROM limits WHERE key_id=${key} AND is_deleted=false`;

  const [{ count: requests }] = await sql<
    Requests[]
  >`SELECT COUNT(*) FROM logs WHERE key_id=${key} AND created_at > current_date - interval '30' day AND is_deleted=false`;

  if (requests + 1 > limit.requests) {
    return res.status(403).json({
      status: "error",
      message: `Limit of ${limit.requests} requests per ${limit.days} day(s) reached.`,
    });
  }

  return next();
};

export default checkLimits;
