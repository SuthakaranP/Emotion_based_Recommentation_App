# Optional Python ML Microservice for Emotion Detection
# Exposes a local model endpoint at http://localhost:5000/predict

from flask import Flask, request, jsonify
from flask_cors import CORS
import os

try:
    from transformers import pipeline
    HAS_TRANSFORMERS = True
except ImportError:
    HAS_TRANSFORMERS = False

app = Flask(__name__)
CORS(app)

# Load the model pipeline if installed
classifier = None
if HAS_TRANSFORMERS:
    try:
        print("Loading Hugging Face emotion classifier pipeline...")
        # Models are loaded locally or downloaded on first run
        # j-hartmann/emotion-english-distilroberta-base classifies into: anger, disgust, fear, joy, neutral, sadness, surprise
        classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", top_k=1)
        print("Model loaded successfully!")
    except Exception as e:
        print(f"Error loading transformers pipeline: {e}")
        HAS_TRANSFORMERS = False

# Mapping Hugging Face model emotions to AuraBeat standard emotions
EMOTION_MAP = {
    'joy': 'Happy',
    'sadness': 'Sad',
    'anger': 'Angry',
    'disgust': 'Angry',
    'fear': 'Fear',
    'surprise': 'Excited',
    'neutral': 'Neutral'
}

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'Missing required string field "text"'}), 400
    
    text = data['text']
    
    # Fallback to keyword analyzer if model isn't active
    if not HAS_TRANSFORMERS or classifier is None:
        detected = analyze_keywords_fallback(text)
        return jsonify({
            'emotion': detected,
            'source': 'local_keyword_analyzer',
            'note': 'Hugging Face transformers not installed or failed to load. Using fallback keywords.'
        })

    try:
        predictions = classifier(text)
        label = predictions[0][0]['label']
        score = predictions[0][0]['score']
        
        mapped = EMOTION_MAP.get(label, 'Neutral')
        
        # Override for 'Relaxed' since distilroberta doesn't have a native 'relaxed' category
        lower_text = text.lower()
        if any(w in lower_text for w in ['relax', 'calm', 'peace', 'chill', 'soothe', 'sleep', 'rest']):
            mapped = 'Relaxed'
            
        return jsonify({
            'emotion': mapped,
            'original_label': label,
            'confidence': float(score),
            'source': 'huggingface_distilroberta'
        })
    except Exception as e:
        return jsonify({'error': f'Model inference error: {str(e)}'}), 500

def analyze_keywords_fallback(text):
    clean = text.lower()
    if any(w in clean for w in ['happy', 'joy', 'glad', 'cheerful', 'smile', 'good', 'great', 'awesome']):
        return 'Happy'
    if any(w in clean for w in ['sad', 'unhappy', 'cry', 'lonely', 'depressed', 'sorrow', 'pain', 'hurt', 'stress']):
        return 'Sad'
    if any(w in clean for w in ['relax', 'calm', 'peace', 'chill', 'sleep', 'soothe', 'rest', 'quiet']):
        return 'Relaxed'
    if any(w in clean for w in ['excit', 'thrill', 'hype', 'cant wait', 'amazing', 'energetic']):
        return 'Excited'
    if any(w in clean for w in ['angry', 'mad', 'furious', 'hate', 'annoy', 'rage', 'irritate']):
        return 'Angry'
    if any(w in clean for w in ['fear', 'scared', 'afraid', 'frighten', 'terrified', 'panic', 'spooky']):
        return 'Fear'
    return 'Neutral'

if __name__ == '__main__':
    # Listen on port 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
