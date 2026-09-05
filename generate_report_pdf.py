import os
import subprocess
import sys

# Auto-install reportlab
try:
    import reportlab
except ImportError:
    print("Installing reportlab...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "reportlab"])

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch

def build_pdf(filename="AuraBeat_Complete_Project_Report.pdf"):
    # Target 0.5-inch margins for modern compact technical paper look
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    # Define custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#1DB954'), # AuraBeat green
        alignment=0, # Left
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=12,
        leading=14,
        textColor=colors.HexColor('#888888'),
        spaceAfter=25
    )
    
    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#0F172A'), # Charcoal / Slate
        spaceBefore=15,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#334155'),
        spaceAfter=8
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    
    table_text = ParagraphStyle(
        'TableText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#1E293B')
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white
    )

    story = []
    
    # ------------------ TITLE & OVERVIEW ------------------
    story.append(Paragraph("AURA BEAT", ParagraphStyle('Sub', fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor('#1DB954'), leading=12)))
    story.append(Paragraph("Emotion-Aware Music Generator & AI Voice Assistant", title_style))
    story.append(Paragraph("Prepared by: Project Development Team & Lead Architect<br/>Date: July 2026", subtitle_style))
    story.append(Spacer(1, 10))
    
    # ------------------ ABSTRACT & PROJECT PURPOSE ------------------
    story.append(Paragraph("1. Executive Summary & Problem Solved", h1_style))
    story.append(Paragraph(
        "AuraBeat solves a key limitation of traditional music systems: the requirement of active user interaction "
        "and manual catalog filtering which ignores real-time psychological states. AuraBeat automates music selection "
        "by introducing an <b>emotion-sensing layer</b>. The application parses facial expressions, voice sentiment, or text "
        "inputs to tailor the streaming experience to the user's emotional state. By building a unified catalog aggregation engine "
        "which merges a local db and online APIs, AuraBeat provides a seamless Web3-ready music player with natural voice feedback.",
        body_style
    ))
    
    # ------------------ PROJECT UNIQUENESS SECTION ------------------
    story.append(Paragraph("2. Project Uniqueness Matrix", h1_style))
    story.append(Paragraph(
        "The following matrix summarizes key features that distinguish AuraBeat from standard streaming apps:",
        body_style
    ))
    
    uniqueness_data = [
        [
            Paragraph("System Dimension", table_header),
            Paragraph("Traditional Music Streaming Apps", table_header),
            Paragraph("AuraBeat Solution (Uniqueness)", table_header)
        ],
        [
            Paragraph("<b>Mood Detection</b>", table_text),
            Paragraph("Relies entirely on pre-configured static playlists (chill, workout).", table_text),
            Paragraph("<b>Dynamic Multi-modal Input</b>: Runs browser-level computer vision models (TinyFaceDetector) and Web Speech sentiment filters to classify emotions in 1.2s.", table_text)
        ],
        [
            Paragraph("<b>CORS Streaming</b>", table_text),
            Paragraph("Fails due to browser origin security limits on external media CDNs.", table_text),
            Paragraph("<b>Reverse Audio Proxying</b>: A custom Spring Boot proxy streams raw audio bytes, keeping playback running locally.", table_text)
        ],
        [
            Paragraph("<b>Conversation Flow</b>", table_text),
            Paragraph("Static text search fields with zero context retention.", table_text),
            Paragraph("<b>AI Command Integration</b>: A custom action-parsing layer translates LLM tokens into executable actions (e.g. navigation, playlist creation).", table_text)
        ],
        [
            Paragraph("<b>AI Architecture</b>", table_text),
            Paragraph("Requires heavy server nodes or crashes entirely when cloud keys hit limits.", table_text),
            Paragraph("<b>Double Fallback Strategy</b>: Integrates a local python (Hugging Face transformer) service and Java pattern rules if APIs are offline.", table_text)
        ]
    ]
    
    # 540pt printable width (612 - 72)
    uniq_table = Table(uniqueness_data, colWidths=[1.2*inch, 2.5*inch, 3.8*inch])
    uniq_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F8FAFC')),
    ]))
    story.append(uniq_table)
    story.append(Spacer(1, 15))
    
    # ------------------ ARCHITECTURE SECTION ------------------
    story.append(Paragraph("3. Core Technical Architecture", h1_style))
    story.append(Paragraph(
        "AuraBeat follows a decoupled **Full-Stack microservice layout** containing three primary layers:",
        body_style
    ))
    
    arch_data = [
        [
            Paragraph("Component Layer", table_header),
            Paragraph("Technologies Used", table_header),
            Paragraph("Key Responsibilities & Implemented Features", table_header)
        ],
        [
            Paragraph("<b>Frontend (Client)</b>", table_text),
            Paragraph("React 19, Vite, Tailwind CSS v4, Lucide Icons, Framer Motion", table_text),
            Paragraph("Dynamic UI state; hooks for voice capture (webkitSpeech); face expression smoothing via a 7-reading majority vote filter.", table_text)
        ],
        [
            Paragraph("<b>Backend (Spring)</b>", table_text),
            Paragraph("Java 21, Spring Boot 4, Spring Security, Spring Data JPA, Jackson", table_text),
            Paragraph("JWT stateless sessions; BCrypt verification; Catalog aggregating service; Audio-streaming reverse proxy endpoint to bypass CORS.", table_text)
        ],
        [
            Paragraph("<b>Database</b>", table_text),
            Paragraph("MySQL, Hibernate (ORM)", table_text),
            Paragraph("7 relational schema tables: users, songs, playlists, playlist_songs, favorites, emotion_history, and chat_history.", table_text)
        ],
        [
            Paragraph("<b>AI Services</b>", table_text),
            Paragraph("Google Gemini API, Hugging Face (distilroberta), Python Flask", table_text),
            Paragraph("Dual-sentiment analysis; action parsing ([ACTION:play_song]); local script fallback parser for offline compatibility.", table_text)
        ]
    ]
    
    arch_table = Table(arch_data, colWidths=[1.5*inch, 2.0*inch, 4.0*inch])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#FFFFFF')),
    ]))
    story.append(arch_table)
    story.append(PageBreak())
    
    # ------------------ DETAILED SECTION: FRONTEND ------------------
    story.append(Paragraph("4. Frontend Deep-Dive (React Implementation)", h1_style))
    story.append(Paragraph(
        "<b>A. Music State Engine (MusicContext.jsx)</b>:<br/>"
        "Controls global audio playback. Maps standard HTML5 event hooks into properties like currentSong, shuffleList, volume, "
        "and repeat modes. Resolves stream playback in a two-stage process: replaces dummy demo track URLs on the fly from Saavn API "
        "mappings, and rewrites external CDN source links through local routes (`/api/audio/stream?url=...`) to avoid browser CORS errors.",
        body_style
    ))
    story.append(Paragraph(
        "<b>B. AI Action Manager (AIContext.jsx)</b>:<br/>"
        "Integrates native window synthesis for text speech outputs. Uses a regex parser block to decompose text vectors: "
        "reads `[ACTION:action_name] [PARAM:value]` and triggers React state actions (e.g. `play_song`, `navigate`, `create_playlist`).",
        body_style
    ))
    story.append(Paragraph(
        "<b>C. Webcam Expression Tracker (Dashboard.jsx)</b>:<br/>"
        "Dynamically downloads `face-api.js` on mount. Deploys TinyFace models to inspect video frames stream. Combats noise "
        "using a <b>Majority Vote Smoothing Buffer</b> (runs every 1200ms, stores last 7 readings, only commits the emotion when "
        "the consensus rate exceeds 3 readings). Saves the logged emotion history to `/api/emotion`.",
        body_style
    ))
    story.append(Spacer(1, 10))
    
    # ------------------ DETAILED SECTION: BACKEND ------------------
    story.append(KeepTogether([
        Paragraph("5. Backend Deep-Dive (Spring Boot Implementation)", h1_style),
        Paragraph(
            "<b>A. Stateless Security Configuration (SecurityConfig.java & Filters)</b>:<br/>"
            "Spring Security forces stateless sessions. Custom JwtAuthenticationFilter captures request headers (`Bearer <token>`), "
            "validates them using JwtTokenProvider (signing HMAC-SHA paths), and creates an authentication instance inside SecurityContextHolder.",
            body_style
        ),
        Paragraph(
            "<b>B. Catalog Caching & De-duplication (CatalogService.java)</b>:<br/>"
            "Combines records from Local Database search, JioSaavn Dev API, and Audius APIs. Implements memory caches via "
            "ConcurrentHashMaps (5-min search results, 1-hr stream URLs expiry). Deduplicates tracks in O(N) using lowercase text mapping of Title + Artist.",
            body_style
        ),
        Paragraph(
            "<b>C. CORS Audio Proxy (AudioStreamController.java)</b>:<br/>"
            "An HTTP reverse proxy. Initiates connections to external CDNs on behalf of the client browser, loads raw audio stream bytes, "
            "attaches default `Access-Control-Allow-Origin: *` configurations, and flushes output response buffers.",
            body_style
        )
    ]))
    story.append(Spacer(1, 10))
    
    # ------------------ DETAILED SECTION: PYTHON SERVICE ------------------
    story.append(KeepTogether([
        Paragraph("6. Python Flask SERVICE (ai-service/app.py)", h1_style),
        Paragraph(
            "<b>DistilRoBERTa Emotion Classifier</b>:<br/>"
            "A local Python microservice exposed on port 5000. Leverages Hugging Face's pipeline model (`j-hartmann/emotion-english-distilroberta-base`) "
            "to classify incoming chat strings into 7 classes (Joy, Anger, Fear, Sadness, Surprise, Disgust, Neutral). It uses a local regex keywords engine "
            "fallback to predict emotions if the DL model fails due to host memory limits. It responds to POST calls at `/api/analyze`.",
            body_style
        )
    ]))
    story.append(Spacer(1, 10))

    # ------------------ DETAILED SECTION: DATABASE ------------------
    story.append(KeepTogether([
        Paragraph("7. Database Schema & Query Optimization", h1_style),
        Paragraph(
            "The MySQL database model (<b>music_memory</b>) is mapped using Hibernate JPA:<br/>"
            "• <b>users</b>: PK `id`, Unique Index `email`, `password` (hashed).<br/>"
            "• <b>songs</b>: PK `id`, Fields: `title`, `artist`, `emotion` (Indexed for search speed), `genre`, `song_url`.<br/>"
            "• <b>playlists</b>: PK `id`, FK `user_id` references `users(id)` (On Delete Cascade).<br/>"
            "• <b>playlist_songs</b>: Junction table mapping composite key `(playlist_id, song_id)`. Many-to-Many.<br/>"
            "• <b>favorites</b>: PK `id`, FK `user_id`, FK `song_id`. Multi-column Unique Index prevents duplicate likes.",
            body_style
        )
    ]))
    story.append(Spacer(1, 10))

    # ------------------ DETAILED SECTION: PROBLEM SOLVED ------------------
    story.append(KeepTogether([
        Paragraph("8. Critical System Challenges & Solutions", h1_style),
        Paragraph(
            "<b>1. Frontend WebSpeech Stuttering Bug</b>:<br/>"
            "<i>Problem</i>: Chrome webkitSpeechRecognition turns off after short pauses. <br/>"
            "<i>Solution</i>: Disabled continuous mode, captured `onend` logs, and forced-restarted calls asynchronously using a React reference hook.",
            body_style
        ),
        Paragraph(
            "<b>2. Multi-Provider Speed Lag</b>:<br/>"
            "<i>Problem</i>: Querying third-party audio wrapper APIs took up to 3 seconds. <br/>"
            "<i>Solution</i>: Utilized dual ConcurrentHashMap caching queues inside backend Catalog Services, minimizing API calls for repeated queries.",
            body_style
        )
    ]))
    
    # Build Document
    doc.build(story)
    print(f"PDF Successfully generated: {filename}")

if __name__ == "__main__":
    build_pdf()
