// tests/post.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Ton server.js
const Post = require('../models/Post');
const User = require('../../user-service/models/User');

describe('Post Service API', () => {
  let testUserId;

  beforeAll(async () => {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Créer un utilisateur de test pour les posts
const USER_SERVICE_URL = 'http://localhost:3001';
const userRes = await request(USER_SERVICE_URL)
      .post('/api/users/register')
      .send({
        username: 'john_post',
        email: 'john_post@example.com',
        password: 'password123'
      });

    testUserId = userRes.body.user.id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Nettoyer la collection des posts après chaque test
    await Post.deleteMany({});
  });

  // ===============================
  // Health check
  // ===============================
  it('GET /health should return status 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'post-service');
  });

  // ===============================
  // Créer un post
  // ===============================
  it('POST /api/posts should create a new post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({
        userId: testUserId,
        content: 'Mon premier post!',
        visibility: 'public'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('post');
    expect(res.body.post).toHaveProperty('content', 'Mon premier post!');
  });

  it('POST /api/posts should fail if missing fields', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ userId: testUserId });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // ===============================
  // Récupérer le feed public
  // ===============================
  it('GET /api/posts should return public posts', async () => {
    // Créer un post public
    await request(app)
      .post('/api/posts')
      .send({
        userId: testUserId,
        content: 'Feed public test',
        visibility: 'public'
      });

    const res = await request(app).get('/api/posts');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('content', 'Feed public test');
  });
});