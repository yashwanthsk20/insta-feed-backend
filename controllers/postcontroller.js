import Post from '../models/Post.js';
import User from '../models/User.js';
import { validatePost, validateFeedQuery } from '../utils/validation.js';
import { FeedService } from '../services/feedService.js';

// @desc    Create a new post
// @route   POST /api/posts
// @access  Public
export const createPost = async (req, res) => {
  try {
    const { error } = validatePost(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { content, imageUrl, tags, authorId } = req.body;

    // Verify author exists
    const author = await User.findById(authorId);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    const post = await Post.create({
      author: authorId,
      content,
      imageUrl,
      tags: tags ? tags.map(tag => tag.toLowerCase()) : []
    });

    // Update user's post count
    await User.findByIdAndUpdate(authorId, { $inc: { postsCount: 1 } });

    // Populate author details
    await post.populate('author', 'username fullName avatar');

    res.status(201).json({
      success: true,
      data: post,
      message: 'Post created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get personalized feed with infinite scroll
// @route   GET /api/posts/feed
// @access  Public
export const getFeed = async (req, res) => {
  try {
    const { error, value } = validateFeedQuery(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { page, limit, tag, userId } = value;

    const result = await FeedService.getPersonalizedFeed(userId, {
      page,
      limit,
      tag
    });

    res.status(200).json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
      filters: {
        tag: tag || null,
        personalized: !!userId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Like/Unlike a post
// @route   POST /api/posts/:id/like
// @access  Public
export const toggleLike = async (req, res) => {
  try {
    const { userId } = req.body;
    const postId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already liked the post
    const likeIndex = post.likes.findIndex(like => like.user.toString() === userId);
    let action;

    if (likeIndex > -1) {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
      post.likesCount = Math.max(0, post.likesCount - 1);
      action = 'unliked';
    } else {
      // Like the post
      post.likes.push({ user: userId });
      post.likesCount += 1;
      action = 'liked';

      // Add post tags to user's liked tags (for personalization)
      if (post.tags.length > 0) {
        const newTags = post.tags.filter(tag => !user.likedTags.includes(tag));
        if (newTags.length > 0) {
          user.likedTags.push(...newTags);
          await user.save();
        }
      }
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: {
        postId,
        likesCount: post.likesCount,
        action,
        isLiked: action === 'liked'
      },
      message: `Post ${action} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username fullName avatar')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get posts by user
// @route   GET /api/posts/user/:userId
// @access  Public
export const getPostsByUser = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.params.userId;

    const posts = await Post.find({ author: userId })
      .populate('author', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalPosts = await Post.countDocuments({ author: userId });

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasNextPage: skip + parseInt(limit) < totalPosts,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
