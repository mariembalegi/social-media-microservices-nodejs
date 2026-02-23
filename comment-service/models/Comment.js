const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  imageUrl: {
    type: String
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24*60*60*1000) // expire après 24h
  }
}, {
  timestamps: true // createdAt et updatedAt automatiques
});

module.exports = mongoose.model('Story', storySchema);