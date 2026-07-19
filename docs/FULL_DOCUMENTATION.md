# Full Backend Documentation

This document is the consolidated technical reference for the backend in this repository. It combines the current Express app structure, runtime behavior, API surface, supporting utilities, and operational conventions into one place.

## 1. Project Overview

This is a Node.js backend for an e-commerce system built with:

- Express for HTTP routing
- PostgreSQL via `pg` for persistence
- JWT for admin authentication
- Multer for file uploads
- Cloudinary for media storage
- Nodemailer for order email notifications

The codebase uses a layered module pattern:

`route -> controller -> service -> repository -> validator`

That structure keeps HTTP concerns, business rules, and SQL access separated.

## 2. Runtime And Startup

The application starts from `src/server.js`.

Startup flow:

1. Load environment configuration from `src/config/env.js`
2. Connect to PostgreSQL with `src/config/connectDB.js`
3. Start the Express app exported from `src/app.js`

The server logs the active port and local URL after a successful boot.

## 3. Core Architecture

### Request Flow

The normal request path is:

1. Router receives the request
2. Validators and middleware run first
3. Controller handles HTTP input/output
4. Service applies business logic
5. Repository runs database queries
6. Errors are normalized by the global error handler

### Application Bootstrap

`src/app.js` configures:

- JSON parsing with a 1 MB request limit
- CORS with a fixed allowlist of frontend origins
- Cookie parsing
- Mounted `/api` route groups
- The global error handler

### Mounted Route Groups

The app currently mounts these route modules:

- `/api/categories`
- `/api/brands`
- `/api/products`
- `/api/cart`
- `/api/orders`
- `/api/admin`
- `/api/attributes`
- `/api/offers`
- `/api/banners`

## 4. Technology Stack

### Dependencies In Use

- `express`
- `pg`
- `dotenv`
- `cors`
- `cookie-parser`
- `jsonwebtoken`
- `bcrypt`
- `joi`
- `multer`
- `cloudinary`
- `nodemailer`
- `slugify`
- `uuid`

### Dev Tooling

- `nodemon`

## 5. Configuration

### Environment Loader

`src/config/env.js` reads environment variables with `dotenv` and exposes:

- `PORT`
- `JWT_SECRET`
- `DATABASE_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

The mail transport also expects:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`

### Database Connection

`src/config/db.js` uses a PostgreSQL `Pool` created from `DATABASE_URL`.

Operational behavior:

- SSL is enabled with `rejectUnauthorized: false`
- Pool max size is 10
- Idle timeout is 30 seconds
- Connection timeout is 10 seconds

`src/config/connectDB.js` retries the connection until the database is reachable or 30 seconds elapse.

It also runs:

```sql
SET search_path TO public
```

That is used for the current Neon/PostgreSQL deployment pattern.

### Cloudinary Configuration

`src/config/cloudinary.js` configures Cloudinary from the environment variables above.

### CORS

`src/app.js` allows these origins:

- `http://localhost:5173`
- `http://localhost:3000`
- `https://e-commerce-sys-frontend-pern-production.up.railway.app`
- `https://e-commerce-sys-backend-pern-production.up.railway.app/api`

Credentials are enabled for cross-origin requests.

## 6. Authentication And Authorization

### JWT Authentication

`src/middlewares/auth.js` expects a bearer token in the `Authorization` header:

```http
Authorization: Bearer <token>
```

If the header is missing, malformed, invalid, or expired, the request fails with a 401 error.

Decoded token payload is stored on `req.admin`.

### Role Authorization

`src/middlewares/authorize.js` checks `req.admin.role` against the allowed role list.

The roles used in the codebase are:

- `super_admin`
- `admin`
- `manager`

### Authorization Pattern

Most protected routers call `authMiddleware` once at the router level, then apply `authorize(...)` on individual routes.

Important behavior:

- If a route uses only `authMiddleware`, it requires a valid token but no additional role check.
- If a route also uses `authorize(...)`, the role must be allowed explicitly.

## 7. Session And Cart Model

The cart and parts of the order flow use a cookie-based session identifier named `sid`.

### Session Middleware

`src/middlewares/session.middleware.js` does two things:

- Reads the existing `sid` cookie if present
- Generates a new UUID if no cookie exists

The service layer later sets the cookie with:

- `httpOnly: true`
- `secure: true`
- `SameSite=None`
- 7 day lifetime

### Cart Behavior

Cart endpoints are session oriented and do not require admin authentication.

The same session model is used by order creation so non-authenticated shopping flows can persist through a browser session.

## 8. File Uploads

### Shared Multer Setup

`src/middlewares/multer.js` uses memory storage and applies:

- Maximum file size: 50 MB
- Allowed MIME types:
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`
  - `application/pdf`
  - `video/mp4`
  - `video/webm`
  - `video/ogg`

### Upload Field Names

- Brand logo: `logo`
- Category media: `media`
- Banner media: `media`
- Product images: `images`
- Offer banner image: `banner_image`
- Payment receipt: `media`

### Cloudinary Upload Behavior

`src/utils/cloudinaryUpload.js` uploads buffer data to Cloudinary and supports PDF-to-image conversion for upload handling.

It also includes helpers for:

- deleting assets from Cloudinary
- generating Cloudinary URLs
- generating downloadable URLs for receipts

## 9. Error Handling

The global error handler is `src/middlewares/errorHandler.js`.

Behavior:

- Logs the error to the console
- Uses `err.statusCode` or `err.status` when present
- Defaults to HTTP 500 otherwise
- Returns a JSON response with `success: false` and a message

Typical error shape:

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

## 10. Utility Modules

### JWT Utility

`src/utils/jwt.js` provides:

- `generateToken(payload)`
- `verifyToken(token)`

Tokens are configured to expire after approximately 1 hour.

### Password Utility

`src/utils/hash.js` provides:

- `hashPassword(password)`
- `comparePasswords(password, hashedPassword)`

It uses `bcrypt` with 10 salt rounds.

### Tracking Code Utility

`src/utils/generateTrackingCode.js` generates order tracking codes in this format:

```text
TRK-YYYYMMDD-XXXXXX
```

### Offer Pricing Utility

`src/utils/offerPricing.js` applies an active offer to a product price.

Supported discount types:

- percentage
- fixed

## 11. Email System

`src/services/mail.service.js` sends two email types:

- Order confirmation emails
- Order status update emails

The email HTML is generated from the templates in `src/templates/`.

### Templates

- `src/templates/orderConfirmation.template.js`
- `src/templates/orderStatusUpdate.template.js`

These templates render branded HTML email content with order details, totals, tracking codes, and shipping information.

## 12. Backend Modules

### Admin

Path: `src/modules/admin/`

Responsibilities:

- Admin login
- Admin registration
- Role management
- Password updates
- Admin deletion

Access model:

- Public login
- Super admin only for registration, role changes, list, and deletion
- Password update available to `super_admin`, `admin`, and `manager`

### Brands

Path: `src/modules/brands/`

Responsibilities:

- List brands for admin use
- List brand names for lightweight dropdowns
- Create brand with logo upload
- Delete brand and clean up the image asset

### Categories

Path: `src/modules/categories/`

Responsibilities:

- Public category listings for products and accessories
- Admin category listing and name lookup
- Create category with media upload
- Delete category

### Products

Path: `src/modules/products/`

Responsibilities:

- Public catalog listing
- Product search and filtering
- Best-selling and latest product feeds
- Product detail views
- Admin product detail views
- Product creation and updates
- Product image management

Important behavior:

- Public product creation exists
- There is also an authenticated admin-only create path without attribute mapping
- Product image endpoints support add, remove, and reorder flows

### Attributes

Path: `src/modules/attributes/`

Responsibilities:

- List attributes
- Group attributes by category
- Create attributes and attribute values
- Map attribute values to products
- Delete attributes and values

### Banners

Path: `src/modules/banners/`

Responsibilities:

- Public image/video banner feeds
- Admin banner listing and detail views
- Banner create and delete flows

### Offers

Path: `src/modules/offers/`

Responsibilities:

- Public offer listing and detail views
- Active and upcoming offer feeds
- Admin offer management
- Offer-product linking
- Offer activation toggling

### Orders

Path: `src/modules/order/`

Responsibilities:

- Public direct order creation
- Public cart checkout order creation
- Tracking lookup by email and tracking code
- Receipt upload
- Admin order dashboard views
- Order status updates

### Cart

Path: `src/modules/cart/`

Responsibilities:

- Session-based cart retrieval
- Add item
- Update quantity
- Remove item
- Clear cart

## 13. Mounted API Reference

This section reflects the routes currently mounted in `src/app.js`.

### Admin API

Base path: `/api/admin`

| Method | Path | Access |
| --- | --- | --- |
| `POST` | `/login` | Public |
| `GET` | `/` | `super_admin` |
| `POST` | `/register` | `super_admin` |
| `PUT` | `/updateRole/:id` | `super_admin` |
| `PUT` | `/settings/updatePassword/:id` | `super_admin`, `admin`, `manager` |
| `DELETE` | `/delete/:id` | `super_admin` |

### Brand API

Base path: `/api/brands`

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/admin` | `super_admin`, `admin` |
| `GET` | `/admin/names` | `super_admin`, `admin` |
| `POST` | `/admin` | `super_admin`, `admin` |
| `DELETE` | `/admin/:id` | `super_admin`, `admin` |

### Category API

Base path: `/api/categories`

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/products` | Public |
| `GET` | `/accessories` | Public |
| `GET` | `/admin` | `super_admin`, `admin` |
| `GET` | `/admin/names` | `super_admin`, `admin` |
| `POST` | `/` | `super_admin`, `admin` |
| `DELETE` | `/:id` | `super_admin`, `admin` |

### Product API

Base path: `/api/products`

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/` | Public |
| `GET` | `/best-selling` | Public |
| `GET` | `/latest` | Public |
| `GET` | `/search/:name` | Public |
| `GET` | `/category/:categoryId` | Public |
| `GET` | `/filter/options/:categoryId` | Public |
| `GET` | `/:id` | Public |
| `POST` | `/` | Public |
| `POST` | `/filter/:categoryId` | Public |
| `GET` | `/admin/limited-details` | `super_admin`, `admin`, `manager` |
| `GET` | `/admin/simple-details` | `super_admin`, `admin`, `manager` |
| `GET` | `/admin/products/:id` | `super_admin`, `admin`, `manager` |
| `POST` | `/admin/without-attributes` | Authenticated admin only |
| `DELETE` | `/admin/delete/:id` | `super_admin`, `admin` |
| `PUT` | `/admin/products/:id/full-update` | `super_admin`, `admin` |
| `POST` | `/admin/products/:id/images` | `super_admin`, `admin` |
| `DELETE` | `/admin/products/:id/images/:imageId` | `super_admin`, `admin` |
| `PATCH` | `/admin/products/:id/images/reorder` | `super_admin`, `admin` |

### Attribute API

Base path: `/api/attributes`

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/admin` | `super_admin`, `admin` |
| `GET` | `/admin/grouped/:categoryId` | `super_admin`, `admin` |
| `POST` | `/admin` | `super_admin`, `admin` |
| `POST` | `/admin/:attributeId/value` | `super_admin`, `admin` |
| `POST` | `/admin/products/:productId/attributes` | `super_admin`, `admin` |
| `DELETE` | `/admin/:id` | `super_admin`, `admin` |
| `DELETE` | `/admin/:attributeId/value/:valueId` | `super_admin`, `admin` |

### Banner API

Base path: `/api/banners`

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/public/images` | Public |
| `GET` | `/public/video` | Public |
| `GET` | `/admin` | `super_admin`, `admin`, `manager` |
| `GET` | `/admin/:id` | `super_admin`, `admin`, `manager` |
| `POST` | `/admin` | `super_admin`, `admin` |
| `DELETE` | `/admin/:id` | `super_admin`, `admin` |

### Offer API

Base path: `/api/offers`

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/` | Public |
| `GET` | `/user` | Public |
| `GET` | `/user/:id` | Public |
| `GET` | `/user/:id/products` | Public |
| `GET` | `/active` | Public |
| `GET` | `/upcoming` | Public |
| `GET` | `/admin` | `super_admin`, `admin`, `manager` |
| `GET` | `/admin/:id` | `super_admin`, `admin`, `manager` |
| `POST` | `/admin/` | `super_admin`, `admin`, `manager` |
| `POST` | `/admin/products/:id` | `super_admin`, `admin`, `manager` |
| `PUT` | `/admin/:id` | `super_admin`, `admin`, `manager` |
| `PUT` | `/admin/:id/toggle` | `super_admin`, `admin`, `manager` |
| `DELETE` | `/admin/:id` | `super_admin`, `admin`, `manager` |

### Order API

Base path: `/api/orders`

| Method | Path | Access |
| --- | --- | --- |
| `POST` | `/create` | Public |
| `POST` | `/tracking` | Public |
| `POST` | `/upload-receipt/:id` | Public |
| `GET` | `/admin/statuses` | `super_admin`, `admin`, `manager` |
| `GET` | `/admin/low-stock-alert` | `super_admin`, `admin`, `manager` |
| `GET` | `/admin/recent-orders` | `super_admin`, `admin`, `manager` |
| `GET` | `/admin/order-status-count` | `super_admin`, `admin`, `manager` |
| `GET` | `/admin/orders` | `super_admin`, `admin`, `manager` |
| `GET` | `/admin/:id` | `super_admin`, `admin`, `manager` |
| `GET` | `/admin/receipt/:id` | `super_admin`, `admin`, `manager` |
| `PUT` | `/admin/state/:id` | `super_admin`, `admin`, `manager` |

### Cart API

Base path: `/api/cart`

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/` | Public |
| `POST` | `/` | Public |
| `PATCH` | `/:itemId` | Public |
| `DELETE` | `/:itemId` | Public |
| `DELETE` | `/` | Public |

## 14. Common Payloads

### Admin Login

```json
{
  "email": "admin@example.com",
  "password": "secret123"
}
```

### Product Creation

```json
{
  "name": "iPhone 15",
  "brand_name": "Apple",
  "category_name": "Smartphones",
  "description": "Flagship phone",
  "base_price": 800,
  "discounted_price": 850,
  "selling_price": 999,
  "stock_quantity": 25,
  "warranty_months": 12,
  "product_tag": "BEST_SELLER",
  "attributes": [
    {
      "attribute_id": 1,
      "attribute_value_id": 8
    }
  ]
}
```

### Order Creation

Direct order:

```json
{
  "customer_email": "customer@example.com",
  "phone_number": "1234567890",
  "shipping_address": "123 Main Street",
  "city": "Dhaka",
  "postal_code": "1200",
  "order_type": "direct",
  "product_id": 101,
  "quantity": 2
}
```

Cart checkout:

```json
{
  "customer_email": "customer@example.com",
  "phone_number": "1234567890",
  "shipping_address": "123 Main Street",
  "city": "Dhaka",
  "postal_code": "1200",
  "order_type": "cart"
}
```

### Cart Item

```json
{
  "product_id": 101,
  "quantity": 2
}
```

### Offer Creation

```json
{
  "title": "New Year Sale",
  "description": "Seasonal discount campaign",
  "discount_type": "percentage",
  "discount_value": 15,
  "start_date": "2026-01-01T00:00:00.000Z",
  "end_date": "2026-01-15T23:59:59.000Z",
  "is_active": true
}
```

## 15. Operational Notes

- Public write endpoints exist for product creation and order creation.
- Route ordering matters in Express; static routes should remain above `/:id` style catch-all routes.
- Some repository changes documented in repo memory indicate brand logo uploads rely on a `logo_public_id` column in the `brands` table.
- The API documentation should be kept in sync with router files because the mounted endpoints are the source of truth.

## 16. Local Setup

### Install

```bash
npm install
```

### Run

```bash
npm run start
```

For development:

```bash
npm run dev
```

### Required Environment Variables

```env
PORT=3000
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=your_postgres_connection_string

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
MAIL_FROM=no-reply@example.com
```

## 17. Key Source Files

- `src/app.js`
- `src/server.js`
- `src/config/env.js`
- `src/config/db.js`
- `src/config/connectDB.js`
- `src/middlewares/auth.js`
- `src/middlewares/authorize.js`
- `src/middlewares/multer.js`
- `src/middlewares/session.middleware.js`
- `docs/API_DOCUMENTATION_SENIOR.md`

## 18. Summary

This backend is a session-aware e-commerce API with:

- public storefront endpoints
- protected admin control plane endpoints
- media handling through Cloudinary
- order emails through SMTP
- PostgreSQL-backed persistence
- JWT role-based authorization for admin workflows

If you extend the system, update this document whenever a router, middleware, or environment contract changes.