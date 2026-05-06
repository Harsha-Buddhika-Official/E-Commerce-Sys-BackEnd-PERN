# API Documentation

This project exposes a REST API for an e-commerce backend.

## Base URL

All routes are mounted under the app root. In local development the server prints the full URL using the configured `PORT` value.

- Server entrypoint: `src/server.js`
- API mount points: `src/app.js`

## Common Conventions

- Success responses usually include `success: true`.
- Many write endpoints also include a `message` field.
- Validation failures return HTTP `400` with field-level error details.
- Protected routes require an `Authorization: Bearer <token>` header.
- Cart and cart-order flows use a `sessionId` cookie.

## Authentication And Roles

The API uses JWT bearer authentication for protected routes.

- `super_admin` can access all admin operations and most management routes.
- `admin` can access most management routes.
- `manager` can access order read/update routes and admin password update.

## Standard Response Shape

Examples used across the API:

```json
{
  "success": true,
  "data": {},
  "message": "..."
}
```

Validation error example:

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
| `POST` | `/register` | `super_admin` | Create a new admin account. |
| `GET` | `/` | `super_admin`, `admin` | List all admins. |
| `PUT` | `/updateRole` | `super_admin` | Update an admin role. |
| `DELETE` | `/delete` | `super_admin` | Delete an admin by email. |
| `PUT` | `/updatePassword` | `super_admin`, `admin`, `manager` | Update an admin password. |

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

## Brand API

Base path: `/api/brands`

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Get all brands. |
| `GET` | `/:id` | Public | Get one brand by id. |
| `POST` | `/` | `super_admin`, `admin`, `manager` | Create a brand. |
| `PUT` | `/:id` | `super_admin`, `admin`, `manager` | Update a brand. |
| `DELETE` | `/:id` | `super_admin`, `admin`, `manager` | Delete a brand. |
| `PUT` | `/:id/soft-delete` | `super_admin`, `admin`, `manager` | Soft delete a brand. |
| `PUT` | `/:id/restore` | `super_admin`, `admin`, `manager` | Restore a soft-deleted brand. |

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
| `GET` | `/` | Public | Get all categories. |
| `GET` | `/products` | Public | Get all product categories. |
| `GET` | `/accessorys` | Public | Get all accessory categories. |
| `GET` | `/:id` | Public | Get one category by id. |
| `POST` | `/` | `super_admin`, `admin` | Create a category. |
| `PUT` | `/:id` | `super_admin`, `admin` | Update a category. |
| `DELETE` | `/:id` | `super_admin`, `admin` | Delete a category. |
| `PUT` | `/:id/deactivate` | `super_admin`, `admin` | Soft delete a category. |
| `PUT` | `/:id/restore` | `super_admin`, `admin` | Restore a category. |

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
| `GET` | `/` | Public | Get all products. |
| `GET` | `/attributes/by-category/:categoryId` | Public | Get attributes available for a category. |
| `GET` | `/:id` | Public | Get one product by id. |
| `POST` | `/` | `super_admin`, `admin` | Create a product. |
| `PUT` | `/:id` | `super_admin`, `admin` | Update a product. |
| `DELETE` | `/:id` | `super_admin`, `admin` | Delete a product. |
| `POST` | `/:id/attributes` | `super_admin`, `admin` | Add an attribute mapping to a product. |
| `DELETE` | `/:id/attributes/:attributeId` | `super_admin`, `admin` | Remove one attribute mapping from a product. |
| `PUT` | `/:id/soft-delete` | `super_admin`, `admin` | Soft delete a product. |
| `PUT` | `/:id/restore` | `super_admin`, `admin` | Restore a soft-deleted product. |

### Product payloads

Create or update:

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
  "product_tag": "featured",
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

## Cart API

Base path: `/api/cart`

Cart routes use a `sessionId` cookie or session identifier to associate items with a visitor.

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/add` | Public | Add an item to the cart. |
| `GET` | `/` | Public | Get cart items for the current session. |
| `PUT` | `/:cartItemId` | Public | Update a cart item quantity. |
| `DELETE` | `/:cartItemId` | Public | Remove a cart item. |

### Cart payloads

Add to cart:

```json
{
  "productId": 12,
  "quantity": 2
}
```

Update cart item:

```json
{
  "quantity": 3
}
```

## Order API

Base path: `/api/orders`

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/direct` | Public | Create a direct order for a single product. |
| `POST` | `/cart` | Public | Create an order from the current cart session. |
| `GET` | `/tracking` | Public | Look up orders by email and tracking code. |
| `GET` | `/:id` | `super_admin`, `admin`, `manager` | Get an order by id. |
| `GET` | `/` | `super_admin`, `admin`, `manager` | Get all orders. |
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

```json
{
  "customer_email": "customer@example.com",
  "phone_number": "0123456789",
  "shipping_address": "123 Main Street",
  "city": "Dhaka",
  "postal_code": "1200",
  "order_status": "pending"
}
```

Tracking lookup:

```json
{
  "email": "customer@example.com",
  "trackingCode": "ABC123XYZ"
}
```

Update order status:

```json
{
  "newStatus": "shipped"
}
```

Allowed order statuses:

- `pending`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

## Attribute API

Base path: `/api/attributes`

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/category` | Public | Get attributes by category. |
| `GET` | `/:id` | Public | Get attribute by id. |
| `POST` | `/` | `super_admin`, `admin` | Create an attribute. |
| `DELETE` | `/` | `super_admin`, `admin` | Delete an attribute. |
| `PUT` | `/:id` | `super_admin`, `admin` | Update an attribute. |

### Attribute payloads

Create:

```json
{
  "name": "Storage"
}
```

Update:

```json
{
  "name": "RAM"
}
```

Delete:

```json
{
  "id": 4
}
```

## Implementation Notes

- The API uses `cors()` and `cookie-parser()` globally.
- Errors are handled by `src/middlewares/errorHandler.js`.
- The server checks the database before starting.
- Some routes use body-based identifiers in the current implementation, so clients should follow the payload examples above rather than assuming every lookup comes from query parameters.
