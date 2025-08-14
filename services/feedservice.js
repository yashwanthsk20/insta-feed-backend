import Post from '../models/Post.js';
import User from '../models/User.js';

export class FeedService {
  static async getPersonalizedFeed(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      tag = null
    } = options;

    const skip = (page - 1) * limit;
    
    try {
      // Get user's liked tags for personalization
      const user = userId ? await User.findById(userId).select('likedTags') : null;
      const userLikedTags = user?.likedTags || [];

      // Build query
      let query = {};
      if (tag) {
        query.tags = { $in: [tag.toLowerCase()] };
      }

      // Get posts with authors populated
      const posts = await Post.find(query)
        .populate('author', 'username fullName avatar')
        .sort(this.buildSortCriteria(userLikedTags, tag))
        .skip(skip)
        .limit(limit)
        .lean();

      // Calculate personalized scores
      const scoredPosts = posts.map(post => ({
        ...post,
        personalizedScore: this.calculatePersonalizedScore(post, userLikedTags, userId),
        isLikedByUser: userId ? post.likes.some(like => like.user.toString() === userId) : false
      }));

      // Re-sort by personalized score
      scoredPosts.sort((a, b) => b.personalizedScore - a.personalizedScore);

      // Get total count for pagination
      const totalPosts = await Post.countDocuments(query);
      const hasNextPage = skip + limit < totalPosts;
      const hasPrevPage = page > 1;

      return {
        posts: scoredPosts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          totalPosts,
          hasNextPage,
          hasPrevPage,
          limit
        }
      };
    } catch (error) {
      throw new Error(`Feed service error: ${error.message}`);
    }
  }

  static calculatePersonalizedScore(post, userLikedTags, userId) {
    let score = 0;

    // Base score from post metrics
    const ageInHours = (Date.now() - new Date(post.createdAt)) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 100 - (ageInHours * 2)); // Faster decay
    const popularityScore = Math.min(post.likesCount * 5, 500);
    
    score += recencyScore + popularityScore;

    // Personalization bonus for matching tags
    if (userLikedTags.length > 0 && post.tags.length > 0) {
      const matchingTags = post.tags.filter(tag => userLikedTags.includes(tag));
      const tagMatchBonus = matchingTags.length * 50; // 50 points per matching tag
      score += tagMatchBonus;
    }

    // Boost newer posts slightly
    if (ageInHours < 24) {
      score += 25; // Fresh content bonus
    }

    return Math.round(score);
  }

  static buildSortCriteria(userLikedTags, filterTag) {
    // Primary sort: recent first, then by likes
    const sortCriteria = {
      createdAt: -1,
      likesCount: -1,
      _id: -1 // Tie breaker for consistent pagination
    };

    return sortCriteria;
  }
}