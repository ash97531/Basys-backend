const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authRoutes = require('../routes/auth');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.JWT_SECRET = 'Ashwani_kumar';
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Auth API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should register a new user', async () => {
    const user = {
      username: 'testuser',
      password: 'password123',
    };

    const res = await request(app).post('/auth/register').send(user);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered successfully!');

    const savedUser = await User.findOne({ username: user.username });
    expect(savedUser).toBeTruthy();
    const passwordMatch = await bcrypt.compare(
      user.password,
      savedUser.password
    );
    expect(passwordMatch).toBe(true);
  });

  it('should login a user with correct credentials', async () => {
    const user = new User({
      username: 'testuser',
      password: await bcrypt.hash('password123', 10),
    });
    await user.save();

    const res = await request(app).post('/auth/login').send({
      username: 'testuser',
      password: 'password123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');

    const decodedToken = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decodedToken.id).toBe(user._id.toString());
  });

  it('should return 401 for invalid credentials', async () => {
    const user = new User({
      username: 'testuser',
      password: await bcrypt.hash('password123', 10),
    });
    await user.save();

    const res = await request(app).post('/auth/login').send({
      username: 'testuser',
      password: 'wrongpassword',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should return 401 for non-existing user', async () => {
    const res = await request(app).post('/auth/login').send({
      username: 'nonexistentuser',
      password: 'password123',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });
});
