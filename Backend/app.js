const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv"); // <- Importación de dotenv
const os = require("os");
const db = require("./config/db.config");

const app = express();
const authRoutes = require("./routes/authRoutes");
const tutoriasRoutes = require("./routes/TutoriasRoutes");
const ensenanzaRoutes = require("./routes/EnsenanzaRoutes");
const investigacionRoutes = require("./routes/InvestigacionRoutes");
const secretariaRoutes = require("./routes/secretariaRoutes");
const adminRoutes = require("./routes/adminRoutes");
const historialRoutes = require("./routes/historialRoutes");
const alumnosPracticasRoutes = require("./routes/practicas/alumnos/alumnos_route");
const practicasFechasRoutes = require("./routes/practicas/fechas_route");
const practicasCalificacionesRoutes = require("./routes/practicas/calificaciones_route");
const documentosAlumnoRoutes = require('./routes/practicas/alumnos/documentos_route');
const documentosAdminRoutes = require('./routes/practicas/admin/documentos_route');

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

app.use(express.json());
app.use(cors());
app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/auth", authRoutes);
app.use("/tutorias", tutoriasRoutes);
app.use("/ensenanza", ensenanzaRoutes);
app.use("/investigacion", investigacionRoutes);
app.use("/secretaria", secretariaRoutes);
app.use("/admin", adminRoutes);
app.use("/historial", historialRoutes);
app.use("/api", alumnosPracticasRoutes);
app.use("/api", practicasFechasRoutes);
app.use("/api", practicasCalificacionesRoutes);
app.use('/api/practicas/alumnos/documentos', documentosAlumnoRoutes);
app.use('/api/practicas/admin/documentos', documentosAdminRoutes);

function getIPAddress() {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    const networkInterface = networkInterfaces[interfaceName];
    for (const alias of networkInterface) {
      if (alias.family === "IPv4" && !alias.internal) {
        return alias.address;
      }
    }
  }
  return "127.0.0.1"; // Default to localhost if no external IP found
}

function startServer(port) {
  const server = app.listen(port, () => {
    const ip = getIPAddress();
    console.log(`Servidor OK en: http://${ip}:${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(
        `El puerto ${port} está ocupado. Probando con el puerto ${port + 1}...`
      );
      startServer(port + 1);
    } else {
      console.error("Error al iniciar el servidor:", err);
    }
  });
}

const defaultPort = process.env.PUERTO || 3000;

app.get("/config", (req, res) => {
  res.json({ serverPort: defaultPort });
});

startServer(defaultPort);
