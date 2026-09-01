// controllers/authController.js
const jwt = require("jsonwebtoken");
const Auth = require("../models/authModel"); // funciones de acceso a PG
const AlumnoModel = require("../models/practicas/alumnos/usuariosAlumnos_model");

// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { rfc, email, password } = req.body || {};
    if (!password || (!rfc && !email)) {
      return res.status(400).json({ ok: false, msg: "Faltan credenciales (RFC/email y contraseña)." });
    }

    let user = null;

    if (email) {
      const eml = String(email).trim().toLowerCase();
      // seguridad extra: valida dominio institucional
      if (!eml.endsWith("@unach.mx")) {
        return res.status(403).json({ ok: false, msg: "El correo debe terminar en @unach.mx" });
      }
      user = await Auth.validateLoginByEmail(eml, password);
    } else if (rfc) {
      const r = String(rfc).trim().toUpperCase();
      user = await Auth.validateLogin(r, password); // RFC
    }

    if (!user) {
      return res.status(401).json({ ok: false, msg: "Usuario o contraseña inválidos." });
    }

    // roles/permisos por RFC (usuario siempre tiene RFC en BD)
    const perms = await Auth.findPermisosByUser({ id: user.id, rfc: user.rfc }); // { items, itemsRaw }
    
    // Si el usuario es un estudiante, se buscan sus datos de alumno
    if (perms.items.includes("ESTUDIANTE")) {
      const alumnoData = await AlumnoModel.findAlumnoByUsuarioId(user.id);
      if (alumnoData) {
        user = { ...user, ...alumnoData };
      }
    }

    const token = jwt.sign(
      { id: user.id, rfc: user.rfc, email: user.email, roles: perms.items },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "8h" }
    );

    return res.json({
      ok: true,
      token,
      usuario: user,
      roles: perms.items,
      permisosRaw: perms.itemsRaw,
    });
  } catch (e) {
    console.error("Error al procesar login:", e);
    return res.status(500).json({ ok: false, msg: "Error interno." });
  }
};

// GET /auth/usuario/:rfc
exports.getUser = async (req, res) => {
  try {
    const { rfc } = req.params;
    const user = await Auth.findUserByRFC(rfc);
    if (!user) return res.status(404).json({ ok: false, msg: "Usuario no encontrado." });
    const { password, ...safe } = user;
    return res.json({ ok: true, usuario: safe });
  } catch (e) {
    console.error("Error al obtener usuario:", e);
    return res.status(500).json({ ok: false, msg: "Error interno." });
  }
};

// GET /auth/permisos/:rfc
exports.getPermisos = async (req, res) => {
  try {
    const { rfc } = req.params;
    const perms = await Auth.findPermisosByRFC(rfc);
    return res.json({ ok: true, items: perms.items });
  } catch (e) {
    console.error("Error al obtener permisos:", e);
    return res.status(500).json({ ok: false, msg: "Error interno." });
  }
};

// POST /auth/send-email
exports.sendEmail = async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({ ok: false, msg: "Faltan campos (to, subject, text/html)." });
    }
    const info = await Auth.transporter.sendMail({
      from: "pruebaunachmx@gmail.com",
      to, subject, text, html,
    });
    return res.json({ ok: true, messageId: info.messageId });
  } catch (e) {
    console.error("Error al enviar correo:", e);
    return res.status(500).json({ ok: false, msg: "No se pudo enviar el correo." });
  }
};
