const request = require('supertest');
const app = require('../index');
const db = require('../config/db');
const { clearDatabase, closeDatabase } = require('./utils/db-handler');

// Antes de todos los tests, conectamos a la BBDD (ya lo hace el pool, pero nos aseguramos)
beforeAll(async () => {
  // Aquí podríamos ejecutar migraciones si fuera necesario, 
  // pero confiamos en que db:test:create ya se ejecutó.
});

// Después de CADA test, limpiamos las tablas para no dejar basura
afterEach(async () => {
  await clearDatabase();
});

// Al terminar TODO, cerramos la conexión
afterAll(async () => {
  await closeDatabase();
});

describe('Auth Endpoints', () => {
  
  // Datos de prueba
  const newUser = {
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    password: 'password123',
    home_gym_id: 1 // Asegúrate de que el gimnasio ID 1 existe en tu BBDD de test (lo insertaremos abajo si no)
  };

  // Como limpiamos la BBDD, necesitamos insertar un gimnasio para que la FK no falle
  beforeEach(async () => {
     const connection = await db.getConnection();
     await connection.query(`
       INSERT INTO gyms (id, name, address, city, latitude, longitude, is_suspended, is_deleted) 
       VALUES (1, 'Test Gym', 'Test St', 'Test City', 0, 0, 0, 0)
       ON DUPLICATE KEY UPDATE name='Test Gym'
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
      // 1. Registrar primero
      await request(app).post('/api/users/register').send(newUser);

      // 2. Intentar registrar de nuevo
      const res = await request(app)
        .post('/api/users/register')
        .send(newUser);

      expect(res.statusCode).toEqual(409); // Email ya registrado
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // Registrar el usuario antes de probar el login
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
      // La API actual no devuelve el objeto user, solo token y mensaje
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

      expect(res.statusCode).toEqual(401); // O 404 según tu implementación
    });
  });
});
