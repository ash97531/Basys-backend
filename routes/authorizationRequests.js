const express = require('express');
const router = express.Router();
const AuthorizationRequest = require('../models/AuthorizationRequest');

// Submit an authorization request
router.post('/', async (req, res) => {
  const newAuthorizationRequest = new AuthorizationRequest(req.body);
  try {
    const savedRequest = await newAuthorizationRequest.save();
    res.status(201).json(savedRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all authorization requests
router.get('/', async (req, res) => {
  try {
    const requests = await AuthorizationRequest.find().populate('patientId');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update the status of an authorization request
router.patch('/:id', async (req, res) => {
  try {
    const updatedRequest = await AuthorizationRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true }
    );
    res.json(updatedRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
