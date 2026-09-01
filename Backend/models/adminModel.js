const db = require("../config/db.config");
/**
 * Obtiene todos los usuarios de la base de datos.
 * @param {function} callback - Función de devolución de llamada que se ejecuta después de obtener los usuarios.
 * @returns {void}
 */
function getUsuarios(callback) {
  const query = `
  SELECT
    us.rfc,
    us.nombre_Doce,
    us.apellido_paterno,
    us.apellido_materno,
    us.n_plaza,
    us.sexo,
    us.email as correo,
    us.status,
    COALESCE(GROUP_CONCAT(DISTINCT p.descripcion), 'Sin permiso') AS permisos,
    COALESCE(GROUP_CONCAT(DISTINCT  p.idPermisos), 'Sin permiso') AS idPermisos
FROM
    usuarios us
LEFT JOIN
    usuarios_permisos up ON us.rfc = up.idUsuario
LEFT JOIN
    permisos p ON up.idPermiso = p.idPermisos
GROUP BY
    us.rfc;

  `;
  db.query(query, (error, rows) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, rows);
    }
  });
}

function insertUsuario(usuario, callback) {
  const query = "INSERT INTO usuarios SET ?";
  db.query(query, usuario, (error, rows) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, rows);
    }
  });
}

function updateUsuario(rfc, usuario, callback) {
  console.log(rfc);
  console.log(usuario);
  const query = "UPDATE usuarios SET ? WHERE rfc = ?";
  db.query(query, [usuario, rfc], (error, rows) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, rows);
    }
  });
}

/**
 * Busca los permisos de un usuario por su RFC.
 * @param {string} rfc - El RFC del usuario.
 * @returns {Promise<object>} - Una promesa que se resuelve con los permisos del usuario.
 */
function findPermisosByRFC(rfc, callback) {
  const query = "SELECT * FROM usuarios_permisos WHERE idUsuario = ?";
  db.query(query, [rfc], (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

function givePermisos(data, callback) {
  // Construir la parte de la consulta VALUES
  const values = data
    .map(({ idPermiso, idUsuario }) => `(${idPermiso}, '${idUsuario}')`)
    .join(",");
  console.log(values);
  // Construir la consulta SQL completa
  const query = `INSERT INTO usuarios_permisos (idPermiso, idUsuario) VALUES ${values}`;
  console.log(query);
  db.query(query, (error, results) => {
    if (error) {
      callback(error, null);
      console.log(error);
    } else {
      callback(null, results);
    }
  });
}

function deletePermisos(idPermiso, idUsuario, callback) {
  // Construir la parte de la consulta VALUES
  const permisosString = idPermiso.join(",");
  // Construir la consulta SQL completa
  const query = `DELETE FROM usuarios_permisos WHERE idPermiso IN (${permisosString}) AND idUsuario = ?`;
  console.log(query);

  db.query(query, [idUsuario], (error, results) => {
    if (error) {
      callback(error, null);
      console.log(error);
    } else {
      callback(null, results);
    }
  });
}

module.exports = {
  getUsuarios,
  insertUsuario,
  updateUsuario,
  findPermisosByRFC,
  givePermisos,
  deletePermisos,
};
