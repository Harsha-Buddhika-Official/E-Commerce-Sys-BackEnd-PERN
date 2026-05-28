# Categories API

Base path: `/api/categories`

This module manages product and accessory categories. The API now includes a lightweight names endpoint that returns only category ids and names.

## Route summary

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/products` | Public | Get product categories. |
| `GET` | `/accessories` | Public | Get accessory categories. |
| `GET` | `/names` | Public | Get active category ids and names only. |
| `GET` | `/:id` | Public | Get one category by id. |
| `POST` | `/` | `super_admin`, `admin` | Create a category. |
| `PUT` | `/:id` | `super_admin`, `admin` | Update a category. |
| `PUT` | `/:id/deactivate` | `super_admin`, `admin` | Soft-delete a category. |
| `PUT` | `/:id/restore` | `super_admin`, `admin` | Restore a category. |
| `DELETE` | `/:id` | `super_admin`, `admin` | Permanently delete a category. |

## Get category names

### `GET /api/categories/names`

Returns only active categories with these fields:

- `category_id`
- `name`

### Example response

```json
{
  "success": true,
  "data": [
    { "category_id": 1, "name": "Shoes" },
    { "category_id": 2, "name": "Bags" }
  ]
}
```

## Notes

- This endpoint is intended for dropdowns and other lightweight frontend selects.
- It returns only categories where `is_active = true`.
