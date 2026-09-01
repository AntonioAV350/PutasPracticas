'use strict';

const {
  obtenerPorMatricula,
  obtenerUna,
  guardarCalificacion,
} = require('../../models/practicas/calificaciones_model');

exports.listarPorMatricula = async (req, res) => {
  try {
    const matricula = String(req.params.matricula || '').trim().toUpperCase();
    if (!matricula) return res.status(400).json({ ok: false, error: 'Matrícula requerida.' });
    const data = await obtenerPorMatricula(matricula);
    return res.json({ ok: true, data });
  } catch (error) {
    console.error('[calificaciones_controller:listarPorMatricula]', error);
    return res.status(500).json({ ok: false, error: error.message || 'Error interno.' });
  }
};

exports.obtenerCalificacion = async (req, res) => {
  try {
    const matricula = String(req.params.matricula || '').trim().toUpperCase();
    const practica = String(req.params.practica || '').trim().toUpperCase();
    if (!matricula || !practica) {
      return res.status(400).json({ ok: false, error: 'Matrícula y práctica son requeridas.' });
    }
    const data = await obtenerUna(matricula, practica);
    if (!data) return res.status(404).json({ ok: false, error: 'Sin calificación registrada.' });
    return res.json({ ok: true, data });
  } catch (error) {
    console.error('[calificaciones_controller:obtenerCalificacion]', error);
    return res.status(500).json({ ok: false, error: error.message || 'Error interno.' });
  }
};

exports.guardar = async (req, res) => {
  try {
    const data = await guardarCalificacion(req.body || {});
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    console.error('[calificaciones_controller:guardar]', error);
    const status = /requerida|inválida|número|entre 0 y 10/i.test(error.message || '')
      ? 400
      : 500;
    return res.status(status).json({ ok: false, error: error.message || 'No se pudo guardar.' });
  }
};
