const express = require('express');
const requireAuth = require('../middleware/auth');

// Creates a standard "public GET, admin-only write" router for a Mongoose model.
// Used for Attorneys, Practice content, Case Studies, Testimonials, and Blog Posts —
// the CMS-style content an admin manages without editing code.
function createContentRouter(Model, defaultSort = { order: 1, createdAt: -1 }) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const items = await Model.find().sort(defaultSort);
    res.json(items);
  });

  router.get('/:id', async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found.' });
    res.json(item);
  });

  router.post('/', requireAuth, async (req, res) => {
    try {
      const created = await Model.create(req.body);
      res.status(201).json(created);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.put('/:id', requireAuth, async (req, res) => {
    const updated = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Not found.' });
    res.json(updated);
  });

  router.delete('/:id', requireAuth, async (req, res) => {
    const deleted = await Model.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found.' });
    res.json({ success: true });
  });

  return router;
}

module.exports = createContentRouter;
