const express = require('express');
const ctrl = require('../../controllers/practicas/fechas_controller');

const router = express.Router();

router.get('/fechas', ctrl.obtenerFechas);
router.post('/fechas', ctrl.crear);
router.put('/fechas/:id', ctrl.actualizar);
router.delete('/fechas/:id', ctrl.eliminar);

module.exports = router;
