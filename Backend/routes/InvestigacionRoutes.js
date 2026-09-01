const express = require("express");
const router = express.Router();
const InvestigacionController = require("../controllers/InvestigacionController");

router.get("/", (req, res) => {
    res.send("Ruta Inicio");
  });

router.get("/proyectos_investigacion", InvestigacionController.obtenerProyectos);
router.post("/proyectos_investigacion", InvestigacionController.insertarProyecto);
router.get("/proyectos_investigacion/:idProyecto", InvestigacionController.obtenerProyectoPorId);
router.put("/proyectos_investigacion/:id", InvestigacionController.editarProyecto);

router.get("/colaboradores/:idColaborador", InvestigacionController.obtenerColaboradores);
router.post("/colaboradores", InvestigacionController.insertarColaborador);
router.put("/colaboradores/:id", InvestigacionController.editarColaborador);
router.delete("/colaboradores/:idColaborador", InvestigacionController.eliminarColaborador);

router.post("/insertarEvidencias",InvestigacionController.cargarEvidencia);
router.get("/evidencias/:idProyecto", InvestigacionController.obtenerEvidencias);
router.delete('/evidencias/:id', InvestigacionController.eliminarEvidencia);


module.exports = router;