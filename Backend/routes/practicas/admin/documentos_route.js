'use strict';

const express = require('express');
const router = express.Router();
const documentosAdminController = require('../../../controllers/practicas/admin/documentos_controller');
const authenticateJWT = require('../../../middlewares/authenticateJWT');

// Prefijo de ruta: /api/practicas/admin/documentos

// PUT /:id_doc/review => Aprueba o rechaza un documento
router.put('/:id_doc/review', authenticateJWT, documentosAdminController.reviewDocumento);

module.exports = router;
