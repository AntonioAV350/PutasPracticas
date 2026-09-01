const db = require("../config/db.config");

function obtenerActividades(callback) {
  const query = `select ae.idActEnsenanza, ae.nombreAct, ae.descripcionAct, ta.nombretipoAct, ta.idtipoActividad, mt.nombreMateria, mt.idMateria, 
    ae.cicloEscolar, ae.fecha, COUNT(DISTINCT es.idevidenciasE) as cantidad_evidencias from actividadesensenanza ae 
    LEFT JOIN  tipoactividad ta on ae.tipoAct = ta.idtipoActividad
    LEFT JOIN  materia mt on ae.materia = mt.idMateria 
    LEFT JOIN  evidenciasensenanza es on ae.idActEnsenanza = es.idActividad
    GROUP BY 
      ae.idActEnsenanza`;
  db.query(query, (error, rows) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, rows);
    }
  });
}

function materiasByRfc(rfc, callback) {
  const query =
    "SELECT detD.docente,detD.materia, m.nombreMateria FROM detalle_docente as detD, materia as m WHERE m.idMateria = detD.materia AND detD.Docente = ?;";
  db.query(query, [rfc], (error, rows) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, rows);
    }
  });
}

function buscarTipoActividad(callback) {
  const query = "SELECT * FROM tipoActividad;";
  db.query(query, (error, rows) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, rows);
    }
  });
}

function insertarActividad(formData, callback) {
  const query = "INSERT INTO actividadesEnsenanza SET ?";
  db.query(query, formData, (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}
function editarActividad(id, formData, callback) {
  const query = "UPDATE actividadesEnsenanza SET ? WHERE idActEnsenanza = ?";
  db.query(query, [formData, id], (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

function eliminarActividad(id, callback) {
  const query = "DELETE FROM actividadesEnsenanza WHERE idActEnsenanza = ?";
  db.query(query, [id], (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

function obtenerEvidencias(idActividad, callback) {
  const query =
    "select ev.idevidenciasE,ev.nombreEvi, ev.descripcionEvi, ev.urlEvi, ev.idActividad, ev.fecha_creacion, act.nombreAct from evidenciasEnsenanza as ev, actividadesEnsenanza as act WHERE ev.idActividad = ? and ev.idActividad = act.idActEnsenanza";
  db.query(query, [idActividad], (error, rows) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, rows);
    }
  });
}

function insertarEvidencias(data, callback) {
  const query = "INSERT INTO evidenciasEnsenanza SET ?";
  db.query(query, data, (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

function actualizarEvidencias(id, data, callback) {
  const query = "UPDATE evidenciasEnsenanza SET ? WHERE idevidenciasE = ?";
  db.query(query, [data, id], (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

function eliminarEvidencia(id, callback) {
  const query = "DELETE FROM evidenciasEnsenanza WHERE idevidenciasE = ?";
  db.query(query, [id], (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

function obtenerEvidenciaPorId(id, callback) {
  const query = "SELECT * FROM evidenciasEnsenanza WHERE idevidenciasE = ?";
  db.query(query, [id], (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

function getAllUsuarios(callback) {
  db.query("SELECT * FROM usuarios WHERE n_plaza != ''", (error, rows) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, rows);
    }
  });
}

function getAllMaterias(callback) {
  db.query(
    "SELECT m.*, s.semestre as nombresemestre,s.grupo,  p.nombreProg FROM materia m JOIN semestre_grupo s ON m.semestre = s.is_SG JOIN prog_academicos p ON m.prog_academico = p.idprog_academicos;",
    (error, rows) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, rows);
      }
    }
  );
}

function getSemestre(callback) {
  db.query("SELECT * FROM semestre_grupo;", (error, rows) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, rows);
    }
  });
}

function getProg(callback) {
  db.query("SELECT * FROM prog_academicos;", (error, rows) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, rows);
    }
  });
}

function getDetalleD(callback) {
  db.query(
    `SELECT 
    d.id_Det_d,d.docente,
    CONCAT(us.nombre_Doce, ' ', us.apellido_paterno,' ',us.apellido_materno) AS nombre_doce,
    d.materia, 
    m.nombreMateria 
    FROM detalle_docente d 
    JOIN materia m 
    ON d.materia = m.idMateria 
    JOIN usuarios us 
    ON d.docente = us.rfc`,
    (error, rows) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, rows);
      }
    }
  );
}
function asignarMateriaDocente(formData, callback) {
  db.beginTransaction((err) => {
    if (err) {
      callback(err, null);
      return;
    }

    const detalleQuery = "INSERT INTO detalle_docente SET ?";
    db.query(detalleQuery, formData, (error, detalleResults) => {
      if (error) {
        return db.rollback(() => {
          callback(error, null);
        });
      }

      const usuariosPermisosQuery =
        "SELECT idUsuario FROM usuarios_permisos WHERE idPermiso = ? AND idUsuario = ?";
      const usuariosPermisosValues = [3, formData.docente];

      db.query(
        usuariosPermisosQuery,
        usuariosPermisosValues,
        (usuariosPermisosError, usuariosPermisosResults) => {
          if (usuariosPermisosError) {
            return db.rollback(() => {
              callback(usuariosPermisosError, null);
            });
          }

          if (usuariosPermisosResults.length > 0) {
            // Ya existe una entrada en usuarios_permisos, no es necesario insertar de nuevo
            db.commit((commitError) => {
              if (commitError) {
                return db.rollback(() => {
                  callback(commitError, null);
                });
              }

              callback(null, {
                detalle: detalleResults,
                mensaje:
                  "El usuario_permiso ya existe, no se ha realizado una nueva inserción.",
              });
            });
          } else {
            // No existe una entrada en usuarios_permisos, proceder con la inserción
            const insertarUsuariosPermisosQuery =
              "INSERT INTO usuarios_permisos (idPermiso, idUsuario) VALUES (?, ?)";
            db.query(
              insertarUsuariosPermisosQuery,
              usuariosPermisosValues,
              (
                insertarUsuariosPermisosError,
                insertarUsuariosPermisosResults
              ) => {
                if (insertarUsuariosPermisosError) {
                  return db.rollback(() => {
                    callback(insertarUsuariosPermisosError, null);
                  });
                }

                db.commit((commitError) => {
                  if (commitError) {
                    return db.rollback(() => {
                      callback(commitError, null);
                    });
                  }

                  callback(null, {
                    detalle: detalleResults,
                    usuariosPermisos: insertarUsuariosPermisosResults,
                  });
                });
              }
            );
          }
        }
      );
    });
  });
}

function editarMateriaDocente(id, formData, callback) {
  const query = "UPDATE detalle_docente SET ? WHERE id_Det_d = ?";
  db.query(query, [formData, id], (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

function eliminarDetalleDocente(id, callback) {
  db.beginTransaction((err) => {
    if (err) {
      callback(err, null);
      return;
    }

    // Consulta para obtener el valor de rfc a partir del id
    const obtenerRfcQuery =
      "SELECT docente FROM detalle_docente WHERE id_Det_d = ?";
    db.query(obtenerRfcQuery, [id], (obtenerRfcError, obtenerRfcResults) => {
      if (obtenerRfcError) {
        return db.rollback(() => {
          callback(obtenerRfcError, null);
        });
      }

      const rfc = obtenerRfcResults[0].docente;

      const detalleQuery = "DELETE FROM detalle_docente WHERE id_Det_d = ?";
      db.query(detalleQuery, [id], (error, detalleResults) => {
        if (error) {
          return db.rollback(() => {
            callback(error, null);
          });
        }

        const usuariosPermisosQuery =
          " DELETE FROM usuarios_permisos WHERE idUsuario = ? AND idPermiso NOT IN (1, 2, 5, 7, 9);";
        db.query(
          usuariosPermisosQuery,
          [rfc],
          (usuariosPermisosError, usuariosPermisosResults) => {
            if (usuariosPermisosError) {
              return db.rollback(() => {
                callback(usuariosPermisosError, null);
              });
            }

            db.commit((commitError) => {
              if (commitError) {
                return db.rollback(() => {
                  callback(commitError, null);
                });
              }

              callback(null, {
                detalle: detalleResults,
                usuariosPermisos: usuariosPermisosResults,
              });
            });
          }
        );
      });
    });
  });
}

function insertarMateria(formData, callback) {
  const query = "INSERT INTO materia SET ?";
  db.query(query, formData, (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}
function editarMateria(id, formData, callback) {
  const query = "UPDATE materia SET ? WHERE idMateria = ?";
  db.query(query, [formData, id], (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

function eliminarMateria(id, callback) {
  const query = "DELETE FROM materia WHERE idMateria = ?";
  db.query(query, [id], (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}


module.exports = {
  obtenerActividades,
  materiasByRfc,
  buscarTipoActividad,
  insertarActividad,
  editarActividad,
  eliminarActividad,
  obtenerEvidencias,
  insertarEvidencias,
  eliminarEvidencia,
  obtenerEvidenciaPorId,
  actualizarEvidencias,
  getAllUsuarios,
  getAllMaterias,
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
