import { Request, Response, NextFunction } from "express";
import { z } from "zod";

import sql from "../utils/database";

interface KeyWithUser {
  key_id: string;

  user_id: string;
  name: string;
  email: string;
}

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

  const [keyWithUser] = await sql<
    KeyWithUser[]
  >`SELECT k.id AS key_id, u.id AS user_id, u.name, u.email FROM keys k INNER JOIN users u ON k.user_id=u.id WHERE k.id=${apiKey} AND k.is_deleted=false AND u.is_deleted=false`;

  if (!keyWithUser) {
    return res.status(401).json({
      status: "error",
      message: "Invalid X-Api-Key header provided.",
    });
  }

  req.key = keyWithUser.key_id;
  req.user = {
    id: keyWithUser.user_id,
    name: keyWithUser.name,
    email: keyWithUser.email,
  };

  return next();
};

export default auth;
