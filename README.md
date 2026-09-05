# AuraBeat: Emotion-Aware Music Generator with AI Chatbot and Voice Assistant

AuraBeat is a full-stack, AI-powered web application that detects a user's emotion, recommends music based on that mood, provides playlist management, and features an interactive AI chatbot capable of both text and voice conversations.

This system is designed as a production-ready, final-year B.Tech Information Technology capstone project.

---

## Technical Stack & Architecture

### Frontend
- **React.js & Vite** (Vite SPA template)
- **React Router DOM** (Single Page App routing)
- **Tailwind CSS v4** (Modern utility styles)
- **Framer Motion** (Fluid micro-animations)
- **Web Speech API** (Built-in Speech-To-Text and Text-To-Speech browser engines)
- **Axios** (API Client with request interceptors)

### Backend
- **Java Spring Boot 4.0.0 (Java 21)**
- **Spring Data JPA & Hibernate ORM**
- **Spring Security** (Secured endpoints, CORS configurations)
- **JSON Web Tokens (JJWT 0.12.5)** (Stateful session security)
- **REST APIs** (JSON communication layout)

### Database
- **MySQL (music_memory)** (Relational storage for logs, play queues, and accounts)

### AI Engines
1. **Google Gemini API** (via Spring Boot HTTP Client - default engine)
2. **Hugging Face Model (distilroberta)** (via local Python Flask microservice - optional local ML pipeline)
3. **Local Rules Engine** (Built-in Java fallback in case API key or python service is offline)

---

## System Architecture Flow

```
     [ Vite React Frontend ]
         │ (STT / TTS / UI)
         ▼ (HTTPS + JWT Headers)
  [ Spring Boot REST APIs ]
    /          │            \
   /           ▼             \
  /    [ MySQL Database ]     \
 /      (music_memory)         \
▼                               ▼
[ Google Gemini API ]    [ Python Flask ML Service ]
(Cloud AI Fallback)      (Local Hugging Face Roberta)
```

---

## Folder Structure

```
Emotion-Aware-music-Generator/
├── backend/                  # Spring Boot Project
│   └── app/
│       ├── src/
│       └── pom.xml           # Maven dependencies
├── frontend/                 # Vite + React Client
│   ├── src/                  # React Source Code
│   │   ├── components/       # Layouts, players
│   │   ├── context/          # Audio playback provider
│   │   ├── hooks/            # Speech recognition wrapper
│   │   ├── pages/            # View pages (Home, Dashboard...)
│   │   └── services/         # Axios wrapper
│   └── package.json          # Node dependencies
├── database/                 # Database Scripts
│   ├── schema.sql            # Table declarations
│   └── data.sql              # Music seed dataset
├── ai-service/               # Optional Python ML Service
│   ├── app.py                # Flask pipeline
│   ├── requirements.txt
│   └── README.md
├── docs/                     # Guides and Testing Collections
│   ├── API_DOCUMENTATION.md  # Detailed API specs
│   └── Postman_Collection.json
└── README.md                 # Project README
```

---

## Setup & Running Guide

### 1. Database Setup
1. Open MySQL Command Line or WorkBench.
2. Run the SQL statements inside `database/schema.sql` to initialize the database `music_memory` and create all tables.
3. Run `database/data.sql` to seed songs for all 7 emotion states.

### 2. Google Gemini API Setup (Recommended)
Set the Gemini API key in your system environment variables so Spring Boot can retrieve it:
- **Windows (CMD):**
  ```cmd
  set GEMINI_API_KEY=your_gemini_api_key_here
  ```
- **Windows (PowerShell):**
  ```powershell
  $env:GEMINI_API_KEY="your_gemini_api_key_here"
  ```
- **macOS/Linux:**
  ```bash
  export GEMINI_API_KEY="your_gemini_api_key_here"
  ```
*If no API key is specified, the application will automatically fall back to local keyword classification and pre-configured chat responses so the app is fully functional.*

### 3. Backend Setup & Run
1. Open terminal in the `backend/app` folder.
2. Compile the project:
   ```bash
   .\mvnw.cmd clean compile
   ```
3. Start the Spring Boot server:
   ```bash
   .\mvnw.cmd spring-boot:run
   ```
   The backend server will run on `http://localhost:8080`.

### 4. Frontend Setup & Run
1. Open a new terminal in the `frontend` folder.
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Launch Vite development server:
   ```bash
   npm run dev
   ```
   Open the browser at `http://localhost:5173`.

### 5. Optional Python ML Microservice Setup
To test local Hugging Face model predictions, see the instructions inside `ai-service/README.md`.
Once launched on port `5000`, the Spring Boot backend can interact with it for local predictions if configured.
