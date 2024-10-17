const mongoose = require('mongoose');

const AuthorizationRequestSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  treatmentType: {
    type: String,
    required: true,
  },
  insurancePlan: {
    type: String,
    required: true,
  },
  dateOfService: {
    type: Date,
    required: true,
  },
  diagnosisCode: {
    type: String,
    required: true,
  },
  doctorNotes: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  'AuthorizationRequest',
  AuthorizationRequestSchema
);
