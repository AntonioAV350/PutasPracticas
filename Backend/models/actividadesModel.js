
const pool = require("../config/db.config"); 


function obtenerActividades(callback) {
  const query = `
    SELECT 
      act.id_actividad, 
      act.nombre_actividad, 
      act.descripcion, 
      act.fecha, 
      act.id_carrera, 
      car.nombre_carrera,
      COUNT(evt.id_evidencia) AS cantidad_evidencias
    FROM 
      modulo_investigacion.actividades_tutorias AS act
    LEFT JOIN 
      carreras AS car ON car.id_carrera = act.id_carrera 
    LEFT JOIN 
      modulo_investigacion.evidencias_tutorias AS evt ON evt.id_actividad = act.id_actividad 
    GROUP BY 
      act.id_actividad, car.nombre_carrera
    ORDER BY
      act.id_actividad ASC;
  `;
  
  pool.query(query, (error, results) => {
    if (error) {
      console.error("Error al obtener actividades:", error); // Es bueno loguear el error específico
      callback(error, null);
    } else {
      callback(null, results.rows); // En node-postgres, los resultados están en results.rows
    }
  });
}

async function buscarProgAcademico(callback) {
  try {
    const query = "SELECT * FROM public.carreras";
    const { rows } = await pool.query(query);
    callback(null, rows);
  } catch (error) {
    console.error("Error en la consulta:", error);
    callback(error, null);
  }
}


function buscarActividad(id, callback) {
  // 1. Consulta SQL corregida para PostgreSQL
  const query = `
    SELECT * FROM modulo_investigacion.actividades_tutorias 
    WHERE id_actividad = $1;
  `;

  // 2. Usar pool.query y pasar los parámetros en un arreglo
  pool.query(query, [id], (error, results) => {
    if (error) {
      console.error("Error al buscar la actividad:", error);
      callback(error, null);
    } else {
      // 3. Devolver solo la primera fila, ya que se busca por ID
      callback(null, results.rows[0]); 
    }
  });
}



function insertarActividad(data, callback) {
  // Obtenemos los nombres de las columnas y los valores del objeto 'data'
  const columnas = Object.keys(data);
  const valores = Object.values(data);

  // Creamos los placeholders ($1, $2, $3, ...) dinámicamente
  const placeholders = columnas.map((_, index) => `$${index + 1}`).join(', ');

  // Construimos la consulta SQL final para PostgreSQL
  const query = `
    INSERT INTO modulo_investigacion.actividades_tutorias (${columnas.join(', ')}) 
    VALUES (${placeholders})
    RETURNING *;`; // Opcional: RETURNING * te devuelve el registro insertado

  // Ejecutamos la consulta usando el pool
  pool.query(query, valores, (error, results) => {
    if (error) {
      console.error("Error al insertar en la base de datos:", error); // Es buena práctica loguear el error
      callback(error, null);
    } else {
      // results.rows contiene el resultado de la consulta
      callback(null, results.rows[0]); // Devolvemos la primera fila del resultado
    }
  });
}


function editarActividad(id, newData, callback) {
  // Obtenemos las columnas y los valores del objeto newData
  const columnas = Object.keys(newData);
  const valores = Object.values(newData);

  // Creamos la cadena de asignaciones (ej: "nombre_actividad" = $1, "descripcion" = $2)
  const setString = columnas
    .map((columna, index) => `"${columna}" = $${index + 1}`)
    .join(', ');

  // El ID será el último parámetro
  const idPlaceholder = `$${columnas.length + 1}`;

  // Construimos la consulta SQL final
  const query = `
    UPDATE modulo_investigacion.actividades_tutorias
    SET ${setString}
    WHERE id_actividad = ${idPlaceholder}
    RETURNING *;`; // Opcional: RETURNING * devuelve la fila actualizada

  // Ejecutamos la consulta. El ID se añade al final del arreglo de valores.
  pool.query(query, [...valores, id], (error, results) => {
    if (error) {
      console.error("Error al editar la actividad:", error);
      callback(error, null);
    } else {
      // Devolvemos la fila actualizada para confirmar los cambios
      callback(null, results.rows[0]);
    }
  });
}




function eliminarActividad(id, callback) {
  // 1. Consulta SQL corregida para PostgreSQL
  const query = `
    DELETE FROM modulo_investigacion.actividades_tutorias 
    WHERE id_actividad = $1;
  `;

  // 2. Usar pool.query
  pool.query(query, [id], (error, results) => {
    if (error) {
      console.error("Error al eliminar la actividad:", error);
      callback(error, null);
    } else {
      // 3. Devolvemos un mensaje de éxito o un error si no se eliminó nada
      if (results.rowCount > 0) {
        callback(null, { message: 'Actividad eliminada exitosamente' });
      } else {
        callback({ message: 'No se encontró la actividad para eliminar' }, null);
      }
    }
  });
}
/*
function obtenerEvidencias(idActividad, callback) {
  const query =
    "select ev.idevidenciasT,ev.nombreEvi, ev.descripcionEvi,ev.fecha_creacion, ev.urlEvi, ev.idActividad, act.nombreActTutorias from evidenciasTutorias as ev, actividadesTutorias as act WHERE ev.idActividad = ? and ev.idActividad = act.idActTutorias";
  db.query(query, [idActividad], (error, rows) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, rows);
    }
  });
}

function insertarEvidencias(data, callback) {
  const query = "INSERT INTO evidenciasTutorias SET ?";
  db.query(query, data, (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}
function actualizarEvidencias(id, data, callback) {
  const query = "UPDATE evidenciasTutorias SET ? WHERE idevidenciasT = ?";
  db.query(query, [data, id], (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

function eliminarEvidencia(id, callback) {
  const query = "DELETE FROM evidenciasTutorias WHERE idevidenciasT = ?";
  db.query(query, [id], (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}
function obtenerEvidenciaPorId(id, callback) {
  const query = "SELECT * FROM evidenciasTutorias WHERE idevidenciasT = ?";
  db.query(query, [id], (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

module.exports = {

  obtenerEvidencias,
  insertarEvidencias,
  obtenerEvidenciaPorId,
  actualizarEvidencias,
  eliminarEvidencia,
};*/

module.exports = {
  obtenerActividades,
  insertarActividad,
  editarActividad,
  eliminarActividad,
  buscarProgAcademico,
  buscarActividad,
};
