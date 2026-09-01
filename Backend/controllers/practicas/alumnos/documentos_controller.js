'use strict';

const DocumentosModel = require('../../../models/practicas/alumnos/documentos_model');
const AlumnoModel = require('../../../models/practicas/alumnos/usuariosAlumnos_model');

async function getMisDocumentos(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ ok: false, error: 'No autorizado. Debes iniciar sesión.' });
    }

    const alumnoInfo = await AlumnoModel.findAlumnoByUsuarioId(req.user.id);
    if (!alumnoInfo || !alumnoInfo.matricula) {
      return res.status(404).json({ ok: false, error: 'No se encontraron datos de alumno para este usuario.' });
    }
    
    const matricula = alumnoInfo.matricula;
    const documentos = await DocumentosModel.getDocumentosForAlumno(matricula);
    
    res.json({ ok: true, data: documentos });

  } catch (error) {
    console.error('[documentos_controller getMisDocumentos]', error);
    res.status(500).json({ ok: false, error: error.message || 'Error interno del servidor.' });
  }
}

module.exports = {
  getMisDocumentos,
};