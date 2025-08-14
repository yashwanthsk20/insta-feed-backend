import Joi from 'joi';

export const validateUser = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    fullName: Joi.string().max(100).required(),
    bio: Joi.string().max(500).optional(),
    avatar: Joi.string().uri().optional()
  });
  
  return schema.validate(data);
};

export const validatePost = (data) => {
  const schema = Joi.object({
    content: Joi.string().max(2200).required(),
    imageUrl: Joi.string().uri().optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(10).optional()
  });
  
  return schema.validate(data);
};

export const validateFeedQuery = (data) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    tag: Joi.string().max(50).optional(),
    userId: Joi.string().optional()
  });
  
  return schema.validate(data);
};