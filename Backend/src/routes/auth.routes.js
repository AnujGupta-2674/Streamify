import express from 'express';
import * as authController from "../controller/auth.controller.js"
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/signup", authController.signup);

router.post('/login', authController.login);

router.post('/logout', authController.logout);

router.post("/onboarding", authMiddleware, authController.onboarding);

router.get("/me", authMiddleware, authController.getUser);

export default router;