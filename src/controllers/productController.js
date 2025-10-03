import { validateCategoryIds } from "../models/categoryModel.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  addProductToCategory,
} from "../models/productModel.js";
import { createVariant } from "../models/variantModel.js";
import { addImageToVariant } from "../models/imageModel.js";
import db from "../config/db.js";
import { paginate } from "../utils/pagination.js";
import { successResponse, errorResponse } from "../utils/response.js";
export const createProductController = async (req, res) => {
  const {
    title,
    description,
    price,
    weight,
    cover_image,
    amount,
    status,
    categories = [],
    variants = [],
  } = req.body;
  const client = await db.connect();
  try {
    // Validate category IDs before doing anything
    const areCategoriesValid = await validateCategoryIds(categories);
    // revised this part because the power ran out
    if (!areCategoriesValid) {
      return errorResponse(res, 400, "One or more category IDs are invalid");
    }
    //Use transaction to avoid partial inserts.
    await client.query("BEGIN");
    const product = await createProduct(
      title,
      description,
      price,
      weight,
      cover_image,
      amount,
      status
    );

    // Add categories
    await Promise.all(
      categories.map((category_id) =>
        addProductToCategory(product.id, category_id)
      )
    );

    // Create variants + images
    const createdVariants = await Promise.all(
      variants.map(async (variant) => {
        const { color, amount, status, images = [] } = variant;
        const newVariant = await createVariant(
          product.id,
          color,
          amount,
          status
        );

        // Attach images to variant
        newVariant.images = images;

        return { ...newVariant, images };
      })
    );

    // Now insert all images in parallel
    await Promise.all(
      createdVariants.flatMap(({ id, images }) =>
        images.map((image) => addImageToVariant(id, image))
      )
    );
    await client.query("COMMIT");

    return successResponse(res, 201, "Product created successfully", {
      product,
      categories,
      variants: createdVariants,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating product:", error);
    client.release();
    return errorResponse(res, 500, "Failed to create product", [error.message]);
  }
};

export const getAllProductsController = async (req, res) => {
  try {
    const { data: products, pagination } = await paginate(
      req.query,
      (limit, offset) => getAllProducts(limit, offset, req.query.sort)
    );
    return successResponse(res, 200, "Products fetched successfully", {
      products,
      pagination,
    });
  } catch (error) {
    console.error("Error getting products:", error);
    return errorResponse(res, 500, "Failed to fetch products", [error.message]);
  }
};

export const getProductByIdController = async (req, res) => {
  const { product_id } = req.params;
  try {
    const product = await getProductById(product_id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    return successResponse(res, 200, "Product fetched successfully", {
      product,
    });
  } catch (error) {
    console.error("Error getting product by ID:", error);
    return errorResponse(res, 500, "Failed to fetch product", [error.message]);
  }
};

export const getProductsByCategoryController = async (req, res) => {
  // assingn category_id from req.params to id variable
  const { category_id } = req.params;
  try {
    // Pagination
    const { data: products, pagination } = await paginate(
      req.query,
      (limit, offset) =>
        getProductsByCategory(category_id, limit, offset, req.query.sort)
    );
    // If no products found
    if (pagination.total === 0) {
      return errorResponse(res, 404, "Category not found or empty");
    }

    return successResponse(res, 200, "Products fetched successfully", {
      products,
      pagination,
    });
  } catch (error) {
    console.error("Error getting products by category:", error);
    return errorResponse(res, 500, "Failed to fetch products by category", [
      error.message,
    ]);
  }
};

// review it when building admin panel
export const updateProductCategoryController = async (req, res) => {
  const { product_id } = req.params;
  const { category_id } = req.body;

  //Todo validate category_id exist ? and product_id is already outside that category before updating
  // also think what the best date to return here in the response as a real project
  try {
    const product = await addProductToCategory(product_id, category_id);

    if (!product) {
      return errorResponse(res, 404, "Product or category not found");
    }

    // Success response
    return successResponse(res, 200, "Product category updated successfully");
  } catch (error) {
    console.error("Error updating product category:", error);
    return errorResponse(res, 500, "Failed to update product category", [
      error.message,
    ]);
  }
};

export const deleteProductController = async (req, res) => {
  const { product_id } = req.params;
  try {
    const product = await deleteProduct(product_id);
    if (!product) return errorResponse(res, 404, "Product not found");

    return successResponse(res, 200, "Product deleted successfully", {
      product,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return errorResponse(res, 500, "Failed to delete product", [error.message]);
  }
};
