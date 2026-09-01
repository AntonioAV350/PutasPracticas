// controllers/practicas/alumnos/usuariosAlumnos.controller.js
const {
  insertUsuario,
  insertAlumno,
  createAlumnoConUsuario,
  updateAlumno,
} = require('../../../models/practicas/alumnos/usuariosAlumnos_model');

exports.crearUsuario = async (req, res, next) => {
  try {
    const r = await insertUsuario(req.body);
    return res.status(r.ok ? 201 : 400).json(r);
  } catch (err) {
    next(err);
  }
};

exports.crearAlumno = async (req, res, next) => {
  try {
    const r = await insertAlumno(req.body);
    return res.status(r.ok ? 201 : 400).json(r);
  } catch (err) {
    next(err);
  }
};

exports.crearAlumnoConUsuario = async (req, res, next) => {
  try {
    const r = await createAlumnoConUsuario(req.body);
    return res.status(r.ok ? 201 : 400).json(r);
  } catch (err) {
    next(err);
  }
};

exports.updateMiPerfil = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ ok: false, error: 'No autorizado. Debes iniciar sesión.' });
    }
    const userId = req.user.id;
    const updatedData = await updateAlumno(userId, req.body);
    res.json({ ok: true, data: updatedData });
  } catch (err) {
    console.error("Error en updateMiPerfil:", err);
    res.status(500).json({ ok: false, error: err.message || 'Error interno del servidor.' });
  }
};
