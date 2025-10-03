import db from "../config/db.js";

// create image
export const addImageToVariant = async (
  variant_id,
  image_url,
  is_primary = false
) => {
  const query = `INSERT INTO product_images (variant_id, image_url, is_primary) VALUES ($1, $2, $3) RETURNING *`;
  const { rows } = await db.query(query, [variant_id, image_url, is_primary]);
  return rows[0];
};

// Get images
export const getImages = async (variant_id) => {
  const query = `SELECT image_url, is_primary FROM product_images WHERE variant_id = $1`;
  const { rows } = await db.query(query, [variant_id]);
  return rows;
};

// CREATE TABLE product_images (
//     id SERIAL PRIMARY KEY,
//     variant_id INT REFERENCES product_variants(id) ON DELETE CASCADE,
//     image_url TEXT NOT NULL,
//     is_primary BOOLEAN DEFAULT FALSE,
// );
