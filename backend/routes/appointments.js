const express = require('express');
const Appointment = require('../models/Appointment');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// POST /api/appointments — public: a client books a consultation
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, service, attorney, preferredDate, preferredTime, message } = req.body;
    if (!name || !email || !service) {
      return res.status(400).json({ error: 'Name, email, and service are required.' });
    }
    const appointment = await Appointment.create({
      name, email, phone, service, attorney, preferredDate, preferredTime, message
    });
    res.status(201).json({ success: true, id: appointment._id });
  } catch (err) {
    res.status(500).json({ error: 'Could not book your appointment. Please try again.' });
  }
});

// GET /api/appointments — admin only: list bookings
router.get('/', requireAuth, async (req, res) => {
  const appointments = await Appointment.find().sort({ createdAt: -1 });
  res.json(appointments);
});

// PATCH /api/appointments/:id — admin only: update status (confirm/decline/complete)
router.patch('/:id', requireAuth, async (req, res) => {
  const { status } = req.body;
  const updated = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!updated) return res.status(404).json({ error: 'Appointment not found.' });
  res.json(updated);
});

module.exports = router;
