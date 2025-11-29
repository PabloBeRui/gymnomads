/**
 * =============================================================================
 * TEST DE INTEGRACIÓN: Gestión de Managers
 * INTEGRATION TEST: Manager Management
 * =============================================================================
 *
 * Pruebas para la lógica específica de Managers y Admin.
 * Verifica que los managers solo vean su propio gimnasio y el admin vea todo.
 *
 * Tests for specific Manager and Admin logic.
 * Verifies that managers only see their own gym and admins see everything.
 *
 * =============================================================================
 */

const request = require('supertest');
const app = require('../index');
const db = require('../config/db');
const { clearDatabase, closeDatabase } = require('./utils/db-handler');

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('Manager & Admin Role Tests', () => {
  
  let adminToken;
  let managerAToken;
  let gymAId = 1; // Base Gym
  let gymBId;

  const adminUser = {
    first_name: 'Admin',
    last_name: 'Boss',
    email: 'admin@test.com',
    password: 'adminpass',
    role: 'admin',
    home_gym_id: 1
  };

  const managerA = {
    first_name: 'Manager',
    last_name: 'A',
    email: 'managerA@test.com',
    password: 'managerpass',
    role: 'manager',
    home_gym_id: 1
  };

  const userA = {
    first_name: 'User',
    last_name: 'A',
    email: 'userA@test.com',
    password: 'userpass',
    role: 'user',
    home_gym_id: 1
  };

  const userB = {
    first_name: 'User',
    last_name: 'B',
    email: 'userB@test.com',
    password: 'userpass',
    role: 'user',
    // home_gym_id se asignará tras crear Gym B
  };

  beforeEach(async () => {
    const connection = await db.getConnection();

    // 1. Crear Gym A (ID 1)
    await connection.query(`
      INSERT IGNORE INTO gyms (id, name, address, city, latitude, longitude, is_suspended, is_deleted) 
      VALUES (1, 'Gym A', 'Street A', 'City A', 0, 0, 0, 0)
    `);

    // 2. Crear Gym B (Auto ID)
    const [gymBRes] = await connection.query(`
      INSERT INTO gyms (name, address, city, latitude, longitude, is_suspended, is_deleted) 
      VALUES ('Gym B', 'Street B', 'City B', 0, 0, 0, 0)
    `);
    gymBId = gymBRes.insertId;
    connection.release();

    // 3. Registrar y elevar a Admin
    await request(app).post('/api/users/register').send(adminUser);
    const conn2 = await db.getConnection();
    await conn2.query('UPDATE users SET role = "admin" WHERE email = ?', [adminUser.email]);
    
    // 4. Registrar y elevar a Manager A (asignado a Gym A - ID 1)
    await request(app).post('/api/users/register').send(managerA);
    await conn2.query('UPDATE users SET role = "manager" WHERE email = ?', [managerA.email]);
    conn2.release();

    // 5. Registrar usuarios normales
    await request(app).post('/api/users/register').send(userA); // Asignado a Gym 1 por defecto en userA object
    
    // Registrar User B y asignarlo a Gym B manualmente (ya que register por defecto podría usar 1 o lo que enviemos)
    // Vamos a enviar userB con el home_gym_id correcto
    userB.home_gym_id = gymBId;
    await request(app).post('/api/users/register').send(userB);

    // 6. Login y obtener tokens
    const loginAdmin = await request(app).post('/api/users/login').send({ email: adminUser.email, password: adminUser.password });
    adminToken = loginAdmin.body.token;

    const loginManager = await request(app).post('/api/users/login').send({ email: managerA.email, password: managerA.password });
    managerAToken = loginManager.body.token;
  });

  describe('GET /api/users/managers (Admin only)', () => {
    it('should return a list of all managers', async () => {
      const res = await request(app)
        .get('/api/users/managers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      // Verificar que Manager A está en la lista // Verify Manager A is in the list
      const foundManager = res.body.data.find(m => m.email === managerA.email);
      expect(foundManager).toBeTruthy();
    });

    it('should forbid access to non-admins', async () => {
      const res = await request(app)
        .get('/api/users/managers')
        .set('Authorization', `Bearer ${managerAToken}`); // Manager intentando entrar // Manager trying to enter

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('GET /api/gyms/:id/users (Manager View)', () => {
    it('should allow Manager A to see users of Gym A', async () => {
      const res = await request(app)
        .get(`/api/gyms/${gymAId}/users`)
        .set('Authorization', `Bearer ${managerAToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      // Debe encontrar al Usuario A // Should find User A
      const foundUser = res.body.data.find(u => u.email === userA.email);
      expect(foundUser).toBeTruthy();
    });

    it('should NOT show users from Gym B when querying Gym A', async () => {
      const res = await request(app)
        .get(`/api/gyms/${gymAId}/users`)
        .set('Authorization', `Bearer ${managerAToken}`);

      expect(res.statusCode).toEqual(200);
      // NO debe encontrar al Usuario B // Should NOT find User B
      const foundUserB = res.body.data.find(u => u.email === userB.email);
      expect(foundUserB).toBeUndefined();
    });

    // Nota: Dependiendo de tu lógica, un Manager podría tener prohibido consultar otro Gym ID
    // o simplemente recibir una lista vacía o error 403. 
    // Note: Depending on your logic, a Manager might be forbidden from querying another Gym ID
    // or just receive an empty list or 403 error.
  });
});
