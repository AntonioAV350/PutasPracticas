-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: sistema_gestion2
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `actividadesensenanza`
--

DROP TABLE IF EXISTS `actividadesensenanza`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividadesensenanza` (
  `idActEnsenanza` int(11) NOT NULL AUTO_INCREMENT,
  `nombreAct` varchar(45) NOT NULL,
  `descripcionAct` varchar(255) NOT NULL,
  `tipoAct` int(11) NOT NULL,
  `materia` int(11) NOT NULL,
  `cicloEscolar` varchar(45) NOT NULL,
  `fecha` date NOT NULL,
  PRIMARY KEY (`idActEnsenanza`),
  KEY `fk_tipoAct_idx` (`tipoAct`),
  KEY `fk_materia_idx` (`materia`),
  CONSTRAINT `fk_materia` FOREIGN KEY (`materia`) REFERENCES `materia` (`idMateria`),
  CONSTRAINT `fk_tipoAct` FOREIGN KEY (`tipoAct`) REFERENCES `tipoactividad` (`idtipoActividad`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `actividadestutorias`
--

DROP TABLE IF EXISTS `actividadestutorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividadestutorias` (
  `idActTutorias` int(11) NOT NULL AUTO_INCREMENT,
  `nombreActTutorias` varchar(45) NOT NULL,
  `descripcionActTutorias` varchar(255) NOT NULL,
  `fechaActTutorias` date NOT NULL,
  `prog_academico` int(11) NOT NULL,
  PRIMARY KEY (`idActTutorias`),
  KEY `prog_academico_idx` (`prog_academico`),
  CONSTRAINT `prog_academico` FOREIGN KEY (`prog_academico`) REFERENCES `prog_academicos` (`idprog_academicos`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `colaboradores`
--

DROP TABLE IF EXISTS `colaboradores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colaboradores` (
  `id_colaborador` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` text NOT NULL,
  `tipo` text NOT NULL,
  `id_proyecto` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_colaborador`),
  UNIQUE KEY `id_colaborador` (`id_colaborador`),
  KEY `fk_id_proyecto_idx` (`id_proyecto`),
  CONSTRAINT `fk_id_proyecto` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos_investigacion` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detalle_docente`
--

DROP TABLE IF EXISTS `detalle_docente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_docente` (
  `id_Det_d` int(11) NOT NULL AUTO_INCREMENT,
  `docente` varchar(45) NOT NULL,
  `materia` int(11) NOT NULL,
  PRIMARY KEY (`id_Det_d`),
  UNIQUE KEY `id_Det_d` (`id_Det_d`),
  KEY `fk_docente_idx` (`docente`) USING BTREE,
  KEY `fk_materia_idx` (`materia`) USING BTREE,
  CONSTRAINT `fk_docente` FOREIGN KEY (`docente`) REFERENCES `usuarios` (`rfc`),
  CONSTRAINT `fk_materiaDoc` FOREIGN KEY (`materia`) REFERENCES `materia` (`idMateria`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `documentos_docentes`
--

DROP TABLE IF EXISTS `documentos_docentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentos_docentes` (
  `idDocumento` int(11) NOT NULL AUTO_INCREMENT,
  `idUsuario` varchar(13) NOT NULL,
  `nombreDoc` varchar(100) NOT NULL,
  `idTipoDocumento` int(11) NOT NULL,
  `urlDocumento` varchar(100) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idDocumento`),
  KEY `idUsuario` (`idUsuario`),
  KEY `idTipoDocumento` (`idTipoDocumento`),
  CONSTRAINT `documentos_docentes_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`rfc`),
  CONSTRAINT `documentos_docentes_ibfk_2` FOREIGN KEY (`idTipoDocumento`) REFERENCES `tipo_documento` (`idTipoDocumento`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `evidencias_investigacion`
--

DROP TABLE IF EXISTS `evidencias_investigacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evidencias_investigacion` (
  `id_evidencia` int(11) NOT NULL AUTO_INCREMENT,
  `nombreEvi` text NOT NULL,
  `urlEvi` text NOT NULL,
  `id_proyecto` int(11) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_evidencia`),
  KEY `id_proyecto` (`id_proyecto`),
  CONSTRAINT `evidencias_investigacion_ibfk_1` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos_investigacion` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `evidenciasensenanza`
--

DROP TABLE IF EXISTS `evidenciasensenanza`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evidenciasensenanza` (
  `idevidenciasE` int(11) NOT NULL AUTO_INCREMENT,
  `nombreEvi` varchar(45) NOT NULL,
  `descripcionEvi` varchar(255) NOT NULL,
  `urlEvi` varchar(255) NOT NULL,
  `idActividad` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idevidenciasE`),
  KEY `fk_idActividad_idx` (`idActividad`),
  CONSTRAINT `fk_idActividad` FOREIGN KEY (`idActividad`) REFERENCES `actividadesensenanza` (`idActEnsenanza`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `evidenciastutorias`
--

DROP TABLE IF EXISTS `evidenciastutorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evidenciastutorias` (
  `idevidenciasT` int(11) NOT NULL AUTO_INCREMENT,
  `nombreEvi` varchar(45) NOT NULL,
  `descripcionEvi` varchar(255) NOT NULL,
  `urlEvi` varchar(255) NOT NULL,
  `idActividad` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idevidenciasT`),
  KEY `idActividad_idx` (`idActividad`),
  CONSTRAINT `idActividad` FOREIGN KEY (`idActividad`) REFERENCES `actividadestutorias` (`idActTutorias`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `historial_cambios`
--

DROP TABLE IF EXISTS `historial_cambios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_cambios` (
  `idhistorial_cambios` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `idusuario` varchar(13) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `tabla_afectada` varchar(50) DEFAULT NULL,
  `valor_anterior` varchar(50) DEFAULT NULL,
  `valor_nuevo` varchar(50) DEFAULT NULL,
  `fecha_cambio` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idhistorial_cambios`),
  KEY `idusuario` (`idusuario`),
  CONSTRAINT `historial_cambios_ibfk_1` FOREIGN KEY (`idusuario`) REFERENCES `usuarios` (`rfc`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `materia`
--

DROP TABLE IF EXISTS `materia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materia` (
  `idMateria` int(11) NOT NULL AUTO_INCREMENT,
  `nombreMateria` varchar(70) NOT NULL,
  `prog_academico` int(11) NOT NULL,
  `semestre` int(11) DEFAULT NULL,
  PRIMARY KEY (`idMateria`),
  KEY `fk_prog_academico_idx` (`prog_academico`),
  KEY `fk_semestre_idx` (`semestre`),
  CONSTRAINT `fk_prog_academico` FOREIGN KEY (`prog_academico`) REFERENCES `prog_academicos` (`idprog_academicos`),
  CONSTRAINT `fk_semestre` FOREIGN KEY (`semestre`) REFERENCES `semestre_grupo` (`is_SG`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permisos`
--

DROP TABLE IF EXISTS `permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permisos` (
  `idPermisos` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idPermisos`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prog_academicos`
--

DROP TABLE IF EXISTS `prog_academicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prog_academicos` (
  `idprog_academicos` int(11) NOT NULL AUTO_INCREMENT,
  `nombreProg` varchar(70) NOT NULL,
  `nivel_estudios` varchar(35) NOT NULL,
  PRIMARY KEY (`idprog_academicos`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `proyectos_investigacion`
--

DROP TABLE IF EXISTS `proyectos_investigacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proyectos_investigacion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` text NOT NULL,
  `ciclo_escolar` text DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_final` date DEFAULT NULL,
  `linea_investigacion` text DEFAULT NULL,
  `estatus` int(11) DEFAULT NULL,
  `recursos_utilizados` text DEFAULT NULL,
  `tipo_de_recurso` text DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  `id_lider_proyecto` varchar(13) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_id_lider_constraint` (`id_lider_proyecto`),
  CONSTRAINT `fk_id_lider_constraint` FOREIGN KEY (`id_lider_proyecto`) REFERENCES `usuarios` (`rfc`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `secretariaac`
--

DROP TABLE IF EXISTS `secretariaac`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `secretariaac` (
  `idSecretaria` int(11) NOT NULL AUTO_INCREMENT,
  `rfc` varchar(13) NOT NULL,
  `nivelEstudio` char(30) NOT NULL,
  `nombreInstitucion` char(255) NOT NULL,
  `areaEspecializacion` varchar(45) NOT NULL,
  PRIMARY KEY (`idSecretaria`),
  KEY `rfc` (`rfc`),
  CONSTRAINT `secretariaAc_ibfk_1` FOREIGN KEY (`rfc`) REFERENCES `usuarios` (`rfc`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `semestre_grupo`
--

DROP TABLE IF EXISTS `semestre_grupo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `semestre_grupo` (
  `is_SG` int(11) NOT NULL AUTO_INCREMENT,
  `semestre` varchar(35) NOT NULL,
  `grupo` varchar(35) NOT NULL,
  PRIMARY KEY (`is_SG`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tipo_documento`
--

DROP TABLE IF EXISTS `tipo_documento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_documento` (
  `idTipoDocumento` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` char(255) NOT NULL,
  PRIMARY KEY (`idTipoDocumento`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tipoactividad`
--

DROP TABLE IF EXISTS `tipoactividad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipoactividad` (
  `idtipoActividad` int(11) NOT NULL AUTO_INCREMENT,
  `nombretipoAct` varchar(45) NOT NULL,
  PRIMARY KEY (`idtipoActividad`),
  UNIQUE (`nombretipoAct`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `rfc` varchar(13) NOT NULL,
  `nombre_Doce` varchar(45) DEFAULT NULL,
  `apellido_paterno` varchar(20) DEFAULT NULL,
  `apellido_materno` varchar(25) DEFAULT NULL,
  `password` text DEFAULT NULL,
  `n_plaza` varchar(35) DEFAULT NULL,
  `sexo` varchar(6) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`rfc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios_permisos`
--

DROP TABLE IF EXISTS `usuarios_permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios_permisos` (
  `idPermiso` int(11) NOT NULL,
  `idUsuario` varchar(13) NOT NULL,
  PRIMARY KEY (`idPermiso`,`idUsuario`),
  KEY `fk_idPermisos_idx` (`idPermiso`),
  KEY `fk_idUsuario_idx` (`idUsuario`),
  CONSTRAINT `fk_idPermisos` FOREIGN KEY (`idPermiso`) REFERENCES `permisos` (`idPermisos`),
  CONSTRAINT `fk_idUsuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`rfc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'sistema_gestion2'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-08-07 18:10:53
