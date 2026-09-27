# Ozone Computers — E-Commerce Backend (PERN Stack)

Production backend for **Ozone Computers**, a computer-hardware e-commerce platform. Built on **PostgreSQL, Express, React (consumed separately), Node.js** with a fully layered module architecture and an integrated **AI product-comparison / shopping-assistant** feature powered by OpenRouter.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Authentication & Authorization](#authentication--authorization)
7. [Guest Sessions (Cart & Orders)](#guest-sessions-cart--orders)
8. [API Reference](#api-reference)
9. [AI Features](#ai-features)
10. [File Uploads](#file-uploads)
11. [Error Handling](#error-handling)
12. [Rate Limiting](#rate-limiting)
13. [Database Notes](#database-notes)
14. [Deployment (Docker)](#deployment-docker)
15. [Known Limitations & Roadmap](#known-limitations--roadmap)

---

## Tech Stack

| Concern | Technology |
|---|---|
| Runtime | Node.js (ESM — `"type": "module"`) |
| Framework | Express 4 |
| Database | PostgreSQL (`pg`), hosted on Neon (serverless Postgres) |
| Auth | JWT (`jsonwebtoken`) + bcrypt password hashing |
| Guest identity | Cookie-based session ID (`uuid`) for cart/order flows |
| File storage | Cloudinary (images, banners, receipts) |
| Uploads | Multer (in-memory storage, MIME + extension allow-listing) |
| Validation | Joi |
| Email | Nodemailer (SMTP) — Resend integration present but currently disabled |
| Rate limiting | `express-rate-limit` |
| AI provider | OpenRouter (`fetch`-based client, model-agnostic) |
| Containerization | Docker (`node:22-alpine`) |

---

## Architecture

The codebase follows a strict **layered, module-per-domain** architecture. Every business domain under `src/modules/<domain>/` follows the same four-file pattern:

```
route.js        → HTTP method + path bindings, middleware wiring only
controller.js    → Request/response shape, delegates to service, calls next(err)
service.js       → Business logic, orchestration, validation of business rules
repository.js    → SQL queries only, no business logic
validator.js     → Joi schemas, request shape validation (where applicable)
```

**Request flow:**

```
Client → route → [middleware: auth / authorize / session / upload / validator]
       → controller → service → repository → PostgreSQL
       ← controller (shapes response) ← service ← repository
```

Cross-cutting concerns live outside the module folders:

```
src/config/       → DB pool, env loader, Cloudinary, mail transport
src/middlewares/  → auth, authorize, error handler, rate limiter, multer, session
src/services/     → shared services consumed by multiple modules (AI, mail)
src/templates/    → HTML email templates
src/utils/        → AppError, JWT helpers, tracking code generator, offer pricing
```

---

## Project Structure

```
src/
├── app.js                       # Express app assembly, CORS, route mounting
├── server.js                    # Entrypoint — connects DB, starts HTTP listener
├── config/
│   ├── db.js                    # pg Pool (Neon-configured, SSL, pool limits)
│   ├── connectDB.js             # Startup connection check with retry/backoff
│   ├── env.js                   # Centralized env var access
│   ├── cloudinary.js
│   ├── mailer.config.js
│   └── resend.config.js
├── middlewares/
│   ├── auth.js                  # JWT verification → req.admin
│   ├── authorize.js             # Role-based route guard
│   ├── errorHandler.js          # Centralized error → JSON response
│   ├── loginLimiter.js          # Rate limit on /admin/login
│   ├── multer.js                # Upload config + MIME/extension allow-list
│   └── session.middleware.js    # Guest session cookie (cart/order)
├── modules/
│   ├── admin/                   # Admin auth, roles, account management
│   ├── attributes/               # Category-scoped product attributes & values
│   ├── banners/                  # Homepage banner images/video
│   ├── brands/
│   ├── cart/                     # Session-based guest cart
│   ├── categories/
│   ├── chat/                     # AI shopping assistant (stateless, client-held history)
│   ├── comparison/                # AI product comparison (async job pattern)
│   ├── notifications/             # Scaffolded, not yet wired into app.js
│   ├── offers/                    # Discounts/promotions engine
│   ├── order/                     # Order lifecycle, tracking, receipts
│   └── products/                  # Product catalog, images, filtering
├── services/
│   ├── ai/
│   │   ├── openRouterClient.js   # Provider-agnostic chat-completion client
│   │   ├── prompts/               # Prompt builders (one per AI use case)
│   │   └── utils/                 # Response formatting, DB→prompt formatting
│   └── mail.service.js
├── templates/                    # Order confirmation / status email HTML
└── utils/                        # AppError, jwt, hash, tracking codes, offer pricing
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18 (project targets Node 22 in Docker)
- A PostgreSQL database (Neon recommended — the pool is pre-configured for it)
- Cloudinary account (image/video storage)
- An OpenRouter API key (for AI features)

### Install

```bash
git clone <repo-url>
cd E-Commerce-Sys-BackEnd-PERN
npm install
```

### Run

```bash
npm run dev     # nodemon, auto-restart
npm start        # production
```

The server connects to the database first (with retry/backoff, see [Database Notes](#database-notes)) and only starts listening once that succeeds.

---

## Environment Variables

Create a `.env` file at the project root:

```env
# Server
PORT=4000
NODE_ENV=development

# Database (Neon connection string, pooled endpoint recommended)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Auth
JWT_SECRET=your-long-random-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Mail (SMTP — currently active transport)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
MAIL_FROM="Ozone Computers <no-reply@ozonecomputers.com>"

# Mail (Resend — alternate provider, currently unused in mail.service.js)
RESEND_API_KEY=your-resend-key

# AI (OpenRouter)
OPENROUTER_API_KEY=your-openrouter-key
AI_MODEL=openai/gpt-4o-mini
```

> **Note:** `env.js` no longer hard-validates required variables at boot (the check is commented out). A missing variable will surface as a runtime error the first time that dependency is used, not at startup — keep this in mind when diagnosing "works locally, fails in prod" issues.

---

## Authentication & Authorization

Two independent identity systems exist in parallel:

### 1. Admin/staff auth (JWT)

- `POST /api/admin/login` issues a JWT (`generateToken`, 1-hour expiry) validated on protected routes via `authMiddleware`, which decodes the token into `req.admin`.
- Role-based access is enforced per-route with `authorize(...roles)`.
- Three roles exist: **`super_admin`**, **`admin`**, **`manager`** (enforced via Joi `.valid()` in `admin.validator.js`; new admins default to `manager` if no role is supplied).
- `super_admin` is required for admin account management (create/update-role/delete) and destructive catalog operations (deleting brands/categories/attributes/products).

### 2. Guest identity (session cookie)

Cart and order-tracking flows require no login. `attachSession` middleware issues a `sid` cookie (UUID v4, 7-day expiry, `httpOnly`, `secure`, `SameSite=None` in production) on first cart/order interaction. This is the mechanism `cart.routes.js` and `order.routes.js` use to scope guest data without accounts.

---

## Guest Sessions (Cart & Orders)

- `GET/POST/PATCH/DELETE /api/cart` — all scoped to the caller's session cookie, not a user account.
- `POST /api/orders/create` — public, uses the session for guest order attribution.
- `POST /api/orders/tracking` — public order lookup by tracking code (format: `TRK-YYYYMMDD-<6 hex chars>`, see `generateTrackingCode.js`), not tied to the session — this is how a guest retrieves order status from any device using the code emailed/shown to them.
- `POST /api/orders/upload-receipt/:id` — public, bank-deposit-slip upload for offline payment confirmation (images/PDF only, via `receiptUpload`).

---

## API Reference

All routes are mounted under `/api`. `🔒` = requires `authMiddleware`; role in parentheses = additionally requires `authorize(role)`.

### `/api/products`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List all products |
| GET | `/best-selling` | Public | Best-selling products (homepage) |
| GET | `/latest` | Public | Newest products (homepage) |
| GET | `/search/:name` | Public | Name search |
| GET | `/category/:categoryId` | Public | Products by category |
| GET | `/filter/options/:categoryId` | Public | Available filter facets for a category |
| POST | `/filter/:categoryId` | Public | Apply filters, return matching products |
| GET | `/:id` | Public | Full product detail |
| POST | `/` | Public* | Create product with attributes (multipart, ≤3 images) |
| 🔒 GET | `/admin/limited-details` | admin/manager | Lightweight admin listing |
| 🔒 GET | `/admin/simple-details` | admin/manager | Simplified admin listing |
| 🔒 GET | `/admin/products/:id` | admin/manager | Full admin detail view |
| 🔒 POST | `/admin/without-attributes` | any admin | Create product without attribute mapping |
| 🔒 PUT | `/admin/products/:id/full-update` | admin | Update product fields (JSON only) |
| 🔒 POST | `/admin/products/:id/images` | admin | Add up to 3 images |
| 🔒 DELETE | `/admin/products/:id/images/:imageId` | admin | Remove one image (DB + Cloudinary) |
| 🔒 PATCH | `/admin/products/:id/images/reorder` | admin | Reorder/set primary image |
| 🔒 DELETE | `/admin/delete/:id` | super_admin | Delete product |

\* `POST /` for product creation is currently unauthenticated at the route level — flagged in [Known Limitations](#known-limitations--roadmap).

### `/api/categories`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/products` | Public | Categories flagged as product categories |
| GET | `/accessories` | Public | Categories flagged as accessory categories |
| 🔒 GET | `/admin` | admin | Full category list |
| 🔒 GET | `/admin/names` | admin | Name-only list (for dropdowns) |
| 🔒 POST | `/` | admin | Create category (multipart, single media) |
| 🔒 DELETE | `/:id` | admin | Delete category |

### `/api/brands`

| Method | Path | Access | Description |
|---|---|---|---|
| 🔒 GET | `/admin` | admin | Full brand list |
| 🔒 GET | `/admin/names` | admin | Name-only list |
| 🔒 POST | `/admin` | admin | Create brand (multipart, logo) |
| 🔒 DELETE | `/admin/:id` | admin | Delete brand |

### `/api/attributes`

All routes 🔒 require admin/super_admin — attribute management is admin-only, no public read routes.

| Method | Path | Description |
|---|---|---|
| GET | `/admin` | List attributes |
| GET | `/admin/grouped/:categoryId` | Attributes grouped by category |
| POST | `/admin` | Create attribute |
| POST | `/admin/:attributeId/value` | Add a value to an attribute |
| POST | `/admin/products/:productId/attributes` | Map attribute+value onto a product |
| DELETE | `/admin/:id` | Delete attribute |
| DELETE | `/admin/:attributeId/value/:valueId` | Delete an attribute value |

### `/api/cart` (session-scoped, no auth)

| Method | Path | Description |
|---|---|---|
| GET | `/` | Get current session's cart |
| POST | `/` | Add item |
| PATCH | `/:itemId` | Update quantity |
| DELETE | `/:itemId` | Remove item |
| DELETE | `/` | Clear cart |

### `/api/orders`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/create` | Public | Create order (session-scoped) |
| POST | `/tracking` | Public | Look up orders by tracking code |
| POST | `/upload-receipt/:id` | Public | Upload payment receipt (image/PDF) |
| 🔒 GET | `/admin/statuses` | admin/manager | Order status breakdown |
| 🔒 GET | `/admin/low-stock-alert` | admin/manager | Products below stock threshold |
| 🔒 GET | `/admin/recent-orders` | admin/manager | Recent orders |
| 🔒 GET | `/admin/order-status-count` | admin/manager | Counts per status |
| 🔒 GET | `/admin/orders` | admin/manager | All orders |
| 🔒 GET | `/admin/:id` | admin/manager | Single order detail |
| 🔒 GET | `/admin/receipt/:id` | admin/manager | Fetch uploaded receipt image |
| 🔒 PUT | `/admin/state/:id` | admin/manager | Update order status (triggers status-update email) |

### `/api/offers`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/`, `/user`, `/active`, `/upcoming` | Public | Offer discovery endpoints |
| GET | `/user/:id`, `/user/:id/products` | Public | Offer detail + its products |
| 🔒 GET | `/admin`, `/admin/:id` | admin/manager | Admin offer views |
| 🔒 POST | `/admin/` | admin/manager | Create offer (multipart, banner image) |
| 🔒 POST | `/admin/products/:id` | admin/manager | Attach product to offer |
| 🔒 PUT | `/admin/:id`, `/admin/:id/toggle` | admin/manager | Update offer / toggle active state |
| 🔒 DELETE | `/admin/:id` | admin/manager | Delete offer |

### `/api/banners`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/public/images`, `/public/video` | Public | Homepage media |
| 🔒 GET | `/admin`, `/admin/:id` | admin/manager | Admin banner views |
| 🔒 POST | `/admin` | admin | Create banner (multipart) |
| 🔒 DELETE | `/admin/:id` | admin | Delete banner |

### `/api/admin`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/login` | Public (rate-limited) | Admin login → JWT |
| 🔒 GET | `/` | super_admin | List all admin accounts |
| 🔒 POST | `/register` | super_admin | Create admin account |
| 🔒 PUT | `/updateRole/:id` | super_admin | Change an admin's role |
| 🔒 PUT | `/settings/updatePassword/:id` | any admin role | Change password |
| 🔒 DELETE | `/delete/:id` | super_admin | Delete admin account |

### `/api/ai` (comparison) and `/api/chat`

See [AI Features](#ai-features) below.

---

## AI Features

Both AI features share a single provider client (`src/services/ai/openRouterClient.js`) that calls OpenRouter's chat-completions endpoint over plain `fetch`. Model selection is environment-driven (`AI_MODEL`), so switching providers/models requires no code change.

```js
askAI(prompt)                 // single-turn helper, wraps askAIWithHistory
askAIWithHistory(messages)    // multi-turn, used by both features
```

`max_tokens: 2000`, `temperature: 0.3` — tuned for structured, deterministic JSON output rather than creative variance. The client logs a warning when `finish_reason === "length"`, which is the leading indicator of a truncated/invalid JSON response.

### Product Comparison (`/api/ai`)

Because AI responses have highly variable latency (2–60+ s depending on provider load), this endpoint is built as an **async job pattern** rather than a blocking request/response, to avoid client-side timeouts on slow completions:

```
POST /api/ai            { productIds: number[] }   → 202 { jobId }
GET  /api/ai/:jobId      → { status: "pending" | "done" | "error", result? }
```

**Pipeline (`comparison.service.js`):**

1. Cache check — an in-memory `Map` keyed by sorted product ID set (30 min TTL). Identical comparisons within the TTL window skip the AI call entirely, saving both latency and token budget.
2. `comparison.repository.js` fetches full product rows via a single query using nested `json_build_object`/`json_object_agg` to inline brand, category, and the full attribute set as JSON — no N+1 queries.
3. `formatProductForPrompt.js` flattens the raw attribute JSON (which varies in shape depending on how each attribute was seeded) into a plain-text spec block for the prompt, normalizing key casing along the way.
4. `compareProducts.prompt.js` builds a strict-JSON-only prompt: identical `specs` label sets across all compared products (so the frontend can render a spec-by-spec table without special-casing missing fields), explicit bans on markdown/pipes/line-breaks inside string values, and cross-category handling (e.g. comparing a laptop against a monitor) so the model explains relevance rather than forcing an artificial spec match.
5. `safeParseAIJson` strips code-fences, parses, and recursively sanitizes every string value (markdown symbols, escaped/literal newlines, pipe characters) as a defense-in-depth layer — models don't always honor "no markdown" instructions under load.
6. Result is cached and returned via the job store.

**Job store** (`comparison.jobStore.js`) is a process-local `Map` with a 10-minute expiry sweep. See [Known Limitations](#known-limitations--roadmap) regarding horizontal scaling.

### Shopping Assistant Chat (`/api/chat/message`)

```
POST /api/chat/message   { history, message, comparisonResult? }   → { reply }
```

**Deliberately stateless on the server.** No conversation is persisted in the database — the client (frontend) is the sole holder of chat history and resends it on every turn. This was a scoping decision: a page refresh should start a clean conversation, and the store owner did not want a database footprint or moderation surface for chat transcripts.

- `history` — the prior turns, sent back by the client each request.
- `comparisonResult` — optional; when a user reaches chat via "Ask AI" from a comparison result, the frontend forwards that structured comparison JSON so the assistant can answer follow-ups ("which one is better for video editing?") with the same product context, without re-fetching or re-comparing.
- **Prompt-injection guard:** any `role: "system"` message present in the client-supplied `history` is filtered out server-side before being spliced into the message array — the server always injects its own system message last in that construction order, so a malicious client payload cannot override the assistant's instructions by smuggling a fake system turn.

`buildChatSystemMessage()` composes the base persona plus, when present, the serialized comparison context appended as background the model should reference for follow-ups.

#### In-progress: catalog-grounded product search (commented out)

`chat.service.js` retains a fully-written but **disabled** two-step retrieval flow (visible as a block comment at the bottom of the file), representing the answer to *"can we let the AI query the product catalog without sending the whole database on every call?"* The design, once re-enabled:

1. `chat.repository.js#getCatalogMeta()` — returns a small, cached (10 min TTL) "menu" of real category names, brand names, and attribute names per category. This is cheap enough to send on every relevant turn and lets the model map free-text ("something for university work") to real filterable values instead of hallucinating them.
2. `filterExtraction.prompt.js` — asks the model to convert the user's message into a structured filter object (`categories`, `brands`, `minPrice`/`maxPrice`, `attributeFilters`, `keywords`) using only real catalog values, or `isProductSearch: false` for non-search messages.
3. `chat.repository.js#searchProducts()` — takes that structured filter object and builds a **parameterized** SQL query (the AI never writes SQL, only structured values inserted via `$1, $2, …` placeholders) with a hard `LIMIT` (default 12), keeping the candidate set small before anything reaches a second AI call.
4. `productAnswer.prompt.js` — a second, short AI call turns the filtered candidate rows into a natural-language answer plus the specific `productIds` referenced, so the frontend can deep-link to them.

This is the token-efficient pattern the AI comparison/build-a-PC discussion in this project converged on: **never send the full catalog to the model — filter server-side first, then hand the model a small, relevant candidate set.** Re-enabling it is a matter of uncommenting the block and wiring the two prompt files back in; the SQL/caching layer is already functional.

---

## File Uploads

`src/middlewares/multer.js` uses in-memory storage (files never touch disk) with a shared validation factory (`createFileFilter`) applied to two distinct upload profiles:

- **General uploads** (`upload`) — product/category/brand/banner media. Allows JPEG/PNG/WebP images, PDF, and MP4/WebM/Ogg video, 50 MB cap.
- **Receipt uploads** (`receiptUpload`) — payment slip uploads only. Images + PDF, no video (a deposit slip is never a video).

Validation is defense-in-depth: an explicit deny-list of dangerous MIME types is checked first (executables, shell scripts, PHP), then an allow-list by MIME type, then a cross-check that the file's extension actually matches its declared MIME type — this catches a common bypass where a renamed malicious file is uploaded with a spoofed extension but its true MIME type still resolves correctly.

Accepted files are streamed to **Cloudinary** (`cloudinaryUpload.js`) rather than persisted locally, keeping the server stateless with respect to file storage.

---

## Error Handling

A single `AppError` class (`statusCode` + `message`) is thrown from services/repositories for expected failure modes (validation failures, not-found, auth failures). All controllers pass unexpected errors to `next(error)`, which reaches the centralized `errorHandler` middleware:

```js
res.status(err.statusCode || err.status || 500).json({
  success: false,
  message: err.message || 'Internal Server Error'
});
```

Every successful response follows the same envelope for consistency:

```json
{ "success": true, "message": "...", "data": { } }
```

---

## Rate Limiting

`loginLimiter` (`express-rate-limit`) guards `POST /api/admin/login`: 5 attempts per 10-minute window per IP, with a `Retry-After` header and a JSON `429` body on exceedance. No other routes are currently rate-limited.

---

## Database Notes

- **Connection pool** (`config/db.js`) is tuned for a serverless Postgres provider (Neon): `max: 10`, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 10000`, SSL with `rejectUnauthorized: false`. A `pool.on('error', ...)` handler is registered — **required** when running against providers that unilaterally drop idle connections, otherwise an idle-connection-dropped event becomes an uncaught exception that crashes the process.
- **Startup connectivity check** (`config/connectDB.js`) retries `SELECT 1` every 2 s for up to 30 s before giving up and exiting the process — this avoids a common failure mode where the app starts and accepts traffic before the database is actually reachable (relevant when the DB is a serverless instance waking from idle/sleep).
- Product attribute data is stored as flexible key→value pairs (`product_attributes` / `attributes` / `attribute_values`), aggregated into JSON at query time (`json_object_agg`) rather than modeled as fixed columns — this is what allows the catalog to support arbitrary attribute sets per category without schema migrations per product type, but it's also why `formatProductForPrompt.js` has to defensively normalize attribute value shapes before handing them to the AI layer.

---

## Deployment (Docker)

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

```bash
docker build -t ozone-backend .
docker run -p 4000:4000 --env-file .env ozone-backend
```

CORS is allow-listed explicitly in `app.js` (`allowedOrigins`) rather than wildcarded — update this array when adding new frontend deployment URLs.

---

## Known Limitations & Roadmap

These are conscious trade-offs made for current scale, flagged here so they're deliberate decisions during scale-up rather than surprises:

- **In-memory comparison job store and AI response cache** (`comparison.jobStore.js`, `comparisonCache` in `comparison.service.js`) — both are process-local `Map`s. Fine for a single instance; will silently misbehave behind a multi-instance/load-balanced deployment (a poll request can land on an instance that never processed the job). Migrate to Redis before horizontal scaling.
- **Chat has no persistence** — by design (see [AI Features](#ai-features)), but means there is no chat transcript for support/QA purposes, and no way to resume a conversation across devices/sessions.
- **Notifications module is scaffolded but not wired in** — `modules/notifications/` exists with empty controller/service/routes files and is not mounted in `app.js`.
- **`POST /api/products` (create) has no auth middleware at the route level**, unlike every other mutating product route — worth confirming this is intentional (e.g. a deliberately public "quick add" flow) vs. an oversight before production hardening.
- **Env var validation is disabled** (`config/env.js`) — a missing required variable fails at first use, not at boot. Consider re-enabling for faster failure feedback in new environments.
- **Resend integration is fully written but dormant** — `mail.service.js` retains a complete Resend-based implementation (with retry/backoff) as a commented block; SMTP via Nodemailer is the live path. Useful if switching providers later without redesigning the retry logic.
- **Catalog-grounded chat product search is implemented but disabled** — see the AI Features section above; re-enabling requires uncommenting `chat.service.js`'s alternate implementation and the two associated prompt files.