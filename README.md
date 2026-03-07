# Cloudflare Worker Backend (D1)

Minimal API backend built with **Hono** on **Cloudflare Workers** and **D1**. Provides auth, user management, transactions, and a **read-only admin dashboard** behind an API-key gate, with JWT protection per route.

---

## Table of Contents

- [Quickstart](#quickstart)
- [Auth Model](#auth-model)
- [Error Format](#error-format)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
  - [Health](#health)
  - [Auth](#auth)
  - [Users](#users)
  - [Transactions](#transactions)
  - [Admin Auth](#admin-auth)
  - [Admin Dashboard API](#admin-dashboard-api)
  - [Admin Danger Zone](#admin-danger-zone)
- [Admin Dashboard (Web UI)](#admin-dashboard-web-ui)
- [Project Structure](#project-structure)
- [Security Notes](#security-notes)

---

## Quickstart

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure** environment variables in `wrangler.toml`

   | Variable | Purpose |
   |---|---|
   | `API_KEY` | Required on every non-admin request via `x-api-key` header |
   | `JWT_SECRET` | HS256 secret used to sign/verify JWTs |
   | `RESEND_API_KEY` | Used by `POST /auth/otp` to send email via Resend |

3. **Apply D1 migrations**

   ```bash
   npx wrangler d1 migrations apply DB --remote
   ```

   Migrations: `001_init.sql` → `002_add_avatar_to_users.sql` → `002_add_currency_to_users.sql` → `003_create_admins.sql`

4. **Run locally**

   ```bash
   npm run start
   ```

   Default local URL: `http://127.0.0.1:8787`

---

## Auth Model

### App Clients (Mobile/Web)

All non-admin routes require an API key header:

```
x-api-key: <API_KEY>
```

Protected routes additionally require a Bearer token:

```
Authorization: Bearer <JWT>
```

User JWTs are issued by `POST /auth/login` and contain `{ id, email }`. The `authGuard` middleware verifies the signature **and** confirms the user still exists in the DB with matching data.

### Admin

Admin routes (`/admin/*`) **skip** the API key check entirely.

Protected admin API routes require: `Authorization: Bearer <ADMIN_JWT>` where the JWT contains `{ id, username, role: "admin" }`. The `adminGuard` middleware verifies the signature and checks `role === "admin"`.

Only **one admin account** is allowed. Signup is blocked once an admin exists.

---

## Error Format

All errors are returned as:

```json
{ "error": "Message describing what went wrong" }
```

Status codes used: `400`, `401`, `403`, `404`, `500`.

---

## Database Schema

### `users`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | |
| `name` | TEXT | NOT NULL | Display name |
| `email` | TEXT | NOT NULL, UNIQUE | Used in JWT payload |
| `currency` | TEXT | NOT NULL, DEFAULT `'USD'` | e.g. `PKR`, `USD` |
| `password` | TEXT | NOT NULL | SHA-256 hex hash |
| `avatar` | TEXT | NULL | Avatar URL |

### `transactions`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | |
| `user_id` | INTEGER | NOT NULL, FK → `users(id)` | Owner |
| `amount` | REAL | NOT NULL | |
| `type` | TEXT | NOT NULL | `"income"` or `"expense"` |
| `description` | TEXT | NULL | |
| `created_at` | TEXT | DEFAULT `datetime('now')` | ISO 8601 |

### `admins`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | |
| `username` | TEXT | NOT NULL, UNIQUE | |
| `password` | TEXT | NOT NULL | SHA-256 hex hash |
| `created_at` | TEXT | DEFAULT `datetime('now')` | |

> Only one row is ever allowed in the `admins` table (enforced at the application layer).

---

## API Reference

Base URL: `http://127.0.0.1:8787`

Legend:
- 🔑 = Requires `x-api-key` header
- 🔒 = Requires `Authorization: Bearer <JWT>` (user)
- 🛡️ = Requires `Authorization: Bearer <JWT>` (admin, `role: "admin"`)

---

### Health

#### `GET /health` 🔑

Returns service status.

**Response `200`**

```json
{ "status": "ok" }
```

---

### Auth

#### `POST /auth/register` 🔑

Create a new user account.

**Request Body**

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "currency": "USD",
  "password": "secret"
}
```

All four fields are required (validated by `validateRegister` middleware).

**Response `201`**

```json
{ "message": "User registered" }
```

**Errors:** `400 Missing fields` · `400 Registration failed` (duplicate email)

---

#### `POST /auth/login` 🔑

Authenticate and get a JWT.

**Request Body**

```json
{
  "email": "alice@example.com",
  "password": "secret"
}
```

Both fields required (validated by `validateLogin` middleware).

**Response `200`**

```json
{
  "id": 1,
  "token": "<JWT>"
}
```

JWT payload: `{ id, email }`

**Errors:** `400 Missing fields` · `401 Invalid credentials`

---

#### `POST /auth/otp` 🔑 🔒

Send an OTP to the authenticated user's email via Resend.

**Headers:** `x-api-key`, `Authorization: Bearer <JWT>`

**Request Body:** None

**Response `200`**

```json
{ "OTP": "482917" }
```

The 6-digit OTP is also sent to the user's email. It is returned in the response for development purposes.

**Errors:** `401 No token` · `401 Invalid token` · `500 Could not send email to <email>`

---

### Users

#### `GET /users` 🔑

List all users (basic info).

**Response `200`**

```json
[
  {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "currency": "USD",
    "avatar": ""
  }
]
```

---

#### `GET /user/:id` 🔑

Get a single user by ID.

**URL Params:** `id` — user ID

**Response `200`**

```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "currency": "USD",
  "avatar": ""
}
```

**Errors:** `404 User not found`

---

#### `GET /user/info` 🔑 🔒

Get the full record of the authenticated user.

**Response `200`**

```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "currency": "USD",
  "password": "<sha256-hash>",
  "avatar": ""
}
```

> ⚠️ Includes the password hash in the response.

**Errors:** `401 Unauthorized` · `400 Invalid user id` · `404 User not found`

---

#### `PUT /user/update` 🔑 🔒

Update the authenticated user's name and email. If the email changes, a new JWT is issued (old one becomes invalid).

**Request Body**

```json
{
  "name": "Alice A.",
  "email": "alice+new@example.com"
}
```

Both fields required.

**Response `200` (email unchanged)**

```json
{ "message": "User updated" }
```

**Response `200` (email changed)**

```json
{
  "message": "User updated",
  "token": "<new-JWT>"
}
```

**Errors:** `400 Some field is missing in payload.` · `400 invalid data`

---

#### `PUT /user/avatar` 🔑 🔒

Set or update the avatar URL for the authenticated user.

**Request Body**

```json
{ "avatar": "https://example.com/avatar.png" }
```

**Response `200`**

```json
{ "message": "Avatar updated." }
```

**Errors:** `400 Invalid JSON body` · `400 Avatar URL is required` · `500 Could not save avatar.`

---

#### `PUT /user/setpassword/:id` 🔑

Set a new password for a user by ID. **No JWT required.**

**URL Params:** `id` — user ID

**Request Body**

```json
{ "password": "newSecret" }
```

**Response `200`**

```json
{ "message": "Password has been updated" }
```

**Errors:** `404 Id not found in url` · `404 Password not found in request body.`

---

#### `PUT /user/setcurrency/:id` 🔑

Set a new currency for a user by ID. **No JWT required.**

**URL Params:** `id` — user ID

**Request Body**

```json
{ "currency": "PKR" }
```

**Response `200`**

```json
{ "message": "Currency has been updated" }
```

**Errors:** `404 Id not found in url` · `404 Currency not found in request body.`

---

#### `DELETE /user/delete/:id` 🔑

Delete a user and all their transactions by ID. **No JWT required.**

**URL Params:** `id` — user ID

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "user with id: 1 has been deleted.",
  "user": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "currency": "USD",
    "password": "<sha256>",
    "avatar": null
  }
}
```

**Errors:** `404 User id is missing from url` · `400 User not found`

---

### Transactions

All transaction routes require both `x-api-key` and a valid user JWT.

#### `GET /transactions` 🔑 🔒

List all transactions for the authenticated user.

**Response `200`**

```json
[
  {
    "id": 1,
    "user_id": 1,
    "amount": 20.5,
    "type": "income",
    "description": "Salary",
    "created_at": "2026-02-06 12:34:56"
  }
]
```

---

#### `POST /transaction/new` 🔑 🔒

Create a single transaction. `user_id` is derived from the JWT.

**Request Body**

```json
{
  "amount": 20.5,
  "type": "income",
  "description": "Salary",
  "created_at": "2026-03-01 10:00:00"
}
```

All four fields required and non-empty.

**Response `201`**

```json
{
  "message": "Transaction created",
  "id": 5
}
```

`id` is the newly created transaction ID, or `null` if retrieval failed.

**Errors:** `400 Missing fields`

---

#### `POST /transaction/save` 🔑 🔒

Batch-insert multiple transactions for the authenticated user.

**Request Body**

```json
{
  "list": [
    { "amount": 20.5, "type": "income", "description": "Salary", "created_at": "2026-03-01 10:00:00" },
    { "amount": 5.0, "type": "expense", "description": "Coffee", "created_at": "2026-03-01 11:00:00" }
  ]
}
```

**Response `200`**

```json
{
  "message": "Transactions inserted successfully.",
  "ids": [6, 7]
}
```

**Errors:** `404 List of transaction is not found`

---

#### `PUT /transaction/update/:id` 🔑 🔒

Update one or more fields of a transaction. Provide any combination of fields.

**URL Params:** `id` — transaction ID

**Request Body** (any subset)

```json
{
  "amount": 30,
  "type": "expense",
  "description": "Updated description"
}
```

At least one field is required.

**Response `200`**

```json
{
  "statusCode": 200,
  "message": "Transactions has been updated successfully."
}
```

**Errors:** `500 No field found to update.`

---

#### `DELETE /transaction/delete/:id` 🔑 🔒

Delete a transaction by ID.

**URL Params:** `id` — transaction ID

**Response `200`**

```json
{ "message": "Transaction has been deleted successfully!" }
```

---

### Admin Auth

Admin routes are **not** gated by `x-api-key`. They are accessible directly.

#### `GET /admin/can-signup`

Check whether admin signup is available.

**Response `200`**

```json
{ "canSignup": true }
```

Returns `true` if no admin exists yet, `false` otherwise.

---

#### `POST /admin/signup`

Create the admin account. **Only works once** — blocked after the first admin is created.

**Request Body**

```json
{
  "username": "admin",
  "password": "strongpassword"
}
```

**Response `201`**

```json
{ "message": "Admin created successfully" }
```

**Errors:** `400 Username and password are required` · `403 Admin already exists. Only one admin is allowed.`

---

#### `POST /admin/login`

Authenticate as admin and receive a JWT.

**Request Body**

```json
{
  "username": "admin",
  "password": "strongpassword"
}
```

**Response `200`**

```json
{
  "token": "<ADMIN_JWT>"
}
```

Admin JWT payload: `{ id, username, role: "admin" }`

**Errors:** `400 Username and password are required` · `401 Invalid credentials`

---

### Admin Dashboard API

All endpoints below require `Authorization: Bearer <ADMIN_JWT>` with `role: "admin"`.

#### `GET /admin/api/stats` 🛡️

Aggregate statistics across all users and transactions.

**Response `200`**

```json
{
  "totalUsers": 42,
  "totalTransactions": 1350,
  "totalIncome": 85000.50,
  "totalExpense": 62300.00
}
```

**Errors:** `401 No admin token` · `401 Invalid admin token` · `403 Not an admin`

---

#### `GET /admin/api/users` 🛡️

List all users.

**Response `200`**

```json
[
  {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "currency": "USD",
    "avatar": null,
    "created_at": null
  }
]
```

---

#### `GET /admin/api/users/:id` 🛡️

Get a user with all their transactions.

**URL Params:** `id` — user ID

**Response `200`**

```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "currency": "USD",
  "avatar": null,
  "transactions": [
    {
      "id": 10,
      "user_id": 1,
      "amount": 20.5,
      "type": "income",
      "description": "Salary",
      "created_at": "2026-03-01 10:00:00"
    }
  ]
}
```

Transactions are ordered by `created_at DESC`.

**Errors:** `404 User not found`

---

#### `GET /admin/api/transactions` 🛡️

List all transactions (across all users) with joined user info.

**Response `200`**

```json
[
  {
    "id": 10,
    "user_id": 1,
    "amount": 20.5,
    "type": "income",
    "description": "Salary",
    "created_at": "2026-03-01 10:00:00",
    "user_name": "Alice",
    "user_email": "alice@example.com"
  }
]
```

Ordered by `created_at DESC`.

---

### Admin Danger Zone

#### `DELETE /admin/reset`

**⚠️ DESTRUCTIVE — No authentication required.**

Deletes **all** users and transactions and resets autoincrement sequences.

**Response `200`**

```json
{ "message": "Your backend has been cleaned up." }
```

---

## Admin Dashboard (Web UI)

A fully self-contained read-only dashboard is served at:

```
GET /admin/dashboard
```

Open it in a browser. It provides:

- **Login / Signup** — If no admin exists, shows a "Create Admin" form. Otherwise shows login.
- **Overview** — Stats cards (total users, transactions, income, expense) + recent users & transactions.
- **Users** — Searchable table of all users. Click "View" to see a user's details and transactions in a modal.
- **Transactions** — Searchable table of all transactions across all users with user names linked.

The dashboard is a single-page app; the JWT is stored in `localStorage` under `admin_token`. All API calls from the dashboard use the `/admin/api/*` endpoints.

---

## Project Structure

```
├── migrations/
│   ├── 001_init.sql                  # users & transactions tables
│   ├── 002_add_avatar_to_users.sql   # avatar column
│   ├── 002_add_currency_to_users.sql # currency column
│   └── 003_create_admins.sql         # admins table
├── src/
│   ├── index.js                      # Hono app, middleware chain, route wiring
│   ├── controllers/
│   │   ├── admin.auth.controller.js  # Admin signup, login, can-signup
│   │   ├── admin.controller.js       # Reset everything (danger)
│   │   ├── admin.dashboard.controller.js # Stats, users list, transactions list
│   │   ├── auth.controller.js        # Register, login, OTP
│   │   ├── health.controller.js      # Health check
│   │   ├── transaction.controller.js # CRUD for transactions
│   │   └── user.controller.js        # CRUD for users
│   ├── middleware/
│   │   ├── adminGuard.js             # Verifies admin JWT (role=admin)
│   │   ├── authGuard.js              # Verifies user JWT + DB check
│   │   ├── authorization.js          # x-api-key check (skips /admin/*)
│   │   ├── cors.js                   # CORS headers (allow all origins)
│   │   ├── error.js                  # Global error handler
│   │   ├── notFound.js               # 404 handler
│   │   ├── requestLogger.js          # Logs [METHOD] [URL]
│   │   └── validation.js             # Validates register/login payloads
│   ├── models/
│   │   ├── admin.js                  # Admin DB queries + dashboard stats
│   │   ├── transaction.js            # Transaction DB queries
│   │   └── user.js                   # User DB queries
│   ├── routes/
│   │   ├── admin.js                  # All admin routes
│   │   ├── auth.js                   # Auth routes
│   │   ├── health.js                 # Health route
│   │   ├── transaction.js            # Transaction routes
│   │   └── user.js                   # User routes
│   ├── utils/
│   │   ├── ApiError.js               # Custom error class with status
│   │   ├── asyncHandler.js
│   │   ├── errorCodes.js
│   │   ├── getTime.js
│   │   ├── hash.js                   # SHA-256 hash/compare
│   │   ├── jwt.js                    # HS256 JWT sign/verify (Web Crypto)
│   │   ├── otpGenerator.js           # Random 6-digit OTP
│   │   ├── user.js                   # getId helper
│   │   └── verifyPayload.js          # Verify JWT payload against DB
│   └── views/
│       └── dashboard.js              # Admin dashboard HTML SPA
├── wrangler.toml                     # Cloudflare Workers config
└── package.json
```

---

## Middleware Pipeline

Every request flows through:

1. **CORS** — Sets `Access-Control-Allow-Origin: *`, handles preflight `OPTIONS`
2. **Request Logger** — Logs `[METHOD] [URL]` to console
3. **API Key Authorization** — Requires `x-api-key` header. **Skipped for `/admin/*` routes.**
4. **Route handler** — May additionally apply `authGuard` (user JWT) or `adminGuard` (admin JWT)

---

## Security Notes

- `PUT /user/setpassword/:id`, `PUT /user/setcurrency/:id`, and `DELETE /user/delete/:id` are not protected by JWT — any caller with the API key can invoke them.
- `DELETE /admin/reset` has no protection at all — it can wipe the entire database.
- `GET /user/info` returns the password hash in the response.
- `PUT /transaction/update/:id` and `DELETE /transaction/delete/:id` don't verify that the transaction belongs to the authenticated user.
- Passwords are hashed with SHA-256 without salt. Use a stronger algorithm (bcrypt/argon2) for production.
- JWTs have no expiration set.
