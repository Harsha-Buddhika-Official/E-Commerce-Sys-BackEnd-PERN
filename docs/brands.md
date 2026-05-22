# Brands API

This document describes the Brands API endpoints for managing product brands.

Base path: `/brands`

## Endpoints

- **GET /brands**
  - Public
  - Description: Retrieve a list of all brands.
  - Response 200: Array of brand objects.
  - Example response:

```json
[{
  "brand_id": 1,
  "name": "Acme",
  "slug": "acme",
  "logo_url": "https://example.com/logo.png",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}]
```

- **GET /brands/:id**
  - Public
  - Description: Retrieve a single brand by numeric `id`.
  - URL parameters:
    - `id` (number, positive, required)
  - Response 200: Brand object.
  - Errors:
    - 400: Invalid `id` parameter
    - 404: Brand not found

- **POST /brands**
  - Protected: requires authentication (`authMiddleware`) and authorization.
  - Allowed roles: `super_admin`, `admin`, `manager` (via `authorize` middleware)
  - Description: Create a new brand.
  - Request body (application/json):
    - `name` (string, required, 2-100 chars)
    - `logo_url` (string, optional, must be a valid URI)
  - Notes:
    - The `slug` is generated server-side from `name` (lowercase, URL-safe).
    - Duplicate names are rejected with 409 Conflict.
  - Responses:
    - 201: Brand created. Returns the created brand object.
    - 400: Validation failed (returns details array).
    - 409: Brand with this name already exists.

  - Example request:

```json
{
  "name": "Acme",
  "logo_url": "https://cdn.example.com/acme.png"
}
```

- **PUT /brands/:id**
  - Protected: requires authentication and roles `super_admin`, `admin`, `manager`.
  - Description: Update an existing brand.
  - URL parameters:
    - `id` (number, positive, required)
  - Request body (application/json):
    - `name` (string, optional, 2-100 chars)
    - `logo_url` (string, optional, valid URI)
  - Notes:
    - If `name` changes, the API checks for duplicate names and will return 409 on conflict.
    - A new `slug` will be generated from the provided `name`.
  - Responses:
    - 200: Brand updated (returns updated object)
    - 400: Validation failed
    - 404: Brand not found
    - 409: Duplicate name conflict

- **PUT /brands/:id/soft-delete**
  - Protected: requires authentication and roles `super_admin`, `admin`, `manager`.
  - Description: Soft-delete a brand (sets `is_active` to `false`).
  - URL parameters: `id` (number)
  - Responses:
    - 200: Soft-delete successful (returns message)
    - 404: Brand not found

- **PUT /brands/:id/restore**
  - Protected: requires authentication and roles `super_admin`, `admin`, `manager`.
  - Description: Restore a soft-deleted brand (sets `is_active` to `true`).
  - URL parameters: `id` (number)
  - Responses:
    - 200: Restore successful
    - 404: Brand not found

- **DELETE /brands/:id**
  - Protected: requires authentication and roles `super_admin`, `admin`, `manager`.
  - Description: Permanently delete a brand from the database.
  - URL parameters: `id` (number)
  - Responses:
    - 200: Brand deleted successfully
    - 404: Brand not found

## Validation rules

- `name`
  - required for creation
  - string, trimmed
  - min length 2, max length 100

- `logo_url`
  - optional
  - must be a valid URI when present

- `id` (path param)
  - required
  - must be a positive integer

Errors from validation are returned with status 400 and a payload like:

```json
{
  "success": false,
  "error": [
    { "field": "name", "message": "Brand name is required" }
  ]
}
```

## Authorization and authentication

- Public endpoints: `GET /brands`, `GET /brands/:id`.
- All other endpoints require authentication via `authMiddleware` and role checks via `authorize(...)` middleware.

## Implementation notes

- The `slug` value is generated server-side using `slugify(name, { lower: true, strict: true })`.
- Duplicate brand names are checked in the service layer and produce `409 Conflict` when attempting to create or rename to an existing name.
- Soft-delete toggles `is_active` and updates `updated_at` timestamp.

## Example curl requests

- List brands

```bash
curl -sS http://localhost:3000/brands
```

- Create brand (protected)

```bash
curl -X POST http://localhost:3000/brands \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme","logo_url":"https://cdn.example.com/acme.png"}'
```

## Related docs

- See [docs/admin.md](docs/admin.md) for information about role definitions and admin actions.
