
# Cloudflare Worker Backend API Documentation

This document describes all available API endpoints, request/response formats, and example usage in JavaScript (using `fetch`).

---

## Authentication

### Register
- **Endpoint:** `POST /auth/register`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "yourpassword"
}
```
- **Response:**
```json
{
  "message": "User registered"
}
```
- **Example (JS):**
```js
fetch('/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John Doe', email: 'john@example.com', password: 'yourpassword' })
})
.then(res => res.json())
.then(console.log);
```

### Login
- **Endpoint:** `POST /auth/login`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "yourpassword"
}
```
- **Response:**
```json
{
  "token": "<JWT_TOKEN>"
}
```
- **Example (JS):**
```js
fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'john@example.com', password: 'yourpassword' })
})
.then(res => res.json())
.then(console.log);
```

---

## Users

> All user endpoints require the `Authorization: Bearer <token>` header from login.

### List Users
- **Endpoint:** `GET /users`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
[
  { "id": 1, "name": "John Doe", "email": "john@example.com" }
]
```
- **Example (JS):**
```js
fetch('/users', {
  headers: { 'Authorization': 'Bearer <token>' }
})
.then(res => res.json())
.then(console.log);
```

### Get User by ID
- **Endpoint:** `GET /users/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{ "id": 1, "name": "John Doe", "email": "john@example.com" }
```
- **Example (JS):**
```js
fetch('/users/1', {
  headers: { 'Authorization': 'Bearer <token>' }
})
.then(res => res.json())
.then(console.log);
```

### Update User
- **Endpoint:** `PUT /users/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```
- **Response:**
```json
{ "message": "User updated" }
```
- **Example (JS):**
```js
fetch('/users/1', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'Jane Doe', email: 'jane@example.com' })
})
.then(res => res.json())
.then(console.log);
```

### Set User Avatar
- **Endpoint:** `PUT /users/:id/avatar`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "avatar": "https://res.cloudinary.com/your-cloud/image/upload/v123/avatar.jpg"
}
```
- **Response:**
```json
{ "message": "Avatar updated" }
```
- **Example (JS):**
```js
fetch('/users/1/avatar', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ avatar: 'https://res.cloudinary.com/your-cloud/image/upload/v123/avatar.jpg' })
})
.then(res => res.json())
.then(console.log);
```

---

## Transactions

> All transaction endpoints require the `Authorization: Bearer <token>` header from login.

### List Transactions
- **Endpoint:** `GET /transactions`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "amount": 100.0,
    "type": "credit",
    "description": "Salary",
    "created_at": "2026-01-31T12:00:00Z"
  }
]
```
- **Example (JS):**
```js
fetch('/transactions', {
  headers: { 'Authorization': 'Bearer <token>' }
})
.then(res => res.json())
.then(console.log);
```

### Create Transaction
- **Endpoint:** `POST /transactions`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "user_id": 1,
  "amount": 100.0,
  "type": "credit",
  "description": "Salary"
}
```
- **Response:**
```json
{ "message": "Transaction created" }
```
- **Example (JS):**
```js
fetch('/transactions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ user_id: 1, amount: 100.0, type: 'credit', description: 'Salary' })
})
.then(res => res.json())
.then(console.log);
```

---

## Health Check

### Health
- **Endpoint:** `GET /health`
- **Response:**
```json
{ "status": "ok" }
```
- **Example (JS):**
```js
fetch('/health')
  .then(res => res.json())
  .then(console.log);
```

---

## Error Responses

All errors return JSON in the following format:
```json
{
  "status": <status_code>,
  "message": "Error message"
}
```

---

## Notes
- All endpoints are relative to your deployed base URL.
- All protected endpoints require a valid JWT in the `Authorization` header.
- For avatar, use a valid Cloudinary (or other image host) URL.
- Dates are in ISO 8601 format.
