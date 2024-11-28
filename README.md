# Socialpound API

## Description

Socialpound API is the backend repository for Socialpound, a social media platform like Instagram. It powers core functionalities like posts, likes, comments, notifications, call, etc built with a focus on scalability and performance.

This project is intended for learning and the fun of it and showcases various backend development practices using Node.js and Express.js, with additional tech such as Redis, MongoDB, BullMQ, WebSocket (Socket.io) etc.

This project is a work in progress. More features will be added in the future.

This repository has been kept public as a small token of gratitude towards the open-source community. From React.js to Node.js, my entire current tech stack is built on open source, without which I wouldn’t have become a developer. It also serves to showcase a small glimpse of my Software Engineering skills and expertise in Full Stack Development.

## Table of Contents

- [Description](#description)
- [Frontend](#frontend)
- [Technologies](#technologies)
- [Features](#features)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [License](#license)
- [Contact](#contact)
- [Support](#support)

## Frontend

The repository of Socialpound Webapp made using Next.js:  
[socialpound-webapp](https://github.com/SouravCodery/socialpound-webapp)

## Technologies

- **Node.js**: Backend runtime environment
- **Express.js**: Web framework for Node.js
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for database interactions
- **Redis**: Caching and persistent key-value store
- **AWS S3**: Media storage
- **AWS Presigned URL**: AWS Presigned URLs for secure image uploads from the frontend.
- **BullMQ**: Job queue for handling asynchronous tasks
- **TypeScript**: Type-safe JavaScript superset
- **JWT**: JSON Web Token for user authentication
- **Morgan**: HTTP request logger middleware for Node.js, useful for logging requests and responses
- **Winston**: Versatile logging library for Node.js, supports different transports like files, databases, and console
- **Joi**: Schema description language and validator for JavaScript objects, used for validating request payloads
- **Google-auth-library**: A library for Google's OAuth 2.0 authentication, used for verifying and managing Google logins
- **Compression**: Middleware for Express.js that enables Gzip compression for HTTP responses, improving performance by reducing the size of response payloads
- **WebSocket (Socket.io)**: Facilitates real-time signaling for WebRTC video/audio calls.

## Features

- **User Authentication**: JWT-based authentication (login via Google OAuth)
- **Posts and Feed**: Create posts with images and captions, and view a personalized feed.
- **Likes and Comments**: Like and comment on posts to engage with others.
- **Notifications**: Notifications for likes, comments, friend requests, etc
- **Media Upload**: Upload images/videos to AWS S3 via presigned URL
- **Caching**: Redis-based caching for improved performance
- **Key-Value Store**: Redis key-value store to track likes/comments counters
- **Queue**: Likes, comments, notifications processed in bulk via BullMQ
- **WebSocket**: Provides real-time signaling for seamless WebRTC video/audio calls.

## Installation

To make setup easier, this project provides a Docker Compose file. Make sure that you have Docker and Docker Compose installed. Follow the steps below to get started:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/SouravCodery/socialpound-api.git
   cd socialpound-api
   docker-compose -f docker-compose.local-setup.yml --env-file .env.example up --build
   ```

2. **Populate the `.env.example` with the remaining keys for AWS and Google Client ID**:

   ```
   AWS_ACCESS_KEY_ID=
   AWS_SECRET_ACCESS_KEY=
   AWS_REGION=
   AWS_BUCKET_NAME=
   AWS_PRESIGNED_URL_PREFIX=

   GOOGLE_CLIENT_ID=
   ```

3. **Run Docker Compose to start the API**:

   ```bash
   docker-compose -f docker-compose.local-setup.yml --env-file .env.example up --build
   ```

4. **Access the API**:
   [Socialpound API](http://localhost:3001)

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file. You can use `.env.example` as a reference, which has some keys pre-populated for use with Docker Compose to easily get the server up and running.

```bash
# Environment Example

NODE_ENV=development

MONGODB_URI=mongodb://mongodb:27017/socialpound
PORT=3001

# Redis

REDIS_CACHE_URL=redis://redis-cache:6379
REDIS_KEY_VALUE_STORE_URL=redis://redis-key-value-store:6379

REDIS_BULL_MQ_HOST=redis-key-value-store
REDIS_BULL_MQ_PORT=6379

REDIS_CACHE_ENABLED=true

# AWS Configuration
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=
AWS_PRESIGNED_URL_PREFIX=

# JWT Configuration
AUTH_JWT_SECRET_KEY=generateARandomSecretKey
AUTH_JWT_EXPIRES_IN=30d

# Google Client ID
GOOGLE_CLIENT_ID=

PAGINATION_LIMIT=10
WORKERS_LOG_ENABLED=false
```

## API Documentation

<details>
  <summary>Click to expand API Documentation</summary>

### User Endpoints

**sign-in**

- Method: `POST`
- URL: `{{rootUrl}}/v1/user/sign-in`
- Request Body:

```json
{
  "signedUserDataJWT": "{{signedUserDataJWTGoogle}}"
}
```

**getUserByUsername**

- Method: `GET`
- URL: `{{rootUrl}}/v1/user/souravscchoudhary`

**deleteUser**

- Method: `DELETE`
- URL: `{{rootUrl}}/v1/user`

### Post Endpoints

**createPost**

- Method: `POST`
- URL: `{{rootUrl}}/v1/post`
- Request Body:

```json
{
  "content": [
    {
      "type": "image",
      "url": "https://example.com/image.jpg",
      "aspectRatio": 1
    }
  ],
  "caption": "This is a sample caption."
}
```

**getAllPosts**

- Method: `GET`
- URL: `{{rootUrl}}/v1/post?cursor=66ec5ae6ec50b3ad7e420bb3`

**getPostsByUserId**

- Method: `GET`
- URL: `{{rootUrl}}/v1/post/:userId?cursor=66ec5ae6ec50b3ad7e420bb3`

**deletePostById**

- Method: `DELETE`
- URL: `{{rootUrl}}/v1/post/:postId`

### Comment Endpoints

**addComment**

- Method: `POST`
- URL: `{{rootUrl}}/v1/comment`
- Request Body:

```json
{
  "commentOn": "Post",
  "post": "66b28d6ae36a984431d2aa83",
  "parentComment": null,
  "text": "This is a comment on a post."
}
```

**getCommentsByPostId**

- Method: `POST`
- URL: `{{rootUrl}}/v1/comment/post/:postId?cursor=66b9beb124f866b5162bcb6f`

**deleteCommentById**

- Method: `DELETE`
- URL: `{{rootUrl}}/v1/comment/:commentId`

### Likes Endpoints

**likePostOrComment**

- Method: `POST`
- URL: `{{rootUrl}}/v1/like`
- Request Body:

```json
{
  "likeOn": "Post",
  "post": "66b28d6ae36a984431d2aa83"
}
```

**getPostsLikedByUser**

- Method: `GET`
- URL: `{{rootUrl}}/v1/like/post/:postId?cursor=66b9beb124f866b5162bcb6f`

**unlikePost**

- Method: `DELETE`
- URL: `{{rootUrl}}/v1/like/post/:postId`

**getLikesByPostId**

- Method: `GET`
- URL: `{{rootUrl}}/v1/like/post/:postId`

### Notification Endpoints

**addMarkNotificationAsRead**

- Method: `PATCH`
- URL: `{{rootUrl}}/v1/notification/:notificationId`

**getNotificationsByUser**

- Method: `GET`
- URL: `{{rootUrl}}/v1/notification`

</details>

## License

This project is for learning purposes and is not licensed for commercial use or redistribution. Feel free to explore the code for educational reasons.

## Contact

For questions or feedback, feel free to reach out:

- **GitHub**: [github.com/SouravCodery](https://github.com/SouravCodery)
- **LinkedIn**: [linkedin.com/in/SouravCodery](https://www.linkedin.com/in/SouravCodery)
- **X**: [x.com/souravcodery](https://x.com/souravcodery)
- **Email**: souravscchoudhary@gmail.com

## Support

If you find this project helpful or interesting, please give it a ⭐ on [GitHub](https://github.com/SouravCodery/socialpound-api)!
