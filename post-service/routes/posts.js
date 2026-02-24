const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

/**

* ROUTE : POST /api/posts
* Créer un nouveau post
*/

router.post('/', async (req, res) => {
try {
// Récupérer le userId depuis le header ajouté par le gateway
const userId = req.headers['x-user-id'];
const { content, images, visibility } = req.body;

// Validation
if (!userId) {
return res.status(401).json({
error: 'Authentification requise'
});
}

if (!content) {
return res.status(400).json({
error: 'Le contenu est requis'
});
}

// Créer le post
const post = new Post({
userId,
content,
images: images || [],
visibility: visibility || 'public'
});
await post.save();

res.status(201).json({
message: 'Post créé',
post
});         
} catch (error) {
console.error('Erreur création post:', error);
res.status(500).json({ error: error.message });
}
});

/**
* ROUTE : GET /api/posts
* Récupérer le feed (tous les posts publics)
*/
router.get('/', async (req, res) => {
try {
// Pagination
const page = parseInt(req.query.page) || 1;
const limit= parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;
// Récupérer les posts
const posts = await Post.find({ visibility: 'public' })
.sort({ createdAt: -1 }) // Plus récents en premier
.skip(skip)
.limit(limit);
// Compter le total
const total = await Post.countDocuments({ visibility: 'public' });
res.json({
posts,
pagination: {
page,
limit,
total,
pages: Math.ceil(total / limit)
}
});
} catch (error) {
    console.error('Erreur récupération posts:', error);
    res.status(500).json({error: error.message});
}
});

/**
* ROUTE : GET /api/posts/:id
* Récupérer un post spécifique
*/
router.get('/:id', async (req, res) => {
try {
const post = await Post.findById(req.params.id);
if (!post) {
return res.status(404).json({ error: 'Post non trouvé' });
}
res.json(post);

} catch (error) {
console.error('Erreur récupération post:', error);
res.status(500).json({ error: error.message });
}
});

/**
* ROUTE : PUT /api/posts/:id
* Modifier un post
*/

router.put('/:id', async (req, res) => {
try {
const { userId, content, images } = req.body;

// Récupérer le post
const post = await Post.findById(req.params.id);

if (!post) {
return res.status(404).json({ error: 'Post non trouvé' });
}
// Vérifier que c'est le propriétaire
if (post.userId.toString() != userId) {
return res.status(403).json({
error: 'Non autorisé à modifier ce post'
});
}
// Mettre à jour
if (content) post.content = content;
if (images) post.images = images;
post.updatedAt= Date.now();

await post.save();

res.json({
message: 'Post mis à jour',
post
});
} catch (error) {
console.error('Erreur modification post:', error);
res.status(500).json({ error: error.message});
}
});
/** 
* ROUTE : DELETE /api/posts/:id
* Supprimer un post
*/

router.delete('/:id', async (req, res) => {
try {
const { userId } = req.body;
const post = await Post.findById(req.params.id);

if (!post) {
return res.status(404).json({ error: 'Post non trouvé' });
}
// Vérifier le propriétaire
if (post.userld.toString() != userld) {
return res.status(403).json({
error: 'Non autorisé à supprimer ce post'

});
}
await post.deleteOne();

res.json({ message: 'Post supprimé' });
} catch(error) {
console.error('Erreur suppression post:', error);
res.status(500).json({ error: error.message });
}
});

/**
* ROUTE : GET /api/posts/user/:userId
* Récupérer tous les posts d'un utilisateur
*/

router.get('/user/:userId', async (req, res) => {
try {
const posts = await Post.find({ userld: req.params.userld })
.sort({ createdAt :- 1});

res.json(posts);

} catch (error) {
console.error('Erreur récupération posts utilisateur:', error);
res.status(500).json({ error: error.message });
}
});

/**
* ROUTE : POST /api/posts/:id/like
* Liker un post (simplifié)
*/

router.post('/:id/like', async (req, res) => {
try {
const post = await Post.findById(req.params.id);

if (!post) {
return res.status(404).json({ error: 'Post non trouvé' });
}

// Incrémenter le compteur
await post.incrementLikes();

res.json({
message: 'Post liké',
likesCount: post.likesCount
});
} catch (error) {
console.error('Erreur like post:', error);
res.status(500).json({ error: error.message});
}
});

/**
* ROUTE : POST /api/posts/:id/increment-comments
* Incrémenter le compteur de commentaires
*/
router.post('/:id/increment-comments', async (req, res) => {
try {
const post = await Post.findById(req.params.id);

if (!post) {
return res.status(404).json({ error: 'Post non trouvé' });
}

await post.incrementComments();

res.json({
message: 'Compteur de commentaires incrémenté',
commentsCount: post.commentsCount
});
} catch (error) {
console.error('Erreur incrémentation commentaires:', error);
res.status(500).json({ error: error.message });
}
});

/**
* ROUTE : POST /api/posts/:id/decrement-comments
* Décrémenter le compteur de commentaires
*/
router.post('/:id/decrement-comments', async (req, res) => {
try {
const post = await Post.findById(req.params.id);

if (!post) {
return res.status(404).json({ error: 'Post non trouvé' });
}

await post.decrementComments();

res.json({
message: 'Compteur de commentaires décrémenté',
commentsCount: post.commentsCount
});
} catch (error) {
console.error('Erreur décrémentation commentaires:', error);
res.status(500).json({ error: error.message });
}
});

module.exports = router;
