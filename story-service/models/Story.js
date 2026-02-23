const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  content: {
    type: String,
    maxlength: 500
  },
  imageUrl: {
    type: String
  },
  expiresAt: {
    type: Date,
    required: true
  },
  likesCount: {  // Compteur de likes
    type: Number,
    default: 0,
    min: 0
  },
  commentsCount: { // Compteur de commentaires
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Méthodes pour incrémenter/décrémenter les likes
storySchema.methods.incrementLikes = function() {
  this.likesCount += 1;
  return this.save();
};

storySchema.methods.decrementLikes = function() {
  if (this.likesCount > 0) this.likesCount -= 1;
  return this.save();
};

// Méthodes pour incrémenter/décrémenter les commentaires
storySchema.methods.incrementComments = function() {
  this.commentsCount += 1;
  return this.save();
};

storySchema.methods.decrementComments = function() {
  if (this.commentsCount > 0) this.commentsCount -= 1;
  return this.save();
};

module.exports = mongoose.model('Story', storySchema);