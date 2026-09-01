
const pool = require("../config/db.config");
/*
function showAll(callback) {
  const query = `
  SELECT * FROM sistema_gestion2.secretariaac;
`;
  db.query(query, (error, rows) => {
    if (error) {
      callback(error, null);
      console.log("error");
    } else {
      callback(null, rows);
    }
  });
}*/

function visualizarDocente() {
  const query = "SELECT * FROM  where  = $1";
  db.query(query, (error, rows) => {
    if (error) {
      callback(error, null);
      console.log("error");
    } else {
      callback(null, rows);
    }
  });
}

function insertarDocumentoDocente(data, callback) {
  // Obtenemos los nombres de las columnas y los valores del objeto 'data'
  const columnas = Object.keys(data);
  const valores = Object.values(data);

  // Creamos los placeholders ($1, $2, $3, ...) dinámicamente
  const placeholders = columnas.map((_, index) => `$${index + 1}`).join(', ');

  // Construimos la consulta SQL final para PostgreSQL
  const query = `
    INSERT INTO modulo_investigacion.secretaria_academica (${columnas.join(', ')}) 
    VALUES (${placeholders})
    RETURNING *;
  `;

  // Ejecutamos la consulta usando el pool
  pool.query(query, valores, (error, results) => {
    if (error) {
      console.error("Error al insertar el documento del docente:", error);
      callback(error, null);
    } else {
      // Devolvemos la fila que se acaba de insertar
      callback(null, results.rows[0]);
    }
  });
}

/*
function editarDocumentoDocente(id, newData, callback) {
  const query = "UPDATE secretariaAc SET ? WHERE idSecretaria = ?";
  db.query(query, [newData, id], (error, results) => {
    if (error) {
      console.error("Error al editar el registro:", error);
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

function eliminarDocumentoDocente(id, callback) {
  const query = "DELETE FROM secretariaAc WHERE idSecretaria = ?";
  db.query(query, [id], (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

function obtenerDocumentos(idSecretaria, callback) {
  const query =
    "SELECT dd.idDocumento, dd.idUsuario,dd.nombreDoc, td.descripcion, dd.urlDocumento, dd.fecha FROM documentos_docentes AS dd JOIN tipo_documento AS td ON dd.idTipoDocumento = td.idTipoDocumento WHERE dd.idUsuario = ?;";
  db.query(query, [idSecretaria], (error, rows) => {
    if (error) {
      console.log("error:", error);
      callback(error, null);
    } else {
      callback(null, rows);
    }
  });
}

function getTipo(callback) {
  const query = "SELECT * FROM tipo_documento";
  db.query(query, (error, rows) => {
    if (error) {
      callback(error, null);
      console.log("error");
    } else {
      callback(null, rows);
    }
  });
}

function insertarDocumentos(data, callback) {
  const query = "INSERT INTO documentos_docentes SET ?";
  db.query(query, data, (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

function obtenerDocumentosPorId(id, callback) {
  const query = "SELECT * FROM documentos_docentes WHERE idDocumento = ?";
  db.query(query, [id], (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

function actualizarDocumentos(id, data, callback) {
  const query = "UPDATE documentos_docentes SET ? WHERE idDocumento = ?";
  db.query(query, [data, id], (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}
function eliminarDocumentos(id, callback) {
  const query = "DELETE FROM documentos_docentes WHERE idDocumento = ?";
  db.query(query, [id], (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

*/


//funicon para agregar docente el modulo de  de los docentes------------------------


// Nueva función para obtener docentes con rol 'DOCENTE'
function obtenerRoles(callback) {
  // Consulta modificada para filtrar solo los roles que necesitas
  const query = `
    SELECT * FROM public.roles 
    WHERE nombre_rol IN ('ADMINISTRADOR', 'DOCENTE', 'AMINTUTORIAS') 
    ORDER BY id_rol ASC;
  `;

  pool.query(query, (error, results) => {
    if (error) {
      console.error("Error en la consulta al obtener roles:", error);
      callback(error, null);
    } else {
      callback(null, results.rows);
    }
  });
}


function obtenerDocentes(callback) {
  const query = `
    SELECT 
      u.rfc,
      u.nombre,
      u.apellido_paterno,
      u.apellido_materno,
      u.email,
      u.sexo,
      u.status,
      d.n_plaza,
      ARRAY_AGG(ur.id_rol) as roles
    FROM public.usuarios AS u
    INNER JOIN modulo_investigacion.docentes AS d ON u.rfc = d.rfc
    LEFT JOIN public.usuario_roles AS ur ON u.id = ur.id_usuario
    GROUP BY 
      u.rfc, 
      u.nombre, 
      u.apellido_paterno, 
      u.apellido_materno, 
      u.email, 
      u.sexo, 
      u.status, 
      d.n_plaza
    HAVING 
      -- Nos aseguramos de que el rol de DOCENTE (ID 3) esté en el arreglo de roles
      3 = ANY(ARRAY_AGG(ur.id_rol));
  `;
  
  pool.query(query, (error, results) => {
    if (error) {
      console.error("Error al obtener docentes con roles:", error);
      callback(error, null);
    } else {
      callback(null, results.rows);
    }
  });
}


async function insertar_Docente(formData, callback) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // INSERT en 'usuarios' (recibe la contraseña ya hasheada)
    const insertUsuarioQuery = `
      INSERT INTO public.usuarios (rfc, nombre, apellido_paterno, apellido_materno, sexo, password, email)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;
    `;
    const usuarioValues = [
      formData.rfc,
      formData.nombre,
      formData.apellido_paterno,
      formData.apellido_materno,
      formData.sexo,
      formData.password, // ✅ El modelo recibe la contraseña ya hasheada y solo la guarda
      formData.email
    ];
    const newUsuario = await client.query(insertUsuarioQuery, usuarioValues);
    const newUserId = newUsuario.rows[0].id;

    // INSERT en 'docentes'
    const insertDocenteQuery = `
      INSERT INTO modulo_investigacion.docentes (rfc, n_plaza, id_usuario)
      VALUES ($1, $2, $3);
    `;
    await client.query(insertDocenteQuery, [formData.rfc, formData.n_plaza, newUserId]);

    // INSERT en 'usuario_roles'
    if (formData.roles && formData.roles.length > 0) {
      const rolesValues = formData.roles.map(roleId => `(${newUserId}, ${roleId})`).join(',');
      const insertRolesQuery = `INSERT INTO public.usuario_roles (id_usuario, id_rol) VALUES ${rolesValues};`;
      await client.query(insertRolesQuery);
    }

    await client.query('COMMIT');
    callback(null, { message: 'Docente registrado exitosamente', id: newUserId });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error en la transacción al insertar docente:", error);
    callback(error, null);
  } finally {
    client.release();
  }
}


async function editar_Docente(rfc, formData, callback) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. OBTENER EL ID DEL USUARIO
    const userRes = await client.query('SELECT id FROM public.usuarios WHERE rfc = $1', [rfc]);
    if (userRes.rows.length === 0) {
      throw new Error('No se encontró el docente para editar.');
    }
    const userId = userRes.rows[0].id;

    // 2. ACTUALIZAR la tabla 'usuarios'
    // Se construye la consulta dinámicamente por si la contraseña no cambia
    const userFields = {
      nombre: formData.nombre,
      apellido_paterno: formData.apellido_paterno,
      apellido_materno: formData.apellido_materno,
      sexo: formData.sexo,
      email: formData.email,
    };

    // Solo añadimos la contraseña a la actualización si se proporcionó una nueva
    if (formData.password) {
      userFields.password = formData.password;
    }
    
    const userSetString = Object.keys(userFields).map((key, index) => `"${key}" = $${index + 1}`).join(', ');
    const userValues = Object.values(userFields);
    
    const updateUserQuery = `UPDATE public.usuarios SET ${userSetString} WHERE rfc = $${userValues.length + 1}`;
    await client.query(updateUserQuery, [...userValues, rfc]);

    // 3. ACTUALIZAR la tabla 'docentes'
    const updateDocenteQuery = `UPDATE modulo_investigacion.docentes SET n_plaza = $1 WHERE rfc = $2`;
    await client.query(updateDocenteQuery, [formData.n_plaza, rfc]);

    // 4. ACTUALIZAR ROLES (Borrar los viejos e insertar los nuevos)
    // Primero, borramos todos los roles actuales de ese usuario
    await client.query('DELETE FROM public.usuario_roles WHERE id_usuario = $1', [userId]);

    // Luego, insertamos los nuevos roles que vienen del formulario
    if (formData.roles && formData.roles.length > 0) {
      const rolesValues = formData.roles.map(roleId => `(${userId}, ${roleId})`).join(',');
      const insertRolesQuery = `INSERT INTO public.usuario_roles (id_usuario, id_rol) VALUES ${rolesValues};`;
      await client.query(insertRolesQuery);
    }

    // 5. Si todo fue exitoso, confirmar la transacción
    await client.query('COMMIT');
    callback(null, { message: 'Docente actualizado exitosamente.' });

  } catch (error) {
    // Si algo falla, revertir todo
    await client.query('ROLLBACK');
    console.error("Error en la transacción al editar docente:", error);
    callback(error, null);
  } finally {
    // Liberar la conexión
    client.release();
  }
}


async function eliminar_Docente(rfc, callback) {
  // Iniciamos un cliente para manejar la transacción
  const client = await pool.connect();

  try {
    // Inicia la transacción
    await client.query('BEGIN');

    // 1. PRIMERO: Obtenemos el ID del usuario usando el RFC
    // Lo necesitamos para borrar de 'usuario_roles'
    const res = await client.query('SELECT id FROM public.usuarios WHERE rfc = $1', [rfc]);
    if (res.rows.length === 0) {
      throw new Error('No se encontró un usuario con ese RFC.');
    }
    const userId = res.rows[0].id;

    // 2. SEGUNDO: Eliminamos sus roles en la tabla 'usuario_roles'
    await client.query('DELETE FROM public.usuario_roles WHERE id_usuario = $1', [userId]);

    // 3. TERCERO: Eliminamos el registro de la tabla 'docentes'
    await client.query('DELETE FROM modulo_investigacion.docentes WHERE rfc = $1', [rfc]);

    // 4. FINALMENTE: Eliminamos el registro de la tabla 'usuarios'
    const deleteUserResult = await client.query('DELETE FROM public.usuarios WHERE rfc = $1', [rfc]);

    // Si todo salió bien, confirmamos la transacción
    await client.query('COMMIT');

    // Verificamos si realmente se eliminó algo en el último paso
    if (deleteUserResult.rowCount > 0) {
      callback(null, { message: 'Docente eliminado exitosamente.' });
    } else {
      // Esto no debería pasar si el paso 1 tuvo éxito, pero es una salvaguarda
      throw new Error('No se pudo eliminar el usuario principal.');
    }

  } catch (error) {
    // Si algo falla, revertimos todos los cambios
    await client.query('ROLLBACK');
    console.error("Error en la transacción al eliminar docente:", error);
    callback(error, null);
  } finally {
    // Liberamos la conexión de vuelta a la pool
    client.release();
  }
}
/*
module.exports = {
  showAll,
  insertarDocente,
  editarDocente,
  eliminarDocente,

  getTipo,
  obtenerDocumentos,
  insertarDocumentos,
  obtenerDocumentosPorId,
  actualizarDocumentos,
  eliminarDocumentos,


  
  
  
  
*/
module.exports = {
  insertarDocumentoDocente,


  obtenerDocentes,
  obtenerRoles,
  insertar_Docente,
  eliminar_Docente,
  editar_Docente,
};