# API Documentation

This document describes the current REST API for the e-commerce backend at a level suitable for implementation, integration, and operational review.

## Scope

- Runtime: Node.js + Express
- Database: PostgreSQL
- Auth: JWT bearer token for protected admin endpoints
- Session model: cookie-based session identifier for cart and order flows
- Architecture pattern: route -> controller -> service -> repository

This document reflects the routes currently mounted in [src/app.js](../src/app.js).

## Base Behavior

- All API routes are mounted under `/api`.
- JSON requests are limited by Express to 1 MB.
- Multipart requests use the shared Multer configuration with a 50 MB file size cap.
- Protected admin routes expect `Authorization: Bearer <token>`.
- The JWT token is signed with the configured secret and expires after about 1 hour.
- Cart and order flows can use the `sid` cookie to preserve session state.

## Common Response Pattern

Successful responses usually follow one of these patterns:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

```json
{
  "success": true,
  "data": {}
}
```

Validation and authorization failures commonly return:

```json
{
  "success": false,
  "message": "..."
}
```

or:

```json
{
  "success": false,
  "error": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

## Authentication Model

The auth middleware reads the bearer token from the `Authorization` header, verifies it, and stores the decoded payload in `req.admin`.

Only the following roles are recognized by the current codebase:

- `super_admin`
- `admin`
- `manager`

If a route uses `authMiddleware` but not `authorize(...)`, the request only needs a valid token and is not further role-restricted at router level.

## Role And Permission Limits

### Role Matrix

| Role | Scope | Key Limits |
| --- | --- | --- |
| `super_admin` | Full administrative access | Can manage admins, update admin roles, delete admins, and access all catalog/order management routes that are role-gated. |
| `admin` | Operational management access | Can manage brands, categories, products, attributes, banners, offers, and orders where allowed. Cannot manage admin role assignment or delete admin accounts. |
| `manager` | Read-heavy dashboard and limited control plane access | Can read banners, offers, and order dashboards and can update offer records and order states. Cannot manage brands, categories, attributes, or admin accounts. |

### Permission Highlights

- Admin account creation, deletion, and role changes are restricted to `super_admin`.
- Password updates are allowed for `super_admin`, `admin`, and `manager` on the dedicated password route.
- Brand, category, and attribute write operations are limited to `super_admin` and `admin`.
- Banner create/delete operations are limited to `super_admin` and `admin`; banner list/read operations also allow `manager`.
- Offer CRUD and offer-product linking allow `super_admin`, `admin`, and `manager`.
- Order dashboard, status, and fulfillment actions allow `super_admin`, `admin`, and `manager`.
- Product detailed admin views allow `super_admin`, `admin`, and `manager`, but product mutation endpoints are limited to `super_admin` and `admin` unless the route is intentionally left only token-protected.
- One product creation route, `POST /api/products/admin/without-attributes`, is protected by authentication middleware only; no role guard is applied at router level.

## Upload And File Limits

- Shared Multer file size limit: 50 MB per file.
- Shared allowed MIME types include JPEG, PNG, WebP, PDF, and common video formats.
- Brand logo uploads use the field name `logo`.
- Banner uploads use the field name `media`.
- Product uploads use the field name `images`.
- Offer banner uploads use the field name `banner_image`.
- Receipt uploads use the field name `media`.
- Product image add routes accept up to 3 files per request.
- Product create routes also accept up to 3 files per request.
- The Cloudinary helper converts PDF inputs to an image derivative on upload.

## Session And Cart Rules

- Cart endpoints attach or reuse a session id from the `sid` cookie.
- New sessions are created automatically when the cookie is absent.
- The cookie is configured as HTTP-only, secure, `SameSite=None`, and lives for 7 days in deployed mode.
- Cart and direct order flows are designed to work even without admin authentication.

## Endpoint Reference

### Admin API

Base path: `/api/admin`

| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| `POST` | `/login` | Public | Authenticate an admin and receive a JWT. |
| `GET` | `/` | `super_admin` | List all admins. |
| `POST` | `/register` | `super_admin` | Create a new admin account. |
| `PUT` | `/updateRole/:id` | `super_admin` | Update an admin role. |
| `PUT` | `/settings/updatePassword/:id` | `super_admin`, `admin`, `manager` | Update an admin password. |
| `DELETE` | `/delete/:id` | `super_admin` | Delete an admin account. |

#### Login payload

```json
{
  "email": "admin@example.com",
  "password": "secret123"
}
```

#### Register payload

```json
{
  "fullname": "Jane Doe",
  "email": "admin@example.com",
  "password": "secret123",
  "role": "manager"
}
```

#### Update role payload

`PUT /api/admin/updateRole/:id`

```json
{
  "newRole": "admin"
}
```

#### Update password payload

`PUT /api/admin/settings/updatePassword/:id`

```json
{
  "passwordData": {
    "oldPassword": "secret123",
    "newPassword": "newSecret123",
    "confirmPassword": "newSecret123"
  }
}
```

### Brand API

Base path: `/api/brands`

| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| `GET` | `/admin` | `super_admin`, `admin` | List all brands for administration. |
| `GET` | `/admin/names` | `super_admin`, `admin` | Lightweight brand name list. |
| `POST` | `/admin` | `super_admin`, `admin` | Create a brand with `logo` upload. |
| `DELETE` | `/admin/:id` | `super_admin`, `admin` | Delete a brand. |

#### Brand create payload

Multipart form-data:

- `logo`: image file
- body fields such as `name`

Example JSON shape for the non-file fields:

```json
{
  "name": "Samsung",
  "logo_url": "https://example.com/logo.png"
}
```

### Category API

Base path: `/api/categories`

| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| `GET` | `/products` | Public | Get product categories. Optional query validation is applied. |
| `GET` | `/accessories` | Public | Get accessory categories. Optional query validation is applied. |
| `GET` | `/admin` | `super_admin`, `admin` | List categories for administration. |
| `GET` | `/admin/names` | `super_admin`, `admin` | Lightweight category list. |
| `POST` | `/` | `super_admin`, `admin` | Create a category with `media` upload. |
| `DELETE` | `/:id` | `super_admin`, `admin` | Delete a category. |

#### Category create payload

```json
{
  "name": "Mobile Phones",
  "category_type": "product"
}
```

### Product API

Base path: `/api/products`

| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| `GET` | `/` | Public | List active products. |
| `GET` | `/best-selling` | Public | Best-selling products. |
| `GET` | `/latest` | Public | Latest products. |
| `GET` | `/search/:name` | Public | Search by name. |
| `GET` | `/category/:categoryId` | Public | Products by category. |
| `GET` | `/filter/options/:categoryId` | Public | Available filter options for a category. |
| `GET` | `/:id` | Public | Product detail by id. |
| `POST` | `/` | Public | Create a product with up to 3 `images` files. |
| `POST` | `/filter/:categoryId` | Public | Filter products by category and attribute values. |
| `GET` | `/admin/limited-details` | `super_admin`, `admin`, `manager` | Admin list with reduced payload. |
| `GET` | `/admin/simple-details` | `super_admin`, `admin`, `manager` | Simple admin product list. |
| `GET` | `/admin/products/:id` | `super_admin`, `admin`, `manager` | Full product detail for admin use. |
| `POST` | `/admin/without-attributes` | Authenticated admin only | Create a product without attribute mapping. |
| `DELETE` | `/admin/delete/:id` | `super_admin`, `admin` | Permanently delete a product. |
| `PUT` | `/admin/products/:id/full-update` | `super_admin`, `admin` | Update product details. |
| `POST` | `/admin/products/:id/images` | `super_admin`, `admin` | Add up to 3 images to a product. |
| `DELETE` | `/admin/products/:id/images/:imageId` | `super_admin`, `admin` | Remove one product image. |
| `PATCH` | `/admin/products/:id/images/reorder` | `super_admin`, `admin` | Reorder images and set primary image. |

#### Product create payload

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

#### Filter products payload

```json
{
  "filters": [
    {
      "attribute_id": 1,
      "value": "128GB"
    },
    {
      "attribute_id": 2,
      "value": "Black"
    }
  ]
}
```

### Attribute API

Base path: `/api/attributes`

| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| `GET` | `/admin` | `super_admin`, `admin` | List attributes. |
| `GET` | `/admin/grouped/:categoryId` | `super_admin`, `admin` | Group attributes by category. |
| `POST` | `/admin` | `super_admin`, `admin` | Create an attribute. |
| `POST` | `/admin/:attributeId/value` | `super_admin`, `admin` | Create an attribute value. |
| `POST` | `/admin/products/:productId/attributes` | `super_admin`, `admin` | Attach an attribute value to a product. |
| `DELETE` | `/admin/:id` | `super_admin`, `admin` | Delete an attribute. |
| `DELETE` | `/admin/:attributeId/value/:valueId` | `super_admin`, `admin` | Delete an attribute value. |

### Banner API

Base path: `/api/banners`

| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| `GET` | `/public/images` | Public | Public image banner feed. |
| `GET` | `/public/video` | Public | Public video banner feed. |
| `GET` | `/admin` | `super_admin`, `admin`, `manager` | List banners for admin use. |
| `GET` | `/admin/:id` | `super_admin`, `admin`, `manager` | Get one banner by id. |
| `POST` | `/admin` | `super_admin`, `admin` | Create a banner with `media` upload. |
| `DELETE` | `/admin/:id` | `super_admin`, `admin` | Delete a banner. |

#### Banner create payload

```json
{
  "title": "Summer Sale",
  "image_url": "https://example.com/banner.png",
  "is_active": true
}
```

### Offer API

Base path: `/api/offers`

| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Public offer listing. |
| `GET` | `/user` | Public | Alternative public listing used by the client. |
| `GET` | `/user/:id` | Public | Public offer detail by id. |
| `GET` | `/user/:id/products` | Public | Products linked to an offer. |
| `GET` | `/active` | Public | Active offers only. |
| `GET` | `/upcoming` | Public | Upcoming offers. |
| `GET` | `/admin` | `super_admin`, `admin`, `manager` | Admin listing. |
| `GET` | `/admin/:id` | `super_admin`, `admin`, `manager` | Admin offer detail. |
| `POST` | `/admin/` | `super_admin`, `admin`, `manager` | Create an offer with `banner_image` upload. |
| `POST` | `/admin/products/:id` | `super_admin`, `admin`, `manager` | Link a product to an offer. |
| `PUT` | `/admin/:id` | `super_admin`, `admin`, `manager` | Update an offer. |
| `PUT` | `/admin/:id/toggle` | `super_admin`, `admin`, `manager` | Toggle offer active state. |
| `DELETE` | `/admin/:id` | `super_admin`, `admin`, `manager` | Delete an offer. |

#### Offer create payload

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

#### Offer-product link payload

```json
{
  "product_id": 123
}
```

#### Offer status toggle payload

```json
{
  "is_active": true
}
```

### Order API

Base path: `/api/orders`

| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| `POST` | `/create` | Public | Create an order using the current session cookie if present. |
| `POST` | `/tracking` | Public | Lookup orders by email and tracking code. |
| `POST` | `/upload-receipt/:id` | Public | Upload a payment receipt using `media`. |
| `GET` | `/admin/statuses` | `super_admin`, `admin`, `manager` | Order status summary data. |
| `GET` | `/admin/low-stock-alert` | `super_admin`, `admin`, `manager` | Low-stock dashboard data. |
| `GET` | `/admin/recent-orders` | `super_admin`, `admin`, `manager` | Recent orders for dashboard use. |
| `GET` | `/admin/order-status-count` | `super_admin`, `admin`, `manager` | Status counts for the order page. |
| `GET` | `/admin/orders` | `super_admin`, `admin`, `manager` | Full admin order list. |
| `GET` | `/admin/:id` | `super_admin`, `admin`, `manager` | Order detail by id. |
| `GET` | `/admin/receipt/:id` | `super_admin`, `admin`, `manager` | Retrieve order receipt metadata. |
| `PUT` | `/admin/state/:id` | `super_admin`, `admin`, `manager` | Update order status. |

#### Create order payload

For direct orders:

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

For cart checkout:

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

#### Tracking payload

```json
{
  "email": "customer@example.com",
  "trackingCode": "ABC123456"
}
```

#### Update order status payload

```json
{
  "newStatus": "shipped"
}
```

### Cart API

Base path: `/api/cart`

| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Get the current session cart. |
| `POST` | `/` | Public | Add an item to the cart. |
| `PATCH` | `/:itemId` | Public | Update item quantity. |
| `DELETE` | `/:itemId` | Public | Remove one cart item. |
| `DELETE` | `/` | Public | Clear the cart. |

#### Add item payload

```json
{
  "product_id": 101,
  "quantity": 2
}
```

#### Update item payload

```json
{
  "quantity": 3
}
```

## Operational Notes

- Protected admin routes should always be called with a valid bearer token; otherwise the router returns `401` or `403` depending on the failure point.
- Route-level authorization is explicit in the router files. If a route does not call `authorize(...)`, it is not role-gated at the router layer even if it still requires authentication.
- The current code exposes some public write operations, including product creation and order creation. That may be intentional for the current workflow, but it should be reviewed before production hardening.
- Some validators exist for routes that are not currently mounted. This document only describes mounted endpoints.

## Suggested Integration Order

1. Authenticate with `POST /api/admin/login`.
2. Use the token for protected admin routes.
3. Use public catalog routes to render the storefront.
4. Use cart session routes for shopping flow.
5. Create or track orders from the public order endpoints.

## Source Files

- [src/app.js](../src/app.js)
- [src/middlewares/auth.js](../src/middlewares/auth.js)
- [src/middlewares/authorize.js](../src/middlewares/authorize.js)
- [src/middlewares/multer.js](../src/middlewares/multer.js)
- [src/middlewares/session.middleware.js](../src/middlewares/session.middleware.js)