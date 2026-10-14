-- ========================================================
-- ParkFlow - Sistema de Gestión de Parqueaderos
-- Base de Datos MySQL para XAMPP
-- ========================================================

CREATE DATABASE IF NOT EXISTS `parkflow_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `parkflow_db`;

-- --------------------------------------------------------
-- 1. Tabla de Usuarios (Operadores y Administradores)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NULL,
  `role` ENUM('ADMIN', 'OPERADOR') NOT NULL DEFAULT 'OPERADOR',
  `shift` VARCHAR(50) NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `avatar_url` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Tabla de Tarifas por Tipo de Vehículo
-- --------------------------------------------------------
DROP TABLE IF EXISTS `rates`;
CREATE TABLE `rates` (
  `id` VARCHAR(50) NOT NULL,
  `vehicle_type` ENUM('automovil', 'motocicleta', 'camioneta', 'bicicleta') NOT NULL UNIQUE,
  `label` VARCHAR(100) NOT NULL,
  `rate_per_minute` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `rate_per_fraction15m` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `rate_per_hour` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `rate_per_day` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `rate_per_month` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `grace_period_minutes` INT NOT NULL DEFAULT 10,
  `lost_ticket_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Tabla de Celdas de Parqueadero (Parking Spaces)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `parking_spaces`;
CREATE TABLE `parking_spaces` (
  `id` VARCHAR(50) NOT NULL,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `zone` VARCHAR(50) NOT NULL,
  `allowed_type` ENUM('automovil', 'motocicleta', 'camioneta', 'bicicleta') NOT NULL,
  `status` ENUM('libre', 'ocupado', 'mantenimiento', 'reservado') NOT NULL DEFAULT 'libre',
  `current_vehicle_plate` VARCHAR(20) NULL,
  `current_movement_id` VARCHAR(50) NULL,
  `notes` TEXT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_spaces_status` (`status`),
  INDEX `idx_spaces_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Tabla de Movimientos (Tickets de Entrada y Salida)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `movements`;
CREATE TABLE `movements` (
  `id` VARCHAR(50) NOT NULL,
  `ticket_number` VARCHAR(50) NOT NULL UNIQUE,
  `plate` VARCHAR(20) NOT NULL,
  `vehicle_type` ENUM('automovil', 'motocicleta', 'camioneta', 'bicicleta') NOT NULL,
  `space_id` VARCHAR(50) NOT NULL,
  `space_code` VARCHAR(20) NOT NULL,
  `entry_time` DATETIME NOT NULL,
  `exit_time` DATETIME NULL,
  `operator_entry_id` VARCHAR(50) NOT NULL,
  `operator_entry_name` VARCHAR(100) NOT NULL,
  `operator_exit_id` VARCHAR(50) NULL,
  `operator_exit_name` VARCHAR(100) NULL,
  `helmets_count` INT NULL DEFAULT 0,
  `entry_notes` TEXT NULL,
  `exit_notes` TEXT NULL,
  `client_name` VARCHAR(100) NULL,
  `client_phone` VARCHAR(50) NULL,
  `total_minutes` INT NULL DEFAULT 0,
  `billed_minutes` INT NULL DEFAULT 0,
  `grace_applied` TINYINT(1) NULL DEFAULT 0,
  `subtotal` DECIMAL(12,2) NULL DEFAULT 0.00,
  `discount` DECIMAL(12,2) NULL DEFAULT 0.00,
  `lost_ticket_charge` TINYINT(1) NULL DEFAULT 0,
  `total_paid` DECIMAL(12,2) NULL DEFAULT 0.00,
  `payment_method` ENUM('efectivo', 'nequi', 'daviplata', 'tarjeta', 'convenio') NULL,
  `amount_received` DECIMAL(12,2) NULL DEFAULT 0.00,
  `change_given` DECIMAL(12,2) NULL DEFAULT 0.00,
  `status` ENUM('activo', 'completado', 'cancelado') NOT NULL DEFAULT 'activo',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_movements_plate` (`plate`),
  INDEX `idx_movements_status` (`status`),
  INDEX `idx_movements_entry` (`entry_time`),
  INDEX `idx_movements_ticket` (`ticket_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- DATOS INICIALES (SEEDS)
-- ========================================================

-- Usuarios iniciales
INSERT INTO `users` (`id`, `name`, `email`, `role`, `shift`, `active`) VALUES
('usr-admin-1', 'Carlos Mendoza', 'admin@parkflow.co', 'ADMIN', 'Mañana (06:00 - 14:00)', 1),
('usr-op-1', 'Andrés Charry', 'operador1@parkflow.co', 'OPERADOR', 'Mañana (06:00 - 14:00)', 1),
('usr-op-2', 'Valentina Perdomo', 'operador2@parkflow.co', 'OPERADOR', 'Tarde (14:00 - 22:00)', 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Tarifas iniciales
INSERT INTO `rates` (`id`, `vehicle_type`, `label`, `rate_per_minute`, `rate_per_fraction15m`, `rate_per_hour`, `rate_per_day`, `rate_per_month`, `grace_period_minutes`, `lost_ticket_fee`) VALUES
('rate-auto', 'automovil', 'Automóvil Particular', 70.00, 1200.00, 4200.00, 28000.00, 180000.00, 10, 20000.00),
('rate-moto', 'motocicleta', 'Motocicleta', 35.00, 600.00, 2200.00, 14000.00, 90000.00, 10, 15000.00),
('rate-camioneta', 'camioneta', 'Camioneta / SUV / Van', 80.00, 1400.00, 5000.00, 35000.00, 220000.00, 10, 20000.00),
('rate-bici', 'bicicleta', 'Bicicleta / Patineta', 15.00, 300.00, 1000.00, 6000.00, 40000.00, 15, 10000.00)
ON DUPLICATE KEY UPDATE `label`=VALUES(`label`);

-- Celdas iniciales: Zona A (Automóviles y Camionetas, A-01 a A-10)
INSERT INTO `parking_spaces` (`id`, `code`, `zone`, `allowed_type`, `status`, `current_vehicle_plate`, `current_movement_id`, `notes`) VALUES
('sp-a-01', 'A-01', 'Zona A', 'automovil', 'libre', NULL, NULL, NULL),
('sp-a-02', 'A-02', 'Zona A', 'automovil', 'libre', NULL, NULL, NULL),
('sp-a-03', 'A-03', 'Zona A', 'automovil', 'ocupado', 'KEO-492', 'mov-act-1', NULL),
('sp-a-04', 'A-04', 'Zona A', 'automovil', 'mantenimiento', NULL, NULL, 'Revisión de demarcación y pintura'),
('sp-a-05', 'A-05', 'Zona A', 'camioneta', 'libre', NULL, NULL, NULL),
('sp-a-06', 'A-06', 'Zona A', 'camioneta', 'libre', NULL, NULL, NULL),
('sp-a-07', 'A-07', 'Zona A', 'camioneta', 'ocupado', 'WMS-831', 'mov-act-3', NULL),
('sp-a-08', 'A-08', 'Zona A', 'automovil', 'libre', NULL, NULL, NULL),
('sp-a-09', 'A-09', 'Zona A', 'automovil', 'libre', NULL, NULL, NULL),
('sp-a-10', 'A-10', 'Zona A', 'automovil', 'libre', NULL, NULL, NULL),

-- Zona B (Motocicletas, B-01 a B-15)
('sp-b-01', 'B-01', 'Zona B', 'motocicleta', 'libre', NULL, NULL, NULL),
('sp-b-02', 'B-02', 'Zona B', 'motocicleta', 'ocupado', 'NXL-10F', 'mov-act-2', NULL),
('sp-b-03', 'B-03', 'Zona B', 'motocicleta', 'libre', NULL, NULL, NULL),
('sp-b-04', 'B-04', 'Zona B', 'motocicleta', 'libre', NULL, NULL, NULL),
('sp-b-05', 'B-05', 'Zona B', 'motocicleta', 'libre', NULL, NULL, NULL),
('sp-b-06', 'B-06', 'Zona B', 'motocicleta', 'libre', NULL, NULL, NULL),
('sp-b-07', 'B-07', 'Zona B', 'motocicleta', 'libre', NULL, NULL, NULL),
('sp-b-08', 'B-08', 'Zona B', 'motocicleta', 'ocupado', 'VRT-45C', 'mov-act-4', NULL),
('sp-b-09', 'B-09', 'Zona B', 'motocicleta', 'libre', NULL, NULL, NULL),
('sp-b-10', 'B-10', 'Zona B', 'motocicleta', 'libre', NULL, NULL, NULL),
('sp-b-11', 'B-11', 'Zona B', 'motocicleta', 'libre', NULL, NULL, NULL),
('sp-b-12', 'B-12', 'Zona B', 'motocicleta', 'libre', NULL, NULL, NULL),
('sp-b-13', 'B-13', 'Zona B', 'motocicleta', 'libre', NULL, NULL, NULL),
('sp-b-14', 'B-14', 'Zona B', 'motocicleta', 'libre', NULL, NULL, NULL),
('sp-b-15', 'B-15', 'Zona B', 'motocicleta', 'reservado', NULL, NULL, 'Reservado para mensajería droguería aliada'),

-- Zona C (Nivel 2 Automóvil, C-01 a C-10)
('sp-c-01', 'C-01', 'Zona C', 'automovil', 'ocupado', 'HUK-719', 'mov-act-5', NULL),
('sp-c-02', 'C-02', 'Zona C', 'automovil', 'libre', NULL, NULL, NULL),
('sp-c-03', 'C-03', 'Zona C', 'automovil', 'libre', NULL, NULL, NULL),
('sp-c-04', 'C-04', 'Zona C', 'automovil', 'libre', NULL, NULL, NULL),
('sp-c-05', 'C-05', 'Zona C', 'automovil', 'libre', NULL, NULL, NULL),
('sp-c-06', 'C-06', 'Zona C', 'automovil', 'libre', NULL, NULL, NULL),
('sp-c-07', 'C-07', 'Zona C', 'automovil', 'libre', NULL, NULL, NULL),
('sp-c-08', 'C-08', 'Zona C', 'automovil', 'libre', NULL, NULL, NULL),
('sp-c-09', 'C-09', 'Zona C', 'automovil', 'libre', NULL, NULL, NULL),
('sp-c-10', 'C-10', 'Zona C', 'automovil', 'libre', NULL, NULL, NULL),

-- Zona D (Bicicletas, D-01 a D-06)
('sp-d-01', 'D-01', 'Zona D', 'bicicleta', 'libre', NULL, NULL, NULL),
('sp-d-02', 'D-02', 'Zona D', 'bicicleta', 'ocupado', 'B-04', 'mov-act-6', NULL),
('sp-d-03', 'D-03', 'Zona D', 'bicicleta', 'libre', NULL, NULL, NULL),
('sp-d-04', 'D-04', 'Zona D', 'bicicleta', 'libre', NULL, NULL, NULL),
('sp-d-05', 'D-05', 'Zona D', 'bicicleta', 'libre', NULL, NULL, NULL),
('sp-d-06', 'D-06', 'Zona D', 'bicicleta', 'libre', NULL, NULL, NULL)
ON DUPLICATE KEY UPDATE `zone`=VALUES(`zone`);

-- Movimientos Activos
INSERT INTO `movements` (
  `id`, `ticket_number`, `plate`, `vehicle_type`, `space_id`, `space_code`, 
  `entry_time`, `operator_entry_id`, `operator_entry_name`, `helmets_count`, 
  `entry_notes`, `status`
) VALUES
('mov-act-1', 'TK-10024', 'KEO-492', 'automovil', 'sp-a-03', 'A-03', DATE_SUB(NOW(), INTERVAL 105 MINUTE), 'usr-op-1', 'Andrés Charry', 0, 'Vehículo en buen estado', 'activo'),
('mov-act-2', 'TK-10025', 'NXL-10F', 'motocicleta', 'sp-b-02', 'B-02', DATE_SUB(NOW(), INTERVAL 48 MINUTE), 'usr-op-1', 'Andrés Charry', 2, '2 cascos negros bajo custodia en locker #4', 'activo'),
('mov-act-3', 'TK-10026', 'WMS-831', 'camioneta', 'sp-a-07', 'A-07', DATE_SUB(NOW(), INTERVAL 210 MINUTE), 'usr-op-1', 'Andrés Charry', 0, 'Portaequipaje en techo', 'activo'),
('mov-act-4', 'TK-10027', 'VRT-45C', 'motocicleta', 'sp-b-08', 'B-08', DATE_SUB(NOW(), INTERVAL 22 MINUTE), 'usr-op-1', 'Andrés Charry', 1, NULL, 'activo'),
('mov-act-5', 'TK-10028', 'HUK-719', 'automovil', 'sp-c-01', 'C-01', DATE_SUB(NOW(), INTERVAL 340 MINUTE), 'usr-op-1', 'Andrés Charry', 0, NULL, 'activo'),
('mov-act-6', 'TK-10029', 'B-04', 'bicicleta', 'sp-d-02', 'D-02', DATE_SUB(NOW(), INTERVAL 75 MINUTE), 'usr-op-1', 'Andrés Charry', 0, 'Bicicleta GW color verde con candado propio', 'activo')
ON DUPLICATE KEY UPDATE `plate`=VALUES(`plate`);

-- Movimientos Completados (Historial para estadísticas del día)
INSERT INTO `movements` (
  `id`, `ticket_number`, `plate`, `vehicle_type`, `space_id`, `space_code`, 
  `entry_time`, `exit_time`, `operator_entry_id`, `operator_entry_name`, 
  `operator_exit_id`, `operator_exit_name`, `total_minutes`, `billed_minutes`, 
  `grace_applied`, `subtotal`, `discount`, `lost_ticket_charge`, `total_paid`, 
  `payment_method`, `amount_received`, `change_given`, `status`
) VALUES
('mov-comp-1', 'TK-10018', 'FTZ-882', 'automovil', 'sp-a-01', 'A-01', DATE_SUB(NOW(), INTERVAL 380 MINUTE), DATE_SUB(NOW(), INTERVAL 260 MINUTE), 'usr-op-1', 'Andrés Charry', 'usr-op-1', 'Andrés Charry', 120, 120, 0, 8400.00, 0.00, 0, 8400.00, 'efectivo', 10000.00, 1600.00, 'completado'),
('mov-comp-2', 'TK-10019', 'EHL-32D', 'motocicleta', 'sp-b-01', 'B-01', DATE_SUB(NOW(), INTERVAL 340 MINUTE), DATE_SUB(NOW(), INTERVAL 240 MINUTE), 'usr-op-1', 'Andrés Charry', 'usr-op-1', 'Andrés Charry', 100, 100, 0, 4400.00, 0.00, 0, 4400.00, 'nequi', 4400.00, 0.00, 'completado'),
('mov-comp-3', 'TK-10020', 'GKA-519', 'camioneta', 'sp-a-05', 'A-05', DATE_SUB(NOW(), INTERVAL 310 MINUTE), DATE_SUB(NOW(), INTERVAL 180 MINUTE), 'usr-op-1', 'Andrés Charry', 'usr-op-1', 'Andrés Charry', 130, 130, 0, 11400.00, 0.00, 0, 11400.00, 'tarjeta', 11400.00, 0.00, 'completado'),
('mov-comp-4', 'TK-10021', 'QWE-991', 'automovil', 'sp-c-04', 'C-04', DATE_SUB(NOW(), INTERVAL 200 MINUTE), DATE_SUB(NOW(), INTERVAL 192 MINUTE), 'usr-op-1', 'Andrés Charry', 'usr-op-1', 'Andrés Charry', 8, 0, 1, 0.00, 0.00, 0, 0.00, 'efectivo', 0.00, 0.00, 'completado')
ON DUPLICATE KEY UPDATE `plate`=VALUES(`plate`);
