'use strict';

const pool = require('../../../config/db.config');
const { listarFechas } = require('../fechas_model');

// Mapeo de claves del frontend a los tipos de la BD
const DOC_KEY_TO_TIPO = {
  'hoja-presentacion': 'HOJA_PRESENTACION',
  'presentacion': 'CARTA_PRESENTACION',
  'aceptacion': 'CARTA_ACEPTACION',
  'liberacion': 'CARTA_LIBERACION',
  'reporte': 'REPORTE_FINAL',
  'encuesta': 'ENCUESTA_SATISFACCION',
};

// Lista estática de documentos requeridos, similar a la del frontend
const DOCUMENTOS_REQUERIDOS = [
  { key: 'hoja-presentacion', title: 'Hoja de Presentación' },
  { key: 'presentacion', title: 'Carta de Presentación' },
  { key: 'aceptacion', title: 'Carta de Aceptación' },
  { key: 'liberacion', title: 'Carta de Liberación' },
  { key: 'reporte', title: 'Reporte Final' },
  {
    key: 'encuesta',
    title: 'Encuesta de Satisfacción',
    formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScdGeWTGoSVFrSS3WN19zCPV1abo_wYGOcpcb3EXfzY6itiEg/viewform?usp=header',
    help: 'Llénala en línea. Sube la evidencia de que se contesto.',
  },
];

// Función para obtener los documentos de un alumno específico
async function getDocumentosForAlumno(matricula) {
  if (!matricula) {
    throw new Error("Matrícula no proporcionada.");
  }

  // 1. Obtener todas las fechas configuradas por el admin
  const allFechas = await listarFechas();

  // 2. Obtener todos los documentos ya subidos por el alumno para TODAS las prácticas
  const { rows: uploadedDocs } = await pool.query(
    `SELECT practica, doc_tipo, estado_revision, nombre_archivo, ruta_relativa
     FROM modulo_practicas.documentos_alumno
     WHERE matricula = $1`,
    [matricula]
  );

  const now = new Date();

  // 3. Crear una estructura para agrupar por práctica
  const docsByPractica = {
    P1: [],
    P2: [],
    RES: [],
  };

  // Iterar sobre cada tipo de práctica (P1, P2, RES)
  for (const practica of Object.keys(docsByPractica)) {
    // Para cada práctica, construir la lista de documentos requeridos
    docsByPractica[practica] = DOCUMENTOS_REQUERIDOS.map(doc => {
      const docTipoBd = DOC_KEY_TO_TIPO[doc.key];

      // Encontrar la fecha para este documento (asumiendo que las fechas no son específicas de P1/P2/RES)
      const fechaInfo = allFechas.find(f => f.nombre_documento.toUpperCase().replace(/\s+/g, '') === doc.title.toUpperCase().replace(/\s+/g, ''));
      
      // Encontrar el documento subido para la práctica y tipo de documento actual
      const uploaded = uploadedDocs.find(u => u.practica === practica && u.doc_tipo === docTipoBd);

      let isLocked = true;
      let statusLabel = 'Bloqueado';

      if (fechaInfo) {
        const apertura = new Date(fechaInfo.fecha_apertura);
        const cierre = new Date(fechaInfo.fecha_cierre);
        cierre.setHours(23, 59, 59, 999);

        if (now < apertura) {
          isLocked = true;
          statusLabel = `Abre el ${fechaInfo.fecha_apertura}`;
        } else if (now > cierre) {
          isLocked = true;
          statusLabel = 'Periodo cerrado';
        } else {
          isLocked = false;
          statusLabel = `Abierto hasta ${fechaInfo.fecha_cierre}`;
        }
      }

      if (uploaded) {
        if (uploaded.estado_revision === 'APROBADO') {
          isLocked = true;
          statusLabel = 'Aceptado';
        } else if (uploaded.estado_revision === 'RECHAZADO') {
          isLocked = false;
          statusLabel = 'Rechazado, vuelve a subirlo';
        } else { // PENDIENTE
          isLocked = false; // Debería poder ver el estado
          statusLabel = 'En revisión';
        }
      }

      return {
        ...doc,
        practica,
        fecha_apertura: fechaInfo?.fecha_apertura || null,
        fecha_cierre: fechaInfo?.fecha_cierre || null,
        estado_revision: uploaded?.estado_revision || null,
        nombre_archivo: uploaded?.nombre_archivo || null,
        is_locked: isLocked,
        status_label: statusLabel,
      };
    });

    // Lógica especial para la encuesta (dentro de cada práctica)
    const encuesta = docsByPractica[practica].find(d => d.key === 'encuesta');
    if (encuesta) {
      const otrosDocs = docsByPractica[practica].filter(d => d.key !== 'encuesta');
      const todosAprobados = otrosDocs.every(d => d.estado_revision === 'APROBADO');

      if (!todosAprobados && !encuesta.estado_revision) {
        encuesta.is_locked = true;
        encuesta.status_label = 'Se desbloquea al aceptar los demás documentos.';
      }
    }
  }

  return docsByPractica;
}

// TODO: Crear funciones para el admin (aprobar/rechazar)
// async function setDocumentoStatus(id_doc, estado, adminUser) { ... }

module.exports = {
  getDocumentosForAlumno,
};
