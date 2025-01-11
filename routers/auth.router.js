import { Router } from "express"
import { registerUser, sendSMS, verifyCode } from "../controllers/auth.controller.js";

const router =Router();

router.post('/sent-otp',sendSMS)
router.post('/verify-otp',verifyCode)
router.post('/register',registerUser)

export default router