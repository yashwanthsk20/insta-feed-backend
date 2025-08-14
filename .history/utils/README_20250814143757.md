Installation & Setup
Prerequisites

Node.js v18 or higher
MongoDB v5.0 or higher
Git

steps:

Step 1: Create Project Structure

mkdir infinite-social-feed
cd infinite-social-feed

# Create all directories
mkdir config controllers middleware models routes scripts services utils

# Create individual files (copy content from the artifact above)
touch server.js
touch package.json
touch .env
# ... create all other files as shown in the artifact

Step 2: Install Dependencies

npm install

Step 3: Environment Setup

PORT=3000
MONGODB_URI=mongodb://localhost:27017/social_feed
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here

Step 5: Seed Sample Data

npm run seed

Step 6: Start the Server

# Development mode with auto-restart
npm run dev

 API Documentation
Base URL: http://localhost:3000/api
User Endpoints
Create User

POST /api/users
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "bio": "Software developer",
  "avatar": "https://example.com/avatar.jpg"
}

Get All Users
GET /api/users?page=1&limit=10&search=john

Get User by ID
GET /api/users/USER_ID

Update User Tags
PUT /api/users/USER_ID/tags
Content-Type: application/json

{
  "tags": ["javascript", "react", "photography"]
}

Post Endpoints
Create Post

POST /api/posts
Content-Type: application/json

{
  "authorId": "USER_ID",
  "content": "My amazing post content!",
  "imageUrl": "https://example.com/image.jpg",
  "tags": ["javascript", "coding", "tech"]
}

Get Personalized Feed (Main Feature)

GET /api/posts/feed?page=1&limit=10&tag=javascript&userId=USER_ID

Query Parameters:

page - Page number (default: 1)
limit - Posts per page (default: 10, max: 50)
tag - Filter by specific tag (optional)
userId - For personalization (optional)

Like/Unlike Post

POST /api/posts/POST_ID/like
Content-Type: application/json

{
  "userId": "USER_ID"
}

Get Post by ID

GET /api/posts/POST_ID

Get Posts by User
GET /api/posts/user/USER_ID?page=1&limit=10



Database Schema
User Model

{
  username: String (required, unique),
  email: String (required, unique),
  fullName: String (required),
  avatar: String (default placeholder),
  bio: String (optional),
  likedTags: [String], // For personalization
  followersCount: Number (default: 0),
  followingCount: Number (default: 0),
  postsCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}

Post Model

{
  author: ObjectId (ref: User, required),
  content: String (required, max: 2200),
  imageUrl: String (optional),
  tags: [String], // Lowercase, indexed
  likes: [{
    user: ObjectId (ref: User),
    createdAt: Date
  }],
  likesCount: Number (default: 0),
  commentsCount: Number (default: 0),
  score: Number (calculated automatically),
  createdAt: Date,
  updatedAt: Date
}


Ranking Algorithm
The personalized feed uses a sophisticated ranking algorithm:

const ageInHours = (currentTime - postCreatedTime) / (1000 * 60 * 60);
const recencyScore = Math.max(0, 100 - (ageInHours * 2));
const popularityScore = Math.min(likesCount * 5, 500);

Personalization Bonuses

Tag Matching: +50 points per matching tag with user's liked tags
Fresh Content: +25 points for posts less than 24 hours old
Author Relationship: +100 points for followed users (future feature)

Final Score

finalScore = recencyScore + popularityScore + personalizationBonus



Scaling Considerations
Database Optimization

Compound Indexes

// Optimized for feed queries
db.posts.createIndex({ tags: 1, createdAt: -1, likesCount: -1 })
db.posts.createIndex({ createdAt: -1, score: -1 })

