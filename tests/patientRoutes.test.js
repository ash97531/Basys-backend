const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const patientRoutes = require('../routes/patients');
const Patient = require('../models/Patient');

const app = express();
app.use(express.json());
app.use('/patients', patientRoutes);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
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

describe('Patient API', () => {
  const testPatient = {
    name: 'John Doe',
    age: 30,
    condition: 'Asthma',
    medicalHistory: ['None'],
    treatmentPlan: 'Use inhaler',
  };

  it('should create a new patient and return 201', async () => {
    const response = await request(app).post('/patients').send(testPatient);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(testPatient);
  });

  it('should return a list of patients and return 200', async () => {
    const response = await request(app).get('/patients');

    expect(response.status).toBe(200);
    expect(response.body.patients).toHaveLength(1);
    expect(response.body.totalPages).toBe(1);
  });

  it('should return a specific patient by ID and return 200', async () => {
    const createdPatient = await Patient.create(testPatient);

    const response = await request(app).get(`/patients/${createdPatient._id}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(testPatient);
  });

  it('should return 404 for a non-existing patient', async () => {
    const response = await request(app).get(
      '/patients/605c72f78b59e840d1e3e2e5'
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Patient not found');
  });
});
