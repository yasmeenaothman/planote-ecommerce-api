import db from "../config/db.js";
import { getVariants } from "./variantModel.js";
import { getImages } from "./imageModel.js";
import { getOrderBy } from "../utils/sort.js";
// Create Product
export const createProduct = async (
  title,
  description,
  price,
  weight,
  cover_image,
  amount = 0,
  status = "active"
) => {
  const query = `INSERT INTO products (title, description, price, weight,cover_image, amount, status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
  const values = [
    title,
    description,
    price,
    weight,
    cover_image,
    amount,
    status,
  ];
  const { rows } = await db.query(query, values);
  return rows[0];
};

// Update Product Category (via product_categories table)
export const addProductToCategory = async (product_id, category_id) => {
  const query = `INSERT INTO product_categories (product_id, category_id)
   VALUES ($1,$2)
   ON CONFLICT (product_id, category_id) DO NOTHING
   RETURNING *`;
  const values = [product_id, category_id];
  const { rows } = await db.query(query, values);
  return rows[0];
};

// Get all products
export const getAllProducts = async (limit = 20, offset = 0, sort) => {
  const orderBy = getOrderBy(sort);
  // placeholders just used with values to avoid sql injection but dont used with column names or keywords
  const productQuery = `SELECT * ,COUNT(*) OVER()::int AS total FROM products ORDER BY ${orderBy} LIMIT $1 OFFSET $2`;
  const { rows } = await db.query(productQuery, [limit, offset]);
  return rows;
};
//Get product by ID (with variants and images)
export const getProductById = async (product_id) => {
  const query = `SELECT * FROM products WHERE id = $1`;
  const { rows: productRows } = await db.query(query, [product_id]);
  if (!productRows[0]) return null;
  const product = productRows[0];

  // Get variants
  const variants = await getVariants(product_id);

  // Get images for each variant in parallel
  product.variants = await Promise.all(
    variants.map(async (variant) => {
      variant.images = await getImages(variant.id);
      return variant;
    })
  );

  // Get categories of the product
  const categoryQuery = `
    SELECT category_id 
    FROM product_categories 
    WHERE product_id = $1
  `;
  const { rows: categories } = await db.query(categoryQuery, [product_id]);
  product.categories = categories.map((c) => c.category_id);

  return product;
};

// Get all products by category
export const getProductsByCategory = async (
  category_id,
  limit = 20,
  offset = 0,
  sort
) => {
  const orderBy = getOrderBy(sort);
  const query = `
    SELECT p.*,COUNT(*) OVER()::int AS total
    FROM products p
    JOIN product_categories pc ON p.id = pc.product_id
    WHERE pc.category_id = $1
    ORDER BY ${orderBy} LIMIT $2 OFFSET $3
  `;
  const values = [category_id, limit, offset];
  const { rows } = await db.query(query, values);
  return rows;
};

/////////////////////// Deleting part with admin actions /////////////////////////

// Delete a product
export const deleteProduct = async (product_id) => {
  const query = `DELETE FROM products WHERE id = $1 RETURNING *`;
  const { rows } = await db.query(query, [product_id]);
  return rows[0];
};
// Delete  product from a category
export const removeProductFromCategory = async (product_id, category_id) => {
  const query = `
    DELETE FROM product_categories 
    WHERE product_id = $1 AND category_id = $2
    RETURNING *
  `;
  const { rows } = await db.query(query, [product_id, category_id]);
  return rows[0];
};

// CREATE TABLE products (
//     id SERIAL PRIMARY KEY,
//     title VARCHAR(255) NOT NULL,
//     description TEXT,
//     price DECIMAL(10,2) NOT NULL,
//     weight DECIMAL(10,2),
//     amount INT DEFAULT 0,
//     status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'out_of_stock'))
//            DEFAULT 'active',
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     cover_image TEXT
// );

// CREATE TABLE product_categories (
//     product_id INT REFERENCES products(id) ON DELETE CASCADE,
//     category_id INT REFERENCES categories(id) ON DELETE CASCADE,
//     PRIMARY KEY (product_id, category_id)
// );
