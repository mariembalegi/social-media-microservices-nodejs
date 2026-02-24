const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const axios = require('axios');

/**
 * ROUTE : POST /posts/:postId/comments
 * Créer un commentaire pour un post (RESTful)
 */
router.post('/posts/:postId/comments', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const postId = req.params.postId;
    const { content } = req.body;

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

    // Créer le commentaire
    const comment = await Comment.create({
      postId,
      userId,
      content
    });

    // Appel au Post Service pour incrémenter le compteur
    try {
      await axios.post(
        `http://localhost:${process.env.POST_SERVICE_PORT || 3002}/${postId}/increment-comments`
      );
    } catch (err) {
      console.warn('Erreur incrémentation compteur:', err.message);
    }

    res.status(201).json({
      message: 'Commentaire créé',
      comment
    });
  } catch (error) {
    console.error('Erreur création commentaire:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE : POST /:postId/comments
 * Créer un commentaire (via gateway qui a déjà consommé /api/posts)
 */
router.post('/:postId/comments', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const postId = req.params.postId;
    const { content } = req.body;

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

    // Créer le commentaire
    const comment = await Comment.create({
      postId,
      userId,
      content
    });

    // Appel au Post Service pour incrémenter le compteur
    try {
      await axios.post(
        `http://localhost:${process.env.POST_SERVICE_PORT || 3002}/${postId}/increment-comments`
      );
    } catch (err) {
      console.warn('Erreur incrémentation compteur:', err.message);
    }

    res.status(201).json({
      message: 'Commentaire créé',
      comment
    });
  } catch (error) {
    console.error('Erreur création commentaire:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE : GET /posts/:postId/comments
 * Récupérer tous les commentaires d'un post (RESTful)
 */
router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const postId = req.params.postId;
    const comments = await Comment.find({ postId })
      .sort({ createdAt: -1 });

    res.json({
      comments,
      count: comments.length
    });
  } catch (error) {
    console.error('Erreur récupération commentaires:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE : GET /:postId/comments
 * Récupérer tous les commentaires d'un post (via gateway)
 */
router.get('/:postId/comments', async (req, res) => {
  try {
    const postId = req.params.postId;
    const comments = await Comment.find({ postId })
      .sort({ createdAt: -1 });

    res.json({
      comments,
      count: comments.length
    });
  } catch (error) {
    console.error('Erreur récupération commentaires:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE : DELETE /:id
 * Supprimer un commentaire
 */
router.delete('/:id', async (req, res) => {
  try {
    // Récupérer le userId depuis le header ajouté par le gateway
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({
        error: 'Authentification requise'
      });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Commentaire non trouvé' });
    }

    // Vérifier propriétaire
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({
        error: 'Non autorisé à supprimer ce commentaire'
      });
    }

    const postId = comment.postId;
    await comment.deleteOne();

    // 🔥 Appel au Post Service pour décrémenter le compteur
    try {
      await axios.post(
        `http://localhost:${process.env.POST_SERVICE_PORT || 3002}/${postId}/decrement-comments`
      );
    } catch (err) {
      console.warn('Erreur décrémentation compteur:', err.message);
    }

    res.json({ message: 'Commentaire supprimé' });

  } catch (error) {
    console.error('Erreur suppression commentaire:', error);
    res.status(500).json({ error: error.message });
  }
});


/**
 * ROUTE : POST /api/comments/:id/like
 * Liker un commentaire
 */
router.post('/:id/like', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Commentaire non trouvé' });
    }

    comment.likesCount += 1;
    await comment.save();

    res.json({
      message: 'Commentaire liké',
      likesCount: comment.likesCount
    });

  } catch (error) {
    console.error('Erreur like commentaire:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE : PUT /api/comments/:id
 * Modifier un commentaire
 */
router.put('/:id', async (req, res) => {
  try {
    // Récupérer le userId depuis le header ajouté par le gateway
    const userId = req.headers['x-user-id'];
    const { content } = req.body;

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

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        error: 'Commentaire non trouvé'
      });
    }

    // Vérifier que c'est le propriétaire
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({
        error: 'Non autorisé à modifier ce commentaire'
      });
    }

    comment.content = content;
    await comment.save();

    res.json({
      message: 'Commentaire modifié',
      comment
    });

  } catch (error) {
    console.error('Erreur modification commentaire:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;