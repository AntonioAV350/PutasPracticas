const express = require("express");
const router = express.Router();
const secretariaController = require("../controllers/secretariaController");

router.get("/", (req, res) => {
  res.send("Ruta Inicio");
});

router.get('/getUsuarios', secretariaController.getUsuario);
router.get("/showAll", secretariaController.showAll);
router.post("/insertarDocente", secretariaController.insertarDocente);
router.put("/editarDocente/:id", secretariaController.editarDocente);
router.delete("/eliminarDocente/:id", secretariaController.eliminarDocente);

router.get("/getTipo/", secretariaController.getTipo);
router.get("/documentos/:id", secretariaController.obtenerDocumentos);
router.post("/insertarDocumentos", secretariaController.insertarDocumentos);
router.put("/actualizarDocumentos/:id",secretariaController.actualizarDocumentos);
router.delete("/eliminarDocumentos/:id", secretariaController.eliminarDocumentos);


//ruta para obtener roles
router.get("/obtener_Roles", secretariaController.obtener_Roles);
//rutas para gestionar docentes
router.get('/obtener_Docentes', secretariaController.obtener_Docentes);
router.post("/insertar_Docente", secretariaController.insertar_Docente);
router.put("/editar_Docente/:id", secretariaController.editar_Docente);
router.delete("/eliminar_Docente/:id", secretariaController.eliminar_Docente);

module.exports = router;
