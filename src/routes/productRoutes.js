import express from "express";
import {
  getAllProductsController,
  getProductByIdController,
  getProductsByCategoryController,
  createProductController,
  updateProductCategoryController,
  deleteProductController,
} from "../controllers/productController.js";
import { validateBody } from "../middleware/validateBody.js";
import { productSchema } from "../schemasValidation/productSchema.js";
const productRouter = express.Router();

productRouter.get("/", getAllProductsController);
productRouter.get("/category/:category_id", getProductsByCategoryController);
productRouter.get("/:product_id", getProductByIdController);
productRouter.post("/", validateBody(productSchema), createProductController);
productRouter.patch("/:product_id/category", updateProductCategoryController);
productRouter.delete("/:product_id", deleteProductController);

export default productRouter;
