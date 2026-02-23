const express = require('express');
const router = express.Router();
const Story = require('../models/Story');

// Créer une story
router.post('/', async (req, res) => {
  try {
    const { userId, content, imageUrl } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ error: 'userId et content sont requis' });
    }

    const story = new Story({ userId, content, imageUrl });
    await story.save();

    res.status(201).json({ message: 'Story créée', story });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer toutes les stories
router.get('/', async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer une story par ID
router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story non trouvée' });
    res.json(story);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Supprimer une story
router.delete('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story non trouvée' });

    await story.deleteOne();
    res.json({ message: 'Story supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;