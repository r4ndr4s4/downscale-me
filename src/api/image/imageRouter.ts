import axios from "axios";
import express, { type Request, type Response, type Router } from "express";
import asyncHandler from "express-async-handler";
import sharp from "sharp";

import getResizeOptions from "@/common/utils/getResizeOptions";

export const imageRouter: Router = express.Router();

imageRouter.get(
  "/",
  asyncHandler(async (_: Request, res: Response) => {
    res.status(404).send("Missing image URL");
  })
);

imageRouter.get(
  "/:href(*)",
  asyncHandler(async ({ params: { href }, query }: Request, res: Response) => {
    const paramsStartAt = href.lastIndexOf("/");
    const imageUrl = href.slice(0, paramsStartAt);

    const { w, h } = query;

    console.log({ href, imageUrl, query, w, h });

    try {
      const { data: image } = await axios({
        url: imageUrl,
        responseType: "stream",
      });

      const process = sharp();

      if (w || h) {
        const resizeOptions = getResizeOptions(w?.toString(), h?.toString());

        process.resize(resizeOptions);
      }

      res.type("image/jpeg");
      image.pipe(process).pipe(res);
    } catch (error) {
      console.log({ error });

      res.status(500).send("Error processing image");
    }
  })
);
