# chat.js Backend

A secure, real-time chat application backend built with Node.js, Express, TypeScript, PostgreSQL, and WebSockets.

This project implements a clean, layered architecture separating routing, controllers, services, repositories, and the database layer. It leverages dependency injection for component decoupling, Zod for schema validation, and Drizzle ORM for database interactions.

---

## Key Features

- **Real-Time Communication**: Multi-device WebSocket connections per user managed via a dedicated connection manager, enabling instantaneous message delivery.
- **Token-Based Authentication**: Secure registration and login flows using JSON Web Tokens (JWT) and password hashing with bcrypt.
- **User Management**: API endpoints for fetching, updating, and deleting user accounts, protected by ownership guards.
- **Dependency Injection**: Decoupled component architecture managed via the Awilix container.
- **Schema Validation**: Safe parsing and validation of HTTP payloads and incoming WebSocket messages using Zod.
- **Database Architecture**: Highly optimized database schema with indexes and check constraints, managed via Drizzle ORM and Drizzle Kit migrations.
- **Security Protections**: Configured with CORS, Helmet, and express-rate-limit middleware to defend against common vulnerabilities and abuse.
- **Testing Suite**: Unit and integration test configurations using Vitest and Supertest.

---

## Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Web Framework**: Express (v5)
- **WebSockets**: ws
- **Database Engine**: PostgreSQL
- **Object-Relational Mapping (ORM)**: Drizzle ORM
- **Authentication**: JsonWebToken, Bcrypt
- **Request Validation**: Zod
- **Dependency Injection**: Awilix
- **Process Manager**: Nodemon (development execution)
- **Testing**: Vitest, Supertest

---

## Directory Structure

```text
backend/
├── src/
│   ├── app/
│   │   ├── http/
│   │   │   ├── controllers/      # Route controllers (Auth, User)
│   │   │   └── middlewares/      # Security guards, JWT validation, DI resolver
│   │   ├── repositories/         # Database abstraction layer
│   │   ├── services/             # Business logic layer
│   │   └── websocket/            # WebSocket connection and message management
│   ├── bootstrap/                # Application initialization and dependency injection configuration
│   ├── db/                       # Database connection, schemas, validators, and DTOs
│   ├── routes/                   # Express routing files
│   └── index.ts                  # Server entry point
├── drizzle.config.ts             # Drizzle ORM migration configuration
└── tsconfig.json                 # TypeScript compiler configuration
```

---

## Setup and Installation

### Prerequisites

- Node.js (v18 or higher recommended)
- PostgreSQL database instance

### Installation Steps

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy the example environment file and fill in the required database credentials and application settings:
   ```bash
   cp .env.example .env
   ```

4. Prepare the database schema:
   Generate migration files:
   ```bash
   npm run db:generate
   ```
   Push the schema to the database:
   ```bash
   npm run db:push
   ```
   Or apply migrations:
   ```bash
   npm run db:migrate
   ```

5. Start the application:
   ```bash
   npm start
   ```

---

## API Reference

All REST API endpoints are prefixed with `/api`.

### Authentication

#### Register User
- **URL**: `/api/v1/auth/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "example_user",
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "user": {
      "id": "uuid-string",
      "username": "example_user",
      "email": "user@example.com",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    },
    "token": "jwt-token-string"
  }
  ```

#### Login User
- **URL**: `/api/v1/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "user": { ... },
    "token": "jwt-token-string"
  }
  ```

### Users

These endpoints require authentication. The request must include the JWT in the `Authorization` header as a Bearer token: `Authorization: Bearer <token>`. Additionally, users can only access or modify their own resource (enforced by the ownership guard middleware).

#### Get User by ID
- **URL**: `/api/v1/users/:id`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "id": "uuid-string",
    "username": "example_user",
    "email": "user@example.com",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
  ```

#### Update User
- **URL**: `/api/v1/users/:id`
- **Method**: `POST`
- **Request Body** (optional fields):
  ```json
  {
    "username": "new_username",
    "email": "new_email@example.com",
    "password": "new_secure_password"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "id": "uuid-string",
    "username": "new_username",
    "email": "new_email@example.com"
  }
  ```

#### Delete User
- **URL**: `/api/v1/users/:id`
- **Method**: `DELETE`
- **Response** (204 No Content)

---

## WebSocket Protocol

The application supports real-time messaging using a WebSocket server initialized alongside the HTTP server.

### Connection Handshake

To establish a WebSocket connection, client requests must include a valid JWT in the query string parameters. Unauthenticated requests are rejected during the HTTP upgrade step.

- **Endpoint**: `ws://<server-host>:<port>?token=<jwt_token>`

### Message Format

All WebSocket messages are transmitted as JSON strings.

#### Client to Server (Sending a Message)
Clients send messages containing the target recipient and content. The sender ID is automatically inferred from the authenticated token.
```json
{
  "receiver_id": "receiver-uuid-string",
  "content": "Hello, how are you?"
}
```

#### Server to Client (Message Broadcast)
When a message is successfully validated and stored in the database, the server attempts to deliver the message immediately to the recipient if they are online.
```json
{
  "id": "message-uuid-string",
  "sender_id": "sender-uuid-string",
  "receiver_id": "receiver-uuid-string",
  "content": "Hello, how are you?",
  "status": "sent",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## Database Schema

The database uses PostgreSQL with the following core entities:

- **Users**: Unique identifiers, credentials, and profile meta-information.
- **Contacts**: Standardizes relationship dynamics (such as friend/blocked status and favorites) between users. Includes integrity checks enforcing ID asymmetry (`user_id < other_id`) to prevent duplicate entries for symmetric relations.
- **Messages**: Tracks communication logs, sender/receiver references, content, and delivery statuses (`sent`, `delivered`, `read`).

---

## Testing

The codebase utilizes Vitest for testing. The execution commands are configured in `package.json`:

- **Run all tests**:
  ```bash
  npm test
  ```
- **Run unit tests**:
  ```bash
  npm run test:unit
  ```
- **Run integration tests**:
  ```bash
  npm run test:integration
  ```
- **Run tests in watch mode**:
  ```bash
  npm run test:watch
  ```
