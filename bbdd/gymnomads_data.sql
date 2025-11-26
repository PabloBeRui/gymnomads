-- Insertar datos de prueba en la base de datos 'gymnomads'
-- Insert test data into the 'gymnomads' database

-- Usar la base de datos correcta
-- Use the correct database

USE gymnomads;

-- Insertar gimnasios de prueba
-- Insert test gyms
-- Se han añadido las columnas 'is_suspended' y 'gym_hours'
-- Added 'is_suspended' and 'gym_hours' columns

INSERT INTO gyms (name, address, city, latitude, longitude, logo_url, main_image_url, is_suspended, gym_hours) VALUES
('Gymnomads Admin', 'Sistema', 'N/A', 0, 0, NULL, NULL, 0, '24/7');

-- Ejemplos adicionales (descomentar para usar):
-- Additional examples (uncomment to use):

-- ('CostaFit A Coruña', 'Av. de Hércules, 30, 15002 A Coruña', 'A Coruña', 43.3765, -8.4093, NULL, NULL, 0, 'L-V: 07:00 - 23:00, S-D: 09:00 - 14:00'),
-- ('PowerGym Madrid', 'Calle Falsa 123, Madrid', 'Madrid', 40.4168, -3.7038, NULL, NULL, 1, 'L-D: 06:00 - 00:00'); -- Ejemplo de gimnasio suspendido (1)


-- Insertar usuarios de prueba (con roles y contraseñas hasheadas)
-- Insert test users (with roles and hashed passwords)

-- NOTA: Las contraseñas se insertan ya hasheadas con bcrypt. / NOTE: Passwords are inserted already hashed with bcrypt.

-- La contraseña para 'admin@gymnomads.com' es 'admin123' / The password for 'admin@gymnomads.com' is 'admin123'
-- La contraseña para 'user@gymnomads.com' es 'user123' / The password for 'user@gymnomads.com' is 'user123'
-- La contraseña para 'manager@gymnomads.com' es 'manager123' / The password for 'manager@gymnomads.com' is 'manager123'

INSERT INTO users (first_name, last_name, email, password, home_gym_id, role) VALUES
('Admin', 'GymNomads', 'admin@gymnomads.com', '$2b$10$HADUOtIlZejOSCzXE8/JVupFmOgVUuqUBDAwVpRLT/ay4NFZ1Pawi', 1, 'admin');

-- Ejemplos adicionales (descomentar para usar):
-- ('Luis', 'Breogan Rivas', 'user@gymnomads.com', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', 2, 'user'),
-- ('Manager', 'CostaFit', 'manager@gymnomads.com', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', 2, 'manager');