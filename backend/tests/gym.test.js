/**
 * =============================================================================
 * TEST DE INTEGRACIÓN: Gestión de Gimnasios
 * INTEGRATION TEST: Gym Management
 * =============================================================================
 *
 * Pruebas para el CRUD de gimnasios (Gym Controller).
 * Verifica permisos de administrador y listados públicos.
 *
 * Tests for gym CRUD operations (Gym Controller).
 * Verifies admin permissions and public listings.
 *
 * =============================================================================
 */

const request = require('supertest');
const app = require('../index');
const db = require('../config/db');
const { clearDatabase, closeDatabase } = require('./utils/db-handler');

// Después de CADA test, limpiamos las tablas // After EACH test, clear tables
afterEach(async () => {
  await clearDatabase();
});

// Al terminar TODO, cerramos la conexión // When ALL done, close the connection
afterAll(async () => {
  await closeDatabase();
});

describe('Gym Endpoints', () => {
  
  // Datos de prueba para Admin y Usuario // Test data for Admin and User
  const adminUser = {
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@test.com',
    password: 'adminpassword',
    role: 'admin',
    home_gym_id: 1
  };

  const normalUser = {
    first_name: 'Normal',
    last_name: 'User',
    email: 'user@test.com',
    password: 'userpassword',
    role: 'user',
    home_gym_id: 1
  };

  const newGym = {
    name: 'New Test Gym',
    address: '123 Fitness St',
    city: 'Madrid',
    latitude: 40.4168,
    longitude: -3.7038,
    gym_hours: '09:00 - 22:00',
    // Datos del manager requeridos por el controlador / Manager data required by controller
    manager_first_name: 'Manager',
    manager_last_name: 'Test',
    manager_password: 'managerpassword',
    manager_phone: '123456789'
  };

  let adminToken;
  let userToken;

  // Setup inicial para crear un "gym base" (necesario para registrar usuarios) y obtener tokens
  // Initial setup to create a "base gym" (needed to register users) and get tokens
  beforeEach(async () => {
    const connection = await db.getConnection();
    
    // Insertar gimnasios de forma segura y simple // Insert gyms safely and simply
    await connection.query(`
      INSERT IGNORE INTO gyms (id, name, address, city, latitude, longitude, is_suspended, is_deleted) 
      VALUES (1, 'Base Gym', 'Base St', 'Base City', 0, 0, 0, 0)
    `);
    
    await connection.query(`
      INSERT INTO gyms (name, address, city, latitude, longitude, is_suspended, is_deleted) 
      VALUES ('Visible Gym', 'Visible St', 'Madrid', 40.0, -3.0, 0, 0)
    `);

    connection.release();

    // Registrar Admin // Register Admin
    // Nota: El endpoint de registro crea usuarios con rol 'user' por defecto. 
    // Necesitamos forzar el rol 'admin' en BBDD manualmente para probar.
    // Note: Registration endpoint creates 'user' role by default.
    // We need to manually force 'admin' role in DB to test.
    
    await request(app).post('/api/users/register').send(adminUser);
    // Actualizar a admin manualmente // Manually update to admin
    const connection2 = await db.getConnection();
    await connection2.query('UPDATE users SET role = ? WHERE email = ?', ['admin', adminUser.email]);
    connection2.release();

    // Login Admin y guardar token // Login Admin and save token
    const resAdmin = await request(app).post('/api/users/login').send({
      email: adminUser.email,
      password: adminUser.password
    });
    adminToken = resAdmin.body.token;

    // Registrar y Login Normal User // Register and Login Normal User
    await request(app).post('/api/users/register').send(normalUser);
    const resUser = await request(app).post('/api/users/login').send({
      email: normalUser.email,
      password: normalUser.password
    });
    userToken = resUser.body.token;
  });

  describe('GET /api/gyms', () => {
    it('should return a list of gyms', async () => {
      const res = await request(app).get('/api/gyms');
      expect(res.statusCode).toEqual(200);
      // La API devuelve { data: [...], total: N } // API returns { data: [...], total: N }
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1); // Al menos el 'Base Gym' // At least 'Base Gym'
      expect(res.body.data[0]).toHaveProperty('name');
    });
  });

  describe('POST /api/gyms', () => {
    it('should create a new gym if user is admin', async () => {
      const res = await request(app)
        .post('/api/gyms')
        .set('Authorization', `Bearer ${adminToken}`) // Enviar token de admin // Send admin token
        .send(newGym);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Gimnasio y manager creados con éxito');
      expect(res.body).toHaveProperty('gymId');

      // Verificar que se guardó en BBDD // Verify it was saved in DB
      const listRes = await request(app).get('/api/gyms');
      const createdGym = listRes.body.data.find(g => g.name === newGym.name);
      expect(createdGym).toBeTruthy();
    });

    it('should return 403 (or 401 if token invalid) if user is not admin', async () => {
      const res = await request(app)
        .post('/api/gyms')
        .set('Authorization', `Bearer ${userToken}`) // Token de usuario normal // Normal user token
        .send(newGym);

      // Esperamos 403 Forbidden, pero si la autenticación falla antes, será 401.
      // Expect 403 Forbidden, but if auth fails first, it will be 401.
      expect([401, 403]).toContain(res.statusCode);
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .post('/api/gyms')
        .send(newGym);

      // Esperamos 401 Unauthorized // Expect 401 Unauthorized
      expect(res.statusCode).toEqual(401);
    });
  });
});
