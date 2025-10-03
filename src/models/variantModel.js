import db from "../config/db.js";

// Create variant

export const createVariant = async (product_id, color, amount = 0, status = "active") => {
    const query = `INSERT INTO product_variants (product_id, color, amount, status) VALUES ($1,$2,$3,$4) RETURNING *`;
    const values = [product_id, color, amount, status];
    const { rows } = await db.query(query, values);
    return rows[0];
}


// Get variants
export const getVariants = async (product_id) => {
    const query = `SELECT * FROM product_variants WHERE product_id = $1`;
    const { rows } = await db.query(query, [product_id]);
    return rows;
}







// CREATE TABLE product_variants (
//     id SERIAL PRIMARY KEY,
//     product_id INT REFERENCES products(id) ON DELETE CASCADE,
//     color VARCHAR(50) NOT NULL,
//     amount INT NOT NULL,
//     status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'out_of_stock'))
//            DEFAULT 'active'
// );
