'use strict';

const DocumentosAdminModel = require('../../../models/practicas/admin/documentos_model');

/**
 * Endpoint para que un administrador apruebe o rechace un documento.
 */
async function reviewDocumento(req, res) {
  try {
    const { id_doc } = req.params;
    const { estado, comentarios } = req.body;

    if (!estado) {
      return res.status(400).json({ ok: false, error: "El campo 'estado' es requerido." });
    }

    // Aquí podríamos añadir lógica para verificar que el usuario es un admin con permisos
    // if (!req.user.roles.includes('ADMIN_PRACTICAS')) { ... }

    const updatedDoc = await DocumentosAdminModel.setDocumentoStatus(id_doc, estado, { comentarios });

    res.json({ ok: true, data: updatedDoc });

  } catch (error) {
    console.error('[documentos_admin_controller reviewDocumento]', error);
    if (error.message.includes("No se encontró")) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    res.status(500).json({ ok: false, error: error.message || 'Error interno del servidor.' });
  }
}

module.exports = {
  reviewDocumento,
};
