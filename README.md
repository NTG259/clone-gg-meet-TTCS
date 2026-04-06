# clone-gg-meet-TTCS

A video meeting application built with SpringBoot backend and Next.js frontend.

## API Documentation

### Base URL
```
http://localhost:8080/api
```

---

## Authentication

### 1. Google Login
**Endpoint:** `POST /auth/google`

**Description:** Authenticate user with Google OAuth token and receive an app token.

**Request Body:**
```json
{
  "credential": "google_jwt_token_here"
}
```

**Response:**
```json
{
  "token": "app_jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Status Code:** 200 OK

---

## Room Management

### 2. Create Room
**Endpoint:** `POST /room/create`

**Description:** Create a new meeting room and get connection details.

**Request Body:**
```json
{
  "participantName": "John Doe"
}
```

**Response:**
```json
{
  "data": {
    "roomCode": "MEET123ABC",
    "participantName": "John Doe",
    "token": "room_token_jwt",
    "wsUrl": "ws://localhost:8080/ws/MEET123ABC"
  },
  "message": "Call api create room success",
  "error": null,
  "status": 201
}
```

**Status Code:** 201 Created

---

### 3. Join Room
**Endpoint:** `POST /room/join`

**Description:** Join an existing meeting room with a room code.

**Request Body:**
```json
{
  "participantName": "Jane Smith",
  "roomCode": "MEET123ABC"
}
```

**Response:**
```json
{
  "data": {
    "roomCode": "MEET123ABC",
    "participantName": "Jane Smith",
    "token": "room_token_jwt",
    "wsUrl": "ws://localhost:8080/ws/MEET123ABC"
  },
  "message": "Call api join room success",
  "error": null,
  "status": 200
}
```

**Status Code:** 200 OK

---

## Error Response Format
```json
{
  "data": null,
  "message": "Error message description",
  "error": "ERROR_CODE",
  "status": 400
}
```

---

## Project Structure

### Backend (BE)
- SpringBoot 3.x with Gradle
- JWT Authentication
- WebSocket support for real-time communication
- Google OAuth integration

### Frontend (FE)
- Next.js with TypeScript
- TailwindCSS styling
- Real-time WebSocket connection