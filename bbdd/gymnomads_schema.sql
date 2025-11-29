-- Crear la base de datos 'gymnomads' si no existe
-- Create the 'gymnomads' database if it doesn't exist

DROP DATABASE IF EXISTS gymnomads;
CREATE DATABASE gymnomads CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gymnomads;

-- Crear la tabla para los gimnasios
-- Create table for gyms

CREATE TABLE `gyms` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `address` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `latitude` DECIMAL(10, 8) NOT NULL,
  `longitude` DECIMAL(11, 8) NOT NULL,
  `logo_url` VARCHAR(255) NULL,       
  `main_image_url` VARCHAR(255) NULL,
  
  -- ==================================================================
  -- NUEVO CAMPO PARA SUSPENSIÓN (ESTADO ACTIVO/INACTIVO)
  -- NEW FIELD FOR SUSPENSION (ACTIVE/INACTIVE STATE)
  -- Esta columna indica si el gimnasio está temporalmente suspendido.
  -- A diferencia de 'is_deleted', el gimnasio sigue existiendo pero
  -- no es visible para los usuarios regulares.
  -- 0 = Activo (default), 1 = Suspendido
  --
  -- This column indicates if the gym is temporarily suspended.
  -- Unlike 'is_deleted', the gym still exists but is not visible
  -- to regular users.
  -- 0 = Active (default), 1 = Suspended
  `is_suspended` TINYINT(1) NOT NULL DEFAULT 0,
  -- ==================================================================

  -- ==================================================================
  -- NUEVO CAMPO PARA HORARIOS
  -- NEW FIELD FOR OPENING HOURS
  -- Campo de texto libre para describir el horario de apertura.
  -- Free text field to describe opening hours.
  `gym_hours` VARCHAR(255) DEFAULT NULL,
  -- ==================================================================
  
  -- ==================================================================
  -- MODIFICACIÓN PARA "SOFT DELETE" (BORRADO LÓGICO)
  -- MODIFICATION FOR "SOFT DELETE" (LOGICAL DELETION)
  -- Esta columna se usa para marcar gimnasios como "borrados" (1) 
  -- sin eliminarlos físicamente de la BBDD, 
  -- previniendo así la pérdida de datos en cascada de usuarios y visitas.
  -- 0 = Activo (default), 1 = Borrado
  --
  -- This column is used to mark gyms as "deleted" (1)
  -- without physically removing them from the DB,
  -- thus preventing cascading data loss of users and visits.
  -- 0 = Active (default), 1 = Deleted
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0
  -- ==================================================================

) ENGINE=InnoDB;

-- Crear la tabla para los usuarios
-- Create table for users

CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `profile_picture` VARCHAR(255) NULL,
  `home_gym_id` INT NOT NULL,
  `role` ENUM('user','manager','admin') NOT NULL DEFAULT 'user',
  `registered_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- ==================================================================
  -- MODIFICACIÓN PARA "SOFT DELETE" (BORRADO LÓGICO)
  -- Se cambia 'ON DELETE CASCADE' por 'ON DELETE RESTRICT'.
  -- Esto evita que un usuario sea eliminado automáticamente si su 
  -- gimnasio de origen se borra (lo cual ya no haremos).
  --
  -- MODIFICATION FOR "SOFT DELETE" (LOGICAL DELETION)
  -- Changed 'ON DELETE CASCADE' to 'ON DELETE RESTRICT'.
  -- This prevents a user from being automatically deleted if their 
  -- home gym is deleted (which we will no longer do).
  FOREIGN KEY (`home_gym_id`) REFERENCES `gyms`(`id`) ON DELETE RESTRICT
  -- ==================================================================

) ENGINE=InnoDB;

-- Crear la tabla para las visitas
-- Create table for visits

CREATE TABLE `visits` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `gym_id` INT NOT NULL,
  `visited_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- La FK de 'user_id' SÍ mantiene ON DELETE CASCADE. 
  -- Si un usuario se borra, sus visitas deben borrarse (ej. GDPR).
  -- The 'user_id' FK DOES keep ON DELETE CASCADE.
  -- If a user is deleted, their visits should be deleted (e.g., GDPR).
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  
  -- ==================================================================
  -- MODIFICACIÓN PARA "SOFT DELETE" (BORRADO LÓGICO)
  -- Se cambia 'ON DELETE CASCADE' por 'ON DELETE RESTRICT'.
  -- Esto evita que el historial de visitas se borre si un gimnasio 
  -- se marca como eliminado. El historial debe persistir.
  --
  -- MODIFICATION FOR "SOFT DELETE" (LOGICAL DELETION)
  -- Changed 'ON DELETE CASCADE' to 'ON DELETE RESTRICT'.
  -- This prevents visit history from being deleted if a gym
  -- is marked as deleted. The history must persist.
  FOREIGN KEY (`gym_id`) REFERENCES `gyms`(`id`) ON DELETE RESTRICT
  -- ==================================================================

) ENGINE=InnoDB;