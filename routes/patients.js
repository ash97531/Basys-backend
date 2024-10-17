const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// Get all patients
// router.get('/', async (req, res) => {
//   try {
//     const patients = await Patient.find();
//     res.json(patients);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

router.get('/', async (req, res) => {
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
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new patient
router.post('/', async (req, res) => {
  const newPatient = new Patient(req.body);
  try {
    const savedPatient = await newPatient.save();
    res.status(201).json(savedPatient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
