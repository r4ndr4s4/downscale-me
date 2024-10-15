import { scale } from "proportional-scale";

export const getResizeOptions = ({
  resizeWidth,
  resizeHeight,
  maxWidth,
  maxHeight,
}: {
  resizeWidth?: string;
  resizeHeight?: string;
  maxWidth?: number;
  maxHeight?: number;
}) => {
  const normalizedWidth = resizeWidth ? parseInt(resizeWidth) : undefined;
  const normalizedHeight = resizeHeight ? parseInt(resizeHeight) : undefined;

  const resizeOptions: { width?: number; height?: number } = {};

  // TODO check if maxWidth can be undefined
  // TODO handle negative values
  if (normalizedWidth && maxWidth && normalizedWidth >= maxWidth) {
    throw new Error("Invalid width provided for resize");
  }

  // TODO check if maxHeight can be undefined
  // TODO handle negative values
  if (normalizedHeight && maxHeight && normalizedHeight >= maxHeight) {
    throw new Error("Invalid height provided for resize");
  }

  resizeOptions.width = normalizedWidth;
  resizeOptions.height = normalizedHeight;

  return resizeOptions;
};

export const getRotateOptions = (rotateAngle: string) => {
  const normalizedAngle = parseInt(rotateAngle);

  let rotateOptions = 0;

  if (normalizedAngle % 90 !== 0) {
    throw new Error("Invalid angle provided for rotate");
  }

  rotateOptions = normalizedAngle;

  return rotateOptions;
};

export const getBlurOptions = ({
  resizeWidth,
  resizeHeight,
  originalWidth,
  originalHeight,
}: {
  resizeWidth?: string;
  resizeHeight?: string;
  originalWidth?: number;
  originalHeight?: number;
}) => {
  const normalizedWidth = resizeWidth ? parseInt(resizeWidth) : originalWidth;
  const normalizedHeight = resizeHeight
    ? parseInt(resizeHeight)
    : originalHeight;

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
