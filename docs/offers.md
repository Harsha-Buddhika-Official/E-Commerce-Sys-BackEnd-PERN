# Offers API

Base path: `/api/offers`

This module manages offers and their product mappings. It exposes public read endpoints
and protected write endpoints (admin roles).

## Route summary

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Get all offers. |
| `GET` | `/active` | Public | Get active offers (date + active flag). |
| `GET` | `/:id` | Public | Get a single offer by id. |
| `GET` | `/:id/products` | Public | Get products mapped to an offer. |
| `POST` | `/` | `super_admin`, `admin`, `manager` | Create an offer. |
| `POST` | `/:id/products` | `super_admin`, `admin`, `manager` | Attach product to offer. |
| `PUT` | `/:id` | `super_admin`, `admin`, `manager` | Update an offer. |
| `DELETE` | `/:id` | `super_admin`, `admin`, `manager` | Delete an offer. |
| `DELETE` | `/:id/products/:productId` | `super_admin`, `admin`, `manager` | Remove product from offer. |

## Request payloads

Create offer (`POST /api/offers`):

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

Update offer (`PUT /api/offers/:id`):

```json
{
  "title": "Updated Sale",
  "discount_value": 15,
  "is_active": false
}
```

Attach product to offer (`POST /api/offers/:id/products`):

```json
{
  "product_id": 42
}
```

## Response shape

Offer response (create, update, get by id):

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

Offers list response (`GET /api/offers`):

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

Offer products response (`GET /api/offers/:id/products`):

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

## Validation rules

Offer payload:
- `title`: required, string 2-255 chars.
- `description`: optional string.
- `discount_type`: required, `percentage` or `fixed`.
- `discount_value`: required, positive number; max 100 when percentage.
- `start_date`: required date.
- `end_date`: required date.
- `is_active`: optional boolean.
- `banner_image`: optional string.

Route params:
- `id`: offer id, required positive number.
- `productId`: product id, required positive number.

Attach product payload:
- `product_id`: required positive number.

## Business rules

- `end_date` must be after `start_date`.
- Percentage discounts cannot exceed 100.
- Offer must exist before adding/removing products.
- Product must exist before attaching to an offer.
- Duplicate offer-product pairs are blocked.
- Cart add-item logic checks the `offer_products` mapping first, then loads the active offer and applies the discount before storing `price_at_add`.
- If the mapped offer is inactive or outside its date window, cart pricing falls back to the product's regular selling price.

## Layered implementation (reference)

- Route: `src/modules/offers/offers.routes.js`
- Controller: `src/modules/offers/offers.controller.js`
- Service: `src/modules/offers/offers.service.js`
- Repository: `src/modules/offers/offers.repository.js`
- Validator: `src/modules/offers/offers.validator.js`
