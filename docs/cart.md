# Cart API

Base path: `/api/cart`

Cart endpoints are session-based for guests. A session cookie named `sid` is attached on the
first cart creation and reused on subsequent requests.

## Route summary

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Get current cart for this session. |
| `POST` | `/` | Public | Add an item to the cart. |
| `PATCH` | `/:itemId` | Public | Update quantity for a cart item. |
| `DELETE` | `/:itemId` | Public | Remove a single cart item. |
| `DELETE` | `/` | Public | Clear the entire cart. |

## Session and cookie behavior

- `sid` is generated server-side by middleware and stored in `Set-Cookie` only when a cart
  is first created.
- Every cart request uses `sid` from cookies to resolve the cart.
- If a user never added anything, `GET /api/cart` returns an empty cart shape.

## Request payloads

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

## Response shape

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

## Validation rules

- `product_id`: required integer, positive.
- `quantity`: required integer, min 1, max 100.
- `itemId` param: required integer, positive.

## Business rules

- Product must exist and be active.
- Quantity cannot exceed available stock.
- If the item exists in cart, quantities are combined and revalidated against stock.
- Price is snapshotted on add (`price_at_add`) and not recalculated later.

## Layered implementation (for frontend alignment)

- Route: src/modules/cart/cart.routes.js mounts endpoints and applies session + validation.
- Validator: src/modules/cart/cart.validator.js validates payloads and params with Joi.
- Controller: src/modules/cart/cart.controller.js returns HTTP responses.
- Service: src/modules/cart/cart.service.js applies business rules and session handling.
- Repository: src/modules/cart/cart.repository.js performs SQL and builds cart response.
- Session middleware: src/middlewares/session.middleware.js manages `sid` creation.
