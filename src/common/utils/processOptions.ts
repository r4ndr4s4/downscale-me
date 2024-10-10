export const getResizeOptions = (w?: string, h?: string) => {
  // TODO normalize width and height

  const resizeOptions: { width?: number; height?: number } = {};

  resizeOptions.width = w ? parseInt(w) : undefined;
  resizeOptions.height = h ? parseInt(h) : undefined;

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
