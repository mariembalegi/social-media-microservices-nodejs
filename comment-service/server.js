const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Comment Service: MongoDB connecté');
  })
  .catch(err => {
    console.error('Erreur connexion MongoDB:', err);
    process.exit(1);
  });

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'comment-service',
    timestamp: new Date()
  });
});

// Routes
app.use('/', require('./routes/comments'));

// Gestion erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({ error: 'Erreur serveur' });
});

// Démarrage
const PORT = process.env.COMMENT_SERVICE_PORT || 3004;

app.listen(PORT, () => {
  console.log(`Comment Service démarré sur le port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

module.exports = app; // Pour les tests