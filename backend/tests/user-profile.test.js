/**
 * =============================================================================
 * TEST DE INTEGRACIÓN: Perfil de Usuario
 * INTEGRATION TEST: User Profile
 * =============================================================================
 *
 * Pruebas para la gestión del perfil de usuario (User Controller).
 * Incluye visualización, edición y cambio de contraseña.
 *
 * Tests for user profile management (User Controller).
 * Includes viewing, editing, and changing password.
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

describe('User Profile Endpoints', () => {
  
  const userData = {
    first_name: 'Profile',
    last_name: 'Tester',
    email: 'profile@test.com',
    password: 'originalpassword',
    phone: '111222333',
    role: 'user',
    home_gym_id: 1
  };

  let userToken;
  let userId;

  beforeEach(async () => {
    const connection = await db.getConnection();
    // Insertar gimnasio base // Insert base gym
    await connection.query(`
      INSERT INTO gyms (id, name, address, city, latitude, longitude, is_suspended, is_deleted) 
      VALUES (1, 'Base Gym', 'Base St', 'Base City', 0, 0, 0, 0)
    `);
    connection.release();

    // Registrar usuario // Register user
    const regRes = await request(app).post('/api/users/register').send(userData);
    userId = regRes.body.userId;

    // Login usuario // Login user
    const loginRes = await request(app).post('/api/users/login').send({
      email: userData.email,
      password: userData.password
    });
    userToken = loginRes.body.token;
  });

  describe('GET /api/users/profile', () => {
    it('should return the user profile', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('first_name', userData.first_name);
      expect(res.body).toHaveProperty('email', userData.email);
      // La contraseña NO debe devolverse // Password MUST NOT be returned
      expect(res.body).not.toHaveProperty('password');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile data', async () => {
      const updatedData = {
        first_name: 'Updated Name',
        last_name: 'Updated Lastname', // Requiere apellidos // Requires lastname
        phone: '999888777'
      };

      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Perfil actualizado con éxito');

      // Verificar cambios en BBDD // Verify changes in DB
      const getRes = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(getRes.body.first_name).toBe(updatedData.first_name);
      expect(getRes.body.phone).toBe(updatedData.phone);
    });
  });

  describe('PUT /api/users/password', () => {
    it('should change password successfully', async () => {
      const res = await request(app)
        .put('/api/users/password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: userData.password, // Nota: el controlador espera 'currentPassword', no 'oldPassword'
          newPassword: 'newsecurepassword'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'contraseña actualizada con éxito');

      // Verificar login con nueva contraseña // Verify login with new password
      const loginRes = await request(app).post('/api/users/login').send({
        email: userData.email,
        password: 'newsecurepassword'
      });
      expect(loginRes.statusCode).toEqual(200);
      expect(loginRes.body).toHaveProperty('token');
    });

    it('should fail with incorrect old password', async () => {
      const res = await request(app)
        .put('/api/users/password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newsecurepassword'
        });

      // Esperamos 401 // Expect 401
      expect(res.statusCode).toEqual(401);
    });
  });
});
