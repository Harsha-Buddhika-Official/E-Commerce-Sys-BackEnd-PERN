# Attributes API

This document describes the `attributes` API endpoints, request/response examples, and usage notes. Routes are mounted under `/api/attributes`.

## Summary
- Public endpoints:
  - `GET /api/attributes/category` — get attributes for a category (see note)
  - `GET /api/attributes/:id` — get one attribute by id
- Protected (requires `Authorization: Bearer <JWT>` and role `admin` or `super_admin`):
  - `GET /api/attributes/` — full catalog (categories + attributes with values)
  - `POST /api/attributes/` — create attribute
  - `PUT /api/attributes/:id` — update attribute
  - `DELETE /api/attributes/:id` — delete attribute (see note)

## Authentication & Roles
- Protected routes require a valid JWT and role check. Include header:

  Authorization: Bearer <YOUR_JWT>

Only users with `admin` or `super_admin` roles can call protected endpoints.

## Endpoints

### GET /api/attributes/
Protected. Returns the catalog object with `categories` and `attributes` arrays.

Example Response (200):

{
  "categories": [
    { "category_id": 1, "name": "Laptop" },
    { "category_id": 2, "name": "Monitor" }
  ],
  "attributes": [
    {
      "attribute_id": 1,
      "name": "Brand",
      "category_id": 1,
      "values": [
        { "attribute_value_id": 1, "value": "ASUS" },
        { "attribute_value_id": 2, "value": "MSI" }
      ]
    },
    {
      "attribute_id": 2,
      "name": "RAM",
      "category_id": 1,
      "values": [
        { "attribute_value_id": 10, "value": "16GB" },
        { "attribute_value_id": 11, "value": "32GB" }
      ]
    }
  ]
}

Notes:
- This endpoint aggregates attributes and their `attribute_values` in `values`.

### GET /api/attributes/category
Public. Current implementation reads the request body and forwards it to the service layer — this means you must send a JSON body containing the category identifier. (If you prefer a safer alternative, the product module exposes a GET-by-category route: `GET /api/products/attributes/by-category/:categoryId`.)

Request (example):

Headers:
  Content-Type: application/json

Body:
{
  "categoryId": 1
}

Response (200):
Array of attribute objects for the category. Each object comes from the `attributes` table, e.g.:

[
  { "attribute_id": 1, "name": "Brand", "category_id": 1 },
  { "attribute_id": 2, "name": "RAM", "category_id": 1 }
]

Note: Because the route is a `GET` but the controller reads `req.body`, some HTTP clients may not send a body with GET requests. If you encounter issues, use `GET /api/products/attributes/by-category/:categoryId` instead or update the code to accept a query param.

### GET /api/attributes/:id
Public. Path param `id` (attribute_id).

Example:
  GET /api/attributes/2

Response (200):
{
  "attribute_id": 2,
  "name": "RAM",
  "category_id": 1
}

### POST /api/attributes/
Protected. Create a new attribute.

Headers:
  Content-Type: application/json
  Authorization: Bearer <JWT>

Body (example):
{
  "name": "Color",
  "category_id": 2
}

Response (201):
{
  "message": "Attribute created successfully",
  "attribute": {
    "attribute_id": 5,
    "name": "Color",
    "category_id": 2
  }
}

### PUT /api/attributes/:id
Protected. Update attribute with id in path. Body should include new `name` and `category_id`.

Example:
  PUT /api/attributes/5

Body:
{
  "name": "Color",
  "category_id": 3
}

Response (200):
{
  "message": "Attribute updated successfully"
}

### DELETE /api/attributes/:id
Protected. Controller reads `id` from the path parameter `:id`. No request body is required.

Example:
  DELETE /api/attributes/5

Headers:
  Authorization: Bearer <JWT>

Response (204): No content on success.

## Postman snippets (copy raw JSON body)

- Create attribute (POST /api/attributes):

{
  "name": "Brand",
  "category_id": 1
}

- Get attributes for a category (GET /api/attributes/category):

{
  "categoryId": 1
}

- Delete attribute (DELETE /api/attributes/:id):

{
  "id": 5
}

## Implementation notes for AI or future changes
- Consider changing `GET /api/attributes/category` to accept `?categoryId=` query param or `GET /api/attributes/category/:categoryId` and update controller to use `req.params`/`req.query` to avoid relying on bodies for GET requests.
- Align `DELETE /api/attributes/:id` to read `req.params.id` instead of `req.body.id` for consistency.
- The authoritative catalog endpoint currently is the protected `GET /api/attributes/` which returns both `categories` and `attributes` with embedded `values`.

---
Generated on May 23, 2026
