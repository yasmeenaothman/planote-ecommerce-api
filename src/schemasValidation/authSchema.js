import Joi from "joi";
// Reusable validators
const emailField = Joi.string()
  .trim()
  .strict()
  .lowercase()
  .email()
  .required()
  .messages({
    "string.email": "Must be a valid email",
    "any.required": "Email is required",
  });

const nameField = Joi.string().trim().min(2).max(100).required().messages({
  "string.min": "Name must be at least 2 characters",
  "string.max": "Name must not exceed 100 characters",
  "any.required": "Name is required",
});

// at least one lowercase
// at least one uppercase
// at least one digit
// at least one special character
const passwordField = Joi.string()
  .trim()
  .strict()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
  .messages({
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password cannot exceed 128 characters",
    "string.pattern.base":
      "Password must include at least one uppercase, one lowercase, one digit, and one special character",
  });

export const signupSchema = Joi.object({
  name: nameField,
  email: emailField,
  password: passwordField.required(),
  avatar: Joi.string().uri().optional(),
});
export const loginSchema = Joi.object({
  email: emailField,
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

export const confirmMailSchema = Joi.object({
  email: emailField,
});

export const verifyCodeSchema = Joi.object({
  email: emailField,
  code: Joi.string()
    .trim()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.pattern.base": "Code must be a 6-digit number",
      "any.required": "Verification code is required",
    }),
});
export const resetPasswordSchema = Joi.object({
  tempToken: Joi.string().trim().required().messages({
    "any.required": "Temporary token is required",
    "string.empty": "Temporary token cannot be empty",
  }),
  password: passwordField.required(),
  confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Confirm password is required",
  }),
});

export const googleAuthSchema = Joi.object({
  idToken: Joi.string().required().messages({
    "any.required": "Google ID token is required",
  }),
});
