'use strict';

const express = require('express');
const router = express.Router();
const documentosController = require('../../../controllers/practicas/alumnos/documentos_controller');
const authenticateJWT = require('../../../middlewares/authenticateJWT');

// Prefijo de ruta: /api/practicas/alumnos/documentos

// GET / => Obtiene los documentos para el alumno logueado
router.get('/', authenticateJWT, documentosController.getMisDocumentos);

module.exports = router;
