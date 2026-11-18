CREATE DATABASE IF NOT EXISTS soporte_tickets
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE soporte_tickets;

DROP VIEW  IF EXISTS vista_indicadores;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS tecnicos;
DROP TABLE IF EXISTS categorias;

-- ---------------------------------------------------------------------
-- 1) Categorías (área, prefijo del código y SLA en horas)
-- ---------------------------------------------------------------------
CREATE TABLE categorias (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(60) NOT NULL UNIQUE,
  area      ENUM('Soporte Técnico','Logística') NOT NULL,
  prefijo   CHAR(2) NOT NULL,          -- ST-001, LG-003...
  sla_horas INT NOT NULL               -- tiempo máximo de resolución
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2) Técnicos / responsables (lista del desplegable "Responsable")
-- ---------------------------------------------------------------------
CREATE TABLE tecnicos (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3) Usuarios con rol (login y registro)
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  correo         VARCHAR(120) NOT NULL UNIQUE,
  clave_hash     VARCHAR(255) NOT NULL,          -- contraseña cifrada
  rol            ENUM('solicitante','tecnico') NOT NULL DEFAULT 'solicitante',
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4) Tickets
-- ---------------------------------------------------------------------
CREATE TABLE tickets (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  solicitante      VARCHAR(100) NOT NULL,
  correo           VARCHAR(120) NOT NULL,
  categoria_id     INT NOT NULL,
  descripcion      TEXT NOT NULL,
  estado           ENUM('Recibida','Asignada','En proceso','Resuelta')
                   NOT NULL DEFAULT 'Recibida',
  tecnico_id       INT NULL,
  fecha_creacion   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_asignacion DATETIME NULL,      -- tiempo de respuesta
  fecha_cierre     DATETIME NULL,      -- tiempo de resolución
  archivado        TINYINT(1) NOT NULL DEFAULT 0,   -- 1 = oculto del panel (sigue en indicadores)
  CONSTRAINT fk_ticket_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  CONSTRAINT fk_ticket_tecnico   FOREIGN KEY (tecnico_id)   REFERENCES tecnicos(id),
  INDEX idx_estado (estado),
  INDEX idx_fecha  (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5) Vista para el tablero de indicadores (página y Power BI)
-- ---------------------------------------------------------------------
CREATE VIEW vista_indicadores AS
SELECT
  t.id,
  CONCAT(c.prefijo, '-', LPAD(t.id, 3, '0')) AS codigo,
  t.solicitante,
  c.area,
  c.nombre AS categoria,
  t.estado,
  COALESCE(te.nombre, 'Sin asignar') AS responsable,
  t.fecha_creacion,
  t.fecha_asignacion,
  t.fecha_cierre,
  c.sla_horas,
  ROUND(TIMESTAMPDIFF(MINUTE, t.fecha_creacion, t.fecha_asignacion) / 60, 2) AS horas_respuesta,
  ROUND(TIMESTAMPDIFF(MINUTE, t.fecha_creacion, t.fecha_cierre) / 60, 2)     AS horas_resolucion,
  CASE
    WHEN t.fecha_cierre IS NULL THEN 'Abierto'
    WHEN TIMESTAMPDIFF(MINUTE, t.fecha_creacion, t.fecha_cierre) <= c.sla_horas * 60 THEN 'Cumple'
    ELSE 'No cumple'
  END AS estado_sla
FROM tickets t
JOIN categorias c      ON c.id  = t.categoria_id
LEFT JOIN tecnicos te  ON te.id = t.tecnico_id;

-- =====================================================================
--  DATOS INICIALES
-- =====================================================================

-- Categorías (ajusta los SLA a los reales de tu área)
INSERT INTO categorias (nombre, area, prefijo, sla_horas) VALUES
 ('Software',            'Soporte Técnico', 'ST', 8),
 ('Hardware',            'Soporte Técnico', 'ST', 24),
 ('Red',                 'Soporte Técnico', 'ST', 4),
 ('Préstamo de equipo',  'Logística',       'LG', 24),
 ('Despacho / Envío',    'Logística',       'LG', 48),
 ('Otro',                'Soporte Técnico', 'ST', 48);

-- Técnicos (los tres primeros son de ejemplo; Fabian y Alan son los reales)
INSERT INTO tecnicos (nombre) VALUES
 ('Maria fernanda Mateus'),
 ('andres Matiz'),
 ('Ivan andres Serrato'),
 ('Fabian David Trillos'),
 ('Alan Sastre');

-- Tickets de ejemplo (para que el panel y el tablero no salgan vacíos).
-- Si no los quieres, borra este bloque INSERT completo.
INSERT INTO tickets (solicitante, correo, categoria_id, descripcion, estado, tecnico_id,
                     fecha_creacion, fecha_asignacion, fecha_cierre) VALUES
 ('Ana Martínez', 'ana@uniminuto.edu.co',   1, 'No inicia sesión en el aula virtual', 'Resuelta', 1,
   DATE_SUB(NOW(), INTERVAL 30 HOUR), DATE_SUB(NOW(), INTERVAL 29 HOUR), DATE_SUB(NOW(), INTERVAL 26 HOUR)),
 ('Luis Torres',  'luis@uniminuto.edu.co',  1, 'Instalación de software', 'Resuelta', 2,
   DATE_SUB(NOW(), INTERVAL 20 HOUR), DATE_SUB(NOW(), INTERVAL 19 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR)),
 ('Marta Rojas',  'marta@uniminuto.edu.co', 4, 'Préstamo de portátil para evento', 'En proceso', 3,
   DATE_SUB(NOW(), INTERVAL 6 HOUR),  DATE_SUB(NOW(), INTERVAL 5 HOUR), NULL),
 ('Pedro Silva',  'pedro@uniminuto.edu.co', 3, 'Sin internet en la oficina 2', 'Asignada', 1,
   DATE_SUB(NOW(), INTERVAL 3 HOUR),  DATE_SUB(NOW(), INTERVAL 2 HOUR), NULL),
 ('Sofía Díaz',   'sofia@uniminuto.edu.co', 2, 'El monitor no enciende', 'Recibida', NULL,
   DATE_SUB(NOW(), INTERVAL 1 HOUR),  NULL, NULL);

