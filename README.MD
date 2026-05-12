# E-Commerce System Backend (PERN)

Backend service for an e-commerce platform built with Node.js, Express, and PostgreSQL.
The codebase follows a layered module pattern (routes -> controller -> service -> repository) for maintainability and clear separation of concerns.

## What This Project Includes

- Product catalog management
- Brand and category management
- Attribute management for category-based product filtering
- Session-based cart operations
- Order creation (direct order and cart checkout)
- Order tracking by email and tracking code
- Admin authentication and role-based authorization
- Soft-delete and restore flows for selected resources

## Tech Stack

- Runtime: Node.js (ES Modules)
- Framework: Express
- Database: PostgreSQL (pg Pool)
- Validation: Joi
- Auth: JWT (Bearer token)
- Password Hashing: bcrypt
- Utility Libraries: slugify, uuid, dotenv, cookie-parser, cors
- Dev Tooling: nodemon

## High-Level Architecture

Request flow:

1. Route receives request and applies validators/middleware.
2. Controller handles HTTP concerns and forwards business logic to service.
3. Service applies business rules and orchestration.
4. Repository executes SQL queries.
5. Errors are normalized by global error handler middleware.

Main entry points:

- Server bootstrap: src/server.js
- Express app and route mounting: src/app.js
- Database pool: src/config/db.js
- Environment config loader: src/config/env.js

## Folder Structure

```text
src/
	app.js
	server.js
	config/
		db.js
		env.js
	middlewares/
		auth.js
		authorize.js
		errorHandler.js
	modules/
		admin/
		attributes/
		brands/
		cart/
		categories/
		order/
		products/
	utils/
		AppError.js
		generateTrackingCode.js
		hash.js
		jwt.js
```

Each domain module generally contains:

- <module>.routes.js
- <module>.controller.js
- <module>.service.js
- <module>.repository.js
- <module>.validator.js

## API Modules

Base path prefixes:

- /api/admin
- /api/attributes
- /api/brands
- /api/cart
- /api/categories
- /api/orders
- /api/products

For full endpoint-level documentation, request/response payloads, and role access rules, see API_DOCUMENTATION.md.

## Authentication and Authorization

- JWT token is required for protected endpoints.
- Token is expected in Authorization header:

```http
Authorization: Bearer <token>
```

- Role-based guards are enforced with middleware.
- Supported roles in code:
	- super_admin
	- admin
	- manager

## Cart and Session Behavior

- Cart operations are session-oriented.
- A session identifier is used to resolve a cart for non-authenticated flows.
- Cart checkout uses the active session to transform cart items into an order.

## Error Handling

- Centralized handler: src/middlewares/errorHandler.js
- Typical error response shape:

```json
{
	"success": false,
	"message": "Human-readable error message"
}
```

## Prerequisites

- Node.js 18+ recommended
- PostgreSQL 13+ recommended
- npm

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create an environment file in project root:

```bash
.env
```

3. Add required environment variables (placeholder values only):

```env
PORT=3000
JWT_SECRET=your_jwt_secret_here

DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
```

4. Start the server:

```bash
npm run start
```

If startup succeeds, the app listens on:

- http://localhost:<PORT>

## Available Scripts

- npm run start: start development server with nodemon
- npm test: placeholder script (not implemented)

## Environment Variables Reference

- PORT: application port
- JWT_SECRET: signing secret for JWT generation/verification
- DB_HOST: PostgreSQL host
- DB_PORT: PostgreSQL port
- DB_NAME: PostgreSQL database name
- DB_USER: PostgreSQL username
- DB_PASSWORD: PostgreSQL password

Important:

- Do not commit .env to version control.
- Never expose production secrets in documentation.

## Notes for Contributors

- Keep validation rules in module validator files.
- Keep SQL access in repository layer.
- Keep business logic in service layer.
- Reuse AppError for consistent error propagation.

## Related Documentation

- API reference: API_DOCUMENTATION.md
