import Joi from "joi";

export const productSchema = Joi.object({
  title: Joi.string().max(255).required().messages({
    "string.base": "title must be a string",
    "string.empty": "title cannot be empty",
    "string.max": "title must not exceed 255 characters",
    "any.required": "title is required",
  }),
  description: Joi.string().allow(null, ""),
  price: Joi.number().strict().positive().required().messages({
    "number.base": "price must be a number",
    "any.required": "price is required",
  }),
  weight: Joi.number().positive().optional().messages({
    "number.base": "price must be a number",
  }),
  cover_image: Joi.string().uri().optional().messages({
    "string.uri": "Cover image must be a valid URL",
  }),
  amount: Joi.number().integer().min(0).default(0).messages({
    "number.base": "Amount must be a number",
    "number.min": "Amount cannot be negative",
  }),
  status: Joi.string()
    .valid("active", "inactive", "out_of_stock")
    .default("active")
    .messages({
      "any.only": "Status must be one of 'active', 'inactive', 'out_of_stock'",
    }),
  categories: Joi.array()
    .items(
      Joi.number().integer().messages({
        "number.base": "Category ID must be a number",
        "number.integer": "Category ID must be an integer",
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one category is required",
      "any.required": "Categories field is required",
    }),
  variants: Joi.array()
    .items(
      Joi.object({
        color: Joi.string().max(50).required(),
        amount: Joi.number().integer().min(0).default(0).messages({
          "number.base": "Variant amount must be a number",
          "number.min": "Variant amount cannot be negative",
        }),
        status: Joi.string()
          .valid("active", "inactive", "out_of_stock")
          .default("active")
          .messages({
            "any.only":
              "Variant status must be one of 'active', 'inactive', 'out_of_stock'",
          }),
        images: Joi.array()
          .items(
            Joi.string()
              .uri({ scheme: ["http", "https"] })
              .messages({
                "string.uri": "Variant image must be a valid URL",
              })
          )
          .default([]),
      })
    )
    .default([]),
});
