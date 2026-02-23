const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const axios = require('axios');

/**
 * ROUTE : POST /api/comments
 * Créer un commentaire
 */
router.post('/', async (req, res) => {
  try {
    const { postId, userId, content, parentCommentId } = req.body;

    if (!postId || !userId || !content) {
      return res.status(400).json({
        error: 'postId, userId et content sont requis'
      });
    }

    // Créer le commentaire
    const comment = await Comment.create({
      postId,
      userId,
      content,
      parentCommentId: parentCommentId || null
    });

    // 🔥 Appel au Post Service pour incrémenter le compteur
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
 * ROUTE : GET /api/comments/post/:postId
 * Récupérer les commentaires d'un post
 */
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({
      postId: req.params.postId,
      parentCommentId: null // uniquement commentaires principaux
    }).sort({ createdAt: -1 });

    res.json(comments);

  } catch (error) {
    console.error('Erreur récupération commentaires:', error);
    res.status(500).json({ error: error.message });
  }
});


/**
 * ROUTE : DELETE /api/comments/:id
 * Supprimer un commentaire
 */
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.body;

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
    const { userId, content } = req.body;

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