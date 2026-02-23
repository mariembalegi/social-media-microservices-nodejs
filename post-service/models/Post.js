const mongoose = require('mongoose');

/**
 * SCHÉMA POST
 * Représente une publication sur le réseau social
 */
const postSchema = new mongoose.Schema({
// Référence vers l'utilisateur qui a créé le post
userId: {
type: mongoose.Schema.Types.ObjectId,
ref: 'User', // Référence au modèle User (dans user-service)
required: true
},

// Contenu textuel du post
content: {
type: String,
required: [true, 'Le contenu est requis'],
maxlength: [2000, 'Le contenu ne peut dépasser 2000 caractères'],
trim: true
},
// URLs des images (tableau)
images: [{
type: String,
validate: {
validator: function(v) {
// Validation URL simple
return /^https?:\/\/.+/.test(v);
},
message: 'URL d\'image invalide'
}
}],

// Nombre de likes (dénormalisé pour performance)
likesCount: {
type: Number,
default: 0,
min: 0
},
// Nombre de commentaires
commentsCount: {
type: Number,
default: 0,
min: 0
},
// Nombre de partages
sharesCount: {
type: Number,
default: 0,
min: 0
},

// Visibilité du post
visibility: {
type: String,
enum: ['public', 'friends', 'private'],
default: 'public'
},

// Métadonnées temporelles
createdAt: {
type: Date,
default: Date.now
},
updatedAt: {
type: Date,
default: Date.now
}
}, {
timestamps: true // Gère automatiquement createdAt et updatedAt
});

/** INDEX
* Améliore les performances des requêtes
*/
// Index pour rechercher par utilisateur
postSchema.index({ userId: 1, createdAt: -1});

// Index pour le feed public
postSchema.index({ visibility: 1, createdAt: -1 });

/**
* MÉTHODES D'INSTANCE
*/

// Incrémenter le compteur de likes
postSchema.methods.incrementLikes = function() {
this.likesCount +=1;
return this.save();
};

// Décrémenter le compteur de likes
postSchema.methods.decrementLikes = function() {
if (this.likesCount > 0) {
this.likesCount -= 1;
}
return this.save();
};

// Incrémenter le compteur de commentaires
postSchema.methods.incrementComments = function() {
this.commentsCount += 1;
return this.save();
};

// Décrémenter le compteur de commentaires
postSchema.methods.decrementComments = function() {
if (this.commentsCount > 0) {
this.commentsCount -= 1;
}
return this.save();
};

module.exports = mongoose.model('Post', postSchema);