# Cloudflare Worker Backend (D1)

Minimal API backend built with Hono on Cloudflare Workers and D1. It provides auth, users, transactions, and admin endpoints behind an API key gate, with optional JWT protection per route.

## Quickstart

1. Install dependencies.

   ```bash
   npm install
   ```

2. Configure environment variables in `wrangler.toml`.

   Required vars:

   - `API_KEY`: Required on every request via `x-api-key`.
   - `JWT_SECRET`: Used to sign/verify JWTs.
   - `RESEND_API_KEY`: Used by `POST /auth/otp` to send email.

3. Apply D1 migrations.

   The schema lives in `migrations/001_init.sql`. Apply it using Wrangler for your D1 database.
   ```bash
   npx wrangler d1 migrations apply DB --remote
   ```

4. Run locally.

   ```bash
   npm run start
   ```

   Default local URL (Wrangler dev): `http://127.0.0.1:8787`

## Auth Model

All routes require an API key header:

```
x-api-key: <API_KEY>
```

Protected routes also require a Bearer token:

```
authorization: Bearer <JWT>
```

JWTs are issued by `POST /auth/login` and contain `{ id, email }`. Every request on a protected route verifies the JWT and checks it against the database.

## Error Format

Errors are returned as:

```json
{ "error": "Message" }
```

## Database Schema

`migrations/001_init.sql` creates the following tables:

**users**

| Column | Type | Notes |
| --- | --- | --- |
| id | INTEGER | Primary key, autoincrement |
| name | TEXT | Required |
| email | TEXT | Required, unique |
| currency | TEXT | Required (e.g., `PKR`, `USD`) |
| password | TEXT | Required (SHA-256 hash) |

**transactions**

| Column | Type | Notes |
| --- | --- | --- |
| id | INTEGER | Primary key, autoincrement |
| user_id | INTEGER | Required, FK to users |
| amount | REAL | Required |
| type | TEXT | Required |
| description | TEXT | Optional |
| created_at | TEXT | Defaults to `datetime('now')` |

Note: The API includes an `avatar` field in several responses and updates, but the migration does not currently create an `avatar` column. Add a follow-up migration if you want to use avatars.

## API Reference

Base URL:

```
http://127.0.0.1:8787
```

All examples below include `x-api-key`. Add `authorization` where required.

### Health

**GET /health**

Returns service status.

Response:

```json
{ "status": "ok" }
```

### Auth

**POST /auth/register**

Create a new user.

Request body:

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "currency": "USD",
  "password": "secret"
}
```

Response:

```json
{ "message": "User registered" }
```

**POST /auth/login**

Authenticate a user.

Request body:

```json
{
  "email": "alice@example.com",
  "password": "secret"
}
```

Response:

```json
{
  "id": 1,
  "token": "<JWT>"
}
```

**POST /auth/otp** (Protected)

Sends an OTP to the authenticated user's email (Resend). Returns the OTP in the response on success.

Response:

```json
{ "OTP": "123456" }
```

### Users

**PUT /user/avatar** (Protected)

Set avatar URL for the authenticated user.

Request body:

```json
{ "avatar": "https://example.com/avatar.png" }
```

Response:

```json
{ "message": "Avatar updated." }
```

**GET /users**

List users.

Response:

```json
[
  { "id": 1, "name": "Alice", "email": "alice@example.com", "currency": "USD", "avatar": "" }
]
```

**GET /user/:id**

Get a user by id.

Response:

```json
{ "id": 1, "name": "Alice", "email": "alice@example.com", "currency": "USD", "avatar": "" }
```

**GET /user/info** (Protected)

Get full user record for the authenticated user. This currently returns all columns from the `users` table, including the password hash.

Response:

```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "currency": "USD",
  "password": "<sha256>",
  "avatar": ""
}
```

**PUT /user/update** (Protected)

Update name and email. If email changes, a new JWT is returned.

Request body:

```json
{ "name": "Alice A.", "email": "alice+new@example.com" }
```

Response (email changed):

```json
{ "message": "User updated", "token": "<JWT>" }
```

Response (email unchanged):

```json
{ "message": "User updated" }
```

**DELETE /user/delete/:id**

Deletes a user and their transactions by id.

Response:

```json
{
  "statusCode": 200,
  "message": "user with id: 1 has been deleted.",
  "user": { "id": 1, "name": "Alice", "email": "alice@example.com", "currency": "USD", "password": "<sha256>" }
}
```

**PUT /user/setpassword/:id**

Set a new password for the user id.

Request body:

```json
{ "password": "newSecret" }
```

Response:

```json
{ "message": "Password has been updated" }
```

**PUT /user/setcurrency/:id**

Set a new currency for the user id.

Request body:

```json
{ "currency": "USD" }
```

Response:

```json
{ "message": "Currency has been updated" }
```

### Transactions

**GET /transactions** (Protected)

Lists transactions for the authenticated user.

Response:

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

**POST /transaction/new** (Protected)

Create a transaction. The `user_id` is derived from the JWT payload.

Request body:

```json
{
  "amount": 20.5,
  "type": "income",
  "description": "Salary"
}
```

Response:

```json
{ "message": "Transaction created" }
```

**POST /transaction/save** (Protected)

Insert a list of transactions for the authenticated user. The `user_id` is derived from the JWT payload.

Request body:

```json
{
  "list": [
    { "amount": 20.5, "type": "income", "description": "Salary" },
    { "amount": 5.0, "type": "expense", "description": "Coffee" }
  ]
}
```

Response:

```json
{ "message": "Transactions inserted successfully." }
```

**PUT /transaction/update/:id** (Protected)

Update one or more fields of a transaction.

Request body (any of):

```json
{ "amount": 30 }
```

Response:

```json
{ "statusCode": 200, "message": "Transactions has been updated successfully." }
```

**DELETE /transaction/delete/:id** (Protected)

Delete a transaction by id.

Response:

```json
{ "message": "Transaction has been deleted successfully!" }
```

### Admin

**DELETE /admin/reset**

Deletes all users and transactions and resets their sequences.

Response:

```json
{ "message": "Your backend has been cleaned up." }
```

## Security Notes

- `DELETE /user/delete/:id`, `PUT /user/setpassword/:id`, `PUT /user/setcurrency/:id`, and `DELETE /admin/reset` are not protected by JWT. Any caller with the API key can invoke them.
- `GET /user/info` returns the password hash.
- Passwords are hashed with SHA-256 without salt. Use a stronger hashing approach (e.g., bcrypt/argon2) for production.
