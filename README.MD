# E-Commerce System Backend (PERN)

Backend service for an e-commerce platform built with Node.js, Express, and PostgreSQL. The codebase uses a layered feature-module architecture so API concerns, business rules, and persistence stay separated and testable.

## Architecture At A Glance

The application boots in [src/server.js](src/server.js), waits for the database connection to succeed, and then starts the Express app from [src/app.js](src/app.js). The app mounts all feature routers under `/api`, applies cross-cutting middleware once, and delegates error normalization to a single global handler.

Request flow:

1. The router receives the request and runs request-specific validation and middleware.
2. The controller handles HTTP concerns and response shaping.
3. The service layer applies business rules and orchestration.
4. The repository layer executes SQL against PostgreSQL.
5. Errors bubble into [src/middlewares/errorHandler.js](src/middlewares/errorHandler.js) and are returned in a consistent JSON shape.

This is a classic module-boundary design, not a shared-service monolith. Each feature owns its own route, controller, service, repository, and validator files, which keeps the public API surface easy to reason about and minimizes cross-module coupling.

## System Boundaries

### Runtime And Infrastructure

- Runtime: Node.js with ES modules
- Web framework: Express
- Database: PostgreSQL via `pg`
- Deployment database path: `DATABASE_URL` with SSL enabled in [src/config/db.js](src/config/db.js)
- Environment loading: `dotenv` in [src/config/env.js](src/config/env.js)

### Core Middleware Chain

The app-level middleware stack in [src/app.js](src/app.js) does the following:

- Parses JSON bodies with a 1 MB limit
- Sets `trust proxy` for reverse-proxy aware deployments
- Enables CORS for the approved frontend origins
- Parses cookies for session-aware flows
- Initializes Cloudinary on startup
- Mounts the feature routers
- Handles uncaught application errors with the global error middleware

### Authentication And Access Control

- Admin protection uses JWT Bearer tokens in the `Authorization` header
- `authMiddleware` decodes and attaches the token payload to `req.admin`
- `authorize(...)` enforces role-based access for protected routes
- Supported roles in code are `super_admin`, `admin`, and `manager`

### Session And Cart Behavior

Cart and order flows are intentionally session-backed for guest users. [src/middlewares/session.middleware.js](src/middlewares/session.middleware.js) assigns a cookie-backed session ID, and cart/order handlers reuse that identifier to resolve the active cart or checkout state without requiring a login session.

### Media And External Services

- File uploads use `multer`
- Product and brand images are stored in Cloudinary
- Email support is scaffolded through the mail service and templates
- A Resend config exists alongside the Nodemailer setup, but the active order-email path is still service-driven rather than fully centralized in a single provider abstraction

## Domain Modules

The main mounted API areas are:

- `/api/admin`
- `/api/attributes`
- `/api/banners`
- `/api/brands`
- `/api/cart`
- `/api/categories`
- `/api/offers`
- `/api/orders`
- `/api/products`

Each module generally contains:

- `*.routes.js` or `*.router.js`
- `*.controller.js`
- `*.service.js`
- `*.repository.js`
- `*.validator.js`

Important domain patterns:

- Products expose both public catalog routes and protected admin-only maintenance routes.
- Orders support both guest checkout and admin order management.
- Brands and products integrate multipart uploads with Cloudinary-backed image lifecycle handling.
- Some modules intentionally expose lightweight public read endpoints while protecting write and management actions behind auth.

## Data And Persistence

Repositories are the only layer that should talk to PostgreSQL directly. Business logic should stay in services, and validation should stay close to the module boundary so malformed inputs are rejected before they hit the database.

The codebase currently favors explicit SQL and domain-specific query methods over a generic ORM abstraction. That keeps the data access predictable and makes it easier to reason about query shape, performance, and edge cases.

## Error Model

Errors are normalized by [src/middlewares/errorHandler.js](src/middlewares/errorHandler.js). The expected response shape is:

```json
{
	"success": false,
	"message": "Human-readable error message"
}
```

Use `AppError` for predictable operational failures and keep low-level exceptions out of controller code unless they are immediately translated into a user-facing error.

## Repository Layout

```text
src/
	app.js
	server.js
	config/
		cloudinary.js
		connectDB.js
		db.js
		env.js
		mailer.config.js
		resend.config.js
	middlewares/
		auth.js
		authorize.js
		errorHandler.js
		loginLimiter.js
		multer.js
		session.middleware.js
	modules/
		admin/
		attributes/
		banners/
		brands/
		cart/
		categories/
		notifications/
		offers/
		order/
		products/
	services/
		mail.service.js
	templates/
		orderConfirmation.template.js
		orderStatusUpdate.template.js
	utils/
		AppError.js
		cloudinaryUpload.js
		generateTrackingCode.js
		hash.js
		jwt.js
		offerPricing.js
```

## Operational Notes

- `src/config/env.js` currently loads environment variables but does not enforce a required-variable checklist at startup.
- The project is deployed with a PostgreSQL connection string rather than the older local `DB_*` config path.
- The module structure is intentionally consistent, but a few files use slightly different naming conventions, such as `banner.router.js`.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root.

3. Add the required environment variables:

```env
PORT=3000
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=postgresql://user:password@host:5432/database
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Start the server:

```bash
npm run start
```

If startup succeeds, the app listens on `http://localhost:<PORT>`.

## Available Scripts

- `npm run start`: start the server
- `npm run dev`: start the server with `nodemon`
- `npm test`: placeholder script

## Documentation

- API reference: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)
- Senior-level API reference: [docs/API_DOCUMENTATION_SENIOR.md](docs/API_DOCUMENTATION_SENIOR.md)
- Full documentation: [docs/FULL_DOCUMENTATION.md](docs/FULL_DOCUMENTATION.md)

## Notes For Contributors

- Keep validation in module validator files.
- Keep SQL access in repository files.
- Keep orchestration in service files.
- Reuse `AppError` for consistent error propagation.
- When adding routes, place specific routes before parameterized routes to avoid accidental shadowing.
