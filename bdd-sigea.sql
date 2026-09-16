-- Creación de la Base de Datos y Esquemas
CREATE DATABASE SIGEA;

\c sigea;

CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS modulo_proyectos;
CREATE SCHEMA IF NOT EXISTS modulo_residencias;
CREATE SCHEMA IF NOT EXISTS modulo_investigacion;
CREATE SCHEMA IF NOT EXISTS modulo_practicas;

-- ================================================
-- TIPOS PERSONALIZADOS (se declaran antes que las tablas)
-- ================================================

--todo esto se declara aquie y no en el modulo practicas ya que con el alter del anterior documento se modifica esto ya que debe tener un orden todo y no puede tener esto 
--mas a abajo si lo vas a usar antes
CREATE TYPE modulo_practicas.practica_tipo AS ENUM ('P1', 'P2', 'RES');
CREATE TYPE modulo_practicas.periodo_label AS ENUM ('ENE-ABR', 'MAY-AGO', 'SEP-DIC');
CREATE TYPE modulo_practicas.doc_tipo AS ENUM (
    'HOJA_PRESENTACION',
    'CARTA_PRESENTACION',
    'CARTA_ACEPTACION',
    'REPORTE_FINAL',
    'CARTA_LIBERACION'
);

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
    -- preguntar si debe ser unico tel y email
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

CREATE TABLE public.carreras (
    id_carrera BIGSERIAL PRIMARY KEY,
    nombre_carrera VARCHAR(100) NOT NULL,
    id_facultad INTEGER REFERENCES public.facultades(id_facultad)
);

CREATE TABLE public.empresas (
    id_empresa BIGSERIAL PRIMARY KEY,
    nombre_empresa VARCHAR(255) NOT NULL,
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

CREATE TABLE public.alumnos (
    id_alumno  SERIAL,
    id_usuario BIGINT UNIQUE REFERENCES public.usuarios(id),
    matricula  VARCHAR(30) NOT NULL,
    grado      INTEGER,
    grupo      VARCHAR(10),
    id_carrera BIGINT REFERENCES public.carreras(id_carrera),
    tipo_practica modulo_practicas.practica_tipo, --se le agrega esto ya que habia un alter en el anterior documento entonces decia qeu esto debe ir aqui
    CONSTRAINT alumnos_pkey PRIMARY KEY (matricula),
    CONSTRAINT alumnos_id_alumno_uk UNIQUE (id_alumno)
);


-- ================================================
-- MÓDULO DE INVESTIGACIÓN
-- ================================================

CREATE TABLE modulo_investigacion.docentes (
    rfc        VARCHAR(13) PRIMARY KEY REFERENCES public.usuarios(rfc) ON DELETE CASCADE,
    id_usuario BIGINT REFERENCES public.usuarios(id),
    n_plaza    VARCHAR(35)
);

CREATE TABLE modulo_investigacion.semestre_grupo (
    id_semestre_grupo SERIAL PRIMARY KEY,
    semestre          VARCHAR(35) NOT NULL,
    grupo             VARCHAR(35) NOT NULL
);

CREATE TABLE modulo_investigacion.tipos_actividad (
    id_tipo_actividad SERIAL PRIMARY KEY,
    nombre_tipo       VARCHAR(45) NOT NULL
);

CREATE TABLE modulo_investigacion.tipos_documento (
    id_tipo_documento SERIAL PRIMARY KEY,
    descripcion       VARCHAR(255) NOT NULL
);

CREATE TABLE modulo_investigacion.materias (
    id_materia        SERIAL PRIMARY KEY,
    nombre_materia    VARCHAR(70) NOT NULL,
    id_carrera        INTEGER REFERENCES public.carreras(id_carrera),
    id_semestre_grupo INTEGER REFERENCES modulo_investigacion.semestre_grupo(id_semestre_grupo)
);

CREATE TABLE modulo_investigacion.docente_materia (
    id_detalle  SERIAL PRIMARY KEY,
    rfc_docente VARCHAR(13) REFERENCES modulo_investigacion.docentes(rfc),
    id_materia  INTEGER REFERENCES modulo_investigacion.materias(id_materia)
);

CREATE TABLE modulo_investigacion.actividades_tutorias (
    id_actividad     SERIAL PRIMARY KEY,
    nombre_actividad VARCHAR(45) NOT NULL,
    descripcion      VARCHAR(255) NOT NULL,
    fecha            DATE NOT NULL,
    id_carrera       INTEGER REFERENCES public.carreras(id_carrera),
    rfc_docente      VARCHAR(13) REFERENCES modulo_investigacion.docentes(rfc)
);

CREATE TABLE modulo_investigacion.evidencias_tutorias (
    id_evidencia        SERIAL PRIMARY KEY,
    nombre              VARCHAR(45) NOT NULL,
    descripcion         VARCHAR(255),
    contenido_evidencia BYTEA NOT NULL,
    id_actividad        INTEGER REFERENCES modulo_investigacion.actividades_tutorias(id_actividad),
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE modulo_investigacion.proyectos_investigacion (
    id_proyecto         SERIAL PRIMARY KEY,
    nombre              TEXT NOT NULL,
    ciclo_escolar       TEXT,
    fecha_inicio        DATE,
    fecha_final         DATE,
    linea_investigacion TEXT,
    estatus             INTEGER DEFAULT 1,
    recursos_utilizados TEXT,
    tipo_de_recurso     TEXT,
    fecha_registro      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rfc_lider           VARCHAR(13) REFERENCES modulo_investigacion.docentes(rfc)
);

CREATE TABLE modulo_investigacion.colaboradores (
    id_colaborador BIGSERIAL PRIMARY KEY,
    nombre         TEXT NOT NULL,
    tipo           TEXT NOT NULL,
    id_proyecto    INTEGER REFERENCES modulo_investigacion.proyectos_investigacion(id_proyecto)
);

CREATE TABLE modulo_investigacion.evidencias_investigacion (
    id_evidencia        SERIAL PRIMARY KEY,
    nombre              TEXT NOT NULL,
    contenido_evidencia BYTEA NOT NULL,
    id_proyecto         INTEGER REFERENCES modulo_investigacion.proyectos_investigacion(id_proyecto),
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE modulo_investigacion.actividades_ensenanza (
    id_actividad      SERIAL PRIMARY KEY,
    nombre_actividad  VARCHAR(45) NOT NULL,
    descripcion       VARCHAR(255) NOT NULL,
    id_tipo_actividad INTEGER REFERENCES modulo_investigacion.tipos_actividad(id_tipo_actividad),
    id_materia        INTEGER REFERENCES modulo_investigacion.materias(id_materia),
    ciclo_escolar     VARCHAR(45) NOT NULL,
    fecha             DATE NOT NULL,
    rfc_docente       VARCHAR(13) REFERENCES modulo_investigacion.docentes(rfc)
);

CREATE TABLE modulo_investigacion.evidencias_ensenanza (
    id_evidencia        SERIAL PRIMARY KEY,
    nombre              VARCHAR(45) NOT NULL,
    descripcion         VARCHAR(255),
    contenido_evidencia BYTEA NOT NULL,
    id_actividad        INTEGER REFERENCES modulo_investigacion.actividades_ensenanza(id_actividad),
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE modulo_investigacion.documentos_docentes (
    id_documento         SERIAL PRIMARY KEY,
    rfc_docente          VARCHAR(13) REFERENCES modulo_investigacion.docentes(rfc),
    nombre_documento     VARCHAR(100) NOT NULL,
    id_tipo_documento    INTEGER REFERENCES modulo_investigacion.tipos_documento(id_tipo_documento),
    contenido_documento  BYTEA NOT NULL,
    fecha_subida         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE modulo_investigacion.historial_archivos (
    id_historial            BIGSERIAL PRIMARY KEY,
    id_evidencia            INTEGER,
    nombre_tabla            VARCHAR(50) NOT NULL,
    old_contenido_documento BYTEA,
    fecha_accion            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario              BIGINT REFERENCES public.usuarios(id)
);

CREATE TABLE modulo_investigacion.secretaria_academica (
    id_secretaria        SERIAL PRIMARY KEY,
    rfc                  VARCHAR(13) REFERENCES modulo_investigacion.docentes(rfc),
    nivel_estudio        VARCHAR(30) NOT NULL,
    nombre_institucion   VARCHAR(255) NOT NULL,
    area_especializacion VARCHAR(45) NOT NULL
);
-- ================================================
-- MÓDULO DE PROYECTOS
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
    rfc_docente VARCHAR(13) NOT NULL REFERENCES modulo_investigacion.docentes(rfc),--se le agrego por que alguine debe estar a carago de los porgramas
    institucion VARCHAR(255),                 --lo nuevo que se le agrega la Institución
    periodo VARCHAR(50),                      -- lo nuevo que se agrego Periodo lo que dura el proyecto
    numero_participantes INTEGER CHECK (numero_participantes >= 0), -- los particpantes que particiapne en el programa
    descripcion_proyecto TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    total_horas INTEGER NOT NULL DEFAULT 0,
    estado_avance VARCHAR(20) CHECK (estado_avance IN ('NO_INICIADO', 'EN_PROGRESO', 'COMPLETADO')) DEFAULT 'NO_INICIADO',
    matricula_estudiante VARCHAR(30) REFERENCES public.alumnos(matricula),
    id_empresa BIGINT NOT NULL REFERENCES public.empresas(id_empresa),
    id_tipo_programa BIGINT NOT NULL REFERENCES modulo_proyectos.tipos_programa(id_tipo_programa)
);

-- se crea para la relacion de que proyecto pertenece a que carreras, ya que un proyecto puede pertenecer a varias carreras y una carrera puede tener varios proyectos
CREATE TABLE modulo_proyectos.proyecto_carreras (
    id_programa BIGINT NOT NULL REFERENCES modulo_proyectos.programas(id_programa) ON DELETE CASCADE,
    id_carrera  BIGINT NOT NULL REFERENCES public.carreras(id_carrera) ON DELETE CASCADE,
    PRIMARY KEY (id_programa, id_carrera)
);

--se crea para saber que alumnos participan en el programa, ya que un alumno puede participar en varios programas y un programa puede tener varios alumnos si quieres se puede
--eliminar
CREATE TABLE modulo_proyectos.participantes_programa (
    id_programa BIGINT NOT NULL REFERENCES modulo_proyectos.programas(id_programa) ON DELETE CASCADE,
    matricula   VARCHAR(30) NOT NULL REFERENCES public.alumnos(matricula) ON DELETE CASCADE,
    PRIMARY KEY (id_programa, matricula)
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
-- MÓDULO DE PRÁCTICAS PROFESIONALES
-- ================================================
CREATE TABLE modulo_practicas.fechas (
    id_fecha         SERIAL PRIMARY KEY,
    nombre_documento VARCHAR(150) NOT NULL,
    periodo          modulo_practicas.periodo_label NOT NULL,
    fecha_apertura   DATE NOT NULL,
    fecha_cierre     DATE NOT NULL,
    CONSTRAINT fechas_rango_valido CHECK (fecha_cierre > fecha_apertura)
);

CREATE TABLE modulo_practicas.documentos_alumno (
    id_doc          BIGSERIAL PRIMARY KEY,
    matricula       VARCHAR(30) NOT NULL REFERENCES public.alumnos(matricula) ON DELETE CASCADE,
    practica        modulo_practicas.practica_tipo NOT NULL,
    doc_tipo        modulo_practicas.doc_tipo NOT NULL,
    nombre_archivo  TEXT NOT NULL,          -- ej. carta_presentacion.pdf
    ruta_relativa   TEXT NOT NULL,          -- ej. alumnos/20260001/P1/carta_presentacion.pdf
    mime_type       TEXT,
    tamano_bytes    BIGINT,
    checksum_sha256 TEXT,
    subido_en       TIMESTAMP DEFAULT now(),
    estado_revision TEXT CHECK (estado_revision IN ('PENDIENTE','APROBADO','RECHAZADO')) DEFAULT 'PENDIENTE',
    CONSTRAINT unq_doc_por_tipo UNIQUE (matricula, practica, doc_tipo)
);

CREATE TABLE modulo_practicas.calificaciones (
    id_calificacion SERIAL PRIMARY KEY,
    matricula       VARCHAR(30) NOT NULL REFERENCES public.alumnos(matricula) ON DELETE CASCADE,
    practica        modulo_practicas.practica_tipo NOT NULL,
    calificacion    NUMERIC(5,2) NOT NULL CHECK (calificacion >= 0 AND calificacion <= 10),
    observaciones   TEXT,
    actualizado_en  TIMESTAMP DEFAULT now(),
    CONSTRAINT unq_calif_por_practica UNIQUE (matricula, practica)
);

--inidices utiles
CREATE INDEX idx_doc_matricula_practica ON modulo_practicas.documentos_alumno (matricula, practica);
CREATE INDEX idx_doc_practica ON modulo_practicas.documentos_alumno (practica);


-- ================================================
-- MÓDULO DE RESIDENCIAS
-- ================================================

-- Periodos académicos en los que se ofrecen residencias (ej. AGO-DIC 2026)
CREATE TABLE modulo_residencias.periodos (
    id_periodo     SERIAL PRIMARY KEY,
    nombre_periodo VARCHAR(100) NOT NULL,
    fecha_inicio   DATE NOT NULL,
    fecha_fin      DATE NOT NULL,
    activo         BOOLEAN DEFAULT FALSE
);

-- Plazas/oportunidades que las empresas ofrecen para un periodo dado
CREATE TABLE modulo_residencias.oportunidades (
    id_oportunidad     SERIAL PRIMARY KEY,
    id_empresa         BIGINT REFERENCES public.empresas(id_empresa),
    id_periodo         INTEGER REFERENCES modulo_residencias.periodos(id_periodo),
    area_trabajo       VARCHAR(255) NOT NULL,
    descripcion_area   TEXT NOT NULL,
    horario            VARCHAR(100),
    modalidad          VARCHAR(50) CHECK (modalidad IN ('PRESENCIAL', 'EN LINEA', 'MIXTO')),
    plazas_disponibles INT NOT NULL
);

-- Tabla principal que representa la residencia de un alumno que tecnicamente seria solo para novenos creo
CREATE TABLE modulo_residencias.residencias (
    id_residencia          SERIAL PRIMARY KEY,
    id_alumno              INTEGER UNIQUE REFERENCES public.alumnos(id_alumno),
    id_oportunidad         INTEGER REFERENCES modulo_residencias.oportunidades(id_oportunidad),
    rfc_asesor_interno     VARCHAR(13) REFERENCES public.usuarios(rfc),
    propuesta_proyecto_url TEXT,
    nombre_proyecto_final  VARCHAR(255),
    estado_proceso         VARCHAR(50) CHECK (estado_proceso IN ('POSTULADO', 'PROPUESTA RECHAZADA', 'APROBADO', 'EN CURSO', 'FINALIZADO', 'LIBERADO')) DEFAULT 'POSTULADO',
    folio                  VARCHAR(100) UNIQUE,
    fecha_postulacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documentos que el alumno va entregando durante su residencia
CREATE TABLE modulo_residencias.documentos_entrega (
    id_documento    SERIAL PRIMARY KEY,
    id_residencia   INTEGER REFERENCES modulo_residencias.residencias(id_residencia),
    tipo_documento  VARCHAR(100) CHECK (tipo_documento IN ('PROPUESTA_PROYECTO', 'CARTA_PRESENTACION', 'CARTA_ACEPTACION', 'REPORTE_PERIODICO', 'REPORTE_FINAL', 'CARTA_LIBERACION')),
    url_documento   TEXT NOT NULL,
    fecha_entrega   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_revision VARCHAR(50) CHECK (estado_revision IN ('PENDIENTE', 'APROBADO', 'RECHAZADO')) DEFAULT 'PENDIENTE',
    comentarios     TEXT
);
--nueva tabla agregada para los administradores de residencias, ya que se necesita saber que administrador es el que esta a cargo de las residencias
CREATE TABLE modulo_residencias.administradores (
    id_administrador     BIGSERIAL PRIMARY KEY,
    id_usuario            BIGINT REFERENCES public.usuarios(id),
    area_responsabilidad  VARCHAR(100)
);
--la tabla anteror se puede quitar pero fue una idea para ver quien esta acargo
--de dicha residencia osea ver comoesta distribuida los crago solo

-- ================================================
-- MÓDULO 2: SEGUIMIENTO DE LOS PROYECTOS
-- ================================================

--El cronograma que arma el docente para SU proyecto
CREATE TABLE modulo_proyectos.cronograma_proyecto (
    id_cronograma   BIGSERIAL PRIMARY KEY,
    id_programa     BIGINT NOT NULL REFERENCES modulo_proyectos.programas(id_programa) ON DELETE CASCADE,
    nombre_etapa    VARCHAR(150) NOT NULL,      -- ej. "Avance 1: Marco teórico"
    orden           INTEGER NOT NULL,            -- para saber cuál va antes de cuál
    requisitos      TEXT,                        -- qué debe entregar el alumno en esta etapa
    fecha_apertura  DATE NOT NULL,
    fecha_cierre    DATE NOT NULL,
    CONSTRAINT chk_cronograma_fechas CHECK (fecha_cierre > fecha_apertura)
);

--Lo que cada alumno sube contra cada etapa del cronograma
CREATE TABLE modulo_proyectos.avances_participante (
    id_avance        BIGSERIAL PRIMARY KEY,
    id_cronograma    BIGINT NOT NULL REFERENCES modulo_proyectos.cronograma_proyecto(id_cronograma) ON DELETE CASCADE,
    matricula        VARCHAR(30) NOT NULL REFERENCES public.alumnos(matricula) ON DELETE CASCADE,
    nombre_archivo   TEXT,
    ruta_relativa    TEXT,
    subido_en        TIMESTAMP DEFAULT now(),
    estado_revision  VARCHAR(20) CHECK (estado_revision IN ('PENDIENTE','APROBADO','RECHAZADO')) DEFAULT 'PENDIENTE',
    comentarios      TEXT,                        -- por qué se rechazó / qué falta corregir es mas que ganada para ver si se hizo bien o se excliace l mtvo de por que se rechazo
    CONSTRAINT unq_avance UNIQUE (id_cronograma, matricula)
);
-- ============================================================
-- Verifica rol ADMINISTRADOR antes de registrar un admin de proyectos
-- ============================================================
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


-- ============================================================
-- Guarda el archivo anterior antes de sobreescribirlo (histórico de proyectos)
-- ============================================================
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


-- ============================================================
-- Histórico de documentos/evidencias de investigación (4 triggers, 1 función)
-- ============================================================
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


-- ============================================================
-- Función de apoyo: dar de alta usuario + permiso (sin trigger)
-- ============================================================
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


-- ============================================================
-- Función de apoyo: revisar si un usuario tiene un permiso (sin trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_tiene_permiso(
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
    FROM public.permisos_usuario pu
    WHERE (pu.id_usuario = p_id_usuario AND pu.id_permiso = p_id_permiso)
       OR (SELECT 1 FROM public.usuarios u
             JOIN public.usuario_roles ur ON u.id = ur.id_usuario
             JOIN public.roles r ON ur.id_rol = r.id_rol
             WHERE u.id = p_id_usuario AND r.nombre_rol = 'SUPER-ADMINISTRADOR')
    LIMIT 1;

    RETURN COALESCE(v_existe, FALSE);
END;
$$;


-- ============================================================
    --Verifica admin del módulo de residencias
-- ============================================================
CREATE OR REPLACE FUNCTION modulo_residencias.fn_verificar_admin_residencias()
RETURNS TRIGGER AS $$
DECLARE
  v_es_super_admin BOOLEAN;
  v_es_admin_rol   BOOLEAN;
  v_tiene_permiso  BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.usuario_roles ur
    JOIN public.roles r ON r.id_rol = ur.id_rol
    WHERE ur.id_usuario = NEW.id_usuario AND r.nombre_rol = 'SUPER-ADMINISTRADOR'
  ) INTO v_es_super_admin;

  IF v_es_super_admin THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.usuario_roles ur
    JOIN public.roles r ON r.id_rol = ur.id_rol
    WHERE ur.id_usuario = NEW.id_usuario AND r.nombre_rol = 'ADMINISTRADOR'
  ) INTO v_es_admin_rol;

  SELECT EXISTS (
    SELECT 1 FROM public.permisos_usuario pu
    JOIN public.permisos p ON p.id_permiso = pu.id_permiso
    WHERE pu.id_usuario = NEW.id_usuario AND lower(p.nombre) = lower('Practicas-Admin')
  ) INTO v_tiene_permiso;

  IF NOT (v_es_admin_rol AND v_tiene_permiso) THEN
    RAISE EXCEPTION 'El usuario % no es administrador del módulo de Prácticas (requiere rol ADMINISTRADOR y permiso Practicas-Admin).', NEW.id_usuario;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_verificar_admin_residencias_before_insupd
BEFORE INSERT OR UPDATE ON modulo_residencias.administradores
FOR EACH ROW
EXECUTE FUNCTION modulo_residencias.fn_verificar_admin_residencias();




-- ============================================================
-- Descuenta 1 cupo cada vez que se asocia un alumno al proyecto
-- ============================================================
CREATE OR REPLACE FUNCTION modulo_proyectos.fn_descontar_cupo_participante()
RETURNS TRIGGER AS $$
DECLARE
    v_actualizado INT;
BEGIN
    UPDATE modulo_proyectos.programas
       SET numero_participantes = numero_participantes - 1
     WHERE id_programa = NEW.id_programa
       AND numero_participantes > 0;

    GET DIAGNOSTICS v_actualizado = ROW_COUNT;

    IF v_actualizado = 0 THEN
        RAISE EXCEPTION 'Ya no hay cupos disponibles en el proyecto %', NEW.id_programa;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_descontar_cupo_before_insert
BEFORE INSERT ON modulo_proyectos.participantes_programa
FOR EACH ROW
EXECUTE FUNCTION modulo_proyectos.fn_descontar_cupo_participante();


-- ============================================================
-- PENDIENTE DE CONFIRMAR: libera el cupo si un alumno se sale del proyecto
-- ============================================================
CREATE OR REPLACE FUNCTION modulo_proyectos.fn_liberar_cupo_participante()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE modulo_proyectos.programas
       SET numero_participantes = numero_participantes + 1
     WHERE id_programa = OLD.id_programa;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_liberar_cupo_after_delete
AFTER DELETE ON modulo_proyectos.participantes_programa
FOR EACH ROW
EXECUTE FUNCTION modulo_proyectos.fn_liberar_cupo_participante();
