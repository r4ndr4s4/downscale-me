import axios from "axios";
import express, { type Request, type Response, type Router } from "express";
import asyncHandler from "express-async-handler";
import sharp from "sharp";

import {
  getResizeOptions,
  getRotateOptions,
} from "@/common/utils/processOptions";

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
      { params: { href }, query: { w, h, r, flip, flop } }: Request,
      res: Response
    ) => {
      const paramsStartAt = href.lastIndexOf("/");
      const imageUrl = href.slice(0, paramsStartAt);

      const resizeWidth = w?.toString();
      const resizeHeight = h?.toString();
      const rotateAngle = r?.toString();

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
      });

      try {
        const { data: image } = await axios({
          url: imageUrl,
          responseType: "arraybuffer",
        });

        const process = sharp(image);

        const {
          width: maxWidth,
          height: maxHeight,
          format,
        } = await process.metadata();

        const newFormat = format === "svg" ? "webp" : format;

        console.log({ maxWidth, maxHeight, format, newFormat });

        if (resizeWidth || resizeHeight) {
          const resizeOptions = getResizeOptions({
            resizeWidth,
            resizeHeight,
            maxWidth,
            maxHeight,
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
