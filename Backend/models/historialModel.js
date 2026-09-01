const db = require("../config/db.config");

exports.getHistorial = (rfc) => {
  return new Promise((resolve, reject) => {
    const query = `
                SELECT * FROM historial_cambios
            `;

    db.query(query, [rfc], (error, results) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(results);
    });
  });
};

exports.setHistorial = (data) => { 
  return new Promise((resolve, reject) => {
    const query = `
                INSERT INTO historial_cambios (idusuario,tabla_afectada,valor_anterior,valor_nuevo) VALUES (?, ?, ?, ?,?)
            `;

    db.query(
      query,
      [
        data.idusuario,
        data.tabla_afectada,
        data.valor_anterior,
        data.valor_nuevo,
      ],
      (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(results);
      }
    );
  });
};
