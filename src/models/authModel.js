import db from "../config/db.js";
// dont forget the user have an image

/* ------------------ CREATE USER ------------------ */
// For signup / internal use
export const createUser = async (
  name,
  email,
  password,
  role = "user",
  provider = "local",
  avatar
) => {
  const columns = ["name", "email", "password", "role", "provider"];
  const values = [name, email, password, role, provider];

  if (avatar) {
    columns.push("image");
    values.push(avatar);
  }
  // Build placeholders dynamically ($1, $2, $3, ...)
  const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
  const query = `
    INSERT INTO users (${columns.join(", ")})
    VALUES (${placeholders})
    RETURNING id, name, email, role, provider,avatar,created_at
  `;
  const { rows } = await db.query(query, values);
  return rows[0]; // safe to return to frontend
};

/* ------------------ FIND USER ------------------ */
// Internal use: login / auth (includes password hash)
export const findUserByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = $1`;
  const { rows } = await db.query(query, [email]);
  return rows[0]; // contains password hash, use only internally
};

// Safe version: return only safe fields for frontend
export const findUserSafeByEmail = async (email) => {
  const query = `
    SELECT id, name, email, role, created_at, provider, avatar
    FROM users
    WHERE email = $1
  `;
  const { rows } = await db.query(query, [email]);
  return rows[0]; // safe to send to client
};

// /* ------------------ FIND USER BY ID ------------------ */
// // Safe for frontend
// export const findUserById = async (id) => {
//   const query = `
//     SELECT id, name, email, role, created_at
//     FROM users
//     WHERE id = $1
//   `;
//   const { rows } = await db.query(query, [id]);
//   return rows[0];
// };

// /* ------------------ UPDATE USER ROLE ------------------ */
// export const updateUserRole = async (id, role) => {
//   const query = `
//     UPDATE users
//     SET role = $2
//     WHERE id = $1
//     RETURNING id, name, email, role
//   `;
//   const { rows } = await db.query(query, [id, role]);
//   return rows[0];
// };

// /* ------------------ DELETE USER ------------------ */
// export const deleteUser = async (id) => {
//   const query = `DELETE FROM users WHERE id = $1 RETURNING id`;
//   const { rows } = await db.query(query, [id]);
//   return rows[0];
// };

/* ------------------ Save reset code + expiration ------------------ */
export const setResetCode = async (email, code, expires) => {
  const query = `
    UPDATE users
    SET reset_code = $1, reset_expires = $2
    WHERE email = $3
    RETURNING id, email
  `;
  const values = [code, expires, email];
  const { rows } = await db.query(query, values);
  return rows[0]; // null if user not found
};

/* ------------------  Verify reset code ------------------ */

export const verifyResetCode = async (email, code) => {
  const query = `
    SELECT * FROM users
    WHERE email = $1 AND reset_code = $2 AND reset_expires > NOW()
  `;
  const { rows } = await db.query(query, [email, code]);
  return rows[0]; // return null if there is no matching or expired
};
/* ------------------  Update password and clear reset fields ------------------ */

export const updatePassword = async (email, hashedPassword) => {
  const query = `
    UPDATE users
    SET password = $1, reset_code = NULL, reset_expires = NULL
    WHERE email = $2
    RETURNING id, email
  `;
  const { rows } = await db.query(query, [hashedPassword, email]);
  return rows[0];
};

export const updateProvider = async (userId, avatar, provider = "both") => {
  const updates = [`provider = $2`];
  const values = [userId, provider];

  if (avatar) {
    updates.push(`avatar = $3`);
    values.push(avatar);
  }

  const query = `
    UPDATE users
    SET ${updates.join(", ")}
    WHERE id = $1
    RETURNING id, name, email, role, provider, avatar, created_at
  `;
  const { rows } = await db.query(query, values);
  return rows[0];
};

export const updateUserAuthFields = async (
  userId,
  { password = null, provider = null, avatar = null }
) => {
  const updates = [];
  const values = [userId];
  let paramIndex = 2;

  if (password) {
    updates.push(`password = $${paramIndex++}`);
    values.push(password);
  }

  if (provider) {
    updates.push(`provider = $${paramIndex++}`);
    values.push(provider);
  }

  if (avatar) {
    updates.push(`avatar = $${paramIndex++}`);
    values.push(avatar);
  }

  if (updates.length === 0) return null; // nothing to update

  const query = `
    UPDATE users
    SET ${updates.join(", ")}
    WHERE id = $1
    RETURNING id, name, email, role, provider, avatar, created_at
  `;

  const { rows } = await db.query(query, values);
  return rows[0];
};
