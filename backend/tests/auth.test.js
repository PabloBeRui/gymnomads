/**
 * =============================================================================
 * TEST DE INTEGRACIÓN: Autenticación
 * INTEGRATION TEST: Authentication
 * =============================================================================
 *
 * Pruebas para el registro y login de usuarios (User Controller).
 *
 * Tests for user registration and login (User Controller).
 *
 * =============================================================================
 */

const request = require('supertest');
const app = require('../index');
const db = require('../config/db');
const { clearDatabase, closeDatabase } = require('./utils/db-handler');

// Antes de todos los tests, conectamos a la BBDD (ya lo hace el pool, pero nos aseguramos) // Before all tests, connect to the DB (pool does it, but just to be sure)
beforeAll(async () => {
  // Aquí podríamos ejecutar migraciones si fuera necesario, pero confiamos en que db:test:create ya se ejecutó.
  // Here we could run migrations if necessary, but we trust db:test:create has already run.
});

// Después de CADA test, limpiamos las tablas para no dejar basura // After EACH test, clear tables to avoid leaving garbage
afterEach(async () => {
  await clearDatabase();
});

// Al terminar TODO, cerramos la conexión // When ALL done, close the connection
afterAll(async () => {
  await closeDatabase();
});

describe('Auth Endpoints', () => {
  
  // Datos de prueba // Test data
  const newUser = {
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    password: 'password123',
    home_gym_id: 1 // Asegúrate de que el gimnasio ID 1 existe en tu BBDD de test (lo insertaremos abajo si no) // Ensure gym ID 1 exists in your test DB (we'll insert it below if not)
  };

  // Como limpiamos la BBDD, necesitamos insertar un gimnasio para que la FK no falle // Since we clear the DB, we need to insert a gym so the FK doesn't fail
  beforeEach(async () => {
     const connection = await db.getConnection();
     await connection.query(`
       INSERT IGNORE INTO gyms (id, name, address, city, latitude, longitude, is_suspended, is_deleted) 
       VALUES (1, 'Test Gym', 'Test St', 'Test City', 0, 0, 0, 0)
     `);
     connection.release();
  });

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send(newUser);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Usuario registrado con éxito');
      expect(res.body).toHaveProperty('userId');
    });

    it('should fail when registering with an existing email', async () => {
      // 1. Registrar primero // 1. Register first
      await request(app).post('/api/users/register').send(newUser);

      // 2. Intentar registrar de nuevo // 2. Try to register again
      const res = await request(app)
        .post('/api/users/register')
        .send(newUser);

      expect(res.statusCode).toEqual(409); // Email ya registrado // Email already registered
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // Registrar el usuario antes de probar el login // Register user before testing login
      await request(app).post('/api/users/register').send(newUser);
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: newUser.email,
          password: newUser.password
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('message', 'Login correcto');
      // La API actual no devuelve el objeto user, solo token y mensaje // Current API doesn't return user object, only token and message
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: newUser.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(401); // O 404 según tu implementación // Or 404 depending on your implementation
    });
  });
});
