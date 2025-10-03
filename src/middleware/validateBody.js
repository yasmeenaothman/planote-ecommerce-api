import { errorResponse } from "../utils/response.js";

export const validateBody =
  (schema, property = "body") =>
  async (req, res, next) => {
    try {
      req[property] = await schema.validateAsync(req[property], {
        abortEarly: false, // collect all errors
        stripUnknown: true, // remove fields not in schema
      });
      next(); // continue to controller
    } catch (err) {
      const errors = err.details.map((d) => d.message);
      return errorResponse(res, 400, "Validation failed", errors);
    }
  };
