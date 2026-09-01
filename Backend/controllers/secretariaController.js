const secretariaModel = require("../models/secretariaModel");

const multer = require("multer");

const fs = require("fs");
const path = require("path");

const bcrypt = require("bcrypt");
const saltRounds = 10;




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/evidenciasSecretaria");
  },
  filename: function (req, file, cb) {
    const fileExtension = file.originalname.split(".").pop();
    const actividadId = req.body.idUsuario;
    const currentDate = new Date().toISOString().slice(0, 10);

    cb(
      null,
      `Evi-Sec-${actividadId}-${currentDate}.${fileExtension}`
    );
  },
});

const upload = multer({ storage: storage }).single("evidencias");

function getUsuario(req, res) {
  secretariaModel.getUsuario((error, rows) => {
    if (error) {
      res.status(500).json({ error: "Error al obtener los usuarios." });
    } else {
      res.json(rows);
    }
  });
}

function showAll(req, res) {
  secretariaModel.showAll((error, rows) => {
    if (error) {
      res.status(500).json({ error: "Error al obtener las actividades." });
    } else {
      res.json(rows);
    }
  });
}

function insertarDocente(req, res) {
  const formData = {
    rfc: req.body.rfc,
    nivel_estudio: req.body.nivelEstudio,
    nombre_institucion: req.body.nombreInstitucion,
    area_especializacion: req.body.areaEspecializacion
  };

  secretariaModel.insertarDocumentoDocente(formData, (error, resultado) => {
    if (error) {
      console.log("Error al insertar en la base de datos:", error);
      res.status(500).json({ error: "Error al insertar la actividad." });
    } else {
      res.json(resultado);
    }
  });
}

function editarDocente(req, res) {
  const id = req.body.idSecretaria;
  const formData = {
    rfc: req.body.rfc,
    nivelEstudio: req.body.nivelEstudio,
    nombreInstitucion: req.body.nombreInstitucion,
    areaEspecializacion: req.body.areaEspecializacion,
  };

  secretariaModel.editarDocente(id, formData, (error, results) => {
    if (error) {
      res.status(500).json({ error: "Error al editar la actividad." });
    } else {
      res.json(results);
    }
  });
}

function eliminarDocente(req, res) {
  const id = req.params.id;
  secretariaModel.eliminarDocente(id, (error, resultado) => {
    if (error) {
      console.log("Error al eliminar en la base de datos:", error);
      res.status(500).json({ error: "Error al eliminar la actividad." });
    } else {
      res.json(resultado);
    }
  });
}

function getTipo(req, res) {
  secretariaModel.getTipo((error, rows) => {
    if (error) {
      res.status(500).json({ error: "Error al obtener el data." });
    } else {
      res.json(rows);
    }
  });
}

function obtenerDocumentos(req, res) {
  const idSecretaria = req.params.id;
  secretariaModel.obtenerDocumentos(idSecretaria, (error, rows) => {
    if (error) {
      res.status(500).json({ error: "Error al obtener las actividades." });
    } else {
      res.json(rows);
    }
  });
}

// En tu archivo de controlador
function insertarDocumentos(req, res) {
  try {
    console.log("Controlador - Cuerpo de la petición (req.body):", req.body);
    console.log("Controlador - Archivo recibido (req.file):", req.file);

    // Es buena práctica verificar que el archivo realmente llegó
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo. Asegúrate de que el campo del formulario no esté vacío." });
    }

    const { filename } = req.file;
    const urlArchivo = "/uploads/evidenciasSecretaria/" + filename;
    const { idUsuario, nombreDoc, fecha, idTipoDocumento } = req.body;

    const data = {
      idUsuario: idUsuario,
      idTipoDocumento: idTipoDocumento,
      urlDocumento: urlArchivo,
      fecha,
      nombreDoc,
    };

    secretariaModel.insertarDocumentos(data, (error, results) => {
      if (error) {
        console.error("Error al insertar en la base de datos:", error);
        res.status(500).json({ error: "Error al insertar el registro en la base de datos." });
      } else {
        res.json(results);
      }
    });
  } catch (error) {
    console.error("Error catastrófico en el controlador 'insertarDocumentos':", error);
    res.status(500).json({ error: "Ocurrió un error inesperado en el servidor." });
  }
}
const actualizarDocumentos = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log("Error al subir el archivo:", err);
      return res.status(500).json({ error: err.message });
    }

    const { idDocumento, nombreDoc, fecha, idTipoDocumento } = req.body;

    const data = {
      idTipoDocumento: idTipoDocumento,
      fecha,
      nombreDoc,
    };

    if (req.file) {
      const { filename } = req.file;
      const urlArchivo = "/uploads/evidenciasSecretaria/" + filename;
      data.urlDocumento = urlArchivo;
    }
    // Primero obtenemos la información del archivo antiguo.
    secretariaModel.obtenerDocumentosPorId(idDocumento, (err, prevEvi) => {
      if (err || !prevEvi || prevEvi.length === 0) {
        console.error(
          "Error obteniendo la evidencia previa:",
          err || "No hay datos previos."
        );
        return res
          .status(500)
          .json({ error: "Error al obtener las evidencias previas." });
      }

      const oldFilePath = prevEvi[0].urlDocumento;

      // Luego actualizamos la información en la base de datos.
      secretariaModel.actualizarDocumentos(
        idDocumento,
        data,
        (error, results) => {
          if (error) {
            if (data.urlDocumento) {
              fs.unlink(
                path.join(__dirname, "..", data.urlDocumento),
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
            if (data.urlDocumento && oldFilePath !== data.urlDocumento) {
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

function eliminarDocumentos(req, res) {
  const id = req.params.id;

  secretariaModel.obtenerDocumentosPorId(id, (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Error al obtener la Documento." });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: "Documento no encontrada." });
    }

    const filePath = results[0].urlDocumento;

    fs.unlink(path.join(__dirname, "..", filePath), (error) => {
      if (error) {
        return res.status(500).json({ error: "Error al eliminar el archivo." });
      }

      secretariaModel.eliminarDocumentos(id, (error, results) => {
        if (error) {
          return res
            .status(500)
            .json({ error: "Error al eliminar la Documento." });
        }
        res.json(results);
      });
    });
  });
}

//--------------------------------------------------------------------------------------------------------

/*aqui comienza lo de docentes para agregar nuevos usuarios a la plataforma siendo docentes   */

//--------------------------------------------------------------------------------------------------------


//funcion para obtener roles
function obtener_Roles(req, res) {
  secretariaModel.obtenerRoles((error, rows) => {
    if (error) {
      res.status(500).json({ error: "Error al obtener los roles." });
    } else {
      res.json(rows);
    }
  });
}
// Función para obtener todos los docentes

function obtener_Docentes(req, res) {
  // Se elimina la línea que busca un ID, ya que el modelo obtiene todos los docentes.
  
  // Se llama a la función del modelo pasándole únicamente el callback que espera.
  secretariaModel.obtenerDocentes((error, rows) => {
    if (error) {
      // Se corrigió el mensaje de error para ser más específico.
      res.status(500).json({ error: "Error al obtener los docentes." });
    } else {
      res.json(rows);
    }
  });
}


async function insertar_Docente(req, res) {

  
  try {
    if (!req.body.password) {
      return res.status(400).json({ error: "La contraseña es obligatoria." });
    }
    
    // El hasheo se hace aquí, en el controlador.
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const data = {
      rfc: req.body.rfc,
      n_plaza: req.body.n_plaza,
      nombre: req.body.nombre,
      apellido_paterno: req.body.apellido_paterno,
      apellido_materno: req.body.apellido_materno,
      sexo: req.body.sexo,
      email: req.body.email,
      roles: req.body.roles,
      password: hashedPassword, // Se pasa la contraseña ya hasheada
    };

    // Se llama al modelo con los datos ya listos
    secretariaModel.insertar_Docente(data, (error, resultado) => {
      if (error) {
        return res.status(500).json({ error: "Error al insertar el docente." });
      } else {
        res.status(201).json(resultado); 
      }
    });

  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
}

async function editar_Docente(req, res) {
  const rfc = req.params.id; // Obtenemos el RFC de la URL

  try {
    const data = {
      nombre: req.body.nombre,
      apellido_paterno: req.body.apellido_paterno,
      apellido_materno: req.body.apellido_materno,
      sexo: req.body.sexo,
      email: req.body.email,
      n_plaza: req.body.n_plaza,
      roles: req.body.roles,
    };

    // Si el usuario envió una nueva contraseña, la hasheamos.
    // Si el campo de contraseña viene vacío, simplemente no se actualiza.
    if (req.body.password && req.body.password.length > 0) {
      data.password = await bcrypt.hash(req.body.password, saltRounds);
    }

    secretariaModel.editar_Docente(rfc, data, (error, resultado) => {
      if (error) {
        console.log("Error al editar en la base de datos:", error);
        res.status(500).json({ error: "Error al editar el docente." });
      } else {
        res.json(resultado);
      }
    });

  } catch (error) {
    console.error("Error al preparar datos para editar docente:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
}

//

function eliminar_Docente(req, res) {
  const id = req.params.id;
  secretariaModel.eliminar_Docente(id, (error, resultado) => {
    if (error) {
      console.log("Error al eliminar en la base de datos:", error);
      res.status(500).json({ error: "Error al eliminar la actividad." });
    } else {
      res.json(resultado);
    }
  });
}

module.exports = {
  getUsuario,
  showAll,
  insertarDocente,
  editarDocente,
  eliminarDocente,

  getTipo,
  obtenerDocumentos,
  insertarDocumentos,
  actualizarDocumentos,
  eliminarDocumentos,

  obtener_Docentes,
  insertar_Docente,
  editar_Docente,
  eliminar_Docente,
  obtener_Roles,
};
