-- Creación de la Base de Datos y Esquemas
CREATE DATABASE SIGEA;

\c sigea;

CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS modulo_proyectos;
CREATE SCHEMA IF NOT EXISTS modulo_residencias;
CREATE SCHEMA IF NOT EXISTS modulo_investigacion;
CREATE SCHEMA IF NOT EXISTS modulo_practicas;

-- ================================================
-- ESQUEMA PÚBLICO - TABLAS COMPARTIDAS
-- ================================================

CREATE TABLE public.usuarios (
    id BIGSERIAL PRIMARY KEY,
    rfc VARCHAR(13) UNIQUE,
    username VARCHAR(50) UNIQUE,
    password TEXT NOT NULL,
    nombre VARCHAR(100),
    apellido_paterno VARCHAR(100),
    apellido_materno VARCHAR(100),
    email VARCHAR(100),
    telefono VARCHAR(20),
    sexo VARCHAR(10) CHECK (sexo IN ('MASCULINO', 'FEMENINO', 'OTRO')),
    status INTEGER DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.roles (
    id_rol BIGSERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE CHECK (nombre_rol IN ('SUPER-ADMINISTRADOR','ADMINISTRADOR', 'ESTUDIANTE', 'DOCENTE', 'EMPRESARIO')),
    descripcion TEXT
);


CREATE TABLE public.usuario_roles (
    id_usuario BIGINT REFERENCES public.usuarios(id) ON DELETE CASCADE,
    id_rol BIGINT REFERENCES public.roles(id_rol) ON DELETE CASCADE,
    PRIMARY KEY (id_usuario, id_rol)
);

CREATE TABLE public.permisos (
    id_permiso   SERIAL PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL UNIQUE,
    descripcion  TEXT
);


CREATE TABLE public.permisos_usuario (
    id_usuario  BIGINT NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    id_permiso  INT NOT NULL REFERENCES public.permisos(id_permiso) ON DELETE CASCADE,
    PRIMARY KEY (id_usuario, id_permiso)
);

CREATE TABLE public.facultades (
    id_facultad SERIAL PRIMARY KEY,
    nombre_facultad VARCHAR(100) NOT NULL
);
insert into facultades values ("Facultad de negocios");

CREATE TABLE public.carreras (
    id_carrera BIGSERIAL PRIMARY KEY,
    nombre_carrera VARCHAR(100) NOT NULL,
    id_facultad INTEGER REFERENCES public.facultades(id_facultad)
);

insert into carreras values ("ingenieria en software","1");

CREATE TABLE public.empresas (
    id_empresa BIGSERIAL PRIMARY KEY,
    nombre_empresa VARCHAR(255) NOT NULL,
    -- AJUSTE: Se añade una descripción general para la empresa.
    descripcion_empresa TEXT,
    direccion_empresa VARCHAR(255),
    telefono_empresa VARCHAR(255),
    correo_empresa VARCHAR(255),
    nombre_responsable VARCHAR(255),
    apellidos_responsable VARCHAR(255),
    puesto_responsable VARCHAR(255),
    sexo_responsable VARCHAR(10),
    activa BOOLEAN DEFAULT TRUE
);

CREATE TABLE public.alumnos(
    id_alumno SERIAL PRIMARY KEY,
    id_usuario BIGINT UNIQUE REFERENCES public.usuarios(id),
    matricula VARCHAR(30) UNIQUE,
    grado INTEGER,
    grupo VARCHAR(10),
    id_carrera BIGINT REFERENCES public.carreras(id_carrera)
);
 insert into alumnos values(1,1,"20210001",4,"A","1");

-- ================================================
-- MÓDULO DE PRACTICAS PROFESIONALES
-- ================================================
-- Tipos de apoyo (puedes usar CHECK si prefieres no usar ENUM)
CREATE TYPE modulo_practicas.practica_tipo AS ENUM ('P1', 'P2', 'RES');
CREATE TYPE modulo_practicas.periodo_label AS ENUM ('ENE-JUN', 'JUN-DIC');

CREATE TABLE IF NOT EXISTS modulo_practicas.fechas (
  id_fecha      SERIAL PRIMARY KEY,
  nombre_documento VARCHAR(150) NOT NULL,
  periodo       modulo_practicas.periodo_label NOT NULL,
  fecha_apertura DATE NOT NULL,
  fecha_cierre   DATE NOT NULL,
  CONSTRAINT fechas_rango_valido CHECK (fecha_cierre > fecha_apertura)
);

CREATE TYPE modulo_practicas.doc_tipo AS ENUM (
  'HOJA_PRESENTACION',
  'CARTA_PRESENTACION',
  'CARTA_ACEPTACION',
  'REPORTE_FINAL',
  'CARTA_LIBERACION'
);

CREATE TABLE IF NOT EXISTS modulo_practicas.documentos_alumno (
  id_doc           BIGSERIAL PRIMARY KEY,
  matricula        VARCHAR(30) NOT NULL REFERENCES public.alumnos(matricula) ON DELETE CASCADE,
  practica         modulo_practicas.practica_tipo NOT NULL,
  doc_tipo         modulo_practicas.doc_tipo NOT NULL,
  nombre_archivo   TEXT NOT NULL,        -- ej. carta_presentacion.pdf
  ruta_relativa    TEXT NOT NULL,        -- ej. alumnos/20260001/P1/carta_presentacion.pdf
  mime_type        TEXT,
  tamano_bytes     BIGINT,
  checksum_sha256  TEXT,
  subido_en        TIMESTAMP DEFAULT now(),
  estado_revision  TEXT CHECK (estado_revision IN ('PENDIENTE','APROBADO','RECHAZADO')) DEFAULT 'PENDIENTE',

  -- Evita duplicidad del mismo documento por alumno/práctica
  CONSTRAINT unq_doc_por_tipo UNIQUE (matricula, practica, doc_tipo)
);

-- Índices útiles para búsqueda
CREATE INDEX IF NOT EXISTS idx_doc_matricula_practica ON modulo_practicas.documentos_alumno (matricula, practica);
CREATE INDEX IF NOT EXISTS idx_doc_practica ON modulo_practicas.documentos_alumno (practica);

CREATE TABLE IF NOT EXISTS modulo_practicas.calificaciones (
  id_calificacion SERIAL PRIMARY KEY,
  matricula        VARCHAR(30) NOT NULL REFERENCES public.alumnos(matricula) ON DELETE CASCADE,
  practica         modulo_practicas.practica_tipo NOT NULL,
  calificacion     NUMERIC(5,2) NOT NULL CHECK (calificacion >= 0 AND calificacion <= 10),
  observaciones    TEXT,
  actualizado_en   TIMESTAMP DEFAULT now(),
  CONSTRAINT unq_calif_por_practica UNIQUE (matricula, practica)
);


-- ================================================
-- MÓDULO DE PROYECTOS (Original)
-- ================================================

CREATE TABLE modulo_proyectos.administradores (
    id_administrador BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT REFERENCES public.usuarios(id),
    area_responsabilidad VARCHAR(100)
);

CREATE TABLE modulo_proyectos.tipos_programa (
    id_tipo_programa BIGSERIAL PRIMARY KEY,
    nombre_tipo_programa VARCHAR(50) NOT NULL,
    descripcion TEXT
);

CREATE TABLE modulo_proyectos.programas (
    id_programa BIGSERIAL PRIMARY KEY,
    titulo_proyecto VARCHAR(255),
    descripcion_proyecto TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    total_horas INTEGER NOT NULL DEFAULT 0,
    estado_avance VARCHAR(20) CHECK (estado_avance IN ('NO_INICIADO', 'EN_PROGRESO', 'COMPLETADO')) DEFAULT 'NO_INICIADO',
    matricula_estudiante VARCHAR(30) REFERENCES public.alumnos(matricula),
    id_empresa BIGINT REFERENCES public.empresas(id_empresa),
    id_tipo_programa BIGINT REFERENCES modulo_proyectos.tipos_programa(id_tipo_programa)
);

CREATE TABLE modulo_proyectos.archivos_programa (
    id_archivo_programa BIGSERIAL PRIMARY KEY,
    nombre_archivo VARCHAR(255) NOT NULL,
    contenido_archivo BYTEA,
    id_programa BIGINT REFERENCES modulo_proyectos.programas(id_programa),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE modulo_proyectos.historial_archivos (
    id_historial BIGSERIAL PRIMARY KEY,
    id_archivo_programa BIGINT REFERENCES modulo_proyectos.archivos_programa(id_archivo_programa),
    archivo_anterior_binario BYTEA,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario BIGINT REFERENCES public.usuarios(id)
);

CREATE TABLE modulo_proyectos.eventos (
    id_evento BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    tipo_programa VARCHAR(255),
    id_programa BIGINT REFERENCES modulo_proyectos.programas(id_programa)
);


-- ================================================
-- MÓDULO DE RESIDENCIAS (NUEVO Y FINAL)
-- ================================================

-- Tabla para gestionar los periodos académicos (AGO-DIC 2025, etc.)
CREATE TABLE modulo_residencias.periodos (
    id_periodo SERIAL PRIMARY KEY,
    nombre_periodo VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN DEFAULT FALSE
);

-- Tabla para las oportunidades o plazas que las empresas ofrecen.
CREATE TABLE modulo_residencias.oportunidades (
    id_oportunidad SERIAL PRIMARY KEY,
    id_empresa BIGINT REFERENCES public.empresas(id_empresa),
    id_periodo INTEGER REFERENCES modulo_residencias.periodos(id_periodo),
    area_trabajo VARCHAR(255) NOT NULL,
    descripcion_area TEXT NOT NULL,
    horario VARCHAR(100),
    modalidad VARCHAR(50) CHECK (modalidad IN ('PRESENCIAL', 'EN LINEA', 'MIXTO')),
    plazas_disponibles INT NOT NULL
);

-- Tabla principal que representa la residencia de un alumno.
CREATE TABLE modulo_residencias.residencias (
    id_residencia SERIAL PRIMARY KEY,
    id_alumno INTEGER UNIQUE REFERENCES public.alumnos(id_alumno),
    id_oportunidad INTEGER REFERENCES modulo_residencias.oportunidades(id_oportunidad),
    rfc_asesor_interno VARCHAR(13) REFERENCES public.usuarios(rfc),
    propuesta_proyecto_url TEXT,
    nombre_proyecto_final VARCHAR(255),
    estado_proceso VARCHAR(50) CHECK (estado_proceso IN ('POSTULADO', 'PROPUESTA RECHAZADA', 'APROBADO', 'EN CURSO', 'FINALIZADO', 'LIBERADO')) DEFAULT 'POSTULADO',
    folio VARCHAR(100) UNIQUE,
    fecha_postulacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para gestionar la entrega de todos los documentos.
CREATE TABLE modulo_residencias.documentos_entrega (
    id_documento SERIAL PRIMARY KEY,
    id_residencia INTEGER REFERENCES modulo_residencias.residencias(id_residencia),
    tipo_documento VARCHAR(100) CHECK (tipo_documento IN ('PROPUESTA_PROYECTO', 'CARTA_PRESENTACION', 'CARTA_ACEPTACION', 'REPORTE_PERIODICO', 'REPORTE_FINAL', 'CARTA_LIBERACION')),
    url_documento TEXT NOT NULL,
    fecha_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_revision VARCHAR(50) CHECK (estado_revision IN ('PENDIENTE', 'APROBADO', 'RECHAZADO')) DEFAULT 'PENDIENTE',
    comentarios TEXT
);

-- ================================================
-- MÓDULO DE INVESTIGACIÓN (Original)
-- ================================================

CREATE TABLE modulo_investigacion.docentes (
    rfc VARCHAR(13) PRIMARY KEY REFERENCES public.usuarios(rfc) ON DELETE CASCADE,
    id_usuario BIGINT REFERENCES public.usuarios(id),
    n_plaza VARCHAR(35)
);

CREATE TABLE modulo_investigacion.semestre_grupo (
    id_semestre_grupo SERIAL PRIMARY KEY,
    semestre VARCHAR(35) NOT NULL,
    grupo VARCHAR(35) NOT NULL
);

CREATE TABLE modulo_investigacion.materias (
    id_materia SERIAL PRIMARY KEY,
    nombre_materia VARCHAR(70) NOT NULL,
    id_carrera INTEGER REFERENCES public.carreras(id_carrera),
    id_semestre_grupo INTEGER REFERENCES modulo_investigacion.semestre_grupo(id_semestre_grupo)
);

CREATE TABLE modulo_investigacion.docente_materia (
    id_detalle SERIAL PRIMARY KEY,
    rfc_docente VARCHAR(13) REFERENCES modulo_investigacion.docentes(rfc),
    id_materia INTEGER REFERENCES modulo_investigacion.materias(id_materia)
);

CREATE TABLE modulo_investigacion.tipos_actividad (
    id_tipo_actividad SERIAL PRIMARY KEY,
    nombre_tipo VARCHAR(45) NOT NULL
);

CREATE TABLE modulo_investigacion.actividades_tutorias (
    id_actividad SERIAL PRIMARY KEY,
    nombre_actividad VARCHAR(45) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    id_carrera INTEGER REFERENCES public.carreras(id_carrera),
    rfc_docente VARCHAR(13) REFERENCES modulo_investigacion.docentes(rfc)
);

CREATE TABLE modulo_investigacion.proyectos_investigacion (
    id_proyecto SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    ciclo_escolar TEXT,
    fecha_inicio DATE,
    fecha_final DATE,
    linea_investigacion TEXT,
    estatus INTEGER DEFAULT 1,
    recursos_utilizados TEXT,
    tipo_de_recurso TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rfc_lider VARCHAR(13) REFERENCES modulo_investigacion.docentes(rfc)
);

CREATE TABLE modulo_investigacion.colaboradores (
    id_colaborador BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL,
    id_proyecto INTEGER REFERENCES modulo_investigacion.proyectos_investigacion(id_proyecto)
);

CREATE TABLE modulo_investigacion.tipos_documento (
    id_tipo_documento SERIAL PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL
);

CREATE TABLE modulo_investigacion.documentos_docentes (
    id_documento SERIAL PRIMARY KEY,
    rfc_docente VARCHAR(13) REFERENCES modulo_investigacion.docentes(rfc),
    nombre_documento VARCHAR(100) NOT NULL,
    id_tipo_documento INTEGER REFERENCES modulo_investigacion.tipos_documento(id_tipo_documento),
    contenido_documento BYTEA NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE modulo_investigacion.actividades_ensenanza (
    id_actividad SERIAL PRIMARY KEY,
    nombre_actividad VARCHAR(45) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    id_tipo_actividad INTEGER REFERENCES modulo_investigacion.tipos_actividad(id_tipo_actividad),
    id_materia INTEGER REFERENCES modulo_investigacion.materias(id_materia),
    ciclo_escolar VARCHAR(45) NOT NULL,
    fecha DATE NOT NULL,
    rfc_docente VARCHAR(13) REFERENCES modulo_investigacion.docentes(rfc)
);
CREATE TABLE modulo_investigacion.evidencias_ensenanza (
    id_evidencia SERIAL PRIMARY KEY,
    nombre VARCHAR(45) NOT NULL,
    descripcion VARCHAR(255),
    contenido_evidencia BYTEA NOT NULL,
    id_actividad INTEGER REFERENCES modulo_investigacion.actividades_ensenanza(id_actividad),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE modulo_investigacion.evidencias_tutorias (
    id_evidencia SERIAL PRIMARY KEY,
    nombre VARCHAR(45) NOT NULL,
    descripcion VARCHAR(255),
    contenido_evidencia BYTEA NOT NULL,
    id_actividad INTEGER REFERENCES modulo_investigacion.actividades_tutorias(id_actividad),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE modulo_investigacion.evidencias_investigacion (
    id_evidencia SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    contenido_evidencia BYTEA NOT NULL,
    id_proyecto INTEGER REFERENCES modulo_investigacion.proyectos_investigacion(id_proyecto),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE modulo_investigacion.historial_archivos (
    id_historial BIGSERIAL PRIMARY KEY,
    id_evidencia INTEGER,
    nombre_tabla VARCHAR(50) NOT NULL,
    old_contenido_documento BYTEA,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario BIGINT REFERENCES public.usuarios(id)
);

CREATE TABLE modulo_investigacion.secretaria_academica (
    id_secretaria SERIAL PRIMARY KEY,
    rfc VARCHAR(13) REFERENCES modulo_investigacion.docentes(rfc),
    nivel_estudio VARCHAR(30) NOT NULL,
    nombre_institucion VARCHAR(255) NOT NULL,
    area_especializacion VARCHAR(45) NOT NULL
);

-- ================================================
-- FUNCIONES Y TRIGGERS (Originales)
-- ================================================ 

CREATE OR REPLACE FUNCTION public.fn_verificar_rol_administrador()
RETURNS TRIGGER AS $$
DECLARE
    v_rol_id BIGINT;
BEGIN
    SELECT r.id_rol INTO v_rol_id
    FROM public.usuario_roles ur
    JOIN public.roles r ON ur.id_rol = r.id_rol
    WHERE ur.id_usuario = NEW.id_usuario AND r.nombre_rol LIKE '%ADMINISTRADOR%';
    IF NOT FOUND THEN
        RAISE EXCEPTION 'El usuario con ID % no tiene un rol de administrador válido.', NEW.id_usuario;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_verificar_rol_admin_before_insert_update
BEFORE INSERT OR UPDATE ON modulo_proyectos.administradores
FOR EACH ROW
EXECUTE FUNCTION public.fn_verificar_rol_administrador();

CREATE OR REPLACE FUNCTION modulo_proyectos.fn_historial_archivos_proyectos()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO modulo_proyectos.historial_archivos
        (id_archivo_programa, archivo_anterior_binario, id_usuario, fecha_accion)
    VALUES
        (OLD.id_archivo_programa, OLD.contenido_archivo, current_setting('app.user_id', true)::BIGINT, NOW());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_before_update_archivo_programa
BEFORE UPDATE ON modulo_proyectos.archivos_programa
FOR EACH ROW
WHEN (OLD.contenido_archivo IS DISTINCT FROM NEW.contenido_archivo)
EXECUTE FUNCTION modulo_proyectos.fn_historial_archivos_proyectos();

CREATE OR REPLACE FUNCTION modulo_investigacion.fn_historial_archivos_investigacion()
RETURNS TRIGGER AS $$
DECLARE
    v_id_registro INT;
    v_contenido_anterior BYTEA;
BEGIN
    IF TG_TABLE_NAME = 'documentos_docentes' THEN
        v_id_registro := OLD.id_documento;
        v_contenido_anterior := OLD.contenido_documento;
    ELSE
        v_id_registro := OLD.id_evidencia;
        v_contenido_anterior := OLD.contenido_evidencia;
    END IF;
    INSERT INTO modulo_investigacion.historial_archivos
        (id_evidencia, nombre_tabla, old_contenido_documento, id_usuario, fecha_accion)
    VALUES
        (v_id_registro, TG_TABLE_NAME, v_contenido_anterior, current_setting('app.user_id', true)::BIGINT, NOW());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_before_update_documentos_docentes
BEFORE UPDATE ON modulo_investigacion.documentos_docentes
FOR EACH ROW
WHEN (OLD.contenido_documento IS DISTINCT FROM NEW.contenido_documento)
EXECUTE FUNCTION modulo_investigacion.fn_historial_archivos_investigacion();

CREATE TRIGGER trg_before_update_evidencias_ensenanza
BEFORE UPDATE ON modulo_investigacion.evidencias_ensenanza
FOR EACH ROW
WHEN (OLD.contenido_evidencia IS DISTINCT FROM NEW.contenido_evidencia)
EXECUTE FUNCTION modulo_investigacion.fn_historial_archivos_investigacion();

CREATE TRIGGER trg_before_update_evidencias_tutorias
BEFORE UPDATE ON modulo_investigacion.evidencias_tutorias
FOR EACH ROW
WHEN (OLD.contenido_evidencia IS DISTINCT FROM NEW.contenido_evidencia)
EXECUTE FUNCTION modulo_investigacion.fn_historial_archivos_investigacion();

CREATE TRIGGER trg_before_update_evidencias_investigacion
BEFORE UPDATE ON modulo_investigacion.evidencias_investigacion
FOR EACH ROW
WHEN (OLD.contenido_evidencia IS DISTINCT FROM NEW.contenido_evidencia)
EXECUTE FUNCTION modulo_investigacion.fn_historial_archivos_investigacion();

CREATE OR REPLACE FUNCTION public.fn_insert_user(
    p_rfc              VARCHAR(13),
    p_username         VARCHAR(50),
    p_password         TEXT,
    p_nombre           VARCHAR(100),
    p_apellido_paterno VARCHAR(100),
    p_apellido_materno VARCHAR(100),
    p_email            VARCHAR(100),
    p_telefono         VARCHAR(20),
    p_sexo             VARCHAR(10),
    p_permiso_nombre   VARCHAR(100),       
    p_status           INTEGER DEFAULT 1    
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_usuario  BIGINT;
    v_id_permiso  INT;
    v_permiso_nom TEXT := trim(p_permiso_nombre);
BEGIN
    IF v_permiso_nom IS NULL OR v_permiso_nom = '' THEN
        RAISE EXCEPTION 'El nombre del permiso no puede ser nulo o vacío';
    END IF;

    INSERT INTO public.usuarios
        (rfc, username, password, nombre, apellido_paterno, apellido_materno, email, telefono, sexo, status)
    VALUES
        (p_rfc, p_username, p_password, p_nombre, p_apellido_paterno, p_apellido_materno, p_email, p_telefono, p_sexo, p_status)
    RETURNING id INTO v_id_usuario;

    SELECT id_permiso
      INTO v_id_permiso
      FROM public.permisos
     WHERE lower(nombre) = lower(v_permiso_nom)
     LIMIT 1;

    IF v_id_permiso IS NULL THEN
            RAISE EXCEPTION 'El permiso "%" no existe', v_permiso_nom;
    END IF;

    INSERT INTO public.permisos_usuario (id_usuario, id_permiso)
    VALUES (v_id_usuario, v_id_permiso)
    ON CONFLICT DO NOTHING;

    RETURN v_id_usuario;

EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'No se pudo crear el usuario: RFC o username ya existen (%).', SQLERRM
            USING ERRCODE = '23505';
END;
$$;

CREATE OR REPLACE FUNCTION fn_tiene_permiso(
    p_id_usuario BIGINT,
    p_id_permiso INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_existe BOOLEAN;
BEGIN
    SELECT TRUE
    INTO v_existe
    FROM permisos_usuario pu
    WHERE (pu.id_usuario = p_id_usuario
      AND pu.id_permiso = p_id_permiso) OR (SELECT 1 FROM usuarios u
                                                JOIN usuario_roles ur ON u.id = ur.id_usuario 
                                                JOIN roles r ON ur.id_rol = r.id_rol 
                                                WHERE u.id = p_id_usuario AND r.nombre_rol = 'SUPER-ADMINISTRADOR')
    LIMIT 1;

    RETURN COALESCE(v_existe, FALSE);
END;
$$;


-- ================================================
-- DATOS INICIALES PARA EL FUNCIONAMIENTO DEL SISTEMA
-- ================================================ 

-- Roles Básicos
INSERT INTO public.roles (nombre_rol, descripcion) VALUES
('SUPER-ADMINISTRADOR', 'Control total del sistema'),
('ADMINISTRADOR', 'Administrador de un módulo específico'),
('ESTUDIANTE', 'Usuario estudiante con acceso a sus módulos'),
('DOCENTE', 'Usuario docente con acceso a sus módulos'),
('EMPRESARIO', 'Usuario externo de una empresa')
ON CONFLICT (nombre_rol) DO NOTHING;

-- Permisos necesarios para la aplicación
INSERT INTO public.permisos (nombre, descripcion) VALUES
('proyectos', 'Acceso al módulo de proyectos'),
('residencias', 'Acceso al módulo de residencias'),
('investigacion', 'Acceso al módulo de investigación'),
('Super-Admin', 'Acceso total a todos los módulos y configuraciones'),
('Enseñanza-Admin', 'Administrador del módulo de Enseñanza'),
('Enseñanza', 'Acceso de usuario al módulo de Enseñanza'),
('Tutorias-Admin', 'Administrador del módulo de Tutorías'),
('Tutorias', 'Acceso de usuario al módulo de Tutorías'),
('Investigacion-Admin', 'Administrador del módulo de Investigación'),
('Secretaria-Admin', 'Administrador del módulo de Secretaría Académica'),
('Secretaria', 'Acceso de usuario al módulo de Secretaría Académica'),
('Practicas',        'Acceso de usuario al módulo de Prácticas Profesionales (Residencias)'),
('Practicas-Admin',  'Administrador del módulo de Prácticas Profesionales')
ON CONFLICT (nombre) DO NOTHING;

-- Usuario Super-Administrador Principal
INSERT INTO public.usuarios (rfc, username, password, nombre, apellido_paterno, sexo, status, email) VALUES
('ASFI900101ABC', 'superadmin', '$2b$10$w26a6Y1WRvKNu.eGSxQ0POLCwImW4iOpm9KDlIhJ6H0h2spWRcyz6', 'Prueba', 'Unach', 'FEMENINO', 1, 'unachPrueba@unach.com')
ON CONFLICT (rfc) DO NOTHING;

-- Entrada en la tabla de docentes para el admin
INSERT INTO modulo_investigacion.docentes (rfc, n_plaza) VALUES
('ASFI900101ABC', 'PLZ001')
ON CONFLICT (rfc) DO NOTHING;

-- Asignación de rol de Super-Admin
INSERT INTO public.usuario_roles (id_usuario, id_rol)
SELECT 
    (SELECT id FROM public.usuarios WHERE rfc = 'ASFI900101ABC'),
    (SELECT id_rol FROM public.roles WHERE nombre_rol = 'SUPER-ADMINISTRADOR')
ON CONFLICT (id_usuario, id_rol) DO NOTHING;

-- Asignación de todos los permisos al Super-Admin
INSERT INTO public.permisos_usuario (id_usuario, id_permiso)
SELECT
    (SELECT id FROM public.usuarios WHERE rfc = 'ASFI900101ABC'),
    p.id_permiso
FROM 
    public.permisos p
ON CONFLICT (id_usuario, id_permiso) DO NOTHING;

CREATE OR REPLACE FUNCTION modulo_residencias.fn_verificar_admin_residencias()
RETURNS TRIGGER AS $$
DECLARE
  v_es_super_admin BOOLEAN;
  v_es_admin_rol   BOOLEAN;
  v_tiene_permiso  BOOLEAN;
BEGIN
  -- ¿SUPER-ADMINISTRADOR?
  SELECT EXISTS (
    SELECT 1
    FROM public.usuario_roles ur
    JOIN public.roles r ON r.id_rol = ur.id_rol
    WHERE ur.id_usuario = NEW.id_usuario
      AND r.nombre_rol = 'SUPER-ADMINISTRADOR'
  ) INTO v_es_super_admin;

  IF v_es_super_admin THEN
    RETURN NEW;
  END IF;

  -- ¿Rol ADMINISTRADOR?
  SELECT EXISTS (
    SELECT 1
    FROM public.usuario_roles ur
    JOIN public.roles r ON r.id_rol = ur.id_rol
    WHERE ur.id_usuario = NEW.id_usuario
      AND r.nombre_rol = 'ADMINISTRADOR'
  ) INTO v_es_admin_rol;

  -- ¿Permiso Practicas-Admin?
  SELECT EXISTS (
    SELECT 1
    FROM public.permisos_usuario pu
    JOIN public.permisos p ON p.id_permiso = pu.id_permiso
    WHERE pu.id_usuario = NEW.id_usuario
      AND lower(p.nombre) = lower('Practicas-Admin')
  ) INTO v_tiene_permiso;

  IF NOT (v_es_admin_rol AND v_tiene_permiso) THEN
    RAISE EXCEPTION 'El usuario % no es administrador del módulo de Prácticas (requiere rol ADMINISTRADOR y permiso Practicas-Admin).', NEW.id_usuario;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_verificar_admin_residencias_before_insupd ON modulo_residencias.administradores;

CREATE TRIGGER trg_verificar_admin_residencias_before_insupd
BEFORE INSERT OR UPDATE ON modulo_residencias.administradores
FOR EACH ROW
EXECUTE FUNCTION modulo_residencias.fn_verificar_admin_residencias();

-- Usuario admin del módulo de Prácticas
INSERT INTO public.usuarios
  (rfc, username, password, nombre, apellido_paterno, sexo, status, email)
VALUES
  ('PRAC900101XYZ', 'admin_practicas', '$2b$10$w26a6Y1WRvKNu.eGSxQ0POLCwImW4iOpm9KDlIhJ6H0h2spWRcyz6', 'Admin', 'Prácticas', 'MASCULINO', 1, 'admin.practicas@unach.mx')
ON CONFLICT (rfc) DO NOTHING;

-- Asignar rol ADMINISTRADOR (no es SUPER)
INSERT INTO public.usuario_roles (id_usuario, id_rol)
SELECT u.id, r.id_rol
FROM public.usuarios u, public.roles r
WHERE u.rfc = 'PRAC900101XYZ' AND r.nombre_rol = 'ADMINISTRADOR'
ON CONFLICT (id_usuario, id_rol) DO NOTHING;

-- Otorgar SOLO permisos del módulo de Prácticas
INSERT INTO public.permisos_usuario (id_usuario, id_permiso)
SELECT u.id, p.id_permiso
FROM public.usuarios u, public.permisos p
WHERE u.rfc = 'PRAC900101XYZ' AND lower(p.nombre) IN ('practicas', 'practicas-admin')
ON CONFLICT (id_usuario, id_permiso) DO NOTHING;

-- (Opcional) Registrar al usuario como administrador del módulo (pasa trigger)
INSERT INTO modulo_residencias.administradores (id_usuario, area_responsabilidad)
SELECT id, 'Coordinación Prácticas'
FROM public.usuarios
WHERE rfc = 'PRAC900101XYZ'
ON CONFLICT DO NOTHING;

--AdminPrac#2025.

-- Asegura extensión para bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_id_facultad   INT;
  v_id_carrera    BIGINT;
  v_id_usuario    BIGINT;
  v_id_rol_est    BIGINT;
BEGIN
  /* 1) Facultad: "Facultad de Negocios" */
  SELECT id_facultad INTO v_id_facultad
  FROM public.facultades
  WHERE nombre_facultad = 'Facultad de Negocios';

  IF v_id_facultad IS NULL THEN
    INSERT INTO public.facultades(nombre_facultad)
    VALUES ('Facultad de Negocios')
    RETURNING id_facultad INTO v_id_facultad;
  END IF;

  /* 2) Carrera: "Ingeniería en Software" ligada a esa facultad */
  SELECT id_carrera INTO v_id_carrera
  FROM public.carreras
  WHERE nombre_carrera = 'Ingeniería en Software'
    AND id_facultad     = v_id_facultad;

  IF v_id_carrera IS NULL THEN
    INSERT INTO public.carreras(nombre_carrera, id_facultad)
    VALUES ('Ingeniería en Software', v_id_facultad)
    RETURNING id_carrera INTO v_id_carrera;
  END IF;

  /* 3) Usuario alumno */
  -- Ajusta estos datos si quieres valores reales/definitivos:
  -- RFC debe ser único y con formato válido; aquí uno de ejemplo:
  -- (4 letras + 6 dígitos fecha + 3 alfanum)
  -- FREM001231ABC = ejemplo (cámbialo si te choca la unicidad)
  INSERT INTO public.usuarios
    (rfc,            username,  password,                                          nombre, apellido_paterno, apellido_materno, email,            telefono, sexo,       status)
  VALUES
    ('FREM001231ABC','freddy',  crypt('freddy1234', gen_salt('bf', 10)),           'Freddy','Alumno',        NULL,             'freddy@unach.mx', NULL,     'MASCULINO', 1)
  ON CONFLICT (rfc) DO UPDATE
    SET email = EXCLUDED.email
  RETURNING id INTO v_id_usuario;

  /* 4) Rol ESTUDIANTE */
  SELECT id_rol INTO v_id_rol_est
  FROM public.roles
  WHERE nombre_rol = 'ESTUDIANTE';

  IF v_id_rol_est IS NULL THEN
    RAISE EXCEPTION 'El rol ESTUDIANTE no existe en public.roles. Inserta los roles base primero.';
  END IF;

  INSERT INTO public.usuario_roles(id_usuario, id_rol)
  VALUES (v_id_usuario, v_id_rol_est)
  ON CONFLICT DO NOTHING;

  /* 5) Registro en alumnos */
  -- Ajusta matrícula/grado/grupo si lo requieres
  INSERT INTO public.alumnos(id_usuario, matricula, grado, grupo, id_carrera)
  VALUES (v_id_usuario, '20260001', 4, 'A', v_id_carrera)
  ON CONFLICT (id_usuario) DO NOTHING;
END
$$;

-- Usuario
SELECT id, rfc, username, email FROM public.usuarios WHERE rfc = 'FREM001231ABC';

-- Rol asignado
SELECT ur.id_usuario, r.nombre_rol
FROM public.usuario_roles ur
JOIN public.roles r ON r.id_rol = ur.id_rol
WHERE ur.id_usuario = (SELECT id FROM public.usuarios WHERE rfc = 'FREM001231ABC');

-- Alumno
SELECT a.*, c.nombre_carrera, f.nombre_facultad
FROM public.alumnos a
JOIN public.carreras c  ON c.id_carrera  = a.id_carrera
JOIN public.facultades f ON f.id_facultad = c.id_facultad
WHERE a.id_usuario = (SELECT id FROM public.usuarios WHERE rfc = 'FREM001231ABC');

BEGIN;

-- (Opcional) Si quieres vaciar:
-- TRUNCATE TABLE public.alumnos RESTART IDENTITY CASCADE;

-- Asegura que la matrícula no sea nula
ALTER TABLE public.alumnos
  ALTER COLUMN matricula SET NOT NULL;

-- Quita la PK antigua (id_alumno)
ALTER TABLE public.alumnos
  DROP CONSTRAINT IF EXISTS alumnos_pkey;

-- Pone matricula como nueva PK
ALTER TABLE public.alumnos
  ADD CONSTRAINT alumnos_pkey PRIMARY KEY (matricula);

-- Deja id_alumno como clave candidata (para FKs existentes)
ALTER TABLE public.alumnos
  ADD CONSTRAINT alumnos_id_alumno_uk UNIQUE (id_alumno);

COMMIT;

/*
ALTER TYPE modulo_practicas.periodo_label ADD VALUE IF NOT EXISTS 'ENE-JUN';
ALTER TYPE modulo_practicas.periodo_label ADD VALUE IF NOT EXISTS 'JUN-DIC';
*/

ALTER TABLE public.alumnos ADD COLUMN tipo_practica modulo_practicas.practica_tipo;