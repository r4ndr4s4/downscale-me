import express, { type Request, type Response, type Router } from "express";
import asyncHandler from "express-async-handler";
import path from "path";
import sharp from "sharp";

export const imageRouter: Router = express.Router();

imageRouter.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const image = await sharp(path.resolve(__dirname, "img.jpg"))
      //.rotate()
      .resize(200)
      // .jpeg({ mozjpeg: true })
      .toBuffer();

    res
      .writeHead(200, {
        "Content-Type": "image/jpeg",
        "Content-Length": image.length,
      })
      .end(image);
  })
);
