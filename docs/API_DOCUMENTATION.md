📖 API Documentation - Diet Management System

OpenAPI/Swagger Specification

Backend (NestJS) exposes RESTful endpoints documented with Swagger.

Swagger UI available at /api/docs.

API versioning via URI (e.g., /api/v1/clients).

Authentication Flow

Login: User authenticates with email/password.

JWT Issuance: Backend issues access and refresh tokens.

Authorization: Role-based (Admin, Dietitian, Client) enforced via NestJS guards.

Token Refresh: Refresh endpoint to renew access tokens.

Endpoints Examples

POST /api/v1/auth/login

Request:

{
  "email": "dietitian@example.com",
  "password": "secret"
}

Response:

{
  "accessToken": "jwt-token",
  "refreshToken": "jwt-refresh"
}

GET /api/v1/clients

Response:

[
  {
    "id": "c1",
    "name": "John Doe",
    "dietitianId": "d1"
  }
]

POST /api/v1/dietplans

Request:

{
  "clientId": "c1",
  "dietitianId": "d1",
  "meals": [
    { "name": "Breakfast", "calories": 400 }
  ]
}

Response:

{
  "id": "dp1",
  "clientId": "c1",
  "dietitianId": "d1",
  "meals": [
    { "id": "m1", "name": "Breakfast", "calories": 400 }
  ]
}

Error Response Catalog

401 Unauthorized: Invalid or expired JWT.

403 Forbidden: User lacks required role.

404 Not Found: Resource does not exist.

422 Unprocessable Entity: Validation error.

500 Internal Server Error: Unexpected server error.