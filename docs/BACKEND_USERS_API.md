# List users API

## cURL

```bash
curl --location 'http://localhost:8000/api/users?page=1&limit=20' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN_HERE'
```

Replace `YOUR_JWT_TOKEN_HERE` with the JWT returned from `POST /api/login`.

## Example JSON row

Each user object often looks like:

```json
{
  "name": "agent",
  "email": "agent@gmail.in",
  "role": "agent",
  "phone": null
}
```

## GET `/api/users`

| Query      | Optional | Description        |
|-----------|----------|--------------------|
| `page`    | yes      | Page number        |
| `limit`   | yes      | Page size          |
| `search`  | yes      | Name/email filter  |
| `role`    | yes      | admin / agent / viewer |

Response shapes supported by the app: `{ "users": [...], "total": n }`, `{ "data": [...] }`, or a plain array.

## POST `/api/users` (admin — create user)

The **Add user** button sends:

```http
POST /api/users
Authorization: Bearer <admin JWT>
Content-Type: application/json
```

```json
{
  "name": "New Agent",
  "email": "agent@example.com",
  "password": "<same SHA-256 hex hash as /api/register>",
  "role": "agent",
  "phone": "+919876543210"
}
```

- `role`: `admin` | `agent` | `viewer`
- `phone`: optional
- Password hashing on the client matches **`RegisterForm`** / **`POST /api/register`**.

If your API uses a different path (e.g. `POST /api/admin/users`) or plain text passwords, adjust `createUser` in `src/services/usersService.js`.
