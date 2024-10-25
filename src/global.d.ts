import { Key, ToFormat } from "./common/utils/types";

export {};

declare global {
  namespace Express {
    interface Request {
      key: string;

      user: {
        id: string;
        name: string;
        email: string;
      };

      parsedParams: {
        resizeWidth?: number;
        resizeHeight?: number;
        rotateAngle?: number;
        isFlip: boolean;
        isFlop: boolean;
        isGreyscale: boolean;
        isBlur: boolean;
        toQuality?: number;
        toFormat?: ToFormat;
      };
    }
  }
}
