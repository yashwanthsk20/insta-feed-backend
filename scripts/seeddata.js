import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Post from '../models/Post.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

const sampleUsers = [
  {
    username: 'johndoe',
    email: 'john@example.com',
    fullName: 'John Doe',
    bio: 'Software developer and photography enthusiast',
    likedTags: ['javascript', 'react', 'photography']
  },
  {
    username: 'sarahjones',
    email: 'sarah@example.com',
    fullName: 'Sarah Jones',
    bio: 'Digital marketing expert and travel lover',
    likedTags: ['marketing', 'travel', 'food']
  },
  {
    username: 'mikechen',
    email: 'mike@example.com',
    fullName: 'Mike Chen',
    bio: 'UI/UX Designer creating beautiful experiences',
    likedTags: ['design', 'ui', 'ux', 'art']
  },
  {
    username: 'emilysmith',
    email: 'emily@example.com',
    fullName: 'Emily Smith',
    bio: 'Fitness trainer and nutrition coach',
    likedTags: ['fitness', 'health', 'nutrition']
  }
];

const samplePosts = [
  {
    content: "Just finished building my first React app! The feeling of seeing everything come together is incredible. #javascript #react #coding",
    tags: ['javascript', 'react', 'coding'],
    imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500"
  },
  {
    content: "Beautiful sunset from my hiking trip today. Nature never fails to amaze me! 🌅 #nature #hiking #photography",
    tags: ['nature', 'hiking', 'photography'],
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500"
  },
  {
    content: "New UI design for a mobile banking app. Clean, modern, and user-friendly. What do you think? #design #ui #mobile",
    tags: ['design', 'ui', 'mobile'],
    imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500"
  },
  {
    content: "Morning workout complete! Remember, consistency is key. Your future self will thank you. 💪 #fitness #motivation #health",
    tags: ['fitness', 'motivation', 'health']
  },
  {
    content: "Exploring the best coffee shops in the city. This latte art is too beautiful to drink! ☕ #coffee #food #city",
    tags: ['coffee', 'food', 'city'],
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500"
  },
  {
    content: "Working on a new JavaScript framework comparison. The ecosystem keeps evolving! #javascript #development #tech",
    tags: ['javascript', 'development', 'tech']
  }
];

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = await User.insertMany(sampleUsers);
    console.log('👥 Created sample users');

    // Create posts with random authors
    const postsWithAuthors = samplePosts.map((post, index) => ({
      ...post,
      author: createdUsers[index % createdUsers.length]._id,
      likesCount: Math.floor(Math.random() * 50),
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within last week
    }));

    await Post.insertMany(postsWithAuthors);
    console.log('📝 Created sample posts');

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();