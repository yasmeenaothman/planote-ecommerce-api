import Joi from "joi";

const stringField = (maxLength, required = true, fieldName = "Field") =>
  Joi.string()
    .trim()
    .strict()
    .max(maxLength)
    [required ? "required" : "optional"]()
    .messages({
      "string.base": `${fieldName} must be a string`,
      "string.empty": `${fieldName} cannot be empty`,
      "string.max": `${fieldName} must not exceed ${maxLength} characters`,
      "any.required": `${fieldName} is required`,
    });

// Category schema
export const categorySchema = Joi.object({
  name: stringField(100, true, "Category name"),
  icon: stringField(255, true, "Category icon").uri().messages({
    "string.uri": "Icon must be a valid URL",
  }),
});
