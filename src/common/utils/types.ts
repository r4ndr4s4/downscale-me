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

interface TableCommon {
  id: string;

  status: string;
  meta: string;

  created_at: string;
  updated_at: string;

  is_deleted: boolean;
}

export interface Users extends TableCommon {
  name: string;
  email: string;
}

export interface Keys extends TableCommon {
  user_id: string;
}

export interface Logs extends TableCommon {
  image: string;
  key_id: string;

  width: number;
  height: number;
  rotate: number;
  format: string;
  quality: number;
  flip: boolean;
  flop: boolean;
  greyscale: boolean;
  blur: boolean;

  request: string;
  response: string;
}