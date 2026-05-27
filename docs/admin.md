# Admin API

Base path: `/api/admin`

Headers (for protected routes):

- `Authorization: Bearer <token>` — include for any protected/admin route.
- `Content-Type: application/json` — include for JSON request bodies.

This module manages admin authentication and admin account administration. Public clients can only log in. All other routes require a valid JWT in `Authorization: Bearer <token>` and are then filtered by role.

## Route summary

| Method | Route | Auth | Success status | Description |
| --- | --- | --- | ---: | --- |
| `POST` | `/login` | Public | `200` | Log in an admin and receive a JWT token. |
| `GET` | `/` | `super_admin`, `admin` | `200` | List all admin accounts without password hashes. |
| `POST` | `/register` | `super_admin` | `201` | Create a new admin account. |
| `PUT` | `/updateRole` | `super_admin` | `200` | Update an admin role. |
| `PUT` | `/updatePassword/:id` | `super_admin`, `admin`, `manager` | `200` | Update an admin password. |
| `DELETE` | `/delete` | `super_admin` | `200` | Delete an admin by email. |

---

### POST /api/admin/login

- Auth: Public
- Success: `200` — body: `{ "token": "<jwt>", "admin": { ...adminObjectWithoutPasswordHash } }`
- Validation: `400` for malformed body
- Failure: `401` for incorrect credentials

Request example:

```json
{
  "email": "admin@example.com",
  "password": "secret123"
}
```

---

### GET /api/admin

- Auth: `Authorization: Bearer <token>` (roles: `super_admin`, `admin`)
- Success: `200` — returns array of admin objects (password hash omitted)

Response example:

```json
[
  {
    "admin_id": 1,
    "full_name": "Super Admin",
    "email": "owner@example.com",
    "role": "super_admin",
    "created_at": "2026-05-19T10:00:00.000Z",
    "updated_at": "2026-05-19T10:00:00.000Z",
    "last_login": "2026-05-20T08:15:00.000Z"
  }
]
```

---

### POST /api/admin/register

- Auth: `Authorization: Bearer <token>` (role: `super_admin`)
- Success: `201` — returns created admin object (password hash omitted)
- Validation: `400` bad payload; `409` if email already exists

Request example:

```json
{
  "fullname": "Jane Doe",
  "email": "admin@example.com",
  "password": "secret123",
  "role": "manager"
}
```

---

### PUT /api/admin/updateRole

- Auth: `Authorization: Bearer <token>` (role: `super_admin`)
- Success: `200` — returns updated admin object (password hash omitted)
- Validation: `400` missing fields; `404` admin not found

Request example:

```json
{
  "adminId": 12,
  "newRole": "admin"
}
```

---

### PUT /api/admin/updatePassword/:id

- Auth: `Authorization: Bearer <token>` (roles: `super_admin`, `admin`, `manager`)
- Success: `200` — returns updated admin object (password hash omitted)
- Validation: `400` missing fields; `401` old password incorrect; `409` new password same as old; `422` confirm mismatch

Request notes:

- The admin to update is provided as the URL parameter `:id` (admin id).
- The request body should NOT include `adminId` — send only the password fields.

Request example:

```json
{
  "oldPassword": "secret123",
  "newPassword": "newSecret123",
  "confirmPassword": "newSecret123"
}
```

---

### DELETE /api/admin/delete

- Auth: `Authorization: Bearer <token>` (role: `super_admin`)
- Success: `200` — returns deleted admin object (password hash omitted)
- Validation: `400` missing email; `404` admin not found

Request example:

```json
{
  "email": "admin@example.com"
}
```

## Auth rules

- `POST /api/admin/login` is public.
- After `router.use(authMiddleware)`, every remaining route requires a valid JWT.
- Role checks are enforced with `authorize(...)` on each protected route.
- The login token payload is generated from `adminId` and `role`.

## Request payloads

Login

`POST /api/admin/login`

```json
{
  "email": "admin@example.com",
  "password": "secret123"
}
```

Register

`POST /api/admin/register`

```json
{
  "fullname": "Jane Doe",
  "email": "admin@example.com",
  "password": "secret123",
  "role": "manager"
}
```

Update role

`PUT /api/admin/updateRole`

```json
{
  "adminId": 12,
  "newRole": "admin"
}
```

Update password

`PUT /api/admin/updatePassword/:id`

```json
{
  "oldPassword": "secret123",
  "newPassword": "newSecret123",
  "confirmPassword": "newSecret123"
}
```

Delete admin

`DELETE /api/admin/delete`

```json
{
  "email": "admin@example.com"
}
```

## Response shapes

Login returns a token and the authenticated admin object (password hash omitted).

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "admin_id": 12,
    "full_name": "Jane Doe",
    "email": "admin@example.com",
    "role": "manager",
    "created_at": "2026-05-19T10:00:00.000Z",
    "updated_at": "2026-05-19T10:00:00.000Z",
    "last_login": null
  }
}
```

Create, update-role, update-password, and delete return the affected admin record without `password_hash`.

```json
{
  "admin_id": 12,
  "full_name": "Jane Doe",
  "email": "admin@example.com",
  "role": "manager",
  "created_at": "2026-05-19T10:00:00.000Z",
  "updated_at": "2026-05-19T10:00:00.000Z",
  "last_login": null
}
```

List admins returns an array of admin records, also without password hashes.

```json
[
  {
    "admin_id": 1,
    "full_name": "Super Admin",
    "email": "owner@example.com",
    "role": "super_admin",
    "created_at": "2026-05-19T10:00:00.000Z",
    "updated_at": "2026-05-19T10:00:00.000Z",
    "last_login": "2026-05-20T08:15:00.000Z"
  }
]
```

## Validation rules

Register payload

- `fullname`: required string, minimum 3 characters.
- `email`: required valid email.
- `password`: required string, minimum 6 characters.
- `role`: optional; if omitted, the service defaults it to `manager`.
- `role` must be one of `super_admin`, `admin`, or `manager` when provided.

Login payload

- `email`: required valid email.
- `password`: required string.

Service-level checks for role and password management

- `adminId` is required for role and password updates.
- `newRole` is required for role updates.
- `oldPassword`, `newPassword`, and `confirmPassword` are required for password updates.
- `newPassword` and `confirmPassword` must match.

## Business rules

- A duplicate email is rejected with `409`.
- Login fails with `401` when the email does not exist or the password does not match.
- Successful login updates `last_login` for the admin.
- Creating or updating an admin never exposes `password_hash` in the API response.
- Deleting an admin first resolves the account by email, then deletes by `admin_id`.
- Updating a password rejects reuse of the current password.

## Common error responses

Validation failure (`400`):

```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ]
}
```

Typical service errors:

- `401` credentials are incorrect.
- `401` old password is incorrect.
- `404` admin not found.
- `409` admin already exists or new password matches the old password.
- `422` new password and confirm password do not match.

## Layered implementation reference

- Route: `src/modules/admin/admin.routes.js`
- Controller: `src/modules/admin/admin.controller.js`
- Service: `src/modules/admin/admin.service.js`
- Repository: `src/modules/admin/admin.repository.js`
- Validator: `src/modules/admin/admin.validator.js`

## AI usage notes

- Use `POST /api/admin/login` for authentication and token retrieval.
- Use `GET /api/admin` for admin dashboards that need the full account list.
- Use `POST /api/admin/register` only from privileged admin tooling.
- Use `PUT /api/admin/updateRole` when changing permissions on an existing admin account.
- Use `PUT /api/admin/updatePassword` for self-service or privileged password rotation.
- Use `DELETE /api/admin/delete` to remove an admin by email, not by route param.