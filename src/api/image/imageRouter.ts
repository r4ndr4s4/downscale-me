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
import { ParamsValidator } from "@/common/utils/utils";
import { cacheFile } from "@/common/utils/storage";
import lookUpInCache from "@/common/middleware/lookUpInCache";

export const imageRouter: Router = express.Router();

imageRouter.param("href", (req, res, next) => {
  const { params } = req;

  const { href } = ParamsValidator.parse(params);

  const paramsStartAt = href.lastIndexOf("/");
  const imageUrl = href.slice(0, paramsStartAt);

  req.imageUrl = imageUrl;

  next();
});

imageRouter.get(
  "/",
  asyncHandler(async (_: Request, res: Response) => {
    res.status(404).send("Missing image URL");
  })
);

imageRouter.get(
  "/:href(*)",
  lookUpInCache,
  asyncHandler(
    async (
      { originalUrl, key, parsedParams, imageUrl, cacheFileName }: Request,
      res: Response
    ) => {
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

      console.log({
        parsedParams,
        imageUrl,
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
        pages,
      } = await process.metadata();

      // TODO check if format can be undefined
      let newFormat: Format | undefined = format === "svg" ? "webp" : format;

      console.log({
        originalWidth,
        originalHeight,
        format,
        newFormat,
      });

      if (rotateAngle && pages) {
        throw new Error("Cannot rotate animated images");
      }

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
        key_id: key,
        width: resizeWidth || null,
        height: resizeHeight || null,
        rotate: rotateAngle || null,
        format: format === newFormat ? null : newFormat,
        quality: toQuality || null,
        flip: isFlip,
        flop: isFlop,
        greyscale: isGreyscale,
        blur: isBlur,
        request: originalUrl,
        response: "SERVED_FROM_TRANSFORM", // TODO log errors, save "served from cache", etc.
      };

      // TODO move below sending result?, await?
      await sql`INSERT INTO logs ${sql(logEntry)}`;

      res.type(`image/${newFormat}`);
      res.set("Cache-Control", `public, max-age=${60 * 60 * 24}`);

      process.timeout({ seconds: 3 }); // TODO move up?

      // TODO await?
      await cacheFile(cacheFileName, process);

      process.pipe(res);
    }
  )
);
