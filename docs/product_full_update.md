# Full Product Update

**Endpoint:** PUT /api/products/admin/products/:id/full-update

**Summary:** Replace and update a product's full data (core fields, images, attributes) using the EditProductPage payload. Operation is transactional — either all changes persist or none.

**Authentication:** Bearer token required. Roles: `super_admin`, `admin`.

**Path Parameters**
- `id` (integer, required): Product ID to update.

**Request Body** (multipart/form-data)
- `product_id` (integer, optional) — should match `id` if provided.
- `name` (string, optional)
- `slug` (string, optional)
- `description` (string, optional)
- `brand_id` (integer, optional) OR `brand_name` (string, optional)
- `category_id` (integer, optional) OR `category_name` (string, optional)
- `base_price` (number, optional)
- `selling_price` (number, optional)
- `discounted_price` (number, optional)
- `stock_quantity` (integer, optional)
- `warranty_months` (integer|null, optional)
- `product_tag` (string|null, optional)
- `is_active` (boolean, optional)
- `images` (file[], optional, max 3): Upload product images in the `images` field. The server uploads each file to Cloudinary, then replaces the product's existing `product_images` rows with the uploaded results.
- `attributes` (array, optional): When present the server will replace existing attribute mappings. Each item:
  - `attribute_id` (integer, required)
  - `attribute_value_id` (integer, required)
  - Notes: `attribute_value_id` must exist and must belong to the provided `attribute_id`. The server stores both `attribute_value_id` and the resolved `value` from the `attribute_values` table.

**Example Request**

{
  "product_id": 123,
  "name": "New Product Name",
  "brand_id": 5,
  "category_id": 8,
  "base_price": 120.0,
  "selling_price": 150.0,
  "discounted_price": 130.0,
  "stock_quantity": 20,
  "is_active": true,
  "images": [binary files uploaded in the `images` form field],
  "attributes": [
    { "attribute_id": 2, "attribute_value_id": 21 },
    { "attribute_id": 3, "attribute_value_id": 34 }
  ]
}

**Success Response**
- Status: `200 OK`
- Body:

{
  "success": true,
  "data": { /* updated product object returned by GET details */ },
  "message": "Product details updated successfully"
}

**Errors**
- `400 Bad Request` — validation errors, mismatched `product_id`, more than one primary image, attribute value mismatch, etc.
- `404 Not Found` — product, brand, category, or attribute value not found.
- `409 Conflict` — product name already exists (duplicate name check).
- `500 Internal Server Error` — unexpected server error.

**Notes & Implementation Details**
- The endpoint is transactional: images and attributes replacements are rolled back on error.
- The endpoint accepts up to 3 binary files in the `images` field. The server uploads them to Cloudinary and stores the returned `secure_url` values in `product_images`.
- The first uploaded file is marked as the primary image.
- When `attributes` are provided, the server resolves each `attribute_value_id` to get its `value` and stores (`attribute_id`, `attribute_value_id`, `value`) in `product_attributes`.
- If a field is omitted it will remain unchanged (unless the field is explicitly present with `null` depending on validation rules).

**Related endpoints**
- Create product with images: POST /api/products
- Create product (without attributes) clone: POST /api/products/without-attributes
- Map a single attribute to product: POST /api/attributes/products/:productId/attributes

---
File generated: `docs/product_full_update.md`
