const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const AuthorizationRequest = require('../models/AuthorizationRequest');
const Patient = require('../models/Patient');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authorizationRequestRoutes = require('../routes/authorizationRequests');

const app = express();
app.use(express.json());
app.use('/authorization', authorizationRequestRoutes);

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

describe('AuthorizationRequest API', () => {
  let patientId;

  beforeEach(async () => {
    const patient = new Patient({
      name: 'John Doe',
      age: 45,
      condition: 'Diabetes',
      medicalHistory: ['Diabetes'],
      treatmentPlan: 'Insulin therapy',
    });
    const savedPatient = await patient.save();
    patientId = savedPatient._id;
  });

  afterEach(async () => {
    await AuthorizationRequest.deleteMany({});
    await Patient.deleteMany({});
  });

  it('should create a new authorization request', async () => {
    const newRequest = {
      patientId: patientId.toString(),
      treatmentType: 'Physical Therapy',
      insurancePlan: 'Medicare',
      dateOfService: '2024-10-17',
      diagnosisCode: 'Z00.00',
    };

    const res = await request(app).post('/authorization').send(newRequest);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.patientId).toBe(patientId.toString());
    expect(res.body.treatmentType).toBe('Physical Therapy');
    expect(res.body.insurancePlan).toBe('Medicare');
    expect(res.body.status).toBe('pending');
  });

  it('should get all authorization requests', async () => {
    const newRequest = new AuthorizationRequest({
      patientId: patientId,
      treatmentType: 'Surgery',
      insurancePlan: 'Blue Cross',
      dateOfService: new Date('2024-11-01'),
      diagnosisCode: 'J45.909',
    });
    await newRequest.save();

    const res = await request(app).get('/authorization');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].patientId._id).toBe(patientId.toString());
    expect(res.body[0].treatmentType).toBe('Surgery');
  });

  it('should update the status of an authorization request', async () => {
    const newRequest = new AuthorizationRequest({
      patientId: patientId,
      treatmentType: 'Physical Therapy',
      insurancePlan: 'Medicaid',
      dateOfService: new Date(),
      diagnosisCode: 'M54.5',
    });
    const savedRequest = await newRequest.save();

    const res = await request(app)
      .patch(`/authorization/${savedRequest._id}`)
      .send({ status: 'approved' });

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(savedRequest._id.toString());
    expect(res.body.status).toBe('approved');
  });
});
