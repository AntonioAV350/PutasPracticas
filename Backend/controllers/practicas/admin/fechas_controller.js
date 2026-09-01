'use strict';

const {
  listarFechas,
  crearFecha,
  actualizarFecha,
  eliminarFecha,
} = require('../../../models/practicas/admin/fechas_model');

async function handle(action, res) {
  try {
    const data = await action();
    return data;
  } catch (error) {
    console.error('[fechas_controller]', error);
    if (!res.headersSent) {
      const status = error.message === 'Registro no encontrado.' ? 404 : 400;
      res.status(status).json({ ok: false, error: error.message });
    }
    return null;
  }
}

exports.obtenerFechas = async (req, res) => {
  const data = await handle(() => listarFechas(), res);
  if (data) res.json({ ok: true, data });
};

exports.crear = async (req, res) => {
  const data = await handle(() => crearFecha(req.body || {}), res);
  if (data) res.status(201).json({ ok: true, data });
};

exports.actualizar = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ ok: false, error: 'ID inválido.' });
  const data = await handle(() => actualizarFecha(id, req.body || {}), res);
  if (data) res.json({ ok: true, data });
};

exports.eliminar = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ ok: false, error: 'ID inválido.' });
  const ok = await handle(() => eliminarFecha(id), res);
  if (ok) res.json({ ok: true });
};
