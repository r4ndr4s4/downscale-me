import axios from "axios";
import express, { type Request, type Response, type Router } from "express";
import asyncHandler from "express-async-handler";
import sharp from "sharp";

import {
  getBlurOptions,
  getResizeOptions,
} from "@/common/utils/processOptions";
import { Format, ParamsValidator, QueryValidator } from "@/common/utils/types";

export const imageRouter: Router = express.Router();

imageRouter.get(
  "/",
  asyncHandler(async (_: Request, res: Response) => {
    res.status(404).send("Missing image URL");
  })
);

imageRouter.get(
  "/:href(*)",
  asyncHandler(async ({ params, query }: Request, res: Response) => {
    const { href } = ParamsValidator.parse(params);

    const paramsStartAt = href.lastIndexOf("/");
    const imageUrl = href.slice(0, paramsStartAt);

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

    console.log({
      href,
      imageUrl,
      resizeWidth,
      resizeHeight,
      rotateAngle,
      flip,
      flop,
      grey,
      blur,
      toFormat,
      toQuality,
    });

    const { data: image } = await axios({
      url: imageUrl,
      responseType: "arraybuffer",
    });

    const process = sharp(image, { animated: true }); // TODO turn on animated depending on metadata.pages

    const {
      width: originalWidth,
      height: originalHeight,
      format,
    } = await process.metadata();

    // TODO check if format can be undefined
    let newFormat: Format | undefined = format === "svg" ? "webp" : format;

    console.log({
      originalWidth,
      originalHeight,
      format,
      newFormat,
    });

    if (resizeWidth || resizeHeight) {
      const resizeOptions = getResizeOptions({
        resizeWidth,
        resizeHeight,
        maxWidth: originalWidth,
        maxHeight: originalHeight,
      });

      process.resize(resizeOptions);
    }

    if (flip === "") {
      process.flip();
    }

    if (flop === "") {
      process.flop();
    }

    if (rotateAngle) {
      process.rotate(rotateAngle);
    }

    if (grey === "") {
      process.greyscale();
    }

    if (blur === "") {
      const blurOptions = getBlurOptions({
        resizeWidth,
        resizeHeight,
        originalWidth,
        originalHeight,
      });

      process.blur(blurOptions);
    }

    // TODO abstract away
    if (toFormat || toQuality) {
      if (toFormat) {
        newFormat = toFormat as Format;
      }

      switch (newFormat) {
        case "jpeg":
          process.jpeg({
            force: true,
            quality: toQuality || 80,
          });
          break;

        case "png":
          process.png({
            force: true,
            quality: toQuality || 100,
          });
          break;

        case "webp":
          process.webp({
            force: true,
            quality: toQuality || 80,
          });
          break;

        case "gif":
          process.gif({
            force: true,
            colors: Math.ceil((((toQuality || 256) - 1) * 254) / 99 + 2),
          });
          break;

        case "avif":
          process.avif({
            force: true,
            quality: toQuality || 50,
          });
          break;

        case "tiff":
          process.tiff({
            force: true,
            quality: toQuality || 80,
          });
          break;
      }
    }

    // TODO check if newFormat can be undefined
    if (newFormat) {
      process.toFormat(newFormat);
    }

    res.type(`image/${newFormat}`);
    process.pipe(res);
  })
);
