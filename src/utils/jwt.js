import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// Generate a JWT for a user (login/signup)
export const genterateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role }, // payload
    JWT_SECRET, // secret key
    { expiresIn: "7d" } // token expires in 7 days
  );
};
// Generate a temporary JWT for password reset
export const generateTempToken = (email) => {
  return jwt.sign(
    { email }, // only email needed
    JWT_SECRET,
    { expiresIn: "15m" } // short-lived token
  );
};

// Verify any JWT (normal or temp)
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
