import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});
// optional: check if connected
db.on("connect", () => {
  console.log("✅ Connected to PostgreSQL");
});

export default db;
