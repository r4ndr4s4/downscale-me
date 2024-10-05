import express, { type Router } from "express";

import { GetUserSchema } from "@/api/user/userModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { userController } from "./userController";

export const userRouter: Router = express.Router();

userRouter.get("/", userController.getUsers);

userRouter.get("/:id", validateRequest(GetUserSchema), userController.getUser);
