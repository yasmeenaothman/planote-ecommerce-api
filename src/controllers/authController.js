import bcrypt from "bcrypt"; // for hashing passwords
import dotenv from "dotenv";
import { sendEmail } from "../utils/mailer.js";
import {
  findUserByEmail,
  createUser,
  findUserSafeByEmail,
  setResetCode,
  verifyResetCode,
  updatePassword,
  updateUserAuthFields,
} from "../models/authModel.js";
import {
  genterateToken,
  generateTempToken,
  verifyToken,
} from "../utils/jwt.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { generateResetCode } from "../utils/codeGenerator.js";

import { verifyGoogleToken } from "../services/googleAuth.js";
dotenv.config();

// ========================== Signup ==========================
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    // Helper: create or upgrade user
    const handleUser = async (userId = null, provider = "local") => {
      const hashedPassword = await bcrypt.hash(password, 12);
      let user;
      if (userId) {
        // Update password + provider
        user = await updateUserAuthFields(userId, {
          password: hashedPassword,
          provider,
        });
      } else {
        // Create new user
        user = await createUser(name, email, hashedPassword);
      }
      const token = genterateToken(user);
      return successResponse(res, 201, "Signup successful", { user, token });
    };

    if (existingUser) {
      if (existingUser.provider === "google") {
        // Upgrade Google-only account to both
        return await handleUser(existingUser.id, "both");
      }
      // Otherwise reject
      return errorResponse(res, 400, "User already exists");
    }
    // Normal signup
    return await handleUser();
  } catch (e) {
    console.error(e);
    return errorResponse(res, 500, "Signup failed");
  }
};

// ========================== Login ==========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user in DB by email
    const user = await findUserByEmail(email);
    if (!user) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    // Generate JWT
    const token = genterateToken(user);

    // Send safe user info and token to client
    const safeUser = await findUserSafeByEmail(email);
    return successResponse(res, 200, "Login successful", {
      user: safeUser,
      token,
    });
  } catch (e) {
    console.error(e);
    return errorResponse(res, 500, "Login failed");
  }
};

// ========================== Confirm Mail ==========================
//Forgot Password →  confirmMail → send code
export const confirmMail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await findUserByEmail(email);
    if (!user) return errorResponse(res, 404, "User not found");

    const { code, expires } = generateResetCode();
    await setResetCode(email, code, expires);

    await sendEmail(
      email,
      "Your Verification Code for Planote App",
      `
      Hello,

      Your verification code is: ${code}

      This code will expire in 30 minutes. 
      If you did not request this, please ignore this email.

      Thank you,
      The Planote Team
        `
    );
    return successResponse(res, 200, "Verification code sent to email");
  } catch (err) {
    console.log(err);
    return errorResponse(res, 500, "Failed to send verification email");
  }
};

// ========================== Verify Code ==========================
export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const isValid = await verifyResetCode(email, code);
    if (!isValid) return errorResponse(res, 400, "Invalid or expired code");

    // Generate a temporary JWT to allow password reset
    const tempToken = generateTempToken(email);
    return successResponse(res, 200, "Code is verifed successfully", {
      tempToken,
    });
  } catch (e) {
    return errorResponse(res, 500, "Verification failed");
  }
};

// ========================== Reset Password ==========================
export const resetPassword = async (req, res) => {
  const { tempToken, password } = req.body;

  if (!tempToken) {
    return errorResponse(res, 400, "Missing temporary token");
  }

  try {
    // Verify tempToken
    let decoded;
    try {
      decoded = verifyToken(tempToken);
    } catch (err) {
      return errorResponse(res, 401, "Invalid or expired token");
    }

    const email = decoded.email;

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and clear reset code + expiration
    const success = await updatePassword(email, hashedPassword);
    if (!success) {
      return errorResponse(res, 400, "Password reset failed");
    }
    return successResponse(res, 200, "Password reset successfully");
  } catch (e) {
    console.error(e);
    return errorResponse(res, 500, "Password reset failed");
  }
};

// Google Login/Signup with auto-link
// ========================== Google Auth ==========================
export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body; // token from Flutter app

    if (!idToken) return errorResponse(res, 400, "There is no idToken");

    const googleUser = await verifyGoogleToken(idToken);
    if (!googleUser.email_verified) {
      return errorResponse(res, 400, "Google email not verified");
    }
    // Verify token audience (aud) matches your app's client ID
    // Ensures the token is really issued for your app, not just a valid Google token or any other app
    if (googleUser.aud !== process.env.GOOGLE_CLIENT_ID) {
      return errorResponse(res, 401, "Token not issued for this app");
    }

    // Check if user already exists
    let user = await findUserSafeByEmail(googleUser.email);
    if (!user) {
      // Signup new user with Google
      user = await createUser(
        googleUser.name,
        googleUser.email,
        null, // no password for Google users
        "user", // default role
        "google", // provider
        googleUser.picture
      );
    } else if (user.provider === "local") {
      // Auto-link: user signed up locally, now also uses Google
      user = await updateUserAuthFields(user.id, {
        provider: "both",
        avatar: googleUser.picture,
      });
    }
    // if provider already google or both → just login directly

    // Generate JWT
    const token = genterateToken(user);
    return successResponse(res, 200, "Google authentication successful", {
      user,
      token,
    });
  } catch (err) {
    console.error("Google login error:", err);
    return errorResponse(res, 401, "Google authentication failed");
  }
};
