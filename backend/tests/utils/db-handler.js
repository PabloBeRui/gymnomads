const db = require('../../config/db');

// Esta función limpia todas las tablas de la base de datos de TEST.
// This function clears all tables in the TEST database.
const clearDatabase = async () => {
  // Verificar DOBLEMENTE que estamos en test antes de borrar nada.
  // DOUBLE check that we are in test mode before deleting anything.
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('DANGER: Attempting to clear database in non-test environment!');
  }

  const connection = await db.getConnection();
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE visits');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('TRUNCATE TABLE gyms');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  } finally {
    connection.release();
  }
};

// Esta función cierra la conexión al pool (necesario para que Jest termine).
// This function closes the connection pool (necessary for Jest to finish).
const closeDatabase = async () => {
  await db.end();
};

module.exports = { clearDatabase, closeDatabase };
