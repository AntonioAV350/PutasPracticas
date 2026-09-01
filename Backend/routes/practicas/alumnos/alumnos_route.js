// routes/practicas/alumnos/alumnos_route.js
const express = require('express');
const ctrl = require('../../../controllers/practicas/alumnos/usuariosAlumnos_Controller');
const authenticateJWT = require('../../../middlewares/authenticateJWT');

const router = express.Router();

// POST /api/usuarios
router.post('/usuarios', ctrl.crearUsuario);

// POST /api/alumnos
router.post('/alumnos', ctrl.crearAlumno);

// POST /api/alumnos-con-usuario
router.post('/alumnos-con-usuario', ctrl.crearAlumnoConUsuario);

// PUT /api/practicas/alumnos/me - Actualizar perfil del alumno logueado
router.put('/practicas/alumnos/me', authenticateJWT, ctrl.updateMiPerfil);

module.exports = router;
