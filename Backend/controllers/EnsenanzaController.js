const EnsenanzaModel = require("../models/EnsenanzaModel.js");

const multer = require("multer");

const fs = require("fs");
const path = require("path");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/evidenciasEnsenanza");
  },
  filename: function (req, file, cb) {
    const fileExtension = file.originalname.split(".").pop();
    const actividadId = req.body.idActEnsenanza;
    const currentDate = new Date().toISOString().slice(0, 10);
    const uuidv4 = require("uuid").v4; // Asegúrate de instalar la librería UUID si no la tienes

    cb(
      null,
      `Evi-Ens-${actividadId}-${currentDate}-${uuidv4()}.${fileExtension}`
    );
  },
});

const upload = multer({ storage: storage }).single("evidencias");

function obtenerActividades(req, res) {
  EnsenanzaModel.obtenerActividades((error, rows) => {
    if (error) {
      res.status(500).json({ error: "Error al obtener las actividades." });
    } else {
      res.json(rows);
    }
  });
}
function buscarTipoActividad(req, res) {
  EnsenanzaModel.buscarTipoActividad((error, rows) => {
    if (error) {
      res
        .status(500)
        .json({ error: "Error al obtener los tipos de actividades." });
    } else {
      res.json(rows);
    }
  });
}
function materiasByRfc(req, res) {
  const rfc = req.params.id;

  EnsenanzaModel.materiasByRfc(rfc, (error, rows) => {
    if (error) {
      res
        .status(500)
        .json({ error: "Error al obtener los tipos de actividades." });
    } else {
      res.json(rows);
    }
  });
}

function insertarActividad(req, res) {
  // Calcula el ciclo escolar
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // getMonth() devuelve 0-11
  let cicloEscolar;
  if (currentMonth >= 1 && currentMonth <= 6) {
    cicloEscolar = `Ene - Jun ${currentYear}`;
  } else {
    cicloEscolar = `Ago - Dic ${currentYear}`;
  }

  const formData = {
    nombreAct: req.body.nombreAct,
    descripcionAct: req.body.descripcionAct,
    tipoAct: req.body.tipoAct,
    materia: req.body.idMateria,
    cicloEscolar, // Usar el ciclo escolar calculado
    fecha: req.body.fecha,
  };

  EnsenanzaModel.insertarActividad(formData, (error, resultado) => {
    if (error) {
      console.log("Error al insertar en la base de datos:", error);
      res.status(500).json({ error: "Error al insertar la actividad." });
    } else {
      res.json(resultado);
    }
  });
}
function editarActividad(req, res) {
  const id = req.params.id;
  // Calcula el ciclo escolar
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // getMonth() devuelve 0-11
  let cicloEscolar;
  if (currentMonth >= 1 && currentMonth <= 6) {
    cicloEscolar = `Ene - Jun ${currentYear}`;
  } else {
    cicloEscolar = `Ago - Dic ${currentYear}`;
  }

  const formData = {
    nombreAct: req.body.nombreAct,
    descripcionAct: req.body.descripcionAct,
    tipoAct: req.body.tipoAct,
    materia: req.body.idMateria,
    cicloEscolar, // Usar el ciclo escolar calculado
    fecha: req.body.fecha,
  };
  EnsenanzaModel.editarActividad(id, formData, (error, resultado) => {
    if (error) {
      console.log("Error al editar en la base de datos:", error);
      res.status(500).json({ error: "Error al editar la actividad." });
    } else {
      res.json(resultado);
    }
  });
}
function eliminarActividad(req, res) {
  const id = req.params.id;
  EnsenanzaModel.eliminarActividad(id, (error, resultado) => {
    if (error) {
      console.log("Error al eliminar en la base de datos:", error);
      res.status(500).json({ error: "Error al eliminar la actividad." });
    } else {
      res.json(resultado);
    }
  });
}

function obtenerEvidencias(req, res) {
  const idEvidencia = req.params.idEvidencia;

  EnsenanzaModel.obtenerEvidencias(idEvidencia, (error, rows) => {
    if (error) {
      res.status(500).json({ error: "Error al obtener las actividades." });
    } else {
      res.json(rows);
    }
  });
}

function cargarEvidencia(req, res) {
  upload(req, res, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const { originalname, filename } = req.file;

    const urlArchivo = "/public/evidenciasEnsenanza/" + filename;

    const { idActEnsenanza, nombreEvi, descripcionEvi } = req.body;

    const data = {
      nombreEvi,
      descripcionEvi,
      urlEvi: urlArchivo,
      idActividad: idActEnsenanza,
    };

    EnsenanzaModel.insertarEvidencias(data, (error, results) => {
      if (error) {
        res.status(500).json({ error: "Error al insertar las actividades." });
      } else {
        res.json(results);
      }
    });
  });
}
const actualizarEvidencias = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const { idEvidenciasE, nombreEvi, descripcionEvi } = req.body;
    let data = {
      nombreEvi,
      descripcionEvi,
    };

    if (req.file) {
      const { filename } = req.file;
      const urlArchivo = "/public/evidenciasEnsenanza/" + filename;
      data.urlEvi = urlArchivo;
    }

    // Primero obtenemos la información del archivo antiguo.
    EnsenanzaModel.obtenerEvidenciaPorId(idEvidenciasE, (err, prevEvi) => {
      if (err || !prevEvi || prevEvi.length === 0) {
        console.error(
          "Error obteniendo la evidencia previa:",
          err || "No hay datos previos."
        );
        return res
          .status(500)
          .json({ error: "Error al obtener las evidencias previas." });
      }

      const oldFilePath = prevEvi[0].urlEvi;

      // Luego actualizamos la información en la base de datos.
      EnsenanzaModel.actualizarEvidencias(
        idEvidenciasE,
        data,
        (error, results) => {
          if (error) {
            if (data.urlEvi) {
              fs.unlink(
                path.join(__dirname, "..", data.urlEvi),
                (unlinkError) => {
                  if (unlinkError) {
                    console.error(
                      "Error eliminando el nuevo archivo después de un error de base de datos:",
                      unlinkError
                    );
                  }
                }
              );
            }
            return res
              .status(500)
              .json({ error: "Error al actualizar las evidencias." });
          } else {
            // Si se actualizó correctamente y hemos subido un nuevo archivo, eliminamos el antiguo.
            if (data.urlEvi && oldFilePath !== data.urlEvi) {
              fs.unlink(
                path.join(__dirname, "..", oldFilePath),
                (unlinkError) => {
                  if (unlinkError) {
                    console.error(
                      "Error eliminando el archivo antiguo:",
                      unlinkError
                    );
                  }
                }
              );
            }
            res.json({
              message: "Evidencia actualizada correctamente",
              data: results,
            });
          }
        }
      );
    });
  });
};

function eliminarEvidencia(req, res) {
  const id = req.params.id;

  EnsenanzaModel.obtenerEvidenciaPorId(id, (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Error al obtener la evidencia." });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: "Evidencia no encontrada." });
    }

    const filePath = results[0].urlEvi;

    fs.unlink(path.join(__dirname, "..", filePath), (error) => {
      if (error) {
        return res.status(500).json({ error: "Error al eliminar el archivo." });
      }

      EnsenanzaModel.eliminarEvidencia(id, (error, results) => {
        if (error) {
          return res
            .status(500)
            .json({ error: "Error al eliminar la evidencia." });
        }
        res.json(results);
      });
    });
  });
}
function getUsuarios(req, res) {
  EnsenanzaModel.getAllUsuarios((error, usuarios) => {
    if (error) {
      res.status(500).send("Error al obtener usuarios");
    } else {
      res.json(usuarios);
    }
  });
}

function getMaterias(req, res) {
  EnsenanzaModel.getAllMaterias((error, materias) => {
    if (error) {
      res.status(500).send("Error al obtener materias");
    } else {
      res.json(materias);
    }
  });
}
function getSemestre(req, res) {
  EnsenanzaModel.getSemestre((error, materias) => {
    if (error) {
      res.status(500).send("Error al obtener materias");
    } else {
      res.json(materias);
    }
  });
}
function getProg(req, res) {
  EnsenanzaModel.getProg((error, materias) => {
    if (error) {
      res.status(500).send("Error al obtener materias");
    } else {
      res.json(materias);
    }
  });
}

function getDetalleD(req, res) {
  EnsenanzaModel.getDetalleD((error, data) => {
    if (error) {
      res.status(500).send("Error al obtener data");
    } else {
      res.json(data);
    }
  });
}

function asignarMateriaDocente(req, res) {
  const formData = {
    docente: req.body.docente,
    materia: req.body.materias,
  };

  EnsenanzaModel.asignarMateriaDocente(formData, (error, resultado) => {
    if (error) {
      console.log("Error al insertar en la base de datos:", error);
      res.status(500).json({ error: "Error al insertar la actividad." });
    } else {
      res.json(resultado);
    }
  });
}

function editarMateriaDocente(req, res) {
  const id = req.params.id;
  const formData = {
    docente: req.body.docente,
    materia: req.body.materias,
  };
  EnsenanzaModel.editarMateriaDocente(id, formData, (error, resultado) => {
    if (error) {
      console.log("Error al editar en la base de datos:", error);
      res.status(500).json({ error: "Error al editar la actividad." });
    } else {
      res.json(resultado);
    }
  });
}

function eliminarDetalleDocente(req, res) {
  const id = req.params.id;
  EnsenanzaModel.eliminarDetalleDocente(id, (error, resultado) => {
    if (error) {
      console.log("Error al eliminar en la base de datos:", error);
      res.status(500).json({ error: "Error al eliminar la actividad." });
    } else {
      res.json(resultado);
    }
  });
}

function insertarMateria(req, res) {
  const formData = {
    nombreMateria: req.body.nombreMateria,
    semestre: req.body.semestre,
    prog_academico: req.body.prog_academicos,
  };

  EnsenanzaModel.insertarMateria(formData, (error, resultado) => {
    if (error) {
      console.log("Error al insertar en la base de datos:", error);
      res.status(500).json({ error: "Error al insertar la materia." });
    } else {
      res.json(resultado);
    }
  });
}
function editarMateria(req, res) {
  const id = req.params.id;
  const formData = {
    nombreMateria: req.body.nombreMateria,
    semestre: req.body.semestre,
    prog_academico: req.body.prog_academicos,
  };

  EnsenanzaModel.editarMateria(id, formData, (error, resultado) => {
    if (error) {
      console.log("Error al editar en la base de datos:", error);
      res.status(500).json({ error: "Error al editar la materia." });
    } else {
      res.json(resultado);
    }
  });
}
function eliminarMateria(req, res) {
  const id = req.params.id;
  EnsenanzaModel.eliminarMateria(id, (error, resultado) => {
    if (error) {
      console.log("Error al eliminar en la base de datos:", error);
      res.status(500).json({ error: "Error al eliminar la actividad." });
    } else {
      res.json(resultado);
    }
  });
}





module.exports = {
  obtenerActividades,
  buscarTipoActividad,
  materiasByRfc,
  insertarActividad,
  editarActividad,
  eliminarActividad,
  obtenerEvidencias,
  cargarEvidencia,
  actualizarEvidencias,
  eliminarEvidencia,
  getUsuarios,
  getMaterias,
  getDetalleD,
  asignarMateriaDocente,
  editarMateriaDocente,
  eliminarDetalleDocente,
  getSemestre,
  getProg,
  insertarMateria,
  editarMateria,
  eliminarMateria,
  
};
