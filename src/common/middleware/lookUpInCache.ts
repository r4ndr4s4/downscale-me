import { Request, Response, NextFunction } from "express";
import axios from "axios";

import {
  addParams,
  getParamsObj,
  loadCachedFile,
  normalizeName,
} from "../utils/storage";
import { Format } from "../utils/types";
import { getFormat } from "../utils/utils";

export const lookUpInCache = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { parsedParams, key, imageUrl } = req;

  let newFormat: Format = "jpeg"; // TODO handle default

  const { headers } = await axios.head(imageUrl);
  const contentType = headers["content-type"];

  const detectedFormat = getFormat(contentType) || "jpeg"; // TODO handle default
  newFormat = detectedFormat === "svg" ? "webp" : (detectedFormat as Format);

  const {
    resizeWidth,
    resizeHeight,
    rotateAngle,
    isFlip,
    isFlop,
    isGreyscale,
    isBlur,
    toFormat,
    toQuality,
  } = parsedParams;

  if (toFormat) {
    newFormat = toFormat;
  }

  const paramsObj = getParamsObj({
    resizeWidth,
    resizeHeight,
    rotateAngle,
    isFlip,
    isFlop,
    isGreyscale,
    isBlur,
    toQuality,
  });

  const cacheFileName = `${key}/${normalizeName(imageUrl)}-${addParams(
    paramsObj
  )}.${newFormat}`;

  req.cacheFileName = cacheFileName;

  const cachedFile = await loadCachedFile(cacheFileName);

  if (cachedFile) {
    // TODO logging
    res.type(`image/${newFormat}`);
    res.set("Cache-Control", `public, max-age=${60 * 60 * 24}`);

    cachedFile.pipe(res);

    return;
  }

  return next();
};

export default lookUpInCache;
