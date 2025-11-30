-- Script de datos de prueba para GymNomads (entorno de desarrollo)
-- Test data script for GymNomads (development environment)

USE gymnomads;

SET FOREIGN_KEY_CHECKS = 0;

-- Borrar datos existentes EXCEPTO el admin (ID 1) y el gimnasio por defecto (ID 1)
-- Delete existing data EXCEPT the admin (ID 1) and default gym (ID 1)
DELETE FROM visits;
DELETE FROM users WHERE id > 1;
DELETE FROM gyms WHERE id > 1;

SET FOREIGN_KEY_CHECKS = 1;

-- =======================================================================================
-- 1. GIMNASIOS (12 en total, IDs 2-13) / GYMS (12 total, IDs 2-13)
-- =======================================================================================
-- NOTA: Los IDs empiezan en 2 para no sobrescribir el 'Gymnomads Admin' (ID 1)
-- NOTE: IDs start at 2 to avoid overwriting 'Gymnomads Admin' (ID 1)

INSERT INTO gyms (id, name, address, city, latitude, longitude, logo_url, main_image_url, is_suspended, gym_hours, is_deleted) VALUES
(2, 'Spartan Gym', 'Calle Mayor 1', 'Madrid', 40.4168, -3.7038, 'uploads/gym_logos/gym_logo1.png', 'uploads/gym_images/gym_photo1.png', 0, '06:00 - 23:00', 0),
(3, 'Hercules Fitness', 'Av. Diagonal 200', 'Barcelona', 41.3851, 2.1734, 'uploads/gym_logos/gym_logo2.png', 'uploads/gym_images/gym_photo2.png', 0, '24/7', 0),
(4, 'Olympus Center', 'Calle Colon 5', 'Valencia', 39.4699, -0.3763, 'uploads/gym_logos/gym_logo3.png', 'uploads/gym_images/gym_photo3.png', 0, '07:00 - 22:00', 0),
(5, 'Titan Arena', 'Calle Sierpes 10', 'Sevilla', 37.3891, -5.9845, 'uploads/gym_logos/gym_logo4.png', 'uploads/gym_images/gym_photo4.png', 0, '08:00 - 23:00', 0),
(6, 'Iron House', 'Gran Via 30', 'Bilbao', 43.2630, -2.9350, 'uploads/gym_logos/gym_logo5.png', 'uploads/gym_images/gym_photo5.png', 0, '06:00 - 00:00', 0),
(7, 'CrossFit Z', 'Calle Larios 15', 'Malaga', 36.7213, -4.4214, 'uploads/gym_logos/gym_logo6.png', 'uploads/gym_images/gym_photo6.png', 0, '09:00 - 21:00', 0),
(8, 'Power Zone', 'Paseo Maritimo 100', 'Palma', 39.5696, 2.6502, 'uploads/gym_logos/gym_logo7.png', 'uploads/gym_images/gym_photo7.png', 0, '07:00 - 22:30', 0),
(9, 'Urban Fit', 'Plaza del Pilar 2', 'Zaragoza', 41.6488, -0.8891, 'uploads/gym_logos/gym_logo8.png', 'uploads/gym_images/gym_photo8.png', 0, '24/7', 0),
(10, 'Nomad Strength', 'Rua do Franco 50', 'Santiago', 42.8782, -8.5448, 'uploads/gym_logos/gym_logo9.png', 'uploads/gym_images/gym_photo9.png', 0, '08:30 - 22:00', 0),
(11, 'Global Gym', 'Calle San Francisco 4', 'Alicante', 38.3452, -0.4810, 'uploads/gym_logos/gym_logo10.png', 'uploads/gym_images/gym_photo10.png', 0, '06:00 - 23:00', 0),
(12, 'No Logo Gym', 'Calle Sin Nombre 1', 'Murcia', 37.9922, -1.1307, NULL, 'uploads/gym_images/gym_photo11.png', 0, '09:00 - 20:00', 0),
(13, 'Old School Gym', 'Calle Fantasma 666', 'Vigo', 42.2406, -8.7207, 'uploads/gym_logos/gym_logo11.png', NULL, 0, 'Cerrado', 1);

-- =======================================================================================
-- 2. USUARIOS: MANAGERS (12 en total, IDs 2-13)
-- =======================================================================================
-- NOTA: IDs desplazados +1 / NOTE: IDs shifted +1
-- Password for all: 'manager123' (hashed)

INSERT INTO users (id, first_name, last_name, email, password, phone, profile_picture, home_gym_id, role) VALUES
(2, 'Carlos', 'Gómez', 'spartangym@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000020', 'uploads/profile_pictures/user_profile1.png', 2, 'manager'),
(3, 'Laura', 'Fernández', 'herculesfitness@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000021', 'uploads/profile_pictures/user_profile2.png', 3, 'manager'),
(4, 'Javier', 'Martínez', 'olympuscenter@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000022', 'uploads/profile_pictures/user_profile3.png', 4, 'manager'),
(5, 'Ana', 'López', 'titanarena@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000023', 'uploads/profile_pictures/user_profile4.png', 5, 'manager'),
(6, 'Miguel', 'Sánchez', 'ironhouse@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000024', 'uploads/profile_pictures/user_profile5.png', 6, 'manager'),
(7, 'Elena', 'Ruiz', 'crossfitz@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000025', 'uploads/profile_pictures/user_profile6.png', 7, 'manager'),
(8, 'David', 'Jiménez', 'powerzone@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000026', 'uploads/profile_pictures/user_profile7.png', 8, 'manager'),
(9, 'Sofía', 'Díaz', 'urbanfit@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000027', 'uploads/profile_pictures/user_profile8.png', 9, 'manager'),
(10, 'Pablo', 'Moreno', 'nomadstrength@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000028', 'uploads/profile_pictures/user_profile9.png', 10, 'manager'),
(11, 'Carmen', 'Muñoz', 'globalgym@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000029', 'uploads/profile_pictures/user_profile10.png', 11, 'manager'),
(12, 'Antonio', 'Álvarez', 'nologogym@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000030', NULL, 12, 'manager'),
(13, 'Isabel', 'Romero', 'oldschoolgym@gymnomads.dev', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', '600000031', NULL, 13, 'manager');

-- =======================================================================================
-- 3. USUARIOS: STANDARD (25 en total, IDs 14-38)
-- =======================================================================================
-- NOTA: IDs desplazados +1 / NOTE: IDs shifted +1
-- Password for all: 'user123' (hashed)

INSERT INTO users (id, first_name, last_name, email, password, phone, profile_picture, home_gym_id, role) VALUES
-- Usuarios MAX VISITAS (14-18)
(14, 'Susana', 'García', 'user20@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000040', 'uploads/profile_pictures/user_profile11.png', 2, 'user'),
(15, 'Francisco', 'Navarro', 'user21@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000041', 'uploads/profile_pictures/user_profile12.png', 2, 'user'),
(16, 'Aitana', 'Torres', 'user22@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000042', 'uploads/profile_pictures/user_profile13.png', 3, 'user'),
(17, 'Alberto', 'Domínguez', 'user23@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000043', 'uploads/profile_pictures/user_profile14.png', 3, 'user'),
(18, 'Francisco', 'Vázquez', 'user24@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000044', 'uploads/profile_pictures/user_profile15.png', 4, 'user'),

-- Usuarios Sin Foto (IDs 19-22)
(19, 'Adrián', 'Ramos', 'user25@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000045', NULL, 4, 'user'),
(20, 'Beatriz', 'Gil', 'user26@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000046', NULL, 5, 'user'),
(21, 'Diego', 'Serrano', 'user27@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000047', NULL, 5, 'user'),
(22, 'Clara', 'Molina', 'user28@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000048', NULL, 6, 'user'),

-- Resto de usuarios normales (IDs 23-33)
(23, 'Alberto', 'Blanco', 'user29@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000049', 'uploads/profile_pictures/user_profile16.png', 6, 'user'),
(24, 'Brais', 'Castro', 'user30@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000050', 'uploads/profile_pictures/user_profile17.png', 7, 'user'),
(25, 'Fernando', 'Ortega', 'user31@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000051', 'uploads/profile_pictures/user_profile18.png', 7, 'user'),
(26, 'Sara', 'Delgado', 'user32@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000052', 'uploads/profile_pictures/user_profile19.png', 8, 'user'),
(27, 'Estrella', 'Morales', 'user33@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000053', 'uploads/profile_pictures/user_profile20.png', 8, 'user'),
(28, 'Cristina', 'Rubio', 'user34@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000054', 'uploads/profile_pictures/user_profile21.png', 9, 'user'),
(29, 'Carolina', 'Marín', 'user35@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000055', 'uploads/profile_pictures/user_profile22.png', 9, 'user'),
(30, 'Natalia', 'Iglesias', 'user36@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000056', 'uploads/profile_pictures/user_profile23.png', 10, 'user'),
(31, 'Andrés', 'Garrido', 'user37@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000057', 'uploads/profile_pictures/user_profile24.png', 10, 'user'),
(32, 'Eva', 'Cortés', 'user38@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000058', 'uploads/profile_pictures/user_profile25.png', 11, 'user'),
(33, 'Maria', 'Cano', 'user39@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000059', 'uploads/profile_pictures/user_profile26.png', 11, 'user'),

-- Usuarios en Gimnasio Borrado (IDs 34-38) -> Home Gym ID 13
(34, 'Jorge', 'Santos', 'user40@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000060', 'uploads/profile_pictures/user_profile27.png', 13, 'user'),
(35, 'Iria', 'Lozano', 'user41@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000061', 'uploads/profile_pictures/user_profile28.png', 13, 'user'),
(36, 'Teresa', 'Guerrero', 'user42@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000062', 'uploads/profile_pictures/user_profile29.png', 13, 'user'),
(37, 'Hugo', 'Prieto', 'user43@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000063', 'uploads/profile_pictures/user_profile30.png', 13, 'user'),
(38, 'Paula', 'Méndez', 'user44@gymnomads.dev', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', '600000064', 'uploads/profile_pictures/user_profile1.png', 13, 'user');

-- Se ha eliminado el Admin extra (ID 38 original) para preservar al Admin original (ID 1)
-- The extra Admin (original ID 38) has been removed to preserve the original Admin (ID 1)

-- =======================================================================================
-- 4. VISITAS / VISITS
-- =======================================================================================
-- NOTA: Todas las referencias user_id y gym_id han sido desplazadas +1
-- NOTE: All user_id and gym_id references have been shifted +1

-- A) 5 Usuarios con LIMITE ALCANZADO (IDs 14-18)
INSERT INTO visits (user_id, gym_id, visited_at) VALUES
-- User 14 (Roberto García)
(14, 5, NOW()), (14, 6, NOW()), (14, 7, NOW()), (14, 8, NOW()), (14, 9, NOW()), 
(14, 10, NOW()), (14, 11, NOW()), (14, 3, NOW()), (14, 4, NOW()), (14, 5, DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- User 15 (Francisco Navarro - antes Lucía)
(15, 5, NOW()), (15, 6, NOW()), (15, 7, NOW()), (15, 8, NOW()), (15, 9, NOW()), 
(15, 10, NOW()), (15, 11, NOW()), (15, 3, NOW()), (15, 4, NOW()), (15, 5, DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- User 16 (Aitana Torres - antes Manuel)
(16, 2, NOW()), (16, 4, NOW()), (16, 5, NOW()), (16, 6, NOW()), (16, 7, NOW()), 
(16, 8, NOW()), (16, 9, NOW()), (16, 10, NOW()), (16, 11, NOW()), (16, 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- User 17 (Alberto Domínguez - antes Patricia)
(17, 2, NOW()), (17, 4, NOW()), (17, 5, NOW()), (17, 6, NOW()), (17, 7, NOW()), 
(17, 8, NOW()), (17, 9, NOW()), (17, 10, NOW()), (17, 11, NOW()), (17, 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- User 18 (Francisco Vázquez)
(18, 2, NOW()), (18, 3, NOW()), (18, 5, NOW()), (18, 6, NOW()), (18, 7, NOW()), 
(18, 8, NOW()), (18, 9, NOW()), (18, 10, NOW()), (18, 11, NOW()), (18, 2, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- B) Visitas Varias para el resto (Histórico y Mes Actual)
INSERT INTO visits (user_id, gym_id, visited_at) VALUES
-- Admin (ID 1 - Se mantiene original) - Visits to new Gyms (shifted)
(1, 2, NOW()),
(1, 3, DATE_SUB(NOW(), INTERVAL 10 DAY)),

-- Managers (Testing outgoing)
(2, 3, DATE_SUB(NOW(), INTERVAL 5 DAY)), -- Carlos Gómez
(3, 4, DATE_SUB(NOW(), INTERVAL 6 DAY)), -- Laura Fernández
(4, 5, DATE_SUB(NOW(), INTERVAL 7 DAY)), -- Javier Martínez

-- Usuarios Normales (Histórico)
-- Adjusting user IDs (+1) and Gym IDs (+1)
(23, 2, DATE_SUB(NOW(), INTERVAL 15 DAY)), -- Alberto Blanco
(23, 3, DATE_SUB(NOW(), INTERVAL 14 DAY)),
(24, 4, DATE_SUB(NOW(), INTERVAL 13 DAY)), -- Brais Castro
(25, 5, DATE_SUB(NOW(), INTERVAL 12 DAY)), -- Fernando Ortega
(26, 6, DATE_SUB(NOW(), INTERVAL 11 DAY)), -- Sara Delgado
(27, 7, DATE_SUB(NOW(), INTERVAL 10 DAY)), -- Estrella Morales
(28, 8, DATE_SUB(NOW(), INTERVAL 9 DAY)), -- Cristina Rubio
(29, 9, DATE_SUB(NOW(), INTERVAL 8 DAY)), -- Carolina Marín
(30, 10, DATE_SUB(NOW(), INTERVAL 7 DAY)), -- Natalia Iglesias
(31, 11, DATE_SUB(NOW(), INTERVAL 6 DAY)), -- Andrés Garrido
(32, 12, DATE_SUB(NOW(), INTERVAL 5 DAY)), -- Eva Cortés
(33, 2, DATE_SUB(NOW(), INTERVAL 4 DAY)), -- Maria Cano

-- Usuarios Gimnasio Borrado
(34, 2, NOW()), (34, 3, DATE_SUB(NOW(), INTERVAL 2 DAY)), -- Jorge Santos
(35, 4, NOW()), (35, 5, DATE_SUB(NOW(), INTERVAL 3 DAY)), -- Iria Lozano
(36, 6, NOW()), (36, 7, DATE_SUB(NOW(), INTERVAL 4 DAY)), -- Teresa Guerrero
(37, 8, NOW()), (37, 9, DATE_SUB(NOW(), INTERVAL 5 DAY)), -- Hugo Prieto
(38, 10, NOW()), (38, 11, DATE_SUB(NOW(), INTERVAL 6 DAY)); -- Paula Méndez