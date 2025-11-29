-- Script para crear la base de datos de TEST
-- Script to create the TEST database

-- 1. Borrar si existe / Drop if exists
DROP DATABASE IF EXISTS gymnomads_test;

-- 2. Crear la base de datos / Create the database
CREATE DATABASE gymnomads_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gymnomads_test;

-- 3. Crear tablas (Copia exacta de gymnomads_schema.sql)
-- 3. Create tables (Exact copy of gymnomads_schema.sql)

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
  `is_suspended` TINYINT(1) NOT NULL DEFAULT 0,
  `gym_hours` VARCHAR(255) DEFAULT NULL,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0
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
  FOREIGN KEY (`home_gym_id`) REFERENCES `gyms`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Crear la tabla para las visitas
-- Create table for visits

CREATE TABLE `visits` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `gym_id` INT NOT NULL,
  `visited_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`gym_id`) REFERENCES `gyms`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;
