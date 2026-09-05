import os
import subprocess
import sys

# Ensure reportlab is present
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

def run_pdf_generation(filename="AuraBeat_Complete_Software_Project_Report.pdf"):
    print("Beginning generation of AuraBeat 22-Section Software Project Report...")
    
    # Establish modern thin margins for max print area (0.5 inch / 36 pt)
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    # Setup custom color tokens
    PRIMARY_COLOR = colors.HexColor('#1DB954') # AuraBeat Green
    TEXT_DARK = colors.HexColor('#0F172A')     # Charcoal Slate
    TEXT_MUTED = colors.HexColor('#64748B')    # Slate Gray
    BORDER_COLOR = colors.HexColor('#E2E8F0')  # Light Gray
    BG_LIGHT = colors.HexColor('#F8FAFC')      # Off-white
    
    # Text styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=PRIMARY_COLOR,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10,
        leading=12,
        textColor=TEXT_MUTED,
        spaceAfter=15
    )
    
    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=TEXT_DARK,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#334155'),
        spaceAfter=6
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
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#1E293B')
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    story = []
    
    # ------------------ COVER HEADER ------------------
    story.append(Paragraph("<b>AURA BEAT: SOFTWARE SPECIFICATION & SYSTEM ANALYSIS REPORT</b>", ParagraphStyle('Sub', fontName='Helvetica-Bold', fontSize=8, textColor=PRIMARY_COLOR, leading=10)))
    story.append(Paragraph("Complete Technical Project Dossier", title_style))
    story.append(Paragraph("Subject: Formal Technical Onboarding Report for Full-Stack Capstone Developers<br/>Scope: Complete Source Code Audit & Engineering Specifications", subtitle_style))
    story.append(Spacer(1, 5))
    
    # ------------------ 1. PROJECT OVERVIEW ------------------
    story.append(Paragraph("1. Project Overview & Scope Specifications", h1_style))
    story.append(Paragraph(
        "<b>Project Title:</b> AuraBeat: Emotion-Aware Music Generator & Voice Assistant.<br/>"
        "<b>Project Objective:</b> Implement an interactive full-stack app which uses client-side computer vision models, browser speech synthesizers, and backend sentiment extraction to adapt music playing lists to users' emotional states.<br/>"
        "<b>Problem Statement:</b> Traditional music providers require constant user screen interaction and manual search inputs. This isolates playback loops from the user's emotional and physical environment.<br/>"
        "<b>Existing System Details:</b> Streaming platforms (like Spotify or YouTube Music) supply prepackaged playlist buckets, which remain static until the user manually switches albums.<br/>"
        "<b>Limitations of Existing System:</b> High screen-time demands, lack of accessibility for physically restricted users, zero feedback on biometric visual emotions, and CORS blocking risks for developers integrating external audio source APIs.<br/>"
        "<b>Proposed System:</b> AuraBeat combines real-time expression detection (face-api.js), NLP voice controllers (Gemini API), and an HTTP audio reverse-proxy (Spring Boot) backplane to automate hands-free music matches without origin CORS errors.<br/>"
        "<b>Benefits of the Proposed System:</b> Zero screen interaction via STT/TTS loops; local, secure user credential validation; off-loading AI prompt expenses using multi-layered keyword fallback parsers; and visual metric displays.<br/>"
        "<b>Target Users:</b> General desktop music listeners, visually or physically restricted users, and developers exploring client-side neural metrics integrations.<br/>"
        "<b>Project Scope:</b> Integrates a Java 21 Spring Boot core, a Vite + React 19 Frontend single page application (SPA), and a Python Flask sentiment Classifier.<br/>"
        "<b>Project Goals:</b> Real-time facial scan response under 1.5s, 100% CORS-free playback streaming, session-level memory retention via relational DB storage, and robust error recovery.<br/>"
        "<b>Real-world Applications:</b> Hands-free music playback in cars, accessibility players for visually restricted users, and mood-adaptive tracks in wellness suites.<br/>"
        "<b>Future Scope:</b> Miginating face model processing offline to Edge devices, integrating heart rate metrics via smartwatch APIs, and distributed caching in Redis.",
        body_style
    ))
    
    # ------------------ 2. PROJECT WORKFLOW ------------------
    story.append(Paragraph("2. Detailed Project Workflows", h1_style))
    story.append(Paragraph(
        "<b>A. User Flow</b>: The user opens the React client $\\rightarrow$ authenticates via Login $\\rightarrow$ hits Dashboard $\\rightarrow$ either verbalizes searches, types message in chat, or scans face expression $\\rightarrow$ system announces actions $\\rightarrow$ matching music plays.<br/>"
        "<b>B. Request Flow</b>: Frontend Axios Client resolves payload forms $\\rightarrow$ sets authorization header with bearer tokens $\\rightarrow$ hits Backend Spring Security filters $\\rightarrow$ resolves endpoints controller handlers.<br/>"
        "<b>C. Backend Flow</b>: Controller maps REST requests to target service (e.g. ChatService) $\\rightarrow$ retrieves logs $\\rightarrow$ evaluates token parameters $\\rightarrow$ calls Gemini API for semantic classifications $\\rightarrow$ resolves matched songs lists $\\rightarrow$ returns unified JSON arrays.<br/>"
        "<b>D. Database Flow</b>: Calls UserRepository to retrieve logged user mappings $\\rightarrow$ updates EmotionHistory registries $\\rightarrow$ fetches matches via `SongRepository.findByEmotion()` using Spring Data hibernate bindings.<br/>"
        "<b>E. Python / AI Flow</b>: Flask app receives chat strings at `/api/analyze` $\\rightarrow$ loads a DistilRoBERTa model pipeline $\\rightarrow$ outputs emotion lists (Neutral/Joy/Anger/etc.) $\\rightarrow$ falls back to word match scripts if host GPU/RAM hits limits.<br/>"
        "<b>F. Response Flow</b>: AI engine formats instructions $\\rightarrow$ client context speaks text outputs using browser SpeechSynthesis $\\rightarrow$ updates music play queues $\\rightarrow$ changes tracks.",
        body_style
    ))
    
    # ------------------ 3. COMPLETE ARCHITECTURE ------------------
    story.append(Paragraph("3. System Architecture Specification", h1_style))
    story.append(Paragraph(
        "AuraBeat implements a <b>decoupled, distributed layered architecture</b> with a central MVC backend and strategy-driven music source provider interfaces.",
        body_style
    ))
    
    # Render ASCII Architecture Diagram
    arch_diagram = [
        [Paragraph("<b>[Client Web Browser]</b> React 19 SPA (Main Viewport, Web Audio Player, Webcam Frame Scanner, Speech Rec Hooks)", table_text)],
        [Paragraph(" &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; | Axios HTTP JSON Requests (JWT Bearer Token Bearer Authorization Header)", table_text)],
        [Paragraph("<b>[Backend Spring Boot Framework]</b> REST Controller Layer (AuthController, ChatController, SongController, AudioStreamController)", table_text)],
        [Paragraph(" &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; | Business & AI Integration Service Layer", table_text)],
        [Paragraph(" +--> <b>GeminiService</b> (HTTPS POST Request JSON -> Google Gemini 2.5 Flash API endpoint)<br/>"
                   " +--> <b>CatalogService</b> (aggregates providers: LocalProvider, SaavnProvider, AudiusProvider)<br/>"
                   " +--> <b>EmotionService</b> (tracks and parses user sentiments; contains Local Keyword Fallback Engine)<br/>"
                   " +--> <b>AudioStreamController</b> (Reverse Proxy pipelines raw audio bytes from Saavn CDN to bypass CORS)", table_text)],
        [Paragraph(" &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; | Hibernate ORM JPA Interfaces", table_text)],
        [Paragraph("<b>[Database Storage]</b> MySQL Server (Identified schema instance: <i>music_memory</i> containing 7 relational tables)", table_text)],
        [Paragraph(" &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; | Asynchronous REST Fallback calls (Port 5000)", table_text)],
        [Paragraph("<b>[Python AI Sentiment Engine]</b> Flask Microservice (Runs local emotion classification using DistilRoBERTa Transformers pipeline)", table_text)]
    ]
    diag_table = Table(arch_diagram, colWidths=[7.0*inch])
    diag_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F1F5F9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(diag_table)
    story.append(Spacer(1, 10))

    # Explain Responsibility of each layer
    story.append(Paragraph(
        "<b>Responsibilities of each layer:</b><br/>"
        "• <b>Client SPA</b>: Manages UI, captures mic and webcam input, runs client-side ML models, and resolves proxy streams.<br/>"
        "• <b>API Controllers</b>: Validates input, checks JWT headers, and handles HTTP response types.<br/>"
        "• <b>Service Layer</b>: Contains the core business logic, API wrappers, caches, and fallbacks.<br/>"
        "• <b>Repository/JPA</b>: Standardizes Hibernate database interactions without manual SQL creation.<br/>"
        "• <b>Python Microservice</b>: Evaluates expressions locally if Google Gemini API hits rate limits or is offline.",
        body_style
    ))
    story.append(PageBreak())
    
    # ------------------ 4. COMPLETE FOLDER STRUCTURE ------------------
    story.append(Paragraph("4. Folder Structure & Subdirectory Mappings", h1_style))
    story.append(Paragraph(
        "The project is divided into four main folders. Below is their purpose and interactions:",
        body_style
    ))
    
    folder_data = [
        [Paragraph("Directory Path", table_header), Paragraph("Key Files Inside", table_header), Paragraph("Purpose and Responsibilities", table_header)],
        [
            Paragraph("<b>frontend/src/context</b>", table_text),
            Paragraph("MusicContext.jsx, AIContext.jsx", table_text),
            Paragraph("Manages global application state, web audio references, and AI action command mappings.", table_text)
        ],
        [
            Paragraph("<b>frontend/src/hooks</b>", table_text),
            Paragraph("useSpeechRecognition.js", table_text),
            Paragraph("Microphone speech recognition interface. Solves Chrome's speech recognition truncation bug.", table_text)
        ],
        [
            Paragraph("<b>frontend/src/pages</b>", table_text),
            Paragraph("Dashboard.jsx, Register.jsx, Login.jsx, Playlist.jsx", table_text),
            Paragraph("Handles page styling, webcam expression capture, custom playlists creation, and user dashboard metrics.", table_text)
        ],
        [
            Paragraph("<b>backend/app/src/main/.../config</b>", table_text),
            Paragraph("SecurityConfig.java, JwtAuthenticationFilter.java, JwtTokenProvider.java", table_text),
            Paragraph("Defines CORS credentials, intercepts Bearer tokens, and sets security configuration.", table_text)
        ],
        [
            Paragraph("<b>backend/app/src/main/.../controller</b>", table_text),
            Paragraph("AuthController.java, SongController.java, ChatController.java, AudioStreamController.java", table_text),
            Paragraph("REST controllers. Handle client requests, JSON operations, and audio CORS bypass streaming.", table_text)
        ],
        [
            Paragraph("<b>backend/app/src/main/.../service</b>", table_text),
            Paragraph("GeminiService.java, CatalogService.java, EmotionService.java, UserService.java", table_text),
            Paragraph("Handles the core business logic, third-party API integration, keyword fallbacks, and user authentication.", table_text)
        ],
        [
            Paragraph("<b>ai-service</b>", table_text),
            Paragraph("app.py, requirements.txt", table_text),
            Paragraph("Local Python sentiment microservice. Classifies text locally using transformers.", table_text)
        ],
        [
            Paragraph("<b>database</b>", table_text),
            Paragraph("schema.sql, data.sql", table_text),
            Paragraph("MySQL database initial configuration scripts.", table_text)
        ]
    ]
    folder_table = Table(folder_data, colWidths=[1.8*inch, 2.2*inch, 3.5*inch])
    folder_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,1), (-1,-1), BG_LIGHT),
    ]))
    story.append(folder_table)
    story.append(Spacer(1, 10))

    # ------------------ 5. FRONTEND REPORT ------------------
    story.append(Paragraph("5. Frontend Technical Audit (React/Vite)", h1_style))
    story.append(Paragraph(
        "AuraBeat's frontend is a single-page application built on <b>React 19, Vite 8, and Tailwind CSS v4</b>. It is fully responsive, "
        "and optimizes audio playback using a programmatic context wrapper.",
        body_style
    ))
    
    fe_data = [
        [Paragraph("Feature Implemented", table_header), Paragraph("Key Files Involved", table_header), Paragraph("Technical Working & Integration Flow", table_header)],
        [
            Paragraph("<b>Audio Playback & Queue Manager</b>", table_text),
            Paragraph("MusicContext.jsx", table_text),
            Paragraph("Programmatically controls a DOM-level Audio instance. Implements shuffle and repeat loops, and dynamically routes CDN URLs through a local backend proxy to bypass CORS restrictions.", table_text)
        ],
        [
            Paragraph("<b>Real-time Face expression scanner</b>", table_text),
            Paragraph("Dashboard.jsx", table_text),
            Paragraph("Loads face-api.js dynamically in the browser. Uses TinyFaceDetector to classify camera frames. Employs a 7-reading voting method to filter out classification noise.", table_text)
        ],
        [
            Paragraph("<b>VibeBot AI Voice Assistant</b>", table_text),
            Paragraph("AIContext.jsx, useSpeechRecognition.js", table_text),
            Paragraph("Transcribes audio via useSpeechRecognition. Evaluates response strings, and uses browser speechSynthesis to read responses aloud to the user.", table_text)
        ],
        [
            Paragraph("<b>Custom Playlist Mixer</b>", table_text),
            Paragraph("Playlist.jsx", table_text),
            Paragraph("Enables custom playlist creation and tags songs with specific emotions. Users can download their playlist configurations as JSON documents.", table_text)
        ],
        [
            Paragraph("<b>Stateless API Client</b>", table_text),
            Paragraph("services/api.js", table_text),
            Paragraph("Axios instance configured with interceptors. Automatically injects authorization headers, and redirects users to /login if a response returns a 401/403 status.", table_text)
        ]
    ]
    fe_table = Table(fe_data, colWidths=[1.8*inch, 1.7*inch, 4.0*inch])
    fe_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,1), (-1,-1), colors.white),
    ]))
    story.append(fe_table)
    story.append(Spacer(1, 10))
    
    # ------------------ 6. BACKEND REPORT ------------------
    story.append(Paragraph("6. Backend Technical Audit (Spring Boot)", h1_style))
    story.append(Paragraph(
        "The Java backend runs on <b>Java 21 and Spring Boot 4</b>. It is modular and handles data retrieval, security filters, API resolution, and third-party wrappers.",
        body_style
    ))
    
    be_data = [
        [Paragraph("Component", table_header), Paragraph("Implements", table_header), Paragraph("Responsibility & Work Flow", table_header)],
        [
            Paragraph("<b>Security Config</b>", table_text),
            Paragraph("SecurityConfig.java, JwtAuthenticationFilter, JwtTokenProvider", table_text),
            Paragraph("Disables CSRF, checks for JWT bearer tokens in request headers, validates signatures using HMAC-SHA keys, and populates SecurityContextHolder.", table_text)
        ],
        [
            Paragraph("<b>Audio Controller</b>", table_text),
            Paragraph("AudioStreamController.java", table_text),
            Paragraph("A reverse proxy for audio streaming. Resolves external audio URLs, fetches the byte stream, and flushes output response buffers with CORS-permitted headers.", table_text)
        ],
        [
            Paragraph("<b>Music Catalog Service</b>", table_text),
            Paragraph("CatalogService.java, SaavnProvider.java", table_text),
            Paragraph("Combines search results from the local database and third-party APIs. Caches search queries for 5 minutes and streaming URLs for 1 hour to prevent redundant API queries.", table_text)
        ],
        [
            Paragraph("<b>AI Processing Service</b>", table_text),
            Paragraph("ChatService.java, EmotionService.java, GeminiService.java", table_text),
            Paragraph("Queries Gemini 2.5 Flash for emotional classification and action parsing. Falls back to a local keyword-matching engine if the Gemini API is offline.", table_text)
        ]
    ]
    be_table = Table(be_data, colWidths=[1.3*inch, 2.2*inch, 4.0*inch])
    be_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#334155')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,1), (-1,-1), BG_LIGHT),
    ]))
    story.append(be_table)
    story.append(PageBreak())

    # ------------------ 7. DATABASE REPORT ------------------
    story.append(Paragraph("7. Database Schema & Relational Specifications", h1_style))
    story.append(Paragraph(
        "AuraBeat utilizes **MySQL** as its database engine. Below is the relational mapping of the `music_memory` schema:",
        body_style
    ))
    
    # Render ASCII ERD
    erd_diagram = [
        [Paragraph("<b>[users]</b> (id PK | name | email UNIQUE | password | created_at)", table_text)],
        [Paragraph(" &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;| 1 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;| 1 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;| 1", table_text)],
        [Paragraph(" &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;| N &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;| N &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;| N (Cascade on delete)", table_text)],
        [Paragraph(" &nbsp; &nbsp; <b>[playlists]</b> &nbsp; &nbsp; &nbsp; &nbsp; <b>[favorites]</b> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <b>[emotion_history]</b> / <b>[chat_history]</b>", table_text)],
        [Paragraph(" &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;| 1 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;| N &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; (user_id FK references users.id)", table_text)],
        [Paragraph(" &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;| N (playlist_songs Junction table: playlid_id FK, song_id FK)", table_text)],
        [Paragraph(" &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;| 1", table_text)],
        [Paragraph("<b>[songs]</b> (id PK | title | artist | emotion INDEX | genre | song_url | thumbnail | language)", table_text)]
    ]
    erd_table = Table(erd_diagram, colWidths=[7.0*inch])
    erd_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FAF5FF')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#D8B4FE')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(erd_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "<b>Important Relational Mappings:</b><br/>"
        "• <b>playlist_songs</b>: A junction table that maps composite key `(playlist_id, song_id)` to enable a Many-to-Many relationship between playlists and songs.<br/>"
        "• <b>favorites</b>: Enforces a multi-column unique constraint `(user_id, song_id)` to prevent users from adding duplicate likes to the same song.<br/>"
        "• <b>On Delete Cascade</b>: Restrict constraints are configured as Cascade. If a user deletes their profile, their playlists, favorite mappings, and emotion logs are automatically deleted.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # ------------------ 8. PYTHON / AI REPORT ------------------
    story.append(Paragraph("8. Python & Artificial Intelligence Report", h1_style))
    story.append(Paragraph(
        "AuraBeat employs **Google Gemini 2.5 Flash** for sentiment analysis and chatbot actions, with a local Python microservice as a fallback.",
        body_style
    ))
    story.append(Paragraph(
        "<b>A. Google Gemini Service</b>:<br/>"
        "Requests are formatted as system instructions and sent to Gemini: <i>Classify user intent and return structured commands only: [ACTION:navigate] [PARAM:route], [ACTION:play_song] [PARAM:emotion query].</i> "
        "Java's HttpClient sends a POST request with the user's message and history log, and the response is parsed using Jackson ObjectMapper nodes.",
        body_style
    ))
    story.append(Paragraph(
        "<b>B. Python Flask Service (ai-service/app.py)</b>:<br/>"
        "Exposes a local Flask API on port 5000. It uses Hugging Face's pipeline model (`j-hartmann/emotion-english-distilroberta-base`) "
        "to classify sentiment into 7 emotions (Joy, Sadness, Anger, Fear, Surprise, Disgust, Neutral). To prevent application failure in memory-restricted environments, "
        "it contains a local keyword regex matcher fallback to guess the sentiment from key terms (e.g. relax, sad, angry).",
        body_style
    ))
    story.append(Paragraph(
        "<b>C. Browser voice controls</b>:<br/>"
        "Client speech transcriptions are captured using `webkitSpeechRecognition`. Short, silent pauses cause standard speech APIs to terminate. "
        "AuraBeat resolves this by disabling continuous speech recognition and restarting automatically after each transcription using a component reference check (`shouldRestartRef.current`).",
        body_style
    ))
    story.append(Spacer(1, 10))

    # ------------------ 9. DEPENDENCY ANALYSIS ------------------
    story.append(Paragraph("9. Dependency Audit & Possible Alternatives", h1_style))
    
    dep_data = [
        [Paragraph("Dependency", table_header), Paragraph("Environment", table_header), Paragraph("Project Utilizations", table_header), Paragraph("Possible Alternatives", table_header)],
        [Paragraph("<b>framer-motion</b>", table_text), Paragraph("frontend", table_text), Paragraph("Smooth dashboard transitions & modal fade-outs.", table_text), Paragraph("React spring / CSS keyframes", table_text)],
        [Paragraph("<b>axios</b>", table_text), Paragraph("frontend", table_text), Paragraph("API HTTP client. Automatically injects authorization headers.", table_text), Paragraph("Native Fetch API", table_text)],
        [Paragraph("<b>JJwt (jjwt-api)</b>", table_text), Paragraph("backend", table_text), Paragraph("Generates and validates JWT tokens.", table_text), Paragraph("Auth0 Java-JWT", table_text)],
        [Paragraph("<b>Spring Security</b>", table_text), Paragraph("backend", table_text), Paragraph("Secures REST controllers using statless filters.", table_text), Paragraph("Apache Shiro / Custom filters", table_text)],
        [Paragraph("<b>transformers</b>", table_text), Paragraph("python", table_text), Paragraph("Loads DistilRoBERTa model pipeline.", table_text), Paragraph("NLTK / TextBlob Sentiment", table_text)]
    ]
    dep_table = Table(dep_data, colWidths=[1.3*inch, 1.2*inch, 3.2*inch, 1.8*inch])
    dep_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,1), (-1,-1), BG_LIGHT),
    ]))
    story.append(dep_table)
    story.append(PageBreak())

    # ------------------ 10. API DOCUMENTATION ------------------
    story.append(Paragraph("10. API Documentation (AuraBeat REST endpoints)", h1_style))
    
    api_data = [
        [Paragraph("API Endpoint Route", table_header), Paragraph("Method", table_header), Paragraph("Controller Layer", table_header), Paragraph("Authentication?", table_header), Paragraph("JSON Request/Response Payload Types", table_header)],
        [
            Paragraph("<b>/api/register</b>", table_text), Paragraph("POST", table_text), Paragraph("AuthController", table_text), Paragraph("No", table_text),
            Paragraph("Req: {name, email, password}<br/>Res: jwtToken, user details", table_text)
        ],
        [
            Paragraph("<b>/api/login</b>", table_text), Paragraph("POST", table_text), Paragraph("AuthController", table_text), Paragraph("No", table_text),
            Paragraph("Req: {email, password}<br/>Res: jwtToken, user details", table_text)
        ],
        [
            Paragraph("<b>/api/chat</b>", table_text), Paragraph("POST", table_text), Paragraph("ChatController", table_text), Paragraph("Yes (Bearer)", table_text),
            Paragraph("Req: {message}<br/>Res: botResponse, detectedEmotion, recommendedSongs", table_text)
        ],
        [
            Paragraph("<b>/api/emotion</b>", table_text), Paragraph("POST", table_text), Paragraph("EmotionController", table_text), Paragraph("Yes (Bearer)", table_text),
            Paragraph("Req: {text}<br/>Res: emotion (e.g. Happy, Sad)", table_text)
        ],
        [
            Paragraph("<b>/api/songs</b>", table_text), Paragraph("GET", table_text), Paragraph("SongController", table_text), Paragraph("Yes (Bearer)", table_text),
            Paragraph("Params: emotion, genre, search, language<br/>Res: Array of song objects", table_text)
        ],
        [
            Paragraph("<b>/api/audio/stream</b>", table_text), Paragraph("GET", table_text), Paragraph("AudioStreamController", table_text), Paragraph("No", table_text),
            Paragraph("Params: url (JioSaavn CDN path)<br/>Res: Raw audio bytes pipeline output", table_text)
        ]
    ]
    api_table = Table(api_data, colWidths=[1.8*inch, 0.7*inch, 1.4*inch, 1.1*inch, 2.5*inch])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,1), (-1,-1), colors.white),
    ]))
    story.append(api_table)
    story.append(Spacer(1, 10))

    # ------------------ 11. SECURITY REPORT ------------------
    story.append(Paragraph("11. Security Implementation Report", h1_style))
    story.append(Paragraph(
        "AuraBeat implements a <b>stateless security design</b> using Spring Security. Below is the details of this workflow:<br/>"
        "• <b>Authentication Filter</b>: The `JwtAuthenticationFilter` intercepts requests. It parses the authorization header, verifies token signatures, and populates Spring's context details.<br/>"
        "• <b>Password Security</b>: Passwords are encrypted before database commit using `BCryptPasswordEncoder` (configured with a work factor of 10). matches are validated via: `encoder.matches(raw, hashed)`.<br/>"
        "• <b>CORS (Cross-Origin Resource Sharing)</b>: Backend controllers allow browser resource requests via `@CrossOrigin(origins = \"*\")` annotations. To avoid CORS restrictions when streaming, audio files are proxied through local backend ports.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # ------------------ 12. ALGORITHMS AND BUSINESS LOGIC ------------------
    story.append(Paragraph("12. Deployed Algorithms & Logic", h1_style))
    story.append(Paragraph(
        "<b>A. Webcam Recognition Smoothing Algorithm</b>:<br/>"
        "Raw webcam detections can struggle with expression flickering. AuraBeat resolves this using a **queue smoothing filter**:<br/>"
        "1. Real-time predictions are captured from the webcam via face-api.js every 1.2 seconds.<br/>"
        "2. Predictions with a confidence score under 0.40 (or 0.60 for Neutral) are discarded.<br/>"
        "3. Decisive predictions are added to a queue containing the last 7 readings.<br/>"
        "4. A majority vote is calculated over the queue once it contains at least 3 entries, determining the user's emotion.<br/>"
        "5. The system commits the detected emotion only if it differs from the previously logged emotion, reducing duplicate API calls.",
        body_style
    ))
    story.append(Paragraph(
        "<b>B. Catalog Caching & Deduplication Algorithm (CatalogService)</b>:<br/>"
        "Aggregates search results dynamically from the local database, JioSaavn Dev API, and Audius APIs. To prevent rate limits "
        "and improve response times, it caches search queries for 5 minutes and streaming URLs for 1 hour. It deduplicates tracks "
        "in $O(N)$ using lowercase Title + Artist comparisons. Local database results are prioritized and displayed first.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # ------------------ 13. DESIGN PATTERNS ------------------
    story.append(Paragraph("13. Software Design Patterns in Practice", h1_style))
    story.append(Paragraph(
        "• <b>Proxy Pattern</b>: Implemented in `AudioStreamController.java` to act as an HTTP reverse proxy. It fetches external audio bytes from CDNs and streams them to bypass CORS restrictions.<br/>"
        "• <b>Strategy Pattern</b>: Reflected in the `MusicProvider` interface. Switchable implementations (`SaavnProvider`, `AudiusProvider`, `LocalProvider`) execute dynamically under `CatalogService` based on available APIs.<br/>"
        "• <b>Singleton Pattern</b>: Implemented by Spring Boot's Enclosing IOC Container, which handles service initializations (e.g. `GeminiService`).<br/>"
        "• <b>Observer Pattern</b>: Implemented in `MusicContext` to monitor HTML5 audio player properties and push updates to the UI.",
        body_style
    ))
    story.append(PageBreak())

    # ------------------ 14. CONFIGURATION REPORT ------------------
    story.append(Paragraph("14. System Configuration Reports", h1_style))
    story.append(Paragraph(
        "• <b>application.properties</b>: Configures the MySQL connection string (`spring.datasource.url=jdbc:mysql://localhost:3306/music_memory`), metadata properties (`jpa.hibernate.ddl-auto=update`), JWT secret keys, and `gemini.api.key`.<br/>"
        "• <b>vite.config.js</b>: Handles compilation and React 19 plugins.<br/>"
        "• <b>package.json</b>: Manages dependencies (e.g. Framer Motion, Axios, Tailwind CSS v4, Lucide Icons).<br/>"
        "• <b>pom.xml</b>: Manages Maven dependencies (e.g. Spring Security, Spring Boot Web, Spring Data JPA, Hibernate, JJWT).<br/>"
        "• <b>requirements.txt</b>: Configures python dependencies (Flask, Flask-CORS, Transformers, Torch, Sentencepiece, Werkzeug).",
        body_style
    ))
    
    # ------------------ 15. EXECUTION FLOW ------------------
    story.append(Paragraph("15. Component Execution Flow", h1_style))
    story.append(Paragraph(
        "<b>1. Application Startup:</b> Spring Boot initialises, reads configurations, validates the database connection, "
        "and database seed scripts map initial entries. The Vite React client starts up, checks for cached user credentials in local storage, "
        "and redirects the user to the Login page.<br/>"
        "<b>2. User Login:</b> User submits their email and password $\\rightarrow$ the login controller validates credentials via BCrypt $\\rightarrow$ a JWT is generated and returned to the client $\\rightarrow$ the client saves the token in local storage and redirects the user to the Dashboard.<br/>"
        "<b>3. Speech Request Processing:</b> User speaks a query $\\rightarrow$ client transcribes it using `useSpeechRecognition` $\\rightarrow$ Axios sends a POST request with the transcription to `/api/chat` $\\rightarrow$ the backend parses the query's emotion and intent using the Gemini API $\\rightarrow$ matching songs are queried and returned to the client $\\rightarrow$ the browser speaks the response aloud and plays the matching tracks.",
        body_style
    ))

    # ------------------ 16. ERROR HANDLING ------------------
    story.append(Paragraph("16. System Error Handling & Resilience", h1_style))
    story.append(Paragraph(
        "• <b>Frontend:</b> Axios response interceptors catch 401/403 errors, clear local storage, and redirect users to log in if their token has expired. "
        "The Dashboard includes a retry banner if catalog API requests fail.<br/>"
        "• <b>Backend REST Exception Handlers:</b> Controllers capture Exceptions and return appropriate HTTP status codes (e.g. 400 Bad Request, 502 Bad Gateway).<br/>"
        "• <b>AI Fallbacks:</b> If the Gemini API is offline or returns an error, `EmotionService` and `ChatService` fall back to local keyword pattern matching to parse queries.",
        body_style
    ))

    # ------------------ 17. PERFORMANCE ANALYSIS ------------------
    story.append(Paragraph("17. System Performance Optimization Features", h1_style))
    story.append(Paragraph(
        "• <b>Caching:</b> `CatalogService` caches search queries for 5 minutes and streaming URLs for 1 hour using Java `ConcurrentHashMap` to reduce external API queries.<br/>"
        "• <b>Client-side computations:</b> Facial recognition is processed locally in the browser using the user's GPU/CPU. Webcam snapshots do not need to be uploaded to the server.<br/>"
        "• <b>Consolidated Aggregation:</b> Caching search queries and deduplicating tracks locally results in catalog search response times under 400ms.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # ------------------ 18. PROJECT UNIQUENESS ------------------
    story.append(Paragraph("18. Project Uniqueness Summary Table", h1_style))
    
    uniq_details = [
        [Paragraph("Feature Component", table_header), Paragraph("Technical Uniqueness", table_header), Paragraph("Value Added", table_header)],
        [
            Paragraph("<b>Auditory UI Loop</b>", table_text),
            Paragraph("Combination of Text-to-Speech synthesis and Speech-to-Text command tracking.", table_text),
            Paragraph("Improves accessibility for users with limited mobility or vision impairments.", table_text)
        ],
        [
            Paragraph("<b>Adaptive Playback</b>", table_text),
            Paragraph("Aggregates search results dynamically from local databases and streaming APIs.", table_text),
            Paragraph("Increases the size of the music catalog without expanding database storage.", table_text)
        ]
    ]
    uniq_table2 = Table(uniq_details, colWidths=[1.8*inch, 2.7*inch, 3.0*inch])
    uniq_table2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,1), (-1,-1), BG_LIGHT),
    ]))
    story.append(uniq_table2)
    story.append(PageBreak())

    # ------------------ 19. CHALLENGES AND SOLUTIONS ------------------
    story.append(Paragraph("19. Technical Challenges & Solutions Implemented", h1_style))
    
    cl_data = [
        [Paragraph("Discovered Challenge", table_header), Paragraph("Technical Solution Implemented", table_header), Paragraph("Source Files Involved", table_header), Paragraph("Key Benefit", table_header)],
        [
            Paragraph("CORS blocking external audio streams", table_text),
            Paragraph("Implemented a reverse proxy controller to pipe raw audio bytes locally.", table_text),
            Paragraph("AudioStreamController.java, MusicContext.jsx", table_text),
            Paragraph("Ensures CORS-free playback of external CDN audio tracks.", table_text)
        ],
        [
            Paragraph("Chrome Speech Recognition silent truncation", table_text),
            Paragraph("Disabled continuous mode and auto-restarts recognition on end.", table_text),
            Paragraph("useSpeechRecognition.js", table_text),
            Paragraph("Resolves microphone recording limitations.", table_text)
        ],
        [
            Paragraph("Facial scan flickering expressions", table_text),
            Paragraph("Implemented a 7-reading voting queue before committing emotions.", table_text),
            Paragraph("Dashboard.jsx", table_text),
            Paragraph("Improves emotion classification accuracy.", table_text)
        ]
    ]
    cl_table = Table(cl_data, colWidths=[1.8*inch, 2.2*inch, 1.8*inch, 1.7*inch])
    cl_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,1), (-1,-1), colors.white),
    ]))
    story.append(cl_table)
    story.append(Spacer(1, 10))

    # ------------------ 20. STRENGTHS AND WEAKNESSES ------------------
    story.append(Paragraph("20. Project Evaluation: Strengths & Weaknesses", h1_style))
    story.append(Paragraph(
        "<b>Strengths:</b> Built-in offline fallbacks, client-side face scanning that saves network bandwidth, "
        "and a secure JWT authentication system.<br/>"
        "<b>Weaknesses:</b> Caching uses local server memory instead of a distributed cache, "
        "and speech recognition relies on browser support and internet access.<br/>"
        "<b>Recommended Scalability Improvements:</b> Use Redis to manage cached queries, "
        "and run a localized OpenAI Whisper compiler offline to handle speech recognition.",
        body_style
    ))
    
    # ------------------ 21. TECHNOLOGY INVENTORY ------------------
    story.append(Paragraph("21. Technical Stack Inventory Details", h1_style))
    
    tech_data = [
        [Paragraph("Discovered Tech", table_header), Paragraph("Category", table_header), Paragraph("Purpose / File Implementations", table_header), Paragraph("Advantage", table_header)],
        [Paragraph("React 19 / Vite 8", table_text), Paragraph("Frontend Core", table_text), Paragraph("App.jsx, Components, Pages", table_text), Paragraph("Fast compilation and rendering", table_text)],
        [Paragraph("Spring Boot 4 / Java 21", table_text), Paragraph("Backend Core", table_text), Paragraph("pom.xml, src/main/java", table_text), Paragraph("Type-safe compilation", table_text)],
        [Paragraph("MySQL", table_text), Paragraph("Database", table_text), Paragraph("database/schema.sql", table_text), Paragraph("Stable relational structure", table_text)],
        [Paragraph("Google Gemini API", table_text), Paragraph("LLM", table_text), Paragraph("GeminiService.java", table_text), Paragraph("Advanced conversational reasoning", table_text)],
        [Paragraph("face-api.js", table_text), Paragraph("Computer Vision", table_text), Paragraph("Dashboard.jsx", table_text), Paragraph("Serverless computer vision", table_text)]
    ]
    tech_table = Table(tech_data, colWidths=[1.4*inch, 1.2*inch, 2.7*inch, 2.2*inch])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#334155')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,1), (-1,-1), BG_LIGHT),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 10))

    # ------------------ 22. FINAL SUMMARY ------------------
    story.append(Paragraph("22. Final Project Executive Summary", h1_style))
    story.append(Paragraph(
        "AuraBeat demonstrates how to integrate client-side biometrics and cloud NLP to automate music selection. "
        "The project features a clean, responsive layout built on React 19 and Vite. The backend runs on Java 21 and Spring Boot, "
        "utilizing Spring Security for authentication and Hibernate JPA to manage database interactions. "
        "AuraBeat integrates Google Gemini for conversational input and emotion detection, with offline fallbacks to handle "
        "rate limits and network issues. The caching mechanism and reverse audio proxy structure successfully deliver a "
        "CORS-free music streaming experience.",
        body_style
    ))
    
    # Compile multi-page document structure
    doc.build(story)
    print("Report Compiled Successfully!")

if __name__ == "__main__":
    run_pdf_generation()
