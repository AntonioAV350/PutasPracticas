const express = require("express");
const router = express.Router();
const HistorialController = require("../controllers/historialController");

// Ruta para obtener el historial de cambios
router.get("/showall", HistorialController.getHistorial);

// Ruta para agregar un registro al historial de cambios
router.post("/insertar", HistorialController.setHistorial);

module.exports = router;
