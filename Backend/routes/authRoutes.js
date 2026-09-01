// routes/authRoutes.js
const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/authController");
const authenticateJWT = require("../middlewares/authenticateJWT");

// ======================
// Rutas de Autenticación
// ======================

// Iniciar sesión
router.post("/login", AuthController.login);

// Obtener datos de usuario por RFC
router.get("/usuario/:rfc", AuthController.getUser);

// Enviar correo (placeholder; implementa tu servicio real en el controller)
router.post("/send-email", AuthController.sendEmail);

// Obtener permisos (protegida con JWT)
router.get("/permisos/:rfc", authenticateJWT, AuthController.getPermisos);

// Ruta protegida de prueba
router.get("/rutaProtegida", authenticateJWT, (req, res) => {
  res.send("Esta es una ruta protegida");
});

module.exports = router;
