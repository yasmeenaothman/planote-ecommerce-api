import db from "../config/db.js";

// Create category
export const createCategory = async (name, icon) => {
  const query = `INSERT INTO categories (name,icon) VALUES ($1,$2) RETURNING *`;
  const { rows } = await db.query(query, [name, icon]);
  return rows[0];
};

// get all categories ordered
export const getAllCategories = async (limit = 20, offset = 0) => {
  const query = `SELECT * ,COUNT(*) OVER()::int AS total FROM categories ORDER BY created_at DESC limit $1 offset $2`;
  const { rows } = await db.query(query, [limit, offset]);
  return rows;
};

// get Category by id
export const getCategoryById = async (id) => {
  const query = `SELECT * FROM categories WHERE id = $1`;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

export const updateCategory = async (id, name, icon) => {
  const query = `UPDATE categories SET name = $1, icon = $2 WHERE id = $3 RETURNING *`;
  const values = [name, icon, id];
  const { rows } = await db.query(query, values);
  return rows[0];
};

// DeleteCategory
export const deleteCategory = async (id) => {
  const query = `DELETE FROM categories WHERE id = $1 RETURNING *`;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};
export const validateCategoryIds = async (categoryIds) => {
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) return false;

  const query = `
    SELECT id 
    FROM categories 
    WHERE id = ANY($1::int[])
  `;
  const { rows } = await db.query(query, [categoryIds]);

  // If the number of found rows matches the number of IDs, all exist
  return rows.length === categoryIds.length;
};
