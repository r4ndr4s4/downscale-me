const getResizeOptions = (w?: string, h?: string) => {
  const resizeOptions: { width?: number; height?: number } = {};

  resizeOptions.width = w ? parseInt(w) : undefined;
  resizeOptions.height = h ? parseInt(h) : undefined;

  return resizeOptions;
};

export default getResizeOptions;
