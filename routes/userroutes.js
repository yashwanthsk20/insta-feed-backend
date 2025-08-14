import express from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUserTags
} from '../controllers/userController.js';

const router = express.Router();

router.route('/')
  .post(createUser)
  .get(getAllUsers);

router.route('/:id')
  .get(getUserById);

router.route('/:id/tags')
  .put(updateUserTags);

export default router;

