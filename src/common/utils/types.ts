import { z } from "zod";

export type Format =
  | "avif"
  | "dz"
  | "fits"
  | "gif"
  | "heif"
  | "input"
  | "jpeg"
  | "jpg"
  | "jp2"
  | "jxl"
  | "magick"
  | "openslide"
  | "pdf"
  | "png"
  | "ppm"
  | "raw"
  | "tiff"
  | "tif"
  | "v"
  | "webp";

const ResizeParam = z.coerce.number().int().positive().optional();
const PositiveRotateParam = z.coerce
  .number()
  .multipleOf(90)
  .positive()
  .optional();
const NegativeRotateParam = z.coerce
  .number()
  .multipleOf(90)
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
  })
  .strict();

const URLParam = z.string().url();

export const ParamsValidator = z
  .object({
    href: URLParam,
    0: URLParam,
  })
  .strict();
