const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Logging simple
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Story Service: MongoDB connecté');
  })
  .catch(err => {
    console.error('Erreur connexion MongoDB:', err);
    process.exit(1);
  });

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'story-service',
    timestamp: new Date()
  });
});

// Routes
app.use('/', require('./routes/stories')); // Assure-toi que le fichier routes/stories.js existe

// Gestion erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({ error: 'Erreur serveur' });
});

// Démarrage
const PORT = process.env.STORY_SERVICE_PORT || 3003;

app.listen(PORT, () => {
  console.log(`Story Service démarré sur le port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

module.exports = app; // Pour les tests