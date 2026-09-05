# AI Emotion Detection Microservice

This folder contains a lightweight Python Flask service that loads a Hugging Face Transformers pipeline for local emotion classification.

## Setup Instructions

### 1. Create a Virtual Environment
Ensure you have Python 3.8+ installed on your machine. In this directory, run:
```bash
python -m venv venv
```

### 2. Activate the Virtual Environment
- **Windows (Command Prompt):**
  ```cmd
  venv\Scripts\activate.bat
  ```
- **Windows (PowerShell):**
  ```powershell
  venv\Scripts\Activate.ps1
  ```
- **macOS/Linux:**
  ```bash
  source venv/bin/activate
  ```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Service
```bash
python app.py
```
The Flask application will start on `http://localhost:5000`.

## API Endpoint

### Predict Emotion
- **URL:** `POST http://localhost:5000/predict`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "text": "I feel so happy today!"
  }
  ```
- **Response:**
  ```json
  {
    "emotion": "Happy",
    "original_label": "joy",
    "confidence": 0.998,
    "source": "huggingface_distilroberta"
  }
  ```
