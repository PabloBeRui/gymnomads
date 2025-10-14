-- Script para resetear completamente la base de datos 'gymnomads'
-- Script to completely reset the 'gymnomads' database


-- 1. Selecciono la base de datos.
-- 1. Select the database .

USE gymnomads;



-- 2. Desactivo temporalmente la comprobación de claves foráneas. / Temporarily disable foreign key checks.


SET FOREIGN_KEY_CHECKS = 0;



-- 3. Vacío todas las tablas. / Truncate all tables.

-- TRUNCATE TABLE es más rápido que DELETE y resetea los contadores de AUTO_INCREMENT.
-- TRUNCATE TABLE is faster than DELETE and resets the AUTO_INCREMENT counters.



TRUNCATE TABLE visits;
TRUNCATE TABLE users;
TRUNCATE TABLE gyms;

-- 4. Reactivo la comprobación de claves foráneas.
-- 4. Re-enable foreign key checks.


SET FOREIGN_KEY_CHECKS = 1;