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

export interface User extends TableCommon {
  name: string;
  email: string;
}

export interface Key extends TableCommon {
  user_id: string;
}

export interface Log extends TableCommon {
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

export interface Limit extends TableCommon {
  requests: number;
  days: number;
  key_id: string;
}
