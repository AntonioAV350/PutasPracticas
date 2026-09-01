const express = require('express');
const ctrl = require('../../controllers/practicas/calificaciones_controller');

const router = express.Router();

router.get('/calificaciones/:matricula', ctrl.listarPorMatricula);
router.get('/calificaciones/:matricula/:practica', ctrl.obtenerCalificacion);
router.post('/calificaciones', ctrl.guardar);
router.put('/calificaciones', ctrl.guardar);

module.exports = router;
