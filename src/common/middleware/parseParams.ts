import { Request, Response, NextFunction } from "express";

import { trueIfProvided, QueryValidator } from "@/common/utils/utils";

export const parseParams = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { query } = req;

  const {
    w: resizeWidth,
    h: resizeHeight,
    r: rotateAngle,
    to: toFormat,
    q: toQuality,
    flip,
    flop,
    grey,
    blur,
  } = QueryValidator.parse(query);

  const isFlip = trueIfProvided(flip);
  const isFlop = trueIfProvided(flop);
  const isGreyscale = trueIfProvided(grey);
  const isBlur = trueIfProvided(blur);

  if (
    !resizeWidth &&
    !resizeHeight &&
    !rotateAngle &&
    !toFormat &&
    !toQuality &&
    !isFlip &&
    !isFlop &&
    !isGreyscale &&
    !isBlur
  ) {
    throw new Error("No transformation requested");
  }

  req.parsedParams = {
    resizeWidth,
    resizeHeight,
    rotateAngle,
    isFlip,
    isFlop,
    isGreyscale,
    isBlur,
    toQuality,
    toFormat,
  };

  return next();
};

export default parseParams;
