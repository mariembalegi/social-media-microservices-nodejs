const mongoose = require('mongoose');

/**
 * SCHÉMA COMMENT
 * Représente un commentaire sur un post
 */
const commentSchema = new mongoose.Schema({
  // Référence vers le post commenté
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Post' // Référence au modèle Post (dans post-service)
  },
  
  // Référence vers l'utilisateur qui a commenté
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Référence au modèle User (dans user-service)
  },
  
  // Contenu du commentaire
  content: {
    type: String,
    required: [true, 'Le contenu est requis'],
    maxlength: [500, 'Le commentaire ne peut dépasser 500 caractères'],
    trim: true
  },
  
  // Commentaire parent (pour les réponses)
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: 'Comment' // Référence à lui-même pour les réponses
  },
  
  // Nombre de likes
  likesCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true // createdAt et updatedAt automatiques
});

// Index pour améliorer les performances
commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);