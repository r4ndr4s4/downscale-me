import axios from "axios";
import express, { type Request, type Response, type Router } from "express";
import asyncHandler from "express-async-handler";
import sharp from "sharp";

import {
  getBlurOptions,
  getResizeOptions,
} from "@/common/utils/processOptions";
import { Format } from "@/common/utils/types";
import sql from "@/common/utils/database";
import {
  trueIfProvided,
  ParamsValidator,
  QueryValidator,
} from "@/common/utils/utils";

const KEY_ID = "13716c77-bfec-4bd5-9bdf-3a76a9d1f232"; // TODO

export const imageRouter: Router = express.Router();

imageRouter.get(
  "/",
  asyncHandler(async (_: Request, res: Response) => {
    res.status(404).send("Missing image URL");
  })
);

imageRouter.get(
  "/:href(*)",
  asyncHandler(
    async ({ params, query, originalUrl }: Request, res: Response) => {
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

      const isFlip = trueIfProvided(flip);
      const isFlop = trueIfProvided(flop);
      const isGreyscale = trueIfProvided(grey);
      const isBlur = trueIfProvided(blur);

      console.log({
        href,
        imageUrl,
        resizeWidth,
        resizeHeight,
        rotateAngle,
        isFlip,
        isFlop,
        isGreyscale,
        isBlur,
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

      if (isFlip) {
        process.flip();
      }

      if (isFlop) {
        process.flop();
      }

      if (rotateAngle) {
        process.rotate(rotateAngle);
      }

      if (isGreyscale) {
        process.greyscale();
      }

      if (isBlur) {
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

      // TODO move to middleware?
      const logEntry = {
        image: imageUrl,
        key_id: KEY_ID,
        width: resizeWidth || null,
        height: resizeHeight || null,
        rotate: rotateAngle || null,
        format: format === newFormat ? null : newFormat,
        quality: toQuality || null,
        flip: isFlip,
        flop: isFlop,
        greyscale: isGreyscale,
        blur: isBlur,
        request: originalUrl, // TODO api key
        response: "SERVED_FROM_TRANSFORM", // TODO log errors, save "served from cache", etc.
      };

      // TODO move below sending result?, await?
      await sql`INSERT INTO logs ${sql(logEntry)}`;

      res.type(`image/${newFormat}`);
      process.pipe(res);
    }
  )
);
