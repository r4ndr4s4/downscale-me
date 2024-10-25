import sharp from "sharp";
import { Storage } from "@google-cloud/storage";

const BUCKET_NAME = "downscale-me-cache";

const storage = new Storage();
const bucket = storage.bucket(BUCKET_NAME);

export const normalizeName = (fileName: string) =>
  fileName.replace(/[\/:?&"*#.()[\]<>|]/gi, "-");

export const getParamsObj = ({
  resizeWidth,
  resizeHeight,
  rotateAngle,
  isFlip,
  isFlop,
  isGreyscale,
  isBlur,
  toQuality,
}: {
  resizeWidth?: number;
  resizeHeight?: number;
  rotateAngle?: number;
  isFlip: boolean;
  isFlop: boolean;
  isGreyscale: boolean;
  isBlur: boolean;
  toQuality?: number;
}) => ({
  width: resizeWidth?.toString() || "0",
  height: resizeHeight?.toString() || "0",
  rotate: rotateAngle?.toString() || "0",
  flip: isFlip ? "T" : "F",
  flop: isFlop ? "T" : "F",
  greyScale: isGreyscale ? "T" : "F",
  blur: isBlur ? "T" : "F",
  quality: toQuality?.toString() || "0",
});

export const addParams = (params: Record<string, string>) =>
  Object.entries(params)
    .sort()
    .reduce((acc, [key, value]) => `${acc}-${value}`, "")
    .substring(1);

export async function cacheFile(fileName: string, sourceStream: sharp.Sharp) {
  const file = bucket.file(fileName);

  sourceStream.pipe(file.createWriteStream()).on("finish", () => {
    console.log(`${fileName} uploaded to ${BUCKET_NAME}`);
  });
}
