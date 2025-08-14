import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2200
  },
  imageUrl: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 50
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance and ranking
postSchema.index({ createdAt: -1 });
postSchema.index({ likesCount: -1 });
postSchema.index({ score: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ author: 1 });
postSchema.index({ 'likes.user': 1 });

// Compound indexes for complex queries
postSchema.index({ tags: 1, createdAt: -1, likesCount: -1 });

// Calculate score before saving
postSchema.pre('save', function(next) {
  if (this.isModified('likesCount') || this.isNew) {
    const ageInHours = (Date.now() - this.createdAt) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 100 - ageInHours); // Decay over time
    const popularityScore = Math.min(this.likesCount * 10, 1000); // Cap at 1000
    
    this.score = recencyScore + popularityScore;
  }
  next();
});

export default mongoose.model('Post', postSchema);