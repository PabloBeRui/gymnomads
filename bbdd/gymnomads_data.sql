-- Insertar datos de prueba en la base de datos 'gymnomads'
-- Insert test data into the 'gymnomads' database

-- Usar la base de datos correcta
-- Use the correct database

USE gymnomads;

-- Insertar gimnasios de prueba, incluyendo las nuevas columnas para imágenes
-- Insert test gyms, including the new columns for images

INSERT INTO gyms (name, address, city, latitude, longitude, logo_url, main_image_url) VALUES
('Urban Fitness Center', 'Rúa da Raíña, 2, 27001 Lugo', 'Lugo', 43.0107, -7.5570, NULL, NULL),
('CostaFit A Coruña', 'Av. de Hércules, 30, 15002 A Coruña', 'A Coruña', 43.3765, -8.4093, NULL, NULL);

-- Insertar usuarios de prueba (con roles y contraseñas hasheadas)
-- Insert test users (with roles and hashed passwords)

-- NOTA: Las contraseñas se insertan ya hasheadas con bcrypt. / NOTE: Passwords are inserted already hashed with bcrypt.

-- La contraseña para 'admin@gymnomads.com' es 'admin123' / The password for 'admin@gymnomads.com' is 'admin123'
-- La contraseña para 'user@gymnomads.com' es 'user123' / The password for 'user@gymnomads.com' is 'user123'
-- La contraseña para 'manager@gymnomads.com' es 'manager123' / The password for 'manager@gymnomads.com' is 'manager123'

INSERT INTO users (first_name, last_name, email, password, home_gym_id, role) VALUES
('Admin', 'GymNomads', 'admin@gymnomads.com', '$2b$10$HADUOtIlZejOSCzXE8/JVupFmOgVUuqUBDAwVpRLT/ay4NFZ1Pawi', 1, 'admin'),
('Luis', 'Breogan Rivas', 'user@gymnomads.com', '$2b$10$ERnZnvId06PKuQ.r0xUyCu48x0kqDIQha9He.91y8B4Sd6R4d8DeO', 2, 'user'),
('Manager', 'CostaFit', 'manager@gymnomads.com', '$2b$10$INq5/AIYoh.BzDXPOFlRm.o7q.zMvJAtr.o2iwCFGj9NAOa/o5xwq', 2, 'manager');