const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  max: 10,
});

pool.on("connect", () => console.log(" Conexión establecida con PostgreSQL"));
pool.on("error", (error) => console.error(" Error en la conexión a PostgreSQL:", error));

module.exports = pool;

(async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log(" PostgreSQL responde:", result.rows[0].now);
  } catch (err) {
    console.error(" Error al probar conexión:", err);
  }
})();