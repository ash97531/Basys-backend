/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Patient:
 *       type: object
 *       required:
 *         - name
 *         - age
 *         - condition
 *         - medicalHistory
 *         - treatmentPlan
 *       properties:
 *         name:
 *           type: string
 *           description: The patient's name
 *         age:
 *           type: integer
 *           description: The patient's age
 *         condition:
 *           type: string
 *           description: The patient's medical condition
 *         medicalHistory:
 *           type: array
 *           items:
 *             type: string
 *           description: The patient's medical history
 *         treatmentPlan:
 *           type: string
 *           description: The patient's treatment plan
 *         _id:
 *           type: string
 *           description: Unique ID of the patient
 *         __v:
 *           type: integer
 *           description: Version key
 *       example:
 *         name: "surasj"
 *         age: 50
 *         condition: "cdas"
 *         medicalHistory: ["a1", "a2"]
 *         treatmentPlan: "Insulin therapckups"
 *         _id: "67117ac627f56886db543c1c"
 *         __v: 0
 *
 * /api/patients:
 *   get:
 *     summary: Get a paginated list of patients
 *     security:
 *       - bearerAuth: []
 *     tags: [Patient]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of patients per page
 *     responses:
 *       200:
 *         description: A paginated list of patients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patients:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Patient'
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Add a new patient
 *     security:
 *       - bearerAuth: []
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       201:
 *         description: Patient successfully added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       400:
 *         description: Bad request
 *
 * /api/patients/{id}:
 *   get:
 *     summary: Get a specific patient by ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the patient
 *     responses:
 *       200:
 *         description: The patient details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Internal server error
 */

const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalPatients = await Patient.countDocuments();
    const patients = await Patient.find().skip(skip).limit(limit);

    res.json({
      patients,
      totalPages: Math.ceil(totalPatients / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific patient by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new patient
router.post('/', authMiddleware, async (req, res) => {
  const newPatient = new Patient(req.body);
  try {
    const savedPatient = await newPatient.save();
    res.status(201).json(savedPatient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
