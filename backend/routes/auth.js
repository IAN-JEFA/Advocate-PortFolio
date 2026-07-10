const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials.' });

    const match = await admin.comparePassword(password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, admin: { name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

// GET /api/auth/me — confirms the current token is valid
router.get('/me', requireAuth, (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = router;
