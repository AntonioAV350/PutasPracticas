'use strict';

const pool = require('../../config/db.config');

const PERIODOS_VALIDOS = new Set(['ENE-MAY', 'AGO-NOV', 'ENE-JUN', 'JUN-DIC']);
let schemaReady = false;

async function ensureFechasTable() {
  if (schemaReady) return;
  await pool.query(`CREATE SCHEMA IF NOT EXISTS modulo_practicas;`);
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'periodo_label' AND typnamespace = 'modulo_practicas'::regnamespace
      ) THEN
        EXECUTE 'CREATE TYPE modulo_practicas.periodo_label AS ENUM (''ENE-MAY'', ''AGO-NOV'', ''ENE-JUN'', ''JUN-DIC'')';
      END IF;
    END $$;
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS modulo_practicas.fechas (
      id_fecha SERIAL PRIMARY KEY,
      nombre_documento VARCHAR(150) NOT NULL,
      periodo modulo_practicas.periodo_label DEFAULT 'ENE-MAY',
      fecha_apertura DATE NOT NULL,
      fecha_cierre DATE NOT NULL,
      CONSTRAINT fechas_rango_valido CHECK (fecha_cierre > fecha_apertura)
    );
  `).catch(async (err) => {
    if (err.code === '42P07') return; // type exists
    throw err;
  });
  schemaReady = true;
}

function normalizeDateString(value, field) {
  if (!value) throw new Error(`'${field}' es requerido.`);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error(`'${field}' no tiene un formato de fecha válido (YYYY-MM-DD).`);
  return value;
}

function normalizePayload(data = {}) {
  const nombre = String(data.nombre_documento || '').trim();
  if (!nombre) throw new Error('El nombre del documento es requerido.');

  const periodo = String(data.periodo || '').trim().toUpperCase();
  if (!PERIODOS_VALIDOS.has(periodo)) {
    throw new Error(`Periodo inválido. Valores aceptados: ${[...PERIODOS_VALIDOS].join(', ')}.`);
  }

  const fecha_apertura = normalizeDateString(data.fecha_apertura, 'fecha_apertura');
  const fecha_cierre = normalizeDateString(data.fecha_cierre, 'fecha_cierre');

  if (new Date(fecha_cierre) <= new Date(fecha_apertura)) {
    throw new Error('La fecha de cierre debe ser posterior a la de apertura.');
  }

  return { nombre_documento: nombre, periodo, fecha_apertura, fecha_cierre };
}

function mapRow(row) {
  return {
    id: row.id_fecha,
    nombre_documento: row.nombre_documento,
    periodo: row.periodo,
    fecha_apertura: row.fecha_apertura?.toISOString?.().slice(0, 10) || row.fecha_apertura,
    fecha_cierre: row.fecha_cierre?.toISOString?.().slice(0, 10) || row.fecha_cierre,
  };
}

async function listarFechas() {
  await ensureFechasTable();
  const { rows } = await pool.query(
    `SELECT id_fecha, nombre_documento, periodo, fecha_apertura, fecha_cierre
     FROM modulo_practicas.fechas
     ORDER BY fecha_apertura DESC`
  );
  return rows.map(mapRow);
}

async function crearFecha(data = {}) {
  await ensureFechasTable();
  const payload = normalizePayload(data);
  const { rows } = await pool.query(
    `INSERT INTO modulo_practicas.fechas (nombre_documento, periodo, fecha_apertura, fecha_cierre)
     VALUES ($1, $2, $3, $4)
     RETURNING id_fecha, nombre_documento, periodo, fecha_apertura, fecha_cierre`,
    [payload.nombre_documento, payload.periodo, payload.fecha_apertura, payload.fecha_cierre]
  );
  return mapRow(rows[0]);
}

async function actualizarFecha(id, data = {}) {
  await ensureFechasTable();
  if (!id) throw new Error('ID requerido para actualizar.');
  const payload = normalizePayload(data);
  const { rows } = await pool.query(
    `UPDATE modulo_practicas.fechas
     SET nombre_documento = $1,
         periodo = $2,
         fecha_apertura = $3,
         fecha_cierre = $4
     WHERE id_fecha = $5
     RETURNING id_fecha, nombre_documento, periodo, fecha_apertura, fecha_cierre`,
    [payload.nombre_documento, payload.periodo, payload.fecha_apertura, payload.fecha_cierre, id]
  );
  if (!rows.length) throw new Error('Registro no encontrado.');
  return mapRow(rows[0]);
}

async function eliminarFecha(id) {
  await ensureFechasTable();
  if (!id) throw new Error('ID requerido para eliminar.');
  const { rowCount } = await pool.query(
    `DELETE FROM modulo_practicas.fechas WHERE id_fecha = $1`,
    [id]
  );
  if (!rowCount) throw new Error('Registro no encontrado.');
  return true;
}

module.exports = {
  listarFechas,
  crearFecha,
  actualizarFecha,
  eliminarFecha,
};
