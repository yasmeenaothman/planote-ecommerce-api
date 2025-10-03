import db from "../config/db.js";

export const searchSuggestions = async (query, limit = 10, offset = 0) => {
  const searchQuery = `
    SELECT id, name, type, COUNT(*) OVER()::int AS total
    FROM (
      SELECT id, name, 'category' AS type
      FROM categories
      WHERE name ILIKE '%' || $1 || '%'
      UNION ALL
      SELECT id, title AS name, 'product' AS type
      FROM products
      WHERE title ILIKE '%' || $1 || '%' OR description ILIKE '%' || $1 || '%'
    ) combined
    ORDER BY type, name ASC
    LIMIT $2 OFFSET $3;
 `;
  const values = [query, limit, offset];
  const { rows } = await db.query(searchQuery, values);
  return rows;
};
// export const countsearchSuggestions = async (query) => {
//   const countQuery = `
//     SELECT COUNT(*)::int as total
//     FROM (
//       SELECT id FROM categories WHERE name ILIKE '%' || $1 || '%'
//       UNION ALL
//       SELECT id FROM products WHERE title ILIKE '%' || $1 || '%' OR description ILIKE '%' || $1 || '%'
//     ) AS combined
//   `;
//   const { rows } = await db.query(countQuery, [query]);
//   return rows[0]?.total ?? 0;
// };
