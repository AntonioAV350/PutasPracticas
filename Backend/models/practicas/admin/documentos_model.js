'use strict';

const pool = require('../../../config/db.config');

const ESTADOS_VALIDOS = new Set(['APROBADO', 'RECHAZADO', 'PENDIENTE']);

/**
 * Actualiza el estado de revisión de un documento de alumno.
 * @param {number} id_doc - El ID del documento en la tabla documentos_alumno.
 * @param {string} estado - El nuevo estado ('APROBado', 'RECHAZADO').
 * @param {object} [options] - Opciones adicionales (ej. comentarios).
 * @returns {object} El documento actualizado.
 */
async function setDocumentoStatus(id_doc, estado, options = {}) {
  const estadoUpper = String(estado).toUpperCase();
  if (!ESTADOS_VALIDOS.has(estadoUpper)) {
    throw new Error(`Estado de revisión inválido: ${estado}`);
  }

  if (!id_doc || !Number.isFinite(Number(id_doc))) {
    throw new Error("Se requiere un ID de documento válido.");
  }
  
  // Por ahora, solo actualizamos el estado.
  // Podríamos añadir una tabla de historial de revisiones en el futuro.
  const sql = `
    UPDATE modulo_practicas.documentos_alumno
    SET estado_revision = $1
    WHERE id_doc = $2
    RETURNING *;
  `;

  const { rows } = await pool.query(sql, [estadoUpper, id_doc]);

  if (rows.length === 0) {
    throw new Error("No se encontró ningún documento con el ID proporcionado.");
  }

  return rows[0];
}

module.exports = {
  setDocumentoStatus,
};
