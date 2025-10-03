import express, { Router } from "express";
import {
  signup,
  login,
  confirmMail,
  verifyCode,
  resetPassword,
  googleAuth,
} from "../controllers/authController.js";
import { validateBody } from "../middleware/validateBody.js";
import {
  signupSchema,
  loginSchema,
  confirmMailSchema,
  verifyCodeSchema,
  resetPasswordSchema,
  googleAuthSchema,
} from "../schemasValidation/authSchema.js";
// router => mini Express app that handles only specific routes.
const authRouter = express.Router();

// Signup & Login route
authRouter.post("/signup", validateBody(signupSchema), signup);
authRouter.post("/login", validateBody(loginSchema), login);

// TODo : combine confirm_mail and verify_code routes in one route for forgot password
// Forgot Password Flow
authRouter.post(
  "/password/confirm_mail",
  validateBody(confirmMailSchema),
  confirmMail
);
// User enters email + code → verify → return tempToken
authRouter.post(
  "/password/verify_code",
  validateBody(verifyCodeSchema),
  verifyCode
);
// User enters new password + tempToken → reset password
authRouter.post(
  "/password/reset",
  validateBody(resetPasswordSchema),
  resetPassword
);

// Google Login/Signup
authRouter.post("/google", validateBody(googleAuthSchema), googleAuth);

export default authRouter;
