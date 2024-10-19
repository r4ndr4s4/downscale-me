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
    to: z.enum(["jpeg", "png", "webp", "gif", "avif", "tiff"]).optional(),
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
