/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     AuthorizationRequest:
 *       type: object
 *       required:
 *         - patientId
 *         - treatmentType
 *         - insurancePlan
 *         - dateOfService
 *         - diagnosisCode
 *         - doctorNotes
 *         - status
 *       properties:
 *         patientId:
 *           type: string
 *           description: ID of the patient
 *         treatmentType:
 *           type: string
 *           description: Type of treatment the patient requires
 *         insurancePlan:
 *           type: string
 *           description: The patient's insurance plan
 *         dateOfService:
 *           type: string
 *           format: date-time
 *           description: The date of the service
 *         diagnosisCode:
 *           type: string
 *           description: The diagnosis code for the condition
 *         doctorNotes:
 *           type: string
 *           description: Notes from the doctor about the patient's condition and treatment
 *         status:
 *           type: string
 *           description: The status of the authorization request (e.g., "pending", "approved")
 *         _id:
 *           type: string
 *           description: Unique ID of the authorization request
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date when the authorization request was created
 *       example:
 *         patientId: "65234fc9b5f1b93456e8a923"
 *         treatmentType: "Physical Therapy 2"
 *         insurancePlan: "Aetna Gold Plus"
 *         dateOfService: "2024-10-20T00:00:00.000Z"
 *         diagnosisCode: "M54.5"
 *         doctorNotes: "Patient requires physical therapy twice a week due to chronic back pain."
 *         status: "pending"
 *         _id: "671179523a99d1bdfcca8e51"
 *         createdAt: "2024-10-17T20:53:38.991Z"
 *
 * /api/authorization:
 *   post:
 *     summary: Submit a new authorization request
 *     security:
 *       - bearerAuth: []
 *     tags: [Authorization Request]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthorizationRequest'
 *     responses:
 *       201:
 *         description: Authorization request successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthorizationRequest'
 *       400:
 *         description: Bad request
 *
 *   get:
 *     summary: Get all authorization requests
 *     security:
 *       - bearerAuth: []
 *     tags: [Authorization Request]
 *     responses:
 *       200:
 *         description: List of all authorization requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AuthorizationRequest'
 *       500:
 *         description: Internal server error
 *
 * /api/authorization/{id}:
 *   patch:
 *     summary: Update the status of an authorization request
 *     security:
 *       - bearerAuth: []
 *     tags: [Authorization Request]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the authorization request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: New status of the authorization request
 *             example:
 *               status: "approved"
 *     responses:
 *       200:
 *         description: Successfully updated authorization request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthorizationRequest'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

const express = require('express');
const router = express.Router();
const AuthorizationRequest = require('../models/AuthorizationRequest');

const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, async (req, res) => {
  const newAuthorizationRequest = new AuthorizationRequest(req.body);
  try {
    const savedRequest = await newAuthorizationRequest.save();
    res.status(201).json(savedRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all authorization requests
router.get('/', authMiddleware, async (req, res) => {
  try {
    const requests = await AuthorizationRequest.find().populate('patientId');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update the status of an authorization request
router.patch('/:id', authMiddleware, async (req, res) => {
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
