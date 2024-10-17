import { scale } from "proportional-scale";

export const getResizeOptions = ({
  resizeWidth,
  resizeHeight,
  maxWidth,
  maxHeight,
}: {
  resizeWidth?: number;
  resizeHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}) => {
  const resizeOptions: { width?: number; height?: number } = {};

  // TODO check if maxWidth can be undefined
  if (resizeWidth && maxWidth && resizeWidth >= maxWidth) {
    throw new Error("Invalid width provided for resize");
  }

  // TODO check if maxHeight can be undefined
  if (resizeHeight && maxHeight && resizeHeight >= maxHeight) {
    throw new Error("Invalid height provided for resize");
  }

  resizeOptions.width = resizeWidth;
  resizeOptions.height = resizeHeight;

  return resizeOptions;
};

export const getBlurOptions = ({
  resizeWidth,
  resizeHeight,
  originalWidth,
  originalHeight,
}: {
  resizeWidth?: number;
  resizeHeight?: number;
  originalWidth?: number;
  originalHeight?: number;
}) => {
  const normalizedWidth = resizeWidth || originalWidth;
  const normalizedHeight = resizeHeight || originalHeight;

  // TODO check if originalWidth, originalHeight can be undefined
  if (
    !originalWidth ||
    !originalHeight ||
    !normalizedWidth ||
    !normalizedHeight
  ) {
    throw new Error("Invalid width or height provided for blur");
  }

  const { scale: resizeScale } = scale({
    width: originalWidth,
    height: originalHeight,
    maxWidth: normalizedWidth,
    maxHeight: normalizedHeight,
  });

  let blurOptions = 0;

  blurOptions = (originalWidth / 200) * resizeScale;

  blurOptions = Math.max(0.3, blurOptions);
  blurOptions = Math.min(25, blurOptions);

  return blurOptions;
};
