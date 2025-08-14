// ===== ROUTES/POSTROUTES.JS =====
import express from 'express';
import {
  createPost,
  getFeed,
  toggleLike,
  getPostById,
  getPostsByUser
} from '../controllers/postController.js';

const router = express.Router();

router.route('/')
  .post(createPost);

router.route('/feed')
  .get(getFeed);

router.route('/:id')
  .get(getPostById);

router.route('/:id/like')
  .post(toggleLike);

router.route('/user/:userId')
  .get(getPostsByUser);

export default router;