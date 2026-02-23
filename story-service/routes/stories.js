const express = require('express');
const router = express.Router();
const Story = require('../models/Story');

router.post('/', async (req, res) => {
  try {
    const { userId, content, imageUrl } = req.body;

    const story = new Story({
      userId,
      content,
      imageUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    await story.save();
    res.status(201).json(story);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;