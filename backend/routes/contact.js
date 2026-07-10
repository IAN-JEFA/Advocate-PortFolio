const express = require('express');
const nodemailer = require('nodemailer');
const ContactMessage = require('../models/ContactMessage');

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;
    if (!name || !email || !service || !message) {
      return res.status(400).json({ error: 'Name, email, service, and message are required.' });
    }

    const saved = await ContactMessage.create({ name, email, phone, service, message });

    // Email delivery is best-effort: if SMTP isn't configured yet, the message
    // is still saved to the database so nothing is lost.
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await transporter.sendMail({
          from: `"Nairobi Legal Chambers Website" <${process.env.SMTP_USER}>`,
          to: process.env.CONTACT_RECEIVING_EMAIL,
          replyTo: email,
          subject: `New consultation request: ${service}`,
          text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'n/a'}\nService: ${service}\n\nMessage:\n${message}`
        });
      } catch (mailErr) {
        console.error('Email delivery failed (message was still saved):', mailErr.message);
      }
    }

    res.status(201).json({ success: true, id: saved._id });
  } catch (err) {
    res.status(500).json({ error: 'Could not submit your message. Please try again.' });
  }
});

module.exports = router;
