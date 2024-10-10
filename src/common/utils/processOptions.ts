export const getResizeOptions = (w?: string, h?: string) => {
  const normalizedWidth = w ? parseInt(w) : undefined;
  const normalizedHeight = h ? parseInt(h) : undefined;

  const resizeOptions: { width?: number; height?: number } = {};

  resizeOptions.width = normalizedWidth;
  resizeOptions.height = normalizedHeight;

  return resizeOptions;
};

export const getRotateOptions = (r: string) => {
  const normalizedAngle = parseInt(r);

  let rotateOptions = 0;

  if (normalizedAngle % 90 !== 0) {
    throw new Error("Invalid rotation angle");
  }

  rotateOptions = normalizedAngle;

  return rotateOptions;
};
