import { Request, Response, NextFunction } from "express";
import { z } from "zod";

import sql from "../utils/database";
import { Key } from "../utils/types";

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const apiKey = req.get("X-Api-Key") || req.query.apiKey?.toString();

  if (!apiKey) {
    return res.status(401).json({
      status: "error",
      message: "X-Api-Key header not found.",
    });
  }

  try {
    z.string().uuid().parse(apiKey);
  } catch {
    return res.status(401).json({
      status: "error",
      message: "Invalid X-Api-Key header provided.",
    });
  }

  // TODO join with users
  const [key] = await sql<
    Key[]
  >`SELECT * FROM keys WHERE id=${apiKey} AND is_deleted=false`;

  if (!key) {
    return res.status(401).json({
      status: "error",
      message: "Invalid X-Api-Key header provided.",
    });
  }

  req.key = key;

  return next();
};

export default auth;
