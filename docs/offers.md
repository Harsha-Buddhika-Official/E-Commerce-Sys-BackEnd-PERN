# Offers API

Base path: `/api/offers`

This module manages offer campaigns and the many-to-many mapping between offers and products. Frontend clients can read offers publicly, while create/update/delete and product assignment actions are protected.

## What the frontend can use this for

- Show an offers landing page with all offers and their mapped products.
- Show active banner-style promotions.
- Show offer detail pages with attached products.
- Let admins create, edit, delete, attach, and detach products from an offer.

## Auth rules

- Public routes do not require a token.
- Protected routes require `Authorization: Bearer <token>`.
- Protected offer management routes accept these roles: `super_admin`, `admin`, `manager`.

## Route summary

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Get all offers with mapped products and product images. |
| `GET` | `/active` | Public | Get offers that are active right now. |
| `GET` | `/:id` | Public | Get one offer by id. |
| `GET` | `/:id/products` | Public | Get only the products attached to an offer. |
| `POST` | `/admin/` | `super_admin`, `admin`, `manager` | Create a new offer. |
| `POST` | `/admin/products/:id` | `super_admin`, `admin`, `manager` | Attach a product to an offer. `:id` is the offer id. |
| `PUT` | `/admin/:id` | `super_admin`, `admin`, `manager` | Update an offer. |
| `PUT` | `/admin/:id/activation` | `super_admin`, `admin`, `manager` | Set an offer's `is_active` status explicitly from the request body. |
| `DELETE` | `/admin/:id` | `super_admin`, `admin`, `manager` | Delete an offer. |
| `DELETE` | `/admin/:id/products/:productId` | `super_admin`, `admin`, `manager` | Detach a product from an offer. |

## Request payloads

Create offer

`POST /api/offers/admin/`

```json
{
  "title": "Summer Sale",
  "description": "Discount on selected products",
  "discount_type": "percentage",
  "discount_value": 10,
  "start_date": "2026-06-01T00:00:00.000Z",
  "end_date": "2026-06-30T23:59:59.000Z",
  "is_active": true,
  "banner_image": "https://example.com/banner.png"
}
```

Update offer

`PUT /api/offers/admin/:id`

```json
{
  "title": "Updated Sale",
  "discount_value": 15,
  "is_active": false
}
```

Update offer activation

`PUT /api/offers/admin/:id/activation`

Request body:

```json
{
  "is_active": true
}
```

Use `true` to activate the offer and `false` to deactivate it.

Response example:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Summer Sale",
    "is_active": true
  },
  "message": "Offer activation updated successfully"
}
```

Attach a product to an offer

`POST /api/offers/admin/products/:id`

```json
{
  "product_id": 42
}
```

## Response shapes

Create, update, and single-offer responses return a single offer object.

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Summer Sale",
    "description": "Discount on selected products",
    "discount_type": "percentage",
    "discount_value": "10.00",
    "start_date": "2026-06-01T00:00:00.000Z",
    "end_date": "2026-06-30T23:59:59.000Z",
    "is_active": true,
    "banner_image": "https://example.com/banner.png",
    "created_at": "2026-05-19T10:00:00.000Z",
    "updated_at": "2026-05-19T10:00:00.000Z"
  },
  "message": "Offer created successfully"
}
```

List responses from `GET /api/offers` return each offer with a nested `products` array. Each product also includes an `images` array.

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Summer Sale",
      "description": "Discount on selected products",
      "discount_type": "percentage",
      "discount_value": "10.00",
      "start_date": "2026-06-01T00:00:00.000Z",
      "end_date": "2026-06-30T23:59:59.000Z",
      "is_active": true,
      "banner_image": "https://example.com/banner.png",
      "created_at": "2026-05-19T10:00:00.000Z",
      "updated_at": "2026-05-19T10:00:00.000Z",
      "products": [
        {
          "offer_product_id": 1,
          "product_id": 42,
          "name": "iPhone 15",
          "selling_price": "999.00",
          "discounted_price": "899.00",
          "stock_quantity": 25,
          "is_active": true,
          "images": [
            {
              "image_id": 10,
              "image_url": "https://example.com/iphone.png",
              "is_primary": true,
              "alt_text": "Front view",
              "sort_order": 1
            }
          ]
        }
      ]
    }
  ]
}
```

Offer-product list responses from `GET /api/offers/:id/products` return a flatter shape that is useful when the UI only needs the attached products.

```json
{
  "success": true,
  "data": [
    {
      "offer_product_id": 1,
      "offer_id": 1,
      "product_id": 42,
      "created_at": "2026-05-19T10:00:00.000Z",
      "name": "iPhone 15",
      "selling_price": "999.00",
      "stock_quantity": 25,
      "is_active": true
    }
  ]
}
```

Write responses for attach/remove/delete operations usually return only a message and, when relevant, the created or removed relation.

## Validation rules

Offer fields

- `title`: required string, 2 to 255 characters.
- `description`: optional string, empty string and `null` allowed.
- `discount_type`: required, must be `percentage` or `fixed`.
- `discount_value`: required positive number; if `discount_type` is `percentage`, the value cannot exceed 100.
- `start_date`: required valid date.
- `end_date`: required valid date.
- `is_active`: optional boolean.
- `banner_image`: optional string, empty string and `null` allowed.

Route params

- `id`: required positive number.
- `productId`: required positive number.

Attach-product body

- `product_id`: required positive number.

## Business rules

- `end_date` must be after `start_date`.
- Percentage discounts cannot exceed 100.
- An offer must exist before it can be updated, deleted, or used for product mapping.
- A product must exist before it can be attached to an offer.
- Duplicate offer-product pairs are rejected.
- `GET /api/offers/active` only returns offers where `is_active = true` and the current time is between `start_date` and `end_date`.
- The cart flow checks `offer_products` first, then loads the active offer and applies the discount before storing `price_at_add`.
- If the mapped offer is inactive or outside its date window, cart pricing falls back to the regular product price.

## Frontend usage notes

- Use `GET /api/offers` for an admin list view or a marketing page that needs all offer metadata.
- Use `GET /api/offers/active` for homepage promotion banners and currently running deals.
- Use `GET /api/offers/:id/products` when the UI only needs the products attached to one offer.
- Use `POST /api/offers/admin/products/:id` to attach an existing product to an offer in an admin panel.
- Use `PUT /api/offers/admin/:id/activation` when the frontend needs to set the active state explicitly.
- Use `DELETE /api/offers/admin/:id/products/:productId` to remove one mapping without deleting the offer itself.

## Layered implementation reference

- Route: `src/modules/offers/offers.routes.js`
- Controller: `src/modules/offers/offers.controller.js`
- Service: `src/modules/offers/offers.service.js`
- Repository: `src/modules/offers/offers.repository.js`
- Validator: `src/modules/offers/offers.validator.js`
