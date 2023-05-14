import { Router } from "express";
import * as authController from "./auth.controllers";

const router = Router();

router.route("/login").post(authController.login);
router.route("/logout").get(authController.logout);
router.route("/register").post(authController.register);
router.route("/get-user-info").get(authController.getUserInfo);

export default router;
