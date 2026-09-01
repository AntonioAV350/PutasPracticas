// models/usuariosAlumnos.model.js
'use strict';

const bcrypt = require('bcrypt');
const pool = require('../../../config/db.config');

// Valores válidos para 'sexo'
const SEXO_PERMITIDO = new Set(['MASCULINO', 'FEMENINO', 'OTRO']);
const CARRERAS_CATALOGO = {
  LIDTS: {
    clave: 'LIDTS',
    nombre: 'Ingeniería en Desarrollo y Tecnologías de Software',
    alias: ['Ingeniería en Software'],
    id_facultad: null,
  },
  LCP: {
    clave: 'LCP',
    nombre: 'Licenciatura en Contaduría',
    alias: ['Contaduría'],
    id_facultad: null,
  },
};

function pickClaveCarrera(data = {}) {
  const raw =
    data.carrera_clave ||
    data.licenciatura ||
    data.carrera ||
    data.carreraCodigo ||
    data.carrera_codigo ||
    data.carreraClave;
  if (!raw) return null;
  const clave = String(raw).trim().toUpperCase();
  return clave || null;
}

async function resolveCarreraId(client, data = {}) {
  if (!client) throw new Error('DB client requerido para resolver carrera.');
  if (data.id_carrera) return data.id_carrera;

  const clave = pickClaveCarrera(data);
  const meta = clave ? CARRERAS_CATALOGO[clave] : null;

  const candidatos = [];
  if (typeof data.carrera_nombre === 'string') candidatos.push(data.carrera_nombre.trim());
  if (meta?.nombre) candidatos.push(meta.nombre);
  if (Array.isArray(meta?.alias)) candidatos.push(...meta.alias);

  const nombres = Array.from(
    new Set(
      candidatos
        .map((n) => (typeof n === 'string' ? n.trim() : ''))
        .filter(Boolean),
    ),
  );

  for (const nombre of nombres) {
    const { rows } = await client.query(
      'SELECT id_carrera FROM public.carreras WHERE LOWER(nombre_carrera) = LOWER($1) LIMIT 1',
      [nombre],
    );
    if (rows?.[0]?.id_carrera) return rows[0].id_carrera;
  }

  if (nombres.length) {
    const nombre = nombres[0];
    const { rows } = await client.query(
      'INSERT INTO public.carreras (nombre_carrera, id_facultad) VALUES ($1, $2) RETURNING id_carrera',
      [nombre, meta?.id_facultad ?? null],
    );
    return rows?.[0]?.id_carrera ?? null;
  }

  return null;
}

/** Normaliza y traduce algunos errores comunes de Postgres a mensajes legibles */
function mapPgError(err) {
  if (!err || !err.code) return err;

  if (err.code === '23505') { // UNIQUE VIOLATION
    if (err.detail?.includes('usuarios_username_key')) err.message = 'El username ya existe.';
    else if (err.detail?.includes('usuarios_rfc_key')) err.message = 'El RFC ya existe.';
    else if (err.detail?.includes('alumnos_matricula_key')) err.message = 'La matrícula ya existe.';
    else if (err.detail?.includes('alumnos_id_usuario_key')) err.message = 'Ese usuario ya tiene registro de alumno.';
    else if (err.constraint) err.message = `Violación de restricción UNIQUE (${err.constraint}).`;
    else err.message = 'Violación de restricción UNIQUE.';
  }

  if (err.code === '23503') { // FOREIGN KEY VIOLATION
    if (err.detail?.includes('alumnos_id_carrera_fkey')) err.message = 'id_carrera no existe en la tabla carreras.';
    else if (err.detail?.includes('alumnos_id_usuario_fkey')) err.message = 'id_usuario no existe en usuarios.';
    else err.message = 'Violación de llave foránea.';
  }

  if (err.code === '23514') { // CHECK VIOLATION
    err.message = "Violación de CHECK (verifica valores como 'sexo').";
  }
  return err;
}

/** Helper: valida/normaliza campos comunes de usuario */
function sanitizeUsuario(data = {}) {
  if (!data.password) throw new Error('La contraseña es requerida.');
  if (data.status === undefined || data.status === null) data.status = 1;

  if (data.sexo) {
    const sexo = String(data.sexo).toUpperCase();
    if (!SEXO_PERMITIDO.has(sexo)) {
      throw new Error("Valor de 'sexo' inválido. Use: 'MASCULINO' | 'FEMENINO' | 'OTRO'.");
    }
    data.sexo = sexo;
  }

  if (data.rfc && data.rfc.length > 13) throw new Error('RFC no puede exceder 13 caracteres.');
  if (data.username && data.username.length > 50) throw new Error('username no puede exceder 50 caracteres.');
  if (data.nombre && data.nombre.length > 100) throw new Error('nombre no puede exceder 100 caracteres.');

  return data;
}

/** INSERT a public.usuarios */
async function insertUsuario(data = {}) {
  const client = await pool.connect();
  try {
    sanitizeUsuario(data);

    const passwordHash = await bcrypt.hash(String(data.password), 12);

    const sql = `
      INSERT INTO public.usuarios
        (rfc, username, password, nombre, apellido_paterno, apellido_materno, email, telefono, sexo, status)
      VALUES
        ($1,  $2,       $3,       $4,     $5,               $6,               $7,   $8,       $9,   $10)
      RETURNING id, rfc, username, email, sexo, status, fecha_creacion
    `;
    const params = [
      data.rfc ?? null,
      data.username ?? null,
      passwordHash,
      data.nombre ?? null,
      data.apellido_paterno ?? null,
      data.apellido_materno ?? null,
      data.email ?? null,
      data.telefono ?? null,
      data.sexo ?? null,
      data.status ?? null, // null → DEFAULT (1)
    ];

    const { rows } = await client.query(sql, params);
    return { ok: true, usuario: rows[0] };
  } catch (error) {
    const err = mapPgError(error);
    return { ok: false, error: err.message, pgCode: err.code };
  } finally {
    client.release();
  }
}

/** INSERT a public.alumnos (requiere id_usuario existente) */
async function insertAlumno(data = {}) {
  const client = await pool.connect();
  try {
    if (!data.id_usuario) throw new Error('id_usuario es requerido.');
    if (!data.matricula) throw new Error('matricula es requerida.');
    if (data.matricula.length > 30) throw new Error('matricula no puede exceder 30 caracteres.');
    if (data.grupo && data.grupo.length > 10) throw new Error('grupo no puede exceder 10 caracteres.');
    const carreraId = await resolveCarreraId(client, data);

    const sql = `
      INSERT INTO public.alumnos
        (id_usuario, matricula, grado, grupo, id_carrera)
      VALUES
        ($1,         $2,        $3,    $4,    $5)
      RETURNING id_alumno, id_usuario, matricula, grado, grupo, id_carrera
    `;
    const params = [
      data.id_usuario,
      data.matricula,
      data.grado ?? null,
      data.grupo ?? null,
      carreraId ?? null,
    ];

    const { rows } = await client.query(sql, params);
    return { ok: true, alumno: rows[0] };
  } catch (error) {
    const err = mapPgError(error);
    return { ok: false, error: err.message, pgCode: err.code };
  } finally {
    client.release();
  }
}

/**
 * TRANSACCIÓN COMPLETA:
 * 1) Crea usuario
 * 2) Asigna ROL = ESTUDIANTE (+ opcional permiso 'Practicas')
 * 3) Crea alumno ligado a ese usuario
 */
async function createAlumnoConUsuario(payload = {}) {
  const client = await pool.connect();
  try {
    const { usuario, alumno } = payload;
    if (!usuario || !alumno) throw new Error("Debe enviar { usuario, alumno }.");

    // Validación/normalización previa
    sanitizeUsuario(usuario);
    if (!alumno.matricula) throw new Error('matricula es requerida.');
    if (alumno.matricula.length > 30) throw new Error('matricula no puede exceder 30 caracteres.');
    if (alumno.grupo && alumno.grupo.length > 10) throw new Error('grupo no puede exceder 10 caracteres.');

    await client.query('BEGIN');

    // 1) Usuario
    const passwordHash = await bcrypt.hash(String(usuario.password), 12);
    const sqlU = `
      INSERT INTO public.usuarios
        (rfc, username, password, nombre, apellido_paterno, apellido_materno, email, telefono, sexo, status)
      VALUES
        ($1,  $2,       $3,       $4,     $5,               $6,               $7,   $8,       $9,   $10)
      RETURNING id, rfc, username, email, sexo, status, fecha_creacion
    `;
    const paramsU = [
      usuario.rfc ?? null,
      usuario.username ?? null,
      passwordHash,
      usuario.nombre ?? null,
      usuario.apellido_paterno ?? null,
      usuario.apellido_materno ?? null,
      usuario.email ?? null,
      usuario.telefono ?? null,
      usuario.sexo ?? null,
      usuario.status ?? null,
    ];
    const { rows: ru } = await client.query(sqlU, paramsU);
    const u = ru[0];

    // 2) Rol ESTUDIANTE
    const { rows: rRol } = await client.query(
      `SELECT id_rol FROM public.roles WHERE nombre_rol = 'ESTUDIANTE' LIMIT 1`
    );
    if (!rRol?.[0]?.id_rol) {
      throw new Error("No existe el rol 'ESTUDIANTE' en public.roles");
    }
    await client.query(
      `INSERT INTO public.usuario_roles (id_usuario, id_rol)
       VALUES ($1, $2)
       ON CONFLICT (id_usuario, id_rol) DO NOTHING`,
      [u.id, rRol[0].id_rol]
    );

    // 2b) (Opcional) Permiso 'Practicas'
    const { rows: rPerm } = await client.query(
      `SELECT id_permiso FROM public.permisos WHERE lower(nombre) = lower('Practicas') LIMIT 1`
    );
    if (rPerm?.[0]?.id_permiso) {
      await client.query(
        `INSERT INTO public.permisos_usuario (id_usuario, id_permiso)
         VALUES ($1, $2)
         ON CONFLICT (id_usuario, id_permiso) DO NOTHING`,
        [u.id, rPerm[0].id_permiso]
      );
    }

    // 3) Alumno
    const carreraId = await resolveCarreraId(client, alumno);
    const sqlA = `
      INSERT INTO public.alumnos
        (id_usuario, matricula, grado, grupo, id_carrera)
      VALUES
        ($1,         $2,        $3,    $4,    $5)
      RETURNING id_alumno, id_usuario, matricula, grado, grupo, id_carrera
    `;
    const paramsA = [
      u.id,
      alumno.matricula,
      alumno.grado ?? null,
      alumno.grupo ?? null,
      carreraId ?? null,
    ];
    const { rows: ra } = await client.query(sqlA, paramsA);
    const a = ra[0];

    await client.query('COMMIT');
    return { ok: true, usuario: u, alumno: a };
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    const err = mapPgError(error);
    return { ok: false, error: err.message, pgCode: err.code };
  } finally {
    client.release();
  }
}


async function findAlumnoByUsuarioId(id_usuario) {
  if (!id_usuario) return null;

  const client = await pool.connect();
  try {
    const sql = `
      SELECT
        a.matricula,
        a.grado,
        a.grupo,
        c.nombre_carrera AS carrera,
        f.nombre_facultad
      FROM public.alumnos a
      LEFT JOIN public.carreras c ON a.id_carrera = c.id_carrera
      LEFT JOIN public.facultades f ON c.id_facultad = f.id_facultad
      WHERE a.id_usuario = $1
      LIMIT 1
    `;
    const { rows } = await client.query(sql, [id_usuario]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error al buscar alumno por id_usuario:", error);
    return null; // O manejar el error como prefieras
  } finally {
    client.release();
  }
}

/**
 * Actualiza los datos de un alumno y su usuario asociado en una transacción.
 * NOTA: La base de datos debe tener la columna 'tipo_practica' en 'public.alumnos'.
 * EJECUTAR: ALTER TABLE public.alumnos ADD COLUMN tipo_practica modulo_practicas.practica_tipo;
 */
async function updateAlumno(userId, data) {
  if (!userId) throw new Error("ID de usuario es requerido.");

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Actualizar la tabla de usuarios
    const sqlUser = `
      UPDATE public.usuarios
      SET
        nombre = $1,
        apellido_paterno = $2,
        apellido_materno = $3,
        email = $4
      WHERE id = $5
      RETURNING *;
    `;
    const userParams = [
      data.nombre,
      data.apellido_paterno,
      data.apellido_materno,
      data.email,
      userId
    ];
    const { rows: updatedUserRows } = await client.query(sqlUser, userParams);
    if (updatedUserRows.length === 0) {
      throw new Error("El usuario a actualizar no fue encontrado.");
    }

    // 2. Actualizar la tabla de alumnos
    const sqlAlumno = `
      UPDATE public.alumnos
      SET
        matricula = $1,
        grado = $2,
        grupo = $3,
        tipo_practica = $4
      WHERE id_usuario = $5
      RETURNING *;
    `;
    const alumnoParams = [
      data.matricula,
      data.grado,
      data.grupo,
      data.tipo_practica, // 'P1' o 'P2'
      userId
    ];
    const { rows: updatedAlumnoRows } = await client.query(sqlAlumno, alumnoParams);
    if (updatedAlumnoRows.length === 0) {
      throw new Error("Los datos del alumno a actualizar no fueron encontrados.");
    }

    await client.query('COMMIT');

    // Devolver una combinación de los datos actualizados
    const { password, ...safeUser } = updatedUserRows[0];
    return { ...safeUser, ...updatedAlumnoRows[0] };

  } catch (error) {
    await client.query('ROLLBACK');
    const err = mapPgError(error);
    console.error("Error en transacción updateAlumno:", err);
    throw new Error(err.message || 'Error al actualizar los datos.');
  } finally {
    client.release();
  }
}

module.exports = { insertUsuario, insertAlumno, createAlumnoConUsuario, findAlumnoByUsuarioId, updateAlumno };

