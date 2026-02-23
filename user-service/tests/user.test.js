const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Ton server.js
const User = require('../models/User');

describe('User Service API', () => {

  beforeAll(async () => {
    // Connexion à une base de test (ou la vraie si tu n'as pas de base test)
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Nettoyer la collection après chaque test
    await User.deleteMany({});
  });

  // ===============================
  // Health check
  // ===============================
  it('GET /health should return status 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'user-service');
  });

  // ===============================
  // Inscription
  // ===============================
  it('POST /api/users/register should create a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'john@example.com');
  });

  it('POST /api/users/register should fail if missing fields', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ email: 'john@example.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // ===============================
  // Connexion
  // ===============================
  it('POST /api/users/login should login an existing user', async () => {
    // Créer le user d’abord
    await request(app)
      .post('/api/users/register')
      .send({
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123'
      });

    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'john@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('POST /api/users/login should fail with wrong password', async () => {
    await request(app)
      .post('/api/users/register')
      .send({
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123'
      });

    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'john@example.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
  });

});