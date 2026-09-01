const express = require("express");
const router = express.Router();

/**
 * Controller for handling admin-related operations.
 * @type {Object}
 */
const adminController = require("../controllers/adminController");

router.get("/getUsuarios", adminController.getUsuarios);
router.post("/insertUsuario", adminController.insertUsuario);
router.put("/updateUsuario/:rfc", adminController.updateUsuario);
router.get("/findPermisosByRFC/:rfc", adminController.findPermisosByRFC);
router.post("/givePermisos", adminController.givePermisos);

module.exports = router;
