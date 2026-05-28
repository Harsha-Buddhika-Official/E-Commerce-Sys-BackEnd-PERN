# Brands API

This document describes the Brands API endpoints for managing product brands with Cloudinary image upload support.

Base path: `/api/brands`

## Endpoints

- **GET /brands**
  - Public (No authentication required)
  - Description: Retrieve a list of all brands.
  - Response 200: Array of brand objects.
  - Example response:

```json
{
  "success": true,
  "data": [{
    "brand_id": 1,
    "name": "Acme",
    "slug": "acme",
    "logo_url": "https://res.cloudinary.com/...",
    "logo_public_id": "ecommerce/brands/brand-1234567890",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }]
}
```

- **GET /brands/:id**
  - Public (No authentication required)
  - Description: Retrieve a single brand by numeric `id`.
  - URL parameters:
    - `id` (number, positive, required)
  - Response 200: Brand object.
  - Errors:
    - 400: Invalid `id` parameter
    - 404: Brand not found

- **GET /brands/names**
  - Protected: requires authentication and authorization.
  - Allowed roles: `super_admin`, `admin`, `manager`
  - Description: Retrieve only active brand names and IDs (lightweight endpoint).
  - Response 200: Array with `brand_id` and `name` only.
  - Example response:

```json
{
  "success": true,
  "data": [
    { "brand_id": 1, "name": "Nike" },
    { "brand_id": 2, "name": "Adidas" }
  ]
}
```

- **POST /brands**
  - Protected: requires authentication and authorization.
  - Allowed roles: `super_admin`, `admin`, `manager`
  - Description: Create a new brand with optional logo image upload.
  - Request format: `multipart/form-data`
  - Request fields:
    - `name` (string, required, 2-100 chars)
    - `logo` (file, optional, image only - JPEG, PNG, WebP, max 5MB)
  - Notes:
    - The `slug` is generated server-side from `name` (lowercase, URL-safe).
    - Duplicate names are rejected with 409 Conflict.
    - Logo is uploaded to Cloudinary automatically if provided.
  - Responses:
    - 201: Brand created. Returns the created brand object with Cloudinary URLs.
    - 400: Validation failed (returns details array).
    - 409: Brand with this name already exists.

  - Example request (using FormData):

```javascript
const formData = new FormData();
formData.append('name', 'Nike');
formData.append('logo', fileInput.files[0]);

fetch('/api/brands', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer <your_token>'
    },
    body: formData  // DO NOT set Content-Type header
});
```

  - Example response:

```json
{
  "success": true,
  "data": {
    "brand_id": 1,
    "name": "Nike",
    "slug": "nike",
    "logo_url": "https://res.cloudinary.com/.../brand-1234567890.jpg",
    "logo_public_id": "ecommerce/brands/brand-1234567890",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Brand created successfully"
}
```

- **PUT /brands/:id**
  - Protected: requires authentication and roles `super_admin`, `admin`, `manager`.
  - Description: Update an existing brand with optional new logo image.
  - Request format: `multipart/form-data`
  - URL parameters:
    - `id` (number, positive, required)
  - Request fields:
    - `name` (string, optional, 2-100 chars)
    - `logo` (file, optional, image only - JPEG, PNG, WebP, max 5MB)
  - Notes:
    - If `name` changes, the API checks for duplicate names and will return 409 on conflict.
    - A new `slug` will be generated from the provided `name`.
    - If a new logo is provided, the old one is automatically deleted from Cloudinary.
  - Responses:
    - 200: Brand updated (returns updated object)
    - 400: Validation failed
    - 404: Brand not found
    - 409: Duplicate name conflict

  - Example request:

```javascript
const formData = new FormData();
formData.append('name', 'Nike Updated');
formData.append('logo', newFileInput.files[0]);

fetch('/api/brands/1', {
    method: 'PUT',
    headers: {
        'Authorization': 'Bearer <your_token>'
    },
    body: formData
});
```

- **PUT /brands/:id/soft-delete**
  - Protected: requires authentication and roles `super_admin`, `admin`, `manager`.
  - Description: Soft-delete a brand (sets `is_active` to `false`). Logo remains in Cloudinary.
  - URL parameters: `id` (number)
  - Responses:
    - 200: Soft-delete successful
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
  - Description: Permanently delete a brand and its logo from the database and Cloudinary.
  - URL parameters: `id` (number)
  - Responses:
    - 200: Brand and logo deleted successfully
    - 404: Brand not found

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Authentication Header

Include this header in all protected requests:

```
Authorization: Bearer <JWT_TOKEN>
```

## File Upload Requirements

- **Supported formats**: JPEG, PNG, WebP
- **Max file size**: 5MB
- **Field name**: `logo`
- **Request format**: `multipart/form-data`
- **Content-Type header**: Do NOT set manually (browser will set it automatically)

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
