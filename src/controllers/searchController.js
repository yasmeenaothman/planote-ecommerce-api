import { searchSuggestions } from "../models/searchModel.js";
import { paginate } from "../utils/pagination.js";
import { successResponse, errorResponse } from "../utils/response.js";
export const getSearchSuggestions = async (req, res) => {
  const { query } = req.query;
  if (!query || query.trim() === "") {
    return errorResponse(res, 400, "Search query is required");
  }
  try {
    const results = await paginate(req.query, (limit, offset) =>
      searchSuggestions(query, limit, offset)
    );

    if (results.data.length === 0) {
      return errorResponse(res, 404, "No matches found");
    }
    return successResponse(
      res,
      200,
      "Search suggestions fetched successfully",
      {sugustions: results.data, pagination: results.pagination}
    );
  } catch (error) {
    console.error("Error getting search suggestions:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};
