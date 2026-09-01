// models/authModel.js
const pool = require("../config/db.config");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

/* ========= Normalizador (igual que en el front) ========= */
const sinAcentos = (s = "") => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
function canon(raw = "") {
  let s = String(raw || "").trim();
  s = sinAcentos(s).toUpperCase().replace(/[ \.-]+/g, "_");
  const map = {
    "SUPER_ADMINISTRADOR": "SUPERADMIN",
    "SUPER_ADMIN": "SUPERADMIN",
    "ADMINISTRADOR": "ADMINISTRADOR",
    "DOCENTE": "DOCENTE",
    "SECRETARIA": "SECRETARIA",
    "EMPRESARIO": "EMPRESARIO",
    "ENSENANZA": "ENSENANZA",
    "INVESTIGACION": "INVESTIGACION",
    "PRACTICAS": "PRACTICAS",
    "TUTORIAS": "TUTORIAS",
    "SECRETARIA_ACADEMICA": "SECRETARIA",
    "PRACTICAS_ADMIN": "ADMIN_PRACTICAS",
    "ADMIN_PRACTICAS": "ADMIN_PRACTICAS",
    "ADMINISTRADOR_PRACTICAS": "ADMIN_PRACTICAS",
    "INVESTIGACION_ADMIN": "ADMIN_INVESTIGACION",
    "ADMIN_INVESTIGACION": "ADMIN_INVESTIGACION",
    "ADMINISTRADOR_INVESTIGACION": "ADMIN_INVESTIGACION",
    "ENSENANZA_ADMIN": "ADMIN_ENSENANZA",
    "ADMIN_ENSENANZA": "ADMIN_ENSENANZA",
    "ADMINISTRADOR_ENSENANZA": "ADMIN_ENSENANZA",
    "SECRETARIA_ADMIN": "ADMIN_SECRETARIA",
    "ADMIN_SECRETARIA": "ADMIN_SECRETARIA",
    "ADMINISTRADOR_SECRETARIA": "ADMIN_SECRETARIA",
    "ESTUDIANTE": "ESTUDIANTE",
  };
  if (!map[s] && /^(ENSENANZA|INVESTIGACION|PRACTICAS|SECRETARIA|TUTORIAS)_ADMIN$/.test(s)) {
    const m = s.match(/^(.*)_ADMIN$/);
    if (m) return `ADMIN_${m[1]}`;
  }
  return map[s] || s;
}

/* ========= Login (pgcrypto/crypt) =========
   Requiere en PostgreSQL:
   CREATE EXTENSION IF NOT EXISTS pgcrypto;
*/

// Login por RFC
async function validateLogin(rfc, plainPassword) {
  const sql = `
    SELECT id, rfc, username, nombre, apellido_paterno, apellido_materno, email, password
    FROM public.usuarios
    WHERE rfc = $1
      AND status = 1
    LIMIT 1
  `;
  const { rows } = await pool.query(sql, [rfc]);
  const row = rows[0];
  if (!row) return null;
  const ok = await bcrypt.compare(plainPassword, row.password || "");
  if (!ok) return null;
  const { password, ...safe } = row;
  return safe;
}

// Login por Email
async function validateLoginByEmail(email, plainPassword) {
  const sql = `
    SELECT id, rfc, username, nombre, apellido_paterno, apellido_materno, email, password
    FROM public.usuarios
    WHERE lower(email) = lower($1)
      AND status = 1
    LIMIT 1
  `;
  const { rows } = await pool.query(sql, [email]);
  const row = rows[0];
  if (!row) return null;
  const ok = await bcrypt.compare(plainPassword, row.password || "");
  if (!ok) return null;
  const { password, ...safe } = row;
  return safe;
}

/* ========= Finders ========= */
async function findUserByRFC(rfc) {
  const sql = `
    SELECT *
    FROM public.usuarios
    WHERE rfc = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(sql, [rfc]);
  return rows[0] || null;
}

async function findByEmail(email) {
  const { rows } = await pool.query(
    `SELECT * FROM public.usuarios WHERE lower(email)=lower($1) LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

/* ========= Roles + Permisos ========= */
async function findPermisosByUser({ id, rfc } = {}) {
  let userId = id;
  if (!userId && rfc) {
    const { rows } = await pool.query(
      `SELECT id FROM public.usuarios WHERE rfc = $1 AND status = 1 LIMIT 1`,
      [rfc]
    );
    userId = rows?.[0]?.id;
  }
  if (!userId) return { items: [], itemsRaw: [] };

  const sql = `
    SELECT 'ROL' AS tipo, r.nombre_rol AS valor
    FROM public.usuario_roles ur
    JOIN public.roles r ON r.id_rol = ur.id_rol
    WHERE ur.id_usuario = $1
    UNION ALL
    SELECT 'PERMISO' AS tipo, p.nombre AS valor
    FROM public.permisos_usuario pu
    JOIN public.permisos p ON p.id_permiso = pu.id_permiso
    WHERE pu.id_usuario = $1
  `;
  const { rows } = await pool.query(sql, [userId]);
  const itemsRaw = rows.map((r) => r.valor);
  const items = Array.from(new Set(itemsRaw.map(canon)));
  console.log("🔎 findPermisos itemsRaw:", itemsRaw);
  console.log("🔎 findPermisos itemsCanon:", items);
  return { items, itemsRaw };
}

async function findPermisosByRFC(rfc) {
  if (!rfc) return { items: [], itemsRaw: [] };
  return findPermisosByUser({ rfc });
}

/* ========= Mailer ========= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pruebaunachmx@gmail.com",
    pass: "t n m r d e p t a o y e u c b v", // app password
  },
});

/* ========= Exports ========= */
module.exports = {
  // login
  validateLogin,
  validateLoginByEmail,

  // finders
  findUserByRFC,
  findByEmail,

  // permisos
  findPermisosByUser,
  findPermisosByRFC,

  // mailer
  transporter,
};
