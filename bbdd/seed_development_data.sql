-- Script de datos de prueba para GymNomads (entorno de desarrollo)
-- Test data script for GymNomads (development environment)

USE gymnomads;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE visits;
TRUNCATE TABLE users;
TRUNCATE TABLE gyms;
SET FOREIGN_KEY_CHECKS = 1;

-- =======================================================================================
-- 1. GIMNASIOS (12 en total) / GYMS (12 total)
-- =======================================================================================
INSERT INTO gyms (id, name, address, city, latitude, longitude, logo_url, main_image_url, is_suspended, gym_hours, is_deleted) VALUES
(1, 'Spartan Gym', 'Calle Mayor 1', 'Madrid', 40.4168, -3.7038, 'uploads/gym_logos/gym_logo1.png', 'uploads/gym_images/gym_photo1.png', 0, '06:00 - 23:00', 0),
(2, 'Hercules Fitness', 'Av. Diagonal 200', 'Barcelona', 41.3851, 2.1734, 'uploads/gym_logos/gym_logo2.png', 'uploads/gym_images/gym_photo2.png', 0, '24/7', 0),
(3, 'Olympus Center', 'Calle Colon 5', 'Valencia', 39.4699, -0.3763, 'uploads/gym_logos/gym_logo3.png', 'uploads/gym_images/gym_photo3.png', 0, '07:00 - 22:00', 0),
(4, 'Titan Arena', 'Calle Sierpes 10', 'Sevilla', 37.3891, -5.9845, 'uploads/gym_logos/gym_logo4.png', 'uploads/gym_images/gym_photo4.png', 0, '08:00 - 23:00', 0),
(5, 'Iron House', 'Gran Via 30', 'Bilbao', 43.2630, -2.9350, 'uploads/gym_logos/gym_logo5.png', 'uploads/gym_images/gym_photo5.png', 0, '06:00 - 00:00', 0),
(6, 'CrossFit Z', 'Calle Larios 15', 'Malaga', 36.7213, -4.4214, 'uploads/gym_logos/gym_logo6.png', 'uploads/gym_images/gym_photo6.png', 0, '09:00 - 21:00', 0),
(7, 'Power Zone', 'Paseo Maritimo 100', 'Palma', 39.5696, 2.6502, 'uploads/gym_logos/gym_logo7.png', 'uploads/gym_images/gym_photo7.png', 0, '07:00 - 22:30', 0),
(8, 'Urban Fit', 'Plaza del Pilar 2', 'Zaragoza', 41.6488, -0.8891, 'uploads/gym_logos/gym_logo8.png', 'uploads/gym_images/gym_photo8.png', 0, '24/7', 0),
(9, 'Nomad Strength', 'Rua do Franco 50', 'Santiago', 42.8782, -8.5448, 'uploads/gym_logos/gym_logo9.png', 'uploads/gym_images/gym_photo9.png', 0, '08:30 - 22:00', 0),
(10, 'Global Gym', 'Calle San Francisco 4', 'Alicante', 38.3452, -0.4810, 'uploads/gym_logos/gym_logo10.png', 'uploads/gym_images/gym_photo10.png', 0, '06:00 - 23:00', 0),
(11, 'No Logo Gym', 'Calle Sin Nombre 1', 'Murcia', 37.9922, -1.1307, NULL, 'uploads/gym_images/gym_photo11.png', 0, '09:00 - 20:00', 0),
(12, 'Deleted Gym', 'Calle Fantasma 666', 'Vigo', 42.2406, -8.7207, 'uploads/gym_logos/gym_logo11.png', NULL, 0, 'Cerrado', 1);

-- =======================================================================================
-- 2. USUARIOS: MANAGERS (12 en total, IDs 1-12)
-- =======================================================================================
-- Password for all: 'manager123' (hashed)

INSERT INTO users (id, first_name, last_name, email, password, phone, profile_picture, home_gym_id, role) VALUES
(1, 'Carlos', 'Gómez', 'manager20@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000020', 'uploads/profile_pictures/user_profile1.png', 1, 'manager'),
(2, 'Laura', 'Fernández', 'manager21@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000021', 'uploads/profile_pictures/user_profile2.png', 2, 'manager'),
(3, 'Javier', 'Martínez', 'manager22@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000022', 'uploads/profile_pictures/user_profile3.png', 3, 'manager'),
(4, 'Ana', 'López', 'manager23@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000023', 'uploads/profile_pictures/user_profile4.png', 4, 'manager'),
(5, 'Miguel', 'Sánchez', 'manager24@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000024', 'uploads/profile_pictures/user_profile5.png', 5, 'manager'),
(6, 'Elena', 'Ruiz', 'manager25@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000025', 'uploads/profile_pictures/user_profile6.png', 6, 'manager'),
(7, 'David', 'Jiménez', 'manager26@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000026', 'uploads/profile_pictures/user_profile7.png', 7, 'manager'),
(8, 'Sofía', 'Díaz', 'manager27@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000027', 'uploads/profile_pictures/user_profile8.png', 8, 'manager'),
(9, 'Pablo', 'Moreno', 'manager28@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000028', 'uploads/profile_pictures/user_profile9.png', 9, 'manager'),
(10, 'Carmen', 'Muñoz', 'manager29@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000029', 'uploads/profile_pictures/user_profile10.png', 10, 'manager'),
(11, 'Antonio', 'Álvarez', 'manager30@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000030', NULL, 11, 'manager'),
(12, 'Isabel', 'Romero', 'manager31@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000031', NULL, 12, 'manager');

-- =======================================================================================
-- 3. USUARIOS: STANDARD (25 en total, IDs 13-37)
-- =======================================================================================
-- Password for all: 'user123' (hashed)

INSERT INTO users (id, first_name, last_name, email, password, phone, profile_picture, home_gym_id, role) VALUES
-- Usuarios MAX VISITAS (13-17)
(13, 'Roberto', 'García', 'user20@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000040', 'uploads/profile_pictures/user_profile11.png', 1, 'user'),
(14, 'Lucía', 'Navarro', 'user21@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000041', 'uploads/profile_pictures/user_profile12.png', 1, 'user'),
(15, 'Manuel', 'Torres', 'user22@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000042', 'uploads/profile_pictures/user_profile13.png', 2, 'user'),
(16, 'Patricia', 'Domínguez', 'user23@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000043', 'uploads/profile_pictures/user_profile14.png', 2, 'user'),
(17, 'Francisco', 'Vázquez', 'user24@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000044', 'uploads/profile_pictures/user_profile15.png', 3, 'user'),

-- Usuarios Sin Foto (IDs 18-21)
(18, 'Adrián', 'Ramos', 'user25@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000045', NULL, 3, 'user'),
(19, 'Beatriz', 'Gil', 'user26@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000046', NULL, 4, 'user'),
(20, 'Diego', 'Serrano', 'user27@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000047', NULL, 4, 'user'),
(21, 'Clara', 'Molina', 'user28@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000048', NULL, 5, 'user'),

-- Resto de usuarios normales
(22, 'Alberto', 'Blanco', 'user29@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000049', 'uploads/profile_pictures/user_profile16.png', 5, 'user'),
(23, 'Raquel', 'Castro', 'user30@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000050', 'uploads/profile_pictures/user_profile17.png', 6, 'user'),
(24, 'Fernando', 'Ortega', 'user31@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000051', 'uploads/profile_pictures/user_profile18.png', 6, 'user'),
(25, 'Sara', 'Delgado', 'user32@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000052', 'uploads/profile_pictures/user_profile19.png', 7, 'user'),
(26, 'Victor', 'Morales', 'user33@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000053', 'uploads/profile_pictures/user_profile20.png', 7, 'user'),
(27, 'Cristina', 'Rubio', 'user34@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000054', 'uploads/profile_pictures/user_profile21.png', 8, 'user'),
(28, 'Rubén', 'Marín', 'user35@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000055', 'uploads/profile_pictures/user_profile22.png', 8, 'user'),
(29, 'Natalia', 'Iglesias', 'user36@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000056', 'uploads/profile_pictures/user_profile23.png', 9, 'user'),
(30, 'Andrés', 'Garrido', 'user37@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000057', 'uploads/profile_pictures/user_profile24.png', 9, 'user'),
(31, 'Eva', 'Cortés', 'user38@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000058', 'uploads/profile_pictures/user_profile25.png', 10, 'user'),
(32, 'Jorge', 'Cano', 'user39@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000059', 'uploads/profile_pictures/user_profile26.png', 10, 'user'),

-- Usuarios en Gimnasio Borrado (IDs 33-37) -> Home Gym ID 12
(33, 'Marina', 'Santos', 'user40@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000060', 'uploads/profile_pictures/user_profile27.png', 12, 'user'),
(34, 'Óscar', 'Lozano', 'user41@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000061', 'uploads/profile_pictures/user_profile28.png', 12, 'user'),
(35, 'Teresa', 'Guerrero', 'user42@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000062', 'uploads/profile_pictures/user_profile29.png', 12, 'user'),
(36, 'Hugo', 'Prieto', 'user43@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000063', 'uploads/profile_pictures/user_profile30.png', 12, 'user'),
(37, 'Paula', 'Méndez', 'user44@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000064', 'uploads/profile_pictures/user_profile1.png', 12, 'user'),

-- Admin extra para pruebas (ID 38)
(38, 'Administrador', 'Sistema', 'admin@gymnomads.dev', '$2b$10$HADUOtIlZejOSCzXE8/JVupFmOgVUuqUBDAwVpRLT/ay4NFZ1Pawi', '600999999', NULL, 1, 'admin');


-- =======================================================================================
-- 4. VISITAS / VISITS
-- =======================================================================================

-- A) 5 Usuarios con LIMITE ALCANZADO (IDs 13-17)
INSERT INTO visits (user_id, gym_id, visited_at) VALUES
-- User 13 (Roberto García)
(13, 4, NOW()), (13, 5, NOW()), (13, 6, NOW()), (13, 7, NOW()), (13, 8, NOW()), 
(13, 9, NOW()), (13, 10, NOW()), (13, 2, NOW()), (13, 3, NOW()), (13, 4, DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- User 14 (Lucía Navarro)
(14, 4, NOW()), (14, 5, NOW()), (14, 6, NOW()), (14, 7, NOW()), (14, 8, NOW()), 
(14, 9, NOW()), (14, 10, NOW()), (14, 2, NOW()), (14, 3, NOW()), (14, 4, DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- User 15 (Manuel Torres)
(15, 1, NOW()), (15, 3, NOW()), (15, 4, NOW()), (15, 5, NOW()), (15, 6, NOW()), 
(15, 7, NOW()), (15, 8, NOW()), (15, 9, NOW()), (15, 10, NOW()), (15, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- User 16 (Patricia Domínguez)
(16, 1, NOW()), (16, 3, NOW()), (16, 4, NOW()), (16, 5, NOW()), (16, 6, NOW()), 
(16, 7, NOW()), (16, 8, NOW()), (16, 9, NOW()), (16, 10, NOW()), (16, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- User 17 (Francisco Vázquez)
(17, 1, NOW()), (17, 2, NOW()), (17, 4, NOW()), (17, 5, NOW()), (17, 6, NOW()), 
(17, 7, NOW()), (17, 8, NOW()), (17, 9, NOW()), (17, 10, NOW()), (17, 1, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- B) Visitas Varias para el resto (Histórico y Mes Actual)
INSERT INTO visits (user_id, gym_id, visited_at) VALUES
-- Admin
(38, 1, NOW()),
(38, 2, DATE_SUB(NOW(), INTERVAL 10 DAY)),

-- Managers (Testing outgoing)
(1, 2, DATE_SUB(NOW(), INTERVAL 5 DAY)), -- Carlos Gómez
(2, 3, DATE_SUB(NOW(), INTERVAL 6 DAY)), -- Laura Fernández
(3, 4, DATE_SUB(NOW(), INTERVAL 7 DAY)), -- Javier Martínez

-- Usuarios Normales (Histórico)
(22, 1, DATE_SUB(NOW(), INTERVAL 15 DAY)), -- Alberto Blanco
(22, 2, DATE_SUB(NOW(), INTERVAL 14 DAY)),
(23, 3, DATE_SUB(NOW(), INTERVAL 13 DAY)), -- Raquel Castro
(24, 4, DATE_SUB(NOW(), INTERVAL 12 DAY)), -- Fernando Ortega
(25, 5, DATE_SUB(NOW(), INTERVAL 11 DAY)), -- Sara Delgado
(26, 6, DATE_SUB(NOW(), INTERVAL 10 DAY)), -- Victor Morales
(27, 7, DATE_SUB(NOW(), INTERVAL 9 DAY)), -- Cristina Rubio
(28, 8, DATE_SUB(NOW(), INTERVAL 8 DAY)), -- Rubén Marín
(29, 9, DATE_SUB(NOW(), INTERVAL 7 DAY)), -- Natalia Iglesias
(30, 10, DATE_SUB(NOW(), INTERVAL 6 DAY)), -- Andrés Garrido
(31, 11, DATE_SUB(NOW(), INTERVAL 5 DAY)), -- Eva Cortés
(32, 1, DATE_SUB(NOW(), INTERVAL 4 DAY)), -- Jorge Cano

-- Usuarios Gimnasio Borrado
(33, 1, NOW()), (33, 2, DATE_SUB(NOW(), INTERVAL 2 DAY)), -- Marina Santos
(34, 3, NOW()), (34, 4, DATE_SUB(NOW(), INTERVAL 3 DAY)), -- Óscar Lozano
(35, 5, NOW()), (35, 6, DATE_SUB(NOW(), INTERVAL 4 DAY)), -- Teresa Guerrero
(36, 7, NOW()), (36, 8, DATE_SUB(NOW(), INTERVAL 5 DAY)), -- Hugo Prieto
(37, 9, NOW()), (37, 10, DATE_SUB(NOW(), INTERVAL 6 DAY)); -- Paula Méndez
