import express from "express";
import {
  getAllCategoriesController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from "../controllers/categoryController.js";
import { validateBody } from "../middleware/validateBody.js";
import { categorySchema } from "../schemasValidation/categorySchema.js";

const categoryRouter = express.Router();

categoryRouter.get("/", getAllCategoriesController);
categoryRouter.post(
  "/",
  validateBody(categorySchema),
  createCategoryController
);
categoryRouter.put(
  "/:id",
  validateBody(categorySchema),
  updateCategoryController
);
categoryRouter.delete("/:id", deleteCategoryController);

export default categoryRouter;
