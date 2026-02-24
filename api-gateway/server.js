const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet= require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
require('dotenv').config({path:'../.env'});

const app = express();
/*
* MIDDLEWARES DE SÉCURITÉ
*/

// 1. Helmet : Protège contre les vulnérabilités web connues
app.use(helmet());

// 2. CORS : Gestion des origines croisées
app.use(cors({
origin: "*" , // En production : spécifier les domaines autorisés
methods: ['GET', 'POST', 'PUT', 'DELETE'],
allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Parser JSON - RETIRÉ car le Gateway est un proxy
// Les microservices parseront eux-mêmes le JSON
// app.use(express.json());

/** 
* RATE LIMITING
* Limite le nombre de requêtes par IP
*/
const limiter = rateLimit({
windowMs: 15 * 60 * 1000, // 15 minutes
max: 100, // Max 100 requêtes par fenêtre
message: {
error: 'Trop de requêtes, veuillez réessayer plus tard'    
},
standardHeaders: true, // Retourne les infos dans les headers
legacyHeaders: false
});
app.use(limiter);

/**
* MIDDLEWARE D'AUTHENTIFICATION
* Vérifie le token JWT sur les routes protégées
*/

const authMiddleware = (req, res, next) => {
// Routes publiques (pas besoin d'authentification)
const publicRoutes = [
'/api/users/register',
'/api/users/login',
'/health'
];

// Vérifier si la route est publique
const isPublicRoute = publicRoutes.some(route =>
req.path.includes(route)
);

if (isPublicRoute) {
return next(); // Passer au suivant
}
// Récupérer le token depuis le header
const authHeader = req.headers.authorization;

if (!authHeader) {
return res.status(401).json({
error: 'Token manquant'
});
}
// Format: "Bearer TOKEN"
const token = authHeader.split(' ')[1];

if (!token) {
return res.status(401).json({
error: 'Format de token invalide'
});
}
try {
// Vérifier et décoder le token
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// Transmettre le userId dans les headers pour le microservice
req.headers['x-user-id'] = decoded.userId;
req.user = decoded; // Ajouter les infos user à la requête

next();
} catch (error) {
console.error('Erreur JWT:', error.message);
return res.status(401).json({
error: 'Token invalide ou expiré'
});
}
};

// Appliquer l'authentification
app.use(authMiddleware);

/**
* LOGGING MIDDLEWARE
* Log toutes les requêtes
*/

app.use((req, res, next) => {
const timestamp = new Date().toISOString();
console.log(`[${timestamp} ] ${req.method} ${req.url}`);
next();
});

/**
* PROXIES VERS LES MICROSERVICES
* Redirige les requêtes vers les services appropriés
*/

// User Service
app.use('/api/users', createProxyMiddleware({
target: `http://localhost:${process.env.USER_SERVICE_PORT || 3001}`,
changeOrigin: true,
pathRewrite: {
'^/api/users': ''
},
onError: (err, req, res) => {
console.error('Erreur User Service:', err);
res.status(503).json({
error: 'User Service indisponible'
});
}

}));

// Post Service
app.use('/api/posts', createProxyMiddleware({
target: `http://localhost:${process.env.POST_SERVICE_PORT || 3002}`,
changeOrigin: true,
pathRewrite: {
'^/api/posts': ''
},
onProxyReq: (proxyReq, req, res) => {
// Transmettre le userId au microservice
if (req.headers['x-user-id']) {
proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
}
},
onError: (err, req, res) => {
console.error('Erreur Post Service:', err);
res.status(503).json({
error: 'Post Service indisponible'

});
}
}));

// Comment Service
app.use('/api/comments', createProxyMiddleware({
target: `http://localhost:${process.env.COMMENT_SERVICE_PORT || 3004}`,
changeOrigin: true,
pathRewrite: {
'^/api/comments': ''
},
onError: (err, req, res) => {
console.error('Erreur Comment Service:', err);
res.status(503).json({
error: 'Comment Service indisponible'
});
}
}));

/****

* ROUTES GATEWAY
*/
// Health check global
app.get('/health', (req, res) => {
res.json({
status: 'ok',
service: 'api-gateway',
timestamp: new Date(),
services: {
users: `http://localhost:${process.env.USER_SERVICE_PORT}`,
posts: `http://localhost:${process.env.POST_SERVICE_PORT}`,
comments: `http://localhost:${process.env.COMMENT_SERVICE_PORT}`
}
});
});

// Route 404
app.use((req, res) => {
res.status(404).json({
error: 'Route non trouvée'
});    
});                             
/**

* GESTION GLOBALE DES ERREURS
*/

app.use((err, req, res, next) => {
console.error('Erreur globale:', err);
res.status(500).json({
error: 'Erreur serveur interne'
});
});
/** 
 * DÉMARRAGE DU SERVEUR
*/

const PORT = process.env.API_GATEWAY_PORT || 3000;
app.listen(PORT, ()=> {
console.log(`API Gateway démarré sur le port ${PORT}`);
console.log(`http://localhost:${PORT}`);
console.log("Services proxifiés:");
console.log(` - User Service: http://localhost:${process.env.USER_SERVICE_PORT}`);
console.log(` - Post Service: http://localhost:${process.env.POST_SERVICE_PORT}`);
console.log(` - Comment Service: http://localhost:${process.env.COMMENT_SERVICE_PORT}`);    
});