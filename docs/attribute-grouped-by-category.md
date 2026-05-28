# GET /api/v/attributes/grouped/:categoryId

Purpose: Return a single category with its attributes and each attribute's values (Cloud-DB aggregated response).

- Method: GET
- Path: `/api/v/attributes/grouped/:categoryId`
- Auth: `Authorization: Bearer <token>` — roles: `super_admin`, `admin`
- Content-Type: `application/json`

Path Parameters
- `categoryId` (integer, required): category identifier to return with attributes and values.

Alternative input (supported by controller)
- Query: `?category_id=1` or `?categoryId=1`
- Request body JSON: `{ "category_id": 1 }` (controller accepts body, but route param is preferred for GET)

Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "category_id": 1,
      "category_name": "Smartphones",
      "attributes": [
        {
          "attribute_id": 3,
          "name": "Storage",
          "values": [
            { "attribute_value_id": 11, "value": "64GB", "slug": "64gb", "created_at": "2026-05-01T10:00:00.000Z" },
            { "attribute_value_id": 12, "value": "128GB", "slug": "128gb", "created_at": "2026-05-01T10:01:00.000Z" }
          ]
        }
      ]
    }
  ]
}
```

Errors
- `401 Unauthorized` — missing/invalid token or insufficient role.
- `404 Not Found` — category not found or no active attributes/values for that category.
- `500 Internal Server Error` — DB or server error.

cURL example

```bash
curl -s -X GET "http://localhost:3000/api/v/attributes/grouped/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

Notes
- This route uses a DB-side aggregation to produce attributes and their nested values; the response is array-shaped to keep compatibility with the `/grouped` endpoint which returns multiple categories when no filter is provided.
- Prefer using the route param variant (`/grouped/:categoryId`) when requesting a single category.
