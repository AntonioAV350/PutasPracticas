const actividadesModel = require("../models/actividadesModel");

const multer = require("multer");

const fs = require("fs");
const path = require("path");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const fileExtension = file.originalname.split(".").pop();
    const actividadId = req.body.idActTutorias;
    const currentDate = new Date().toISOString().slice(0, 10);
    const uuidv4 = require("uuid").v4; 

    cb(
      null,
      `Evi-Ens-${actividadId}-${currentDate}-${uuidv4()}.${fileExtension}`
    );
  },
});

const upload = multer({ storage: storage }).single('evidencias');


function insertarActividad(req, res) {

  
  
  const formData = {
    nombre_actividad: req.body.nombre_actividad,
    descripcion: req.body.descripcion,
    fecha: req.body.fecha,
    id_carrera: req.body.id_carrera, // Asegúrate que este también coincida
  };

  actividadesModel.insertarActividad(formData, (error, resultado) => {
    if (error) {
      console.log("Error al insertar en la base de datos:", error);
      res.status(500).json({ error: "Error al insertar la actividad." });
    } else {
      res.json(resultado);
    }
  });
}

function obtenerActividades(req, res) {
  actividadesModel.obtenerActividades((error, rows) => {
    if (error) {
      res.status(500).json({ error: "Error al obtener las actividades." });
    } else {
      res.json(rows);
    }
  });
}

function buscarProgAcademico(req, res) {
  actividadesModel.buscarProgAcademico((error, rows) => {
    if (error) {
      console.error("Error en la consulta:", error);
      return res.status(500).json({ error: "Error al obtener las carreras." });
    }
    //console.log("Consulta exitosa:", rows);
    res.json(rows);
  });
}


function buscarActividad(req, res) {
  const id = req.params.id;
  // 👇 AQUÍ AGREGAS EL CONSOLE.LOG PARA DEPURAR
  console.log("Intentando buscar actividad con ID:", id);
  console.log("El tipo de dato del ID recibido es:", typeof id);
  actividadesModel.buscarActividad(id, (error, rows) => {
    if (error) {
      res.status(500).json({ error: "Error al obtener la actividad." });
    } else {
      res.json(rows);
    }
  });
}

function editarActividad(req, res) {
  const id = req.body.id_actividad;
  const formData = {
    nombre_actividad: req.body.nombre_actividad,
    descripcion: req.body.descripcion,
    fecha: req.body.fecha,
    id_carrera: req.body.id_carrera, // Asegúrate que este también coincida
  };

  actividadesModel.editarActividad(id, formData, (error, results) => {
    if (error) {
      res.status(500).json({ error: "Error al editar la actividad." });
    } else {
      res.json(results);
    }
  });
}

function eliminarActividad(req, res) {
  const id = req.params.id;
  actividadesModel.eliminarActividad(id, (error, results) => {
    if (error) {
      res.status(500).json({ error: "Error al eliminar la actividad." });
    } else {
      res.json(results);
    }
  });
}

function obtenerEvidencias(req, res) {
  const idEvidencia = req.params.idEvidencia;

  actividadesModel.obtenerEvidencias(idEvidencia, (error, rows) => {
    if (error) {
      res.status(500).json({ error: "Error al obtener las actividades." });
    } else {
      res.json(rows);
    }
  });
}


function cargarEvidencia(req, res) {
    
  upload(req, res, function (err) {
      if (err){
          return res.status(500).json({ error: err.message });
      }
      const {originalname, filename} = req.file;

      const urlArchivo = '/uploads/' + filename;

      const {idActTutorias, nombreEvi,  descripcionEvi} = req.body;

      const data = {
          nombreEvi,
          descripcionEvi,
          urlEvi: urlArchivo,
          idActividad: idActTutorias,
      };

      actividadesModel.insertarEvidencias(data, (error, results) => {
          if (error) {
              res.status(500).json({ error: 'Error al insertar las actividades.' });
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

    const { idEvidenciasT, nombreEvi, descripcionEvi } = req.body;
    let data = {
      nombreEvi,
      descripcionEvi,
    };

    if (req.file) {
      const { filename } = req.file;
      const urlArchivo = "/uploads/" + filename;
      data.urlEvi = urlArchivo;
    }

    // Primero obtenemos la información del archivo antiguo.
    actividadesModel.obtenerEvidenciaPorId(idEvidenciasT, (err, prevEvi) => {
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
      actividadesModel.actualizarEvidencias(
        idEvidenciasT,
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

  actividadesModel.obtenerEvidenciaPorId(id, (error, results) => {
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

      actividadesModel.eliminarEvidencia(id, (error, results) => {
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

module.exports = {
  obtenerActividades,
  insertarActividad,
  editarActividad,
  eliminarActividad,
  buscarActividad,
  buscarProgAcademico,
  obtenerEvidencias,
  cargarEvidencia,
  actualizarEvidencias,
  eliminarEvidencia
};
