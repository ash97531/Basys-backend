const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  condition: {
    type: String,
    required: true,
  },
  medicalHistory: {
    type: [String],
    required: true,
  },
  treatmentPlan: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Patient', PatientSchema);
