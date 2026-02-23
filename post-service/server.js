const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({path:'../.env'});

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
.then(()=> {
console.log('Post Service: MongoDB connecté');
})
.catch(err => {
console.error('Erreur connexion MongoDB:', err);
process.exit(1);
});


// Routes
app.get('/health', (req, res) => {
res.json({
status: 'ok',
service: 'post-service',
timestamp: new Date()
});
});
app.use('/', require('./routes/posts'));

// Gestion erreurs
app.use((err, req, res, next) => {
console.error('Erreur:', err);
res.status(500).json({ error: 'Erreur serveur' });
});


// Démarrage
const PORT = process.env.POST_SERVICE_PORT || 3002;
app.listen(PORT, ()=> {
console.log(`Post Service démarré sur le port ${PORT}`);
console.log(`http://localhost:${PORT}`);
});

module.exports = app; // Exporter pour les tests