'use strict';

const pool = require('../../config/db.config');

const PRACTICAS_VALIDAS = new Set(['P1', 'P2', 'RES']);

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  await pool.query(`CREATE SCHEMA IF NOT EXISTS modulo_practicas;`);
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'practica_tipo' AND typnamespace = 'modulo_practicas'::regnamespace
      ) THEN
        EXECUTE 'CREATE TYPE modulo_practicas.practica_tipo AS ENUM (''P1'',''P2'',''RES'')';
      END IF;
    END $$;
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS modulo_practicas.calificaciones (
      id_calificacion SERIAL PRIMARY KEY,
      matricula VARCHAR(30) NOT NULL REFERENCES public.alumnos(matricula) ON DELETE CASCADE,
      practica modulo_practicas.practica_tipo NOT NULL,
      calificacion NUMERIC(5,2) NOT NULL CHECK (calificacion >= 0 AND calificacion <= 10),
      observaciones TEXT,
      actualizado_en TIMESTAMP DEFAULT now(),
      UNIQUE (matricula, practica)
    );
  `);
  tableReady = true;
}

function normalizePayload(data = {}) {
  const matricula = String(data.matricula || '').trim().toUpperCase();
  if (!matricula) throw new Error('La matrícula es requerida.');

  const practica = String(data.practica || '').trim().toUpperCase();
  if (!PRACTICAS_VALIDAS.has(practica)) {
    throw new Error("Práctica inválida. Usa 'P1', 'P2' o 'RES'.");
  }

  const calificacion = Number(data.calificacion);
  if (!Number.isFinite(calificacion)) throw new Error('La calificación debe ser un número.');
  if (calificacion < 0 || calificacion > 10) throw new Error('La calificación debe estar entre 0 y 10.');

  const observaciones = data.observaciones ? String(data.observaciones).trim() : null;
  return { matricula, practica, calificacion, observaciones };
}

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id_calificacion,
    matricula: row.matricula,
    practica: row.practica,
    calificacion: Number(row.calificacion),
    observaciones: row.observaciones,
    actualizado_en: row.actualizado_en,
  };
}

async function obtenerPorMatricula(matricula) {
  await ensureTable();
  const { rows } = await pool.query(
    `SELECT id_calificacion, matricula, practica, calificacion, observaciones, actualizado_en
     FROM modulo_practicas.calificaciones
     WHERE matricula = $1`,
    [matricula],
  );
  return rows.map(mapRow);
}

async function obtenerUna(matricula, practica) {
  await ensureTable();
  const { rows } = await pool.query(
    `SELECT id_calificacion, matricula, practica, calificacion, observaciones, actualizado_en
     FROM modulo_practicas.calificaciones
     WHERE matricula = $1 AND practica = $2
     LIMIT 1`,
    [matricula, practica],
  );
  return mapRow(rows[0]);
}

async function guardarCalificacion(data = {}) {
  await ensureTable();
  const payload = normalizePayload(data);
  const { rows } = await pool.query(
    `INSERT INTO modulo_practicas.calificaciones (matricula, practica, calificacion, observaciones)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (matricula, practica)
     DO UPDATE SET calificacion = EXCLUDED.calificacion,
                   observaciones = EXCLUDED.observaciones,
                   actualizado_en = now()
     RETURNING id_calificacion, matricula, practica, calificacion, observaciones, actualizado_en`,
    [payload.matricula, payload.practica, payload.calificacion, payload.observaciones],
  );
  return mapRow(rows[0]);
}

module.exports = {
  obtenerPorMatricula,
  obtenerUna,
  guardarCalificacion,
};
