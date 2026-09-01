const express = require('express');
const router = express.Router();
const articuloController = require('../controllers/articuloController');
const actividadesController = require('../controllers/actividadesController');

router.get('/', (req, res) => {
    res.send('Ruta Inicio');
});

router.get('/api/articulos', articuloController.obtenerArticulos);

router.post('/api/articulos', articuloController.insertarArticulo);

router.put('/api/articulos/:id', articuloController.editarArticulo);

router.delete('/api/articulos/:id', articuloController.eliminarArticulo);

router.get('/api/tutorias', actividadesController.obtenerActividades);

router.post('/api/tutorias', actividadesController.cargarEvidencia);


router.get('/api/buscartutorias/:id', actividadesController.buscarActividad);
router.put('/api/tutorias/:id', actividadesController.editarActividad);
router.delete('/api/tutorias/:id', actividadesController.eliminarActividad);

module.exports = router;
