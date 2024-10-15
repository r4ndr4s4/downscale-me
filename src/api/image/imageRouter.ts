import axios from "axios";
import express, { type Request, type Response, type Router } from "express";
import asyncHandler from "express-async-handler";
import sharp from "sharp";

import {
  getBlurOptions,
  getResizeOptions,
  getRotateOptions,
} from "@/common/utils/processOptions";
import { Format } from "@/common/utils/types";

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
    async (
      {
        params: { href },
        query: { w, h, r, flip, flop, grey, blur, to, q },
      }: Request,
      res: Response
    ) => {
      const paramsStartAt = href.lastIndexOf("/");
      const imageUrl = href.slice(0, paramsStartAt);

      const resizeWidth = w?.toString();
      const resizeHeight = h?.toString();
      const rotateAngle = r?.toString();
      const toFormat = to?.toString();
      const toQuality = q?.toString();

      console.log({
        href,
        imageUrl,
        w,
        resizeWidth,
        h,
        resizeHeight,
        r,
        rotateAngle,
        flip,
        flop,
        grey,
        blur,
        to,
        toFormat,
        q,
        toQuality,
      });

      try {
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

        if (flip || flip === "") {
          process.flip();
        }

        if (flop || flop === "") {
          process.flop();
        }

        if (rotateAngle) {
          const rotateOptions = getRotateOptions(rotateAngle);

          process.rotate(rotateOptions);
        }

        if (grey || grey === "") {
          process.greyscale();
        }

        if (blur || blur === "") {
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
            if (
              !["jpeg", "png", "webp", "gif", "avif", "tiff"].includes(toFormat)
            ) {
              throw new Error("Invalid format provided for output");
            }

            newFormat = toFormat as Format;
          }

          // TODO toQuality validation 1-100

          const normalizedQuality = toQuality ? parseInt(toQuality) : undefined;

          switch (newFormat) {
            case "jpeg":
              process.jpeg({
                force: true,
                quality: normalizedQuality || 80,
              });
              break;

            case "png":
              process.png({
                force: true,
                quality: normalizedQuality || 100,
              });
              break;

            case "webp":
              process.webp({
                force: true,
                quality: normalizedQuality || 80,
              });
              break;

            case "gif":
              process.gif({
                force: true,
                colors: Math.ceil(
                  (((normalizedQuality || 256) - 1) * 254) / 99 + 2
                ),
              });
              break;

            case "avif":
              process.avif({
                force: true,
                quality: normalizedQuality || 50,
              });
              break;

            case "tiff":
              process.tiff({
                force: true,
                quality: normalizedQuality || 80,
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
      } catch (error) {
        console.log({ error });

        res.status(500).send("Error processing image");
      }
    }
  )
);
