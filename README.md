# NestJS GraphQL API

A production-ready NestJS GraphQL API with JWT authentication, role-based access control, PostgreSQL database with Prisma ORM, and comprehensive CRUD operations.

## Features

- **GraphQL API** with Apollo Server
- **JWT Authentication** with Passport
- **Role-Based Access Control** (USER, ADMIN)
- **PostgreSQL Database** with Prisma ORM
- **Three Related Tables**: User, Post, Comment
- **Exception Filters** for proper error handling (400, 401, 403, 404, 500)
- **Validation** with class-validator and ValidationPipe
- **Separate DTOs** for create/update operations
- **Partial Updates** support (PATCH strategy)
- **Password Hashing** with bcrypt
- **OpenAPI/Swagger** documentation
- **Environment Variables** with validation
- **ConfigModule** with schema validation

## Tech Stack

- NestJS
- GraphQL (Apollo Server)
- PostgreSQL
- Prisma ORM
- JWT (Passport)
- bcrypt
- class-validator
- Joi (environment validation)

## Database Schema

### User
- id (UUID)
- email (unique)
- password (hashed)
- name
- role (USER, ADMIN)
- posts (relation)
- comments (relation)
- createdAt
- updatedAt

### Post
- id (UUID)
- title
- content
- published
- authorId (FK to User)
- author (relation)
- comments (relation)
- createdAt
- updatedAt

### Comment
- id (UUID)
- content
- postId (FK to Post)
- post (relation)
- authorId (FK to User)
- author (relation)
- createdAt
- updatedAt

## Prerequisites

- Node.js (v22.11.0 or compatible)
- PostgreSQL
- npm or yarn

## Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Configure environment variables:

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nestjs_graphql_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="7d"

# Server
PORT=3000
NODE_ENV="development"
```

3. Setup PostgreSQL database:

Make sure PostgreSQL is running and create the database:

```bash
createdb nestjs_graphql_db
```

4. Run Prisma migrations:

```bash
npx prisma migrate dev --name init
```

5. Generate Prisma Client:

```bash
npx prisma generate
```

## Running the Application

```bash
# development mode
npm run start

# watch mode (recommended for development)
npm run start:dev

# production mode
npm run start:prod
```

The application will start on:
- Server: `http://localhost:3000`
- GraphQL Playground: `http://localhost:3000/graphql`
- Swagger API Docs: `http://localhost:3000/api`

## GraphQL API Examples

### 1. Register a new user

```graphql
mutation {
  register(createUserDto: {
    email: "user@example.com"
    password: "password123"
    name: "John Doe"
    role: "USER"
  }) {
    accessToken
    user {
      id
      email
      name
      role
    }
  }
}
```

### 2. Login

```graphql
mutation {
  login(loginDto: {
    email: "user@example.com"
    password: "password123"
  }) {
    accessToken
    user {
      id
      email
      name
      role
    }
  }
}
```

### 3. Get current user (requires JWT)

Add Authorization header: `Bearer YOUR_JWT_TOKEN`

```graphql
query {
  me {
    id
    email
    name
    role
    createdAt
  }
}
```

### 4. Create a post (requires JWT)

```graphql
mutation {
  createPost(createPostDto: {
    title: "My First Post"
    content: "This is the content of my post"
    published: true
  }) {
    id
    title
    content
    published
    author {
      name
    }
  }
}
```

### 5. Get all posts

```graphql
query {
  posts {
    id
    title
    content
    published
    author {
      name
      email
    }
  }
}
```

### 6. Update a post (requires JWT, owner or admin)

```graphql
mutation {
  updatePost(
    id: "POST_ID"
    updatePostDto: {
      title: "Updated Title"
      content: "Updated content"
    }
  ) {
    id
    title
    content
  }
}
```

### 7. Create a comment (requires JWT)

```graphql
mutation {
  createComment(createCommentDto: {
    content: "Great post!"
    postId: "POST_ID"
  }) {
    id
    content
    author {
      name
    }
    post {
      title
    }
  }
}
```

### 8. Get all users (requires JWT, ADMIN role only)

```graphql
query {
  users {
    id
    email
    name
    role
  }
}
```

## Authorization

The API uses JWT Bearer tokens for authentication. After login or registration, include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

In GraphQL Playground, set the HTTP headers:

```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

## Role-Based Access Control

- **USER**: Can create/read/update/delete their own posts and comments
- **ADMIN**: Can manage all resources including other users' content

## API Endpoints

- `POST /graphql` - GraphQL endpoint
- `GET /graphql` - GraphQL Playground (development only)
- `GET /api` - Swagger documentation

## Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Push schema changes without migration
npx prisma db push
```

## Project Structure

```
src/
├── auth/                  # Authentication module
│   ├── decorators/        # Custom decorators (CurrentUser, Roles)
│   ├── dto/               # Auth DTOs (LoginDto)
│   ├── guards/            # Guards (JwtAuthGuard, RolesGuard)
│   ├── models/            # GraphQL models (AuthResponse)
│   ├── strategies/        # Passport strategies (JWT)
│   ├── auth.module.ts
│   ├── auth.resolver.ts
│   └── auth.service.ts
├── comments/              # Comments module
│   ├── dto/               # Comment DTOs (create, update)
│   ├── models/            # GraphQL models
│   ├── comments.module.ts
│   ├── comments.resolver.ts
│   └── comments.service.ts
├── common/                # Shared resources
│   └── filters/           # Exception filters
├── config/                # Configuration
│   └── env.validation.ts  # Environment validation schema
├── posts/                 # Posts module
│   ├── dto/               # Post DTOs (create, update)
│   ├── models/            # GraphQL models
│   ├── posts.module.ts
│   ├── posts.resolver.ts
│   └── posts.service.ts
├── prisma/                # Prisma module
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── users/                 # Users module
│   ├── dto/               # User DTOs (create, update)
│   ├── models/            # GraphQL models
│   ├── users.module.ts
│   ├── users.resolver.ts
│   └── users.service.ts
├── app.module.ts          # Root module
└── main.ts                # Application entry point
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error

## License

This project is [MIT licensed](LICENSE).
