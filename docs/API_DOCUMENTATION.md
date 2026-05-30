# API Documentation

This project exposes a REST API for an e-commerce backend.

## Base URL

All routes are mounted under the app root.

- Server entrypoint: `src/server.js`
- Router mounts: `src/app.js`

## Common Conventions

- Success responses usually include `success: true`.
- Write endpoints often include a `message` field.
- Validation failures return HTTP `400`.
- Protected routes require `Authorization: Bearer <token>`.
- Cart and cart-order flows use a `sessionId` cookie when available.

## Authentication And Roles

- `super_admin` can access all admin operations and most management routes.
- `admin` can access most management routes.
- `manager` can access order read/update routes and admin password update.

## Standard Response Shape

Typical success response:

```json
{
  "success": true,
  "data": {},
  "message": "..."
}
```

Typical validation error response:

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

## Admin API

Base path: `/api/admin`

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/login` | Public | Log in an admin and receive a JWT token. |
| `GET` | `/` | `super_admin`, `admin` | List all admins. |
| `POST` | `/register` | `super_admin` | Create a new admin account. |
| `PUT` | `/updateRole` | `super_admin` | Update an admin role. |
| `PUT` | `/updatePassword` | `super_admin`, `admin`, `manager` | Update an admin password. |
| `DELETE` | `/delete` | `super_admin` | Delete an admin by email. |

### Admin payloads

Login:

```json
{
  "email": "admin@example.com",
  "password": "secret123"
}
```

Register:

```json
{
  "fullname": "Jane Doe",
  "email": "admin@example.com",
  "password": "secret123",
  "role": "manager"
}
```

Update role:

```json
{
  "email": "admin@example.com",
  "role": "admin"
}
```

Update password:

```json
{
  "email": "admin@example.com",
  "oldPassword": "secret123",
  "newPassword": "newSecret123"
}
```

Delete admin:

```json
{
  "email": "admin@example.com"
}
```

## Brand API

Base path: `/api/brands`

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Get all brands. |
| `GET` | `/:id` | Public | Get one brand by id. |
| `POST` | `/` | `super_admin`, `admin`, `manager` | Create a brand. |
| `PUT` | `/:id` | `super_admin`, `admin`, `manager` | Update a brand. |
| `PUT` | `/:id/soft-delete` | `super_admin`, `admin`, `manager` | Soft delete a brand. |
| `PUT` | `/:id/restore` | `super_admin`, `admin`, `manager` | Restore a soft-deleted brand. |
| `DELETE` | `/:id` | `super_admin`, `admin`, `manager` | Delete a brand. |

### Brand payloads

Create or update:

```json
{
  "name": "Samsung",
  "logo_url": "https://example.com/samsung.png"
}
```

## Category API

Base path: `/api/categories`

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/products` | Public | Get all product categories. |
| `GET` | `/accessories` | Public | Get all accessory categories. |
| `GET` | `/names` | `super_admin`, `admin` | Get active category ids and names only. |
| `GET` | `/:id` | Public | Get one category by id. |
| `POST` | `/` | `super_admin`, `admin` | Create a category. |
| `PUT` | `/:id` | `super_admin`, `admin` | Update a category. |
| `PUT` | `/:id/deactivate` | `super_admin`, `admin` | Soft delete a category. |
| `PUT` | `/:id/restore` | `super_admin`, `admin` | Restore a category. |
| `DELETE` | `/:id` | `super_admin`, `admin` | Delete a category. |

### Category payloads

Create:

```json
{
  "name": "Mobile Phones",
  "category_type": "product"
}
```

Update:

```json
{
  "name": "Smartphones",
  "img_url": "https://example.com/category.png"
}
```

## Product API

Base path: `/api/products`

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Get all active products. |
| `GET` | `/best-selling` | Public | Get products tagged as best sellers. |
| `GET` | `/latest` | Public | Get the latest 8 active products. |
| `GET` | `/search/:name` | Public | Search products by name. |
| `GET` | `/category/:categoryId` | Public | Get products by category. |
| `GET` | `/attributes/by-category/:categoryId` | Public | Get active attributes available for a category. |
| `GET` | `/filter/options/:categoryId` | Public | Get filter options for a category. |
| `GET` | `/:id` | Public | Get one product by id. |
| `POST` | `/filter/:categoryId` | Public | Get products filtered by selected attribute values. |
| `POST` | `/` | Public | Create a product (accepts up to 3 `images` files multipart/form-data). |
| `PUT` | `/:id` | `super_admin`, `admin` | Update a product. |
| `PUT` | `/:id/soft-delete` | `super_admin`, `admin` | Soft delete a product. |
| `PUT` | `/:id/restore` | `super_admin`, `admin` | Restore a soft-deleted product. |
| `POST` | `/:id/attributes` | `super_admin`, `admin` | Add one attribute mapping to a product. |
| `DELETE` | `/admin/delete/:id` | `super_admin`, `admin` | Permanently delete a product. |
| `DELETE` | `/:id/attributes/:attributeId` | `super_admin`, `admin` | Remove one attribute mapping from a product. |

### Product payloads

Create or update product:

```json
{
  "name": "iPhone 15",
  "brand_name": "Apple",
  "category_name": "Smartphones",
  "description": "Flagship phone",
  "base_price": 800,
  "selling_price": 999,
  "stock_quantity": 25,
  "warranty_months": 12,
  "product_tag": "BEST_SELLER",
  "images": [
    {
      "image_url": "https://example.com/product-1.png",
      "is_primary": true,
      "alt_text": "Front view",
      "sort_order": 1
    }
  ],
  "attributes": [
    {
      "attribute_id": 1,
      "value": "128GB"
    }
  ]
}
```

Create a product attribute mapping:

```json
{
  "attribute_id": 1,
  "value": "128GB"
}
```

Filter products by category and selected attributes:

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

### Product response notes

Single product and list responses include product details plus category, brand, attributes, and images. Attribute items are returned with `product_attribute_id`, `attribute_id`, `attribute_name`, and `value`.

Filter bar responses are grouped by attribute and include value counts for each category.

## Cart API

Base path: `/api/cart`

Cart endpoints are session-based for guests. A session cookie named `sid` is attached on the
first cart creation and reused on subsequent requests.

### Route summary

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Get current cart for this session. |
| `POST` | `/` | Public | Add an item to the cart. |
| `PATCH` | `/:itemId` | Public | Update quantity for a cart item. |
| `DELETE` | `/:itemId` | Public | Remove a single cart item. |
| `DELETE` | `/` | Public | Clear the entire cart. |

### Session and cookie behavior

- `sid` is generated server-side by middleware and stored in `Set-Cookie` only when a cart
  is first created.
- Every cart request uses `sid` from cookies to resolve the cart.
- If a user never added anything, `GET /api/cart` returns an empty cart shape.

### Request payloads

Add item (`POST /api/cart`):

```json
{
  "product_id": 12,
  "quantity": 2
}
```

Update quantity (`PATCH /api/cart/:itemId`):

```json
{
  "quantity": 3
}
```

### Response shape

Cart response (used by `GET`, `POST`, `PATCH`, `DELETE /:itemId`):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "cart_item_id": 1,
        "product_id": 12,
        "product_name": "iPhone 15",
        "product_slug": "iphone-15",
        "image_url": "https://example.com/iphone.png",
        "quantity": 2,
        "price_at_add": "999.00",
        "current_price": "999.00",
        "stock_quantity": 25,
        "is_active": true,
        "line_total": "1998.00",
        "added_at": "2026-05-19T10:00:00.000Z",
        "updated_at": "2026-05-19T10:00:00.000Z"
      }
    ],
    "total": "1998.00",
    "item_count": 2
  },
  "message": "Item added to cart successfully"
}
```

Clear cart response (`DELETE /api/cart`):

```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

### Validation rules

- `product_id`: required integer, positive.
- `quantity`: required integer, min 1, max 100.
- `itemId` param: required integer, positive.

### Business rules

- Product must exist and be active.
- Quantity cannot exceed available stock.
- If the item exists in cart, quantities are combined and revalidated against stock.
- Price is snapshotted on add (`price_at_add`) and not recalculated later.

### Layered implementation (for frontend alignment)

- Route: `src/modules/cart/cart.routes.js` mounts endpoints and applies session + validation.
- Validator: `src/modules/cart/cart.validator.js` validates payloads and params with Joi.
- Controller: `src/modules/cart/cart.controller.js` returns HTTP responses.
- Service: `src/modules/cart/cart.service.js` applies business rules and session handling.
- Repository: `src/modules/cart/cart.repository.js` performs SQL and builds cart response.
- Session middleware: `src/middlewares/session.middleware.js` manages `sid` creation.

## Order API

Base path: `/api/orders`

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/tracking` | Public | Look up orders by email and tracking code. |
| `POST` | `/direct` | Public | Create a direct order for a single product. |
| `POST` | `/cart` | Public | Create an order from the current cart session. |
| `GET` | `/` | `super_admin`, `admin`, `manager` | Get all orders. |
| `GET` | `/:id` | `super_admin`, `admin`, `manager` | Get an order by id. |
| `PUT` | `/:id` | `super_admin`, `admin`, `manager` | Update order status. |
| `DELETE` | `/:id` | `super_admin`, `admin`, `manager` | Delete an order. |

### Order payloads

Direct order:

```json
{
  "customer_email": "customer@example.com",
  "phone_number": "0123456789",
  "shipping_address": "123 Main Street",
  "city": "Dhaka",
  "postal_code": "1200",
  "product_id": 12,
  "quantity": 1
}
```

Cart order:
