import { Key } from "./common/utils/types";

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
    }
  }
}
