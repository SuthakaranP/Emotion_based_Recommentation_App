# AuraBeat Backend REST API Reference Documentation

This document describes all API endpoints exposed by the Spring Boot backend server.

The default server port is **8080**, making the base URL: `http://localhost:8080`

---

## Authentication Endpoints

### 1. User Registration
- **URL:** `/api/register`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-06-21T14:30:00"
  }
  ```

### 2. User Login
- **URL:** `/api/login`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-06-21T14:30:00"
    }
  }
  ```

---

## User Endpoints (Protected)
*Requires Header: `Authorization: Bearer <token>`*

### 1. Retrieve Authenticated User Profile
- **URL:** `/api/users/profile`
- **Method:** `GET`
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-06-21T14:30:00"
  }
  ```

---

## Song Endpoints (Protected)
*Requires Header: `Authorization: Bearer <token>`*

### 1. Retrieve and Filter Songs
- **URL:** `/api/songs`
- **Method:** `GET`
- **URL Parameters (Optional):**
  - `search` (String): Search by title or artist (case-insensitive)
  - `emotion` (String): Filter by emotion (e.g. `Happy`, `Sad`, `Relaxed`, `Angry`, `Fear`, `Excited`, `Neutral`)
  - `genre` (String): Filter by genre (e.g. `Pop`, `Lo-Fi`)
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "title": "Arabic Kuthu",
      "artist": "Anirudh Ravichander",
      "emotion": "Happy",
      "genre": "Dance/Pop",
      "songUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      "thumbnail": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819..."
    }
  ]
  ```

### 2. Retrieve Specific Song
- **URL:** `/api/songs/{id}`
- **Method:** `GET`
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "title": "Arabic Kuthu",
    "artist": "Anirudh Ravichander",
    "emotion": "Happy",
    "genre": "Dance/Pop",
    "songUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "thumbnail": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819..."
  }
  ```

---

## Emotion Endpoints (Protected)
*Requires Header: `Authorization: Bearer <token>`*

### 1. Analyze and Detect Emotion
- **URL:** `/api/emotion`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "text": "I feel so amazing and full of energy today!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "emotion": "Happy"
  }
  ```

### 2. Get User Emotion Logs History
- **URL:** `/api/emotion/history`
- **Method:** `GET`
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "userInput": "I feel so amazing and full of energy today!",
      "detectedEmotion": "Happy",
      "detectedAt": "2026-06-21T14:40:00"
    }
  ]
  ```

---

## AI Chatbot Endpoints (Protected)
*Requires Header: `Authorization: Bearer <token>`*

### 1. Interact with AI Chatbot
- **URL:** `/api/chat`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "message": "I had a stressful day at work."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "detectedEmotion": "Sad",
    "botResponse": "I'm so sorry you had a stressful day. Take a deep breath. Here are some calming, relaxing songs that might help you unwind.",
    "recommendedSongs": [
      {
        "id": 7,
        "title": "Vellai Pookal",
        "artist": "A.R. Rahman",
        "emotion": "Relaxed",
        "genre": "Classical/Melody",
        "songUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        "thumbnail": "https://images.unsplash.com/photo-1507838153414-b4b713384a76..."
      }
    ]
  }
  ```

### 2. Retrieve Chat History
- **URL:** `/api/chat/history`
- **Method:** `GET`
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "userInput": "I had a stressful day at work.",
      "botResponse": "I'm so sorry you had a stressful day. Take a deep breath. Here are some calming, relaxing songs that might help you unwind.",
      "sender": "User",
      "timestamp": "2026-06-21T14:42:00"
    }
  ]
  ```

---

## Favorite Endpoints (Protected)
*Requires Header: `Authorization: Bearer <token>`*

### 1. Retrieve User Favorited Tracks
- **URL:** `/api/favorites`
- **Method:** `GET`
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "likedAt": "2026-06-21T14:45:00",
      "song": {
        "id": 1,
        "title": "Arabic Kuthu",
        "artist": "Anirudh Ravichander",
        "emotion": "Happy",
        "genre": "Dance/Pop",
        "songUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "thumbnail": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819..."
      }
    }
  ]
  ```

### 2. Toggle Favorite Status (Like/Unlike)
- **URL:** `/api/favorites`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "songId": 1
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "songId": 1,
    "isFavorite": true,
    "message": "Added to favorites"
  }
  ```

---

## Playlist Endpoints (Protected)
*Requires Header: `Authorization: Bearer <token>`*

### 1. Retrieve User Playlists
- **URL:** `/api/playlists`
- **Method:** `GET`
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "playlistName": "Happy Vibes",
      "emotion": "Happy",
      "createdDate": "2026-06-21T14:50:00",
      "songs": [
        {
          "id": 1,
          "title": "Arabic Kuthu",
          "artist": "Anirudh Ravichander"
        }
      ]
    }
  ]
  ```

### 2. Create Playlist
- **URL:** `/api/playlists`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "playlistName": "My Workout Mix",
    "emotion": "Excited",
    "songIds": [1, 2, 14]
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": 2,
    "playlistName": "My Workout Mix",
    "emotion": "Excited",
    "createdDate": "2026-06-21T14:52:00",
    "songs": [
      {
        "id": 1,
        "title": "Arabic Kuthu"
      }
    ]
  }
  ```

### 3. Add Song to Playlist
- **URL:** `/api/playlists/{id}/songs`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "songId": 3
  }
  ```
- **Response (200 OK):**
  *Returns updated playlist object.*

### 4. Delete Playlist
- **URL:** `/api/playlists/{id}`
- **Method:** `DELETE`
- **Response (200 OK):**
  ```json
  {
    "message": "Playlist deleted successfully"
  }
  ```

### 5. Remove Song from Playlist
- **URL:** `/api/playlists/{id}/songs/{songId}`
- **Method:** `DELETE`
- **Response (200 OK):**
  *Returns updated playlist object.*
