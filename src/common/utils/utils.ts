import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const ResizeParam = z.coerce
  .number()
  .int()
  .max(2147483647)
  .positive()
  .optional();
const PositiveRotateParam = z.coerce
  .number()
  .multipleOf(90)
  .max(32760) // largest multiple of 90 below 32767 (smallint postgres limit)
  .positive()
  .optional();
const NegativeRotateParam = z.coerce
  .number()
  .multipleOf(90)
  .min(-32760) // smallest multiple of 90 above -32768 (smallint postgres limit)
  .negative()
  .optional();
const BooleanParam = z.string().max(0).optional();

export const QueryValidator = z
  .object({
    w: ResizeParam,
    h: ResizeParam,
    r: PositiveRotateParam.or(NegativeRotateParam),
    to: z.enum(["jpeg", "png", "webp", "gif", "avif", "tiff"]).optional(), // TODO reuse ToFormat
    q: z.coerce.number().int().min(1).max(100).optional(),
    flip: BooleanParam,
    flop: BooleanParam,
    grey: BooleanParam,
    blur: BooleanParam,
    apiKey: z.string().uuid().optional(),
  })
  .strict();

const URLParam = z.string().url();

export const ParamsValidator = z
  .object({
    href: URLParam,
    0: URLParam,
  })
  .strict();

export const trueIfProvided = (value?: string) => value === "";

export const timeoutHalt = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.timedout) {
    next();
  } else {
    req.socket.destroy();
  }
};

export const getFormat = (contentType: string) => {
  if (contentType.includes("image/jpeg")) {
    return "jpeg";
  }

  if (contentType.includes("image/png")) {
    return "png";
  }

  if (contentType.includes("image/webp")) {
    return "webp";
  }

  if (contentType.includes("image/gif")) {
    return "gif";
  }

  if (contentType.includes("image/avif")) {
    return "avif";
  }

  if (contentType.includes("image/tiff")) {
    return "tiff";
  }

  if (contentType.includes("image/svg+xml")) {
    return "svg";
  }
};
