# Products API

Base path: `/api/products`

This module manages products, product images, and product attributes. Product creation now supports Cloudinary uploads for up to 3 images from the frontend.

## Route summary

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Get all active products. |
| `GET` | `/best-selling` | Public | Get best selling products. |
| `GET` | `/latest` | Public | Get latest products. |
| `GET` | `/search/:name` | Public | Search products by name. |
| `GET` | `/category/:categoryId` | Public | Get products by category. |
| `GET` | `/attributes/by-category/:categoryId` | Public | Get attributes available for a category. |
| `GET` | `/filter/options/:categoryId` | Public | Get filter options for a category. |
| `POST` | `/` | Public | Create a product with optional image uploads. |
| `POST` | `/filter/:categoryId` | Public | Filter products by category and filters. |
| `PUT` | `/:id` | `super_admin`, `admin` | Update a product. |
| `PUT` | `/:id/soft-delete` | `super_admin`, `admin` | Soft-delete a product. |
| `PUT` | `/:id/restore` | `super_admin`, `admin` | Restore a soft-deleted product. |
| `POST` | `/:id/attributes` | `super_admin`, `admin` | Add a product attribute mapping. |
| `DELETE` | `/admin/delete/:id` | `super_admin`, `admin` | Permanently delete a product. |
| `DELETE` | `/:id/attributes/:attributeId` | `super_admin`, `admin` | Remove a product attribute mapping. |

## Create product

### `POST /api/products`

This endpoint accepts `multipart/form-data`.

Request fields:

- `name` (string, required)
- `brand_name` (string, required)
- `category_name` (string, required)
- `description` (string, optional)
- `base_price` (number, required)
- `discounted_price` (number, required)
- `selling_price` (number, required)
- `stock_quantity` (number, optional)
- `warranty_months` (number, optional)
- `product_tag` (string, optional)
- `images` (file, optional) - upload up to 3 image files

Accepted image files:

- JPG
- JPEG
- PNG
- WebP

Upload limits:

- Max file size: 10MB per file
- Max files: 3

Image handling:

- Uploaded images are sent to Cloudinary.
- The first uploaded image is marked as primary.
- The server stores the Cloudinary `secure_url` values in `product_images.image_url`.
- Image metadata is stored with sort order and original filename as alt text.

### Example request

```bash
curl -v -X POST http://localhost:4000/api/products \
  -F "name=Test Product" \
  -F "brand_name=Nike" \
  -F "category_name=Shoes" \
  -F "description=Example product" \
  -F "base_price=100" \
  -F "discounted_price=90" \
  -F "selling_price=120" \
  -F "stock_quantity=25" \
  -F "warranty_months=12" \
  -F "product_tag=BEST_SELLER" \
  -F "images=@/full/path/to/image1.jpg" \
  -F "images=@/full/path/to/image2.png" \
  -F "images=@/full/path/to/image3.webp"
```

### Response example

```json
{
  "success": true,
  "data": {
    "product_id": 1,
    "name": "Test Product",
    "slug": "test-product",
    "brand_id": 2,
    "category_id": 4,
    "base_price": "100.00",
    "selling_price": "120.00",
    "discounted_price": "90.00",
    "stock_quantity": 25,
    "images": [
      {
        "image_url": "https://res.cloudinary.com/.../image1.jpg",
        "is_primary": true,
        "alt_text": "image1.jpg",
        "sort_order": 0
      }
    ]
  },
  "message": "Product created successfully"
}
```

## Notes

- Only the create-product route uses Cloudinary image upload.
- Other product routes remain unchanged.
- If you send no files, the product is created without `product_images` entries.