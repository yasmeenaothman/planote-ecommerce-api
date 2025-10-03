import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../models/categoryModel.js";
import { paginate } from "../utils/pagination.js";
import { successResponse, errorResponse } from "../utils/response.js";
export const createCategoryController = async (req, res) => {
  const { name, icon } = req.body;
  try {
    const category = await createCategory(name, icon);
    return successResponse(res, 201, "Category created successfully", {
      category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return errorResponse(res, 500, "Failed to create category", [
      error.message,
    ]);
  }
};

export const getAllCategoriesController = async (req, res) => {
  try {
    const { data: categories, pagination } = await paginate(
      req.query,
      getAllCategories
    );
    return successResponse(res, 200, "Categories fetched successfully", {
      categories,
      pagination,
    });
  } catch (error) {
    console.error("Error getting categories:", error);
    return errorResponse(res, 500, "Failed to fetch categories", [
      error.message,
    ]);
  }
};

export const updateCategoryController = async (req, res) => {
  const { id } = req.params;
  const { name, icon } = req.body;
  try {
    const category = await updateCategory(id, name, icon);
    if (!category) return errorResponse(res, 404, "Category not found");
    return successResponse(res, 200, "Category updated successfully", {
      category,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return errorResponse(res, 500, "Failed to update category", [
      error.message,
    ]);
  }
};

export const deleteCategoryController = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await deleteCategory(id);
    if (!category) return errorResponse(res, 404, "Category not found");
    return successResponse(res, 200, "Category deleted successfully", {
      category,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return errorResponse(res, 500, "Failed to delete category", [
      error.message,
    ]);
  }
};
