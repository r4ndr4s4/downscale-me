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
          responseType: "stream",
        });

        const process = sharp();

        if (resizeWidth || resizeHeight) {
          const resizeOptions = getResizeOptions(resizeWidth, resizeHeight);

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

        res.type("image/jpeg");
        image.pipe(process).pipe(res);
      } catch (error) {
        console.log({ error });

        res.status(500).send("Error processing image");
      }
    }
  )
);
