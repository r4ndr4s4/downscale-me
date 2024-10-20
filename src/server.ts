import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";
import timeout from "connect-timeout";

import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import { userRouter } from "@/api/user/userRouter";
import { imageRouter } from "@/api/image/imageRouter";
import errorHandler from "@/common/middleware/errorHandler";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";
import authByApiKey from "./common/middleware/authByApiKey";
import checkLimits from "./common/middleware/checkLimits";
import { timeoutHalt } from "./common/utils/utils";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());

// Request logging
app.use(requestLogger);

app.use(authByApiKey);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/users", userRouter);
app.use("/image", checkLimits, timeout("5s"), timeoutHalt, imageRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
