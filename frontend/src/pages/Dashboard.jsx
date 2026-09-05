import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { useAI } from '../context/AIContext';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { 
  Mic, MicOff, Send, Play, Heart, Smile, Sparkles, Volume2, Plus, 
  Bot, SendHorizonal, Flame, Compass, Headphones, Clock, Activity, 
  TrendingUp, Users, PlusCircle, CheckCircle, Info, Camera, VideoOff, 
  RefreshCw, X, AlertCircle, Loader 
} from 'lucide-react';
import API from '../services/api';

const Dashboard = () => {
  const { playSong, currentSong, isPlaying, searchQuery, setSearchQuery } = useMusic();
  const { processAIChatResponse, showScanModal, setShowScanModal } = useAI();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Greeting based on local time
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // State Management — read ?tab= from URL on init
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    return tab || 'discover';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [emotionText, setEmotionText] = useState('');
  const [detectedEmotion, setDetectedEmotion] = useState('Neutral');
  const [emotionLoading, setEmotionLoading] = useState(false);
  const [followedArtists, setFollowedArtists] = useState({});
  const [hoveredChartIndex, setHoveredChartIndex] = useState(null);

  // Error state for song fetching (visible in UI)
  const [songError, setSongError] = useState(null);
  const [songsLoading, setSongsLoading] = useState(false);

  // Webcam Scanner States — use a ref to fix stale closure in setInterval
  // faceModelStatus: 'idle' | 'loading_models' | 'loading_camera' | 'ready' | 'scanning' | 'error'
  const [faceModelStatus, setFaceModelStatus] = useState('idle');
  const [scannerEmotion, setScannerEmotion] = useState('');
  const cameraActiveRef = useRef(false); // <-- ref avoids stale closure in setInterval

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  // Smoothing: keep last 7 readings; only commit an emotion when it's consistently dominant
  const recentEmotionsRef = useRef([]);
  const lastPostedEmotionRef = useRef('');
  
  const {
    listening: emotionListening,
    transcript: emotionTranscript,
    startListening: startEmotionListening,
    stopListening: stopEmotionListening,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Chatbot State
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const {
    listening: chatListening,
    transcript: chatTranscript,
    startListening: startChatListening,
    stopListening: stopChatListening,
  } = useSpeechRecognition();

  // Primary Vibe Shortcuts
  const vibes = [
    { name: 'Happy', gradient: 'from-[#FBBF24] to-[#F59E0B]', desc: 'Upbeat & energetic pop rhythms' },
    { name: 'Sad', gradient: 'from-[#3B82F6] to-[#1D4ED8]', desc: 'Melodic, ambient, and soulful acoustics' },
    { name: 'Relaxed', gradient: 'from-[#10B981] to-[#047857]', desc: 'Calming instrumental atmospheres' },
    { name: 'Excited', gradient: 'from-[#EC4899] to-[#BE185D]', desc: 'Fast tempo, danceable beats' },
    { name: 'Angry', gradient: 'from-[#EF4444] to-[#B91C1C]', desc: 'Aggressive heavy-metal & hard rock' },
    { name: 'Fear', gradient: 'from-[#8B5CF6] to-[#6D28D9]', desc: 'Dark, tense horror soundscapes' },
    { name: 'Neutral', gradient: 'from-[#64748B] to-[#475569]', desc: 'Smooth lo-fi chillouts' }
  ];

  const popularArtists = [
    { name: 'Anirudh Ravichander', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', followers: '4.2M' },
    { name: 'A.R. Rahman', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', followers: '8.7M' },
    { name: 'Pharrell Williams', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', followers: '6.1M' },
    { name: 'Lord Huron', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', followers: '1.9M' },
    { name: 'Marconi Union', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', followers: '850K' }
  ];

  // SVG Chart Data
  const chartDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartValues = [14, 22, 18, 29, 24, 38, 31];
  const maxChartValue = 45;
  const svgWidth = 600;
  const svgHeight = 160;
  
  const chartPoints = chartValues.map((val, idx) => {
    const x = (idx / (chartValues.length - 1)) * (svgWidth - 60) + 30;
    const y = svgHeight - ((val / maxChartValue) * (svgHeight - 40) + 20);
    return { x, y, val, day: chartDays[idx] };
  });

  const linePath = chartPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${chartPoints[chartPoints.length - 1].x} ${svgHeight} L ${chartPoints[0].x} ${svgHeight} Z`;

  // Dynamically load face-api script on mount
  useEffect(() => {
    const script = document.createElement('script');
    // Use justadudewhohacks version (the one whose model URLs we use)
    script.src = "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
    script.async = true;
    script.onload = () => {
      console.log('[FaceScan] face-api.js loaded successfully');
    };
    script.onerror = () => {
      console.error('[FaceScan] face-api.js failed to load from CDN');
      setFaceModelStatus('error');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      stopWebcam();
    };
  }, []);

  // Sync activeTab with URL ?tab= changes (e.g. from sidebar nav)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (showScanModal) {
      if (!cameraActiveRef.current && faceModelStatus === 'idle') {
        startWebcam();
      }
    } else {
      stopWebcam();
    }
  }, [showScanModal]);

  useEffect(() => {
    if (emotionTranscript) {
      setEmotionText(emotionTranscript);
    }
  }, [emotionTranscript]);

  useEffect(() => {
    if (chatTranscript) {
      setChatMessage(chatTranscript);
    }
  }, [chatTranscript]);

  useEffect(() => {
    fetchAllSongs();
    fetchSongs('Neutral');
    fetchFavorites();
    fetchChatHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const fetchAllSongs = async () => {
    setSongsLoading(true);
    setSongError(null);
    try {
      const response = await API.get('/api/songs');
      console.log('[Songs] Fetched all songs:', response.data.length, 'tracks');
      setAllSongs(response.data);
      setSongError(null);
    } catch (err) {
      const msg = err.response 
        ? `API Error ${err.response.status}: ${err.response.data?.message || err.message}` 
        : `Network Error: ${err.message}`;
      console.error('[Songs] fetchAllSongs failed:', msg);
      setSongError(msg);
    } finally {
      setSongsLoading(false);
    }
  };

  const fetchSongs = async (emotion) => {
    try {
      console.log('[Songs] Fetching by emotion:', emotion);
      const response = await API.get(`/api/songs?emotion=${emotion}`);
      console.log('[Songs] Got', response.data.length, 'songs for emotion:', emotion);
      setRecommendedSongs(response.data);
      setSongError(null);
    } catch (err) {
      const msg = err.response 
        ? `API Error ${err.response.status}: ${err.response.data?.message || err.message}` 
        : `Network Error: ${err.message}`;
      console.error('[Songs] fetchSongs failed:', msg);
      setSongError(msg);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await API.get('/api/favorites');
      setFavorites(response.data.map(fav => fav.song.id));
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await API.get('/api/chat/history');
      setChatHistory(response.data.map(log => [
        { sender: 'User', message: log.userInput },
        { sender: 'Bot', message: log.botResponse }
      ]).flat());
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  const handleSelectVibe = (vibeName) => {
    setDetectedEmotion(vibeName);
    fetchSongs(vibeName);
  };

  const handlePlayVibe = async (vibeName, e) => {
    e.stopPropagation();
    setDetectedEmotion(vibeName);
    try {
      const response = await API.get(`/api/songs?emotion=${vibeName}`);
      const songs = response.data;
      if (songs.length > 0) {
        setRecommendedSongs(songs);
        playSong(songs[0], songs);
      } else {
        alert(`No songs seeded for vibe: ${vibeName}`);
      }
    } catch (err) {
      console.error('Error playing vibe:', err);
    }
  };

  const handleAnalyzeEmotion = async () => {
    if (!emotionText.trim()) return;
    setEmotionLoading(true);
    try {
      const response = await API.post('/api/emotion', { text: emotionText });
      const emo = response.data.emotion;
      setDetectedEmotion(emo);
      fetchSongs(emo);
    } catch (err) {
      console.error('Error detecting emotion:', err);
    } finally {
      setEmotionLoading(false);
    }
  };

  const handleToggleEmotionMic = () => {
    if (emotionListening) {
      stopEmotionListening();
      setTimeout(() => {
        handleAnalyzeEmotion();
      }, 500);
    } else {
      setEmotionText('');
      startEmotionListening();
    }
  };

  const handleToggleFavorite = async (songId) => {
    try {
      const response = await API.post('/api/favorites', { songId });
      if (response.data.isFavorite) {
        setFavorites(prev => [...prev, songId]);
      } else {
        setFavorites(prev => prev.filter(id => id !== songId));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { sender: 'User', message: userMsg }]);
    setChatLoading(true);

    try {
      const response = await API.post('/api/chat', { message: userMsg });
      const chatResult = response.data;

      // Add bot response to message thread
      setChatHistory(prev => [...prev, { sender: 'Bot', message: chatResult.botResponse }]);
      setDetectedEmotion(chatResult.detectedEmotion);
      setRecommendedSongs(chatResult.recommendedSongs);

      // Global AI Command Architecture Callback
      processAIChatResponse(chatResult);
    } catch (err) {
      console.error('Error sending chat message:', err);
      setChatHistory(prev => [...prev, { sender: 'Bot', message: 'Could not contact assistant.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleToggleChatMic = () => {
    if (chatListening) {
      stopChatListening();
      setTimeout(() => {
        handleSendChatMessage();
      }, 500);
    } else {
      setChatMessage('');
      startChatListening();
    }
  };

  const handleCreatePlaylistFromEmotion = async () => {
    if (recommendedSongs.length === 0) return;
    try {
      const name = `${detectedEmotion} Mix - ${new Date().toLocaleDateString()}`;
      const songIds = recommendedSongs.map(s => s.id);
      await API.post('/api/playlists', {
        playlistName: name,
        emotion: detectedEmotion,
        songIds
      });
      alert(`Created playlist: "${name}"`);
    } catch (err) {
      console.error('Error saving playlist:', err);
    }
  };

  const toggleFollowArtist = (artistName) => {
    setFollowedArtists(prev => ({
      ...prev,
      [artistName]: !prev[artistName]
    }));
  };

  // Webcam Scanning Implementation
  const startWebcam = async () => {
    setShowScanModal(true);
    setScannerEmotion('');
    cameraActiveRef.current = false;

    // Step 1: Load face-api.js models (with explicit state)
    setFaceModelStatus('loading_models');
    try {
      // Wait for face-api to be available (it loads async via CDN script tag)
      let waitAttempts = 0;
      while (!window.faceapi && waitAttempts < 30) {
        await new Promise(r => setTimeout(r, 200));
        waitAttempts++;
      }

      if (!window.faceapi) {
        throw new Error('face-api.js failed to load from CDN after 6 seconds');
      }

      console.log('[FaceScan] face-api.js is available, loading models...');
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
      await window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await window.faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      console.log('[FaceScan] Models loaded successfully');
    } catch (modelErr) {
      console.error('[FaceScan] Model loading failed:', modelErr.message);
      setFaceModelStatus('error');
      setScannerEmotion(`Model load error: ${modelErr.message}`);
      return; // Don't proceed without models
    }

    // Step 2: Get camera stream
    setFaceModelStatus('loading_camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 300 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready before running predictions
        await new Promise((resolve) => {
          videoRef.current.onloadeddata = resolve;
          // Fallback if onloadeddata doesn't fire
          setTimeout(resolve, 1500);
        });
      }
      cameraActiveRef.current = true;
      setFaceModelStatus('scanning');
      console.log('[FaceScan] Camera active — starting detection loop');

      // Step 3: Start running predictions
      runPredictions();
    } catch (camErr) {
      console.error('[FaceScan] Camera access failed:', camErr.message);
      setFaceModelStatus('error');
      setScannerEmotion(`Camera error: ${camErr.message}`);
      setShowScanModal(false);
    }
  };

  const stopWebcam = () => {
    cameraActiveRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setFaceModelStatus('idle');
    setShowScanModal(false);
  };

  const runPredictions = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    // Reset smoothing history on each new session
    recentEmotionsRef.current = [];
    lastPostedEmotionRef.current = '';

    scanIntervalRef.current = setInterval(async () => {
      // Use REF not state — avoids stale closure capturing old false value
      if (videoRef.current && window.faceapi && cameraActiveRef.current) {
        try {
          const detections = await window.faceapi.detectSingleFace(
            videoRef.current,
            new window.faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 })
          ).withFaceExpressions();

          if (detections && detections.expressions) {
            const expressions = detections.expressions;

            // Find the single highest-confidence expression
            const maxEmotion = Object.keys(expressions).reduce((a, b) =>
              expressions[a] > expressions[b] ? a : b
            );
            const confidence = expressions[maxEmotion];

            console.log(
              `[FaceScan] max=${maxEmotion} (${(confidence * 100).toFixed(1)}%)`,
              Object.fromEntries(Object.entries(expressions).map(([k, v]) => [k, (v * 100).toFixed(1) + '%']))
            );

            // --- Confidence gate ---
            // Only add to history when we have a decisive reading.
            // Neutral is raised to 60% threshold because it's the default resting face.
            const minConfidence = maxEmotion === 'neutral' ? 0.60 : 0.45;
            if (confidence >= minConfidence) {
              const history = recentEmotionsRef.current;
              history.push(maxEmotion);
              if (history.length > 7) history.shift(); // keep last 7
            }

            // --- Smoothing: majority vote over last readings ---
            const history = recentEmotionsRef.current;
            if (history.length >= 3) {
              const freq = {};
              history.forEach(e => { freq[e] = (freq[e] || 0) + 1; });
              const smoothed = Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b);

              // Map face-api names → AuraBeat emotion labels
              const emoMap = {
                happy: 'Happy', sad: 'Sad', angry: 'Angry',
                fearful: 'Fear', surprised: 'Excited',
                neutral: 'Neutral', disgusted: 'Angry'
              };
              const detected = emoMap[smoothed] || 'Neutral';

              // Update scanner badge always
              setScannerEmotion(detected);

              // Only call API when emotion actually changes
              if (detected !== lastPostedEmotionRef.current) {
                lastPostedEmotionRef.current = detected;
                setDetectedEmotion(detected);
                fetchSongs(detected);
                // Post history log to database
                await API.post('/api/emotion', { text: `[WebCam Facial Scan: Detected ${detected}]` });
              }
            } else {
              // Not enough history yet — show a scanning indicator
              setScannerEmotion('Scanning...');
            }
          } else {
            // No face detected — don't reset, just note it
            console.log('[FaceScan] No face detected in frame — ensure good lighting and face is centred.');
          }
        } catch (e) {
          console.error('[FaceScan] Detection error:', e);
        }
      }
    }, 1200);
  };

  // Filter songs based on top header search query
  const filteredSongs = allSongs.filter(song => {
    if (!searchQuery) return false;
    const q = searchQuery.toLowerCase();
    return song.title.toLowerCase().includes(q) || 
           song.artist.toLowerCase().includes(q) || 
           song.emotion.toLowerCase().includes(q) ||
           song.genre.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-10 relative select-none">
      
      {/* Background Glow Mesh */}
      <div className="absolute top-[-5%] right-[-5%] w-[40vw] h-[40vw] bg-radial from-[#1DB954]/5 via-transparent to-transparent blur-[100px] pointer-events-none z-0"></div>

      {/* SONG ERROR BANNER (visible when API fails) */}
      {songError && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-3.5 z-10 relative">
          <AlertCircle className="w-4.5 h-4.5 text-red-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-red-300 uppercase tracking-wider">Song Catalog Error</p>
            <p className="text-[11px] text-red-400/80 mt-0.5 font-mono">{songError}</p>
          </div>
          <button onClick={() => { setSongError(null); fetchAllSongs(); }} className="ml-auto text-[11px] text-red-300 hover:text-white border border-red-500/30 px-3 py-1 rounded-full font-semibold cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* 1. HERO GREETING BANNER */}
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 p-6 md:p-8 bg-gradient-to-r from-white/5 to-[#1DB954]/5 backdrop-blur-3xl z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[10px] font-bold text-[#1DB954] uppercase tracking-widest bg-[#1DB954]/10 border border-[#1DB954]/20 px-3 py-1 rounded-full">
              Session Profile Active
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 font-poppins leading-tight">
              {getGreeting()}, <span className="brand-gradient-text">{user.name || 'Developer'}</span>
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-lg">
              AuraBeat has loaded your neural profile. Select a mood shortcut, scan your face expression, or talk to VibeBot.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Webcam Face Scan trigger button */}
            <button
              onClick={startWebcam}
              className="px-6 py-3 bg-gradient-to-r from-[#1DB954] to-[#00D4FF] hover:from-[#1ed760] hover:to-[#2be0ff] text-black font-bold text-xs uppercase tracking-wider rounded-full shadow-lg shadow-[#1DB954]/15 hover:scale-103 active:scale-97 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Camera className="w-4.5 h-4.5 animate-pulse" /> Scan Emotion
            </button>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              <span className="text-xs text-slate-400">Vibe:</span>
              <span className="text-xs font-bold text-[#1DB954] uppercase tracking-wider font-poppins">
                {detectedEmotion}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. WEBCAM SCANNER DIALOG MODAL */}
      <AnimatePresence>
        {showScanModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#171717] border border-white/10 rounded-[32px] p-6 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={stopWebcam}
                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-bold text-white font-poppins mb-2 flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#1DB954]" /> Facial Emotion AI Scan
              </h3>
              <p className="text-xs text-slate-400 mb-6">Scanning expressions to generate personalized tracks</p>

              {/* Webcam view frame */}
              <div className="aspect-[4/3] w-full bg-black/60 rounded-2xl overflow-hidden border border-white/5 relative flex items-center justify-center">
                {(faceModelStatus === 'loading_models' || faceModelStatus === 'loading_camera') ? (
                  <div className="flex flex-col items-center gap-3 px-6 text-center">
                    <RefreshCw className="w-8 h-8 text-[#1DB954] animate-spin" />
                    <span className="text-xs text-slate-400 font-medium">
                      {faceModelStatus === 'loading_models' ? '⏳ Loading face detection models...' : '📷 Activating camera stream...'}
                    </span>
                    <div className="flex gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${faceModelStatus === 'loading_models' ? 'bg-[#1DB954] text-black' : 'bg-white/10 text-slate-400'}`}>1. Models</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${faceModelStatus === 'loading_camera' ? 'bg-[#00D4FF] text-black' : 'bg-white/10 text-slate-400'}`}>2. Camera</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-white/10 text-slate-400">3. Scanning</span>
                    </div>
                  </div>
                ) : faceModelStatus === 'error' ? (
                  <div className="flex flex-col items-center gap-3 px-6 text-center">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                    <span className="text-xs text-red-400 font-medium">{scannerEmotion || 'Face scan error. Check camera permissions.'}</span>
                    <button onClick={startWebcam} className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-1.5 rounded-full text-slate-300 cursor-pointer">Retry</button>
                  </div>
                ) : (
                  <>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      muted 
                      playsInline 
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    {/* Scan overlay grid */}
                    <div className="absolute inset-0 border-2 border-dashed border-[#1DB954]/20 pointer-events-none rounded-2xl animate-pulse m-4"></div>
                    {faceModelStatus === 'scanning' && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-ping" />
                        <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">Live Scan</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Scan output result */}
              <div className="mt-6 flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Detected Expression</span>
                  <span className="text-sm font-bold text-white block mt-0.5 font-poppins capitalize">
                    {faceModelStatus === 'scanning' && !scannerEmotion ? 'Scanning for face...' : (scannerEmotion || 'Waiting...')}
                  </span>
                </div>
                <button
                  onClick={stopWebcam}
                  className="px-5 py-2 bg-white hover:bg-slate-200 text-black text-xs font-bold rounded-full transition-all cursor-pointer"
                >
                  Apply & Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. $10M STARTUP ANALYTICS DASHBOARD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 z-10 relative">
        <div className="glass-card p-5 flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-poppins">Total Songs Loaded</span>
            <Headphones className="w-4 h-4 text-[#1DB954]" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">{allSongs.length || 17}</h3>
            <span className="text-[10px] text-[#1DB954] font-semibold mt-1 block">✔ DB Fully Seeded</span>
          </div>
        </div>

        <div className="glass-card p-5 flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-poppins">Listening Hours</span>
            <Clock className="w-4 h-4 text-[#00D4FF]" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">42.5 hrs</h3>
            <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Weekly average: 6.2 hrs</span>
          </div>
        </div>

        <div className="glass-card p-5 flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-poppins">Favorite Mood</span>
            <Activity className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">{detectedEmotion}</h3>
            <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Based on last 10 requests</span>
          </div>
        </div>

        <div className="glass-card p-5 flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-poppins">Liked Tracks</span>
            <Heart className="w-4 h-4 text-pink-500" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">{favorites.length}</h3>
            <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Stored in user profile</span>
          </div>
        </div>
      </div>

      {/* 4. VERCEL-STYLE INTERACTIVE SVG ANALYTICS CHART */}
      <div className="glass-card p-6 border border-white/5 relative overflow-hidden z-10 bg-black/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-md font-bold text-white font-poppins flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-[#1DB954]" />
              Weekly Listening Activity
            </h3>
            <p className="text-xs text-slate-500">Tracks played over the past 7 days</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
            <Info className="w-3.5 h-3.5" />
            <span>Interactive chart logs</span>
          </div>
        </div>

        {/* Custom SVG Line Chart */}
        <div className="relative w-full overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[500px]">
            {/* Gradients */}
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1DB954" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#1DB954" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="30" y1="20" x2={svgWidth - 30} y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="30" y1="60" x2={svgWidth - 30} y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="30" y1="100" x2={svgWidth - 30} y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="30" y1="140" x2={svgWidth - 30} y2="140" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

            {/* Area under line */}
            <path d={areaPath} fill="url(#chartGradient)" />

            {/* Line Path */}
            <path d={linePath} fill="none" stroke="url(#chartGradient)" strokeWidth="3" className="stroke-[#1DB954]" />

            {/* Peak Nodes */}
            {chartPoints.map((p, idx) => (
              <g 
                key={idx}
                onMouseEnter={() => setHoveredChartIndex(idx)}
                onMouseLeave={() => setHoveredChartIndex(null)}
                className="cursor-pointer"
              >
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={hoveredChartIndex === idx ? "6" : "4"} 
                  fill="#ffffff" 
                  stroke="#1DB954" 
                  strokeWidth="2.5"
                  className="transition-all"
                />
                {/* Labels under chart */}
                <text x={p.x} y={svgHeight - 2} textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="600">{p.day}</text>
              </g>
            ))}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredChartIndex !== null && (
            <div 
              className="absolute bg-[#171717]/95 border border-[#1DB954]/30 rounded-xl p-2.5 shadow-xl text-center backdrop-blur-md pointer-events-none transition-all z-20"
              style={{
                left: `${(chartPoints[hoveredChartIndex].x / svgWidth) * 100}%`,
                top: `${(chartPoints[hoveredChartIndex].y / svgHeight) * 100 - 35}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">{chartPoints[hoveredChartIndex].day}</span>
              <span className="text-xs font-bold text-white block mt-0.5">{chartPoints[hoveredChartIndex].val} tracks</span>
            </div>
          )}
        </div>
      </div>

      {/* 5. ACTIVE SEARCH RESULTS (Triggered when searching in top navbar) */}
      {searchQuery && (
        <div className="glass-card p-6 border border-[#1DB954]/20 z-10 relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Search Results for "{searchQuery}"</span>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-500 hover:text-white underline cursor-pointer"
            >
              Clear Search
            </button>
          </div>
          {filteredSongs.length === 0 ? (
            <p className="text-slate-500 text-xs py-4 text-center">No songs match your search query.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredSongs.map(song => (
                <div 
                  key={song.id}
                  onClick={() => playSong(song, filteredSongs)}
                  className="bg-white/5 hover:bg-white/10 rounded-2xl p-3 border border-white/5 cursor-pointer hover:scale-102 transition-all relative group"
                >
                  <img src={song.thumbnail} alt={song.title} className="aspect-square w-full object-cover rounded-xl" />
                  <h4 className="text-xs font-bold text-white truncate mt-2">{song.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{song.artist}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TRENDING TAB — Full catalog grid (only when ?tab=trending) */}
      {activeTab === 'trending' && (
        <div className="glass-card p-6 border border-white/5 z-10 relative bg-black/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#1DB954]" />
              <h3 className="text-xl font-extrabold text-white font-poppins">Trending Catalog</h3>
              <span className="text-[10px] font-bold text-[#1DB954] bg-[#1DB954]/10 border border-[#1DB954]/20 px-2 py-0.5 rounded-full ml-2">
                {allSongs.length} tracks
              </span>
            </div>
            <div className="flex gap-2">
              {['All', 'Tamil', 'Hindi', 'Telugu', 'English'].map(lang => (
                <button
                  key={lang}
                  onClick={() => {
                    if (lang === 'All') fetchAllSongs();
                    else API.get(`/api/songs?language=${lang}`).then(r => setAllSongs(r.data)).catch(console.error);
                  }}
                  className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-white/10 hover:border-[#1DB954]/50 rounded-full text-slate-400 hover:text-[#1DB954] transition-all cursor-pointer"
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {songsLoading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <RefreshCw className="w-5 h-5 text-[#1DB954] animate-spin" />
              <span className="text-xs text-slate-400">Loading catalog...</span>
            </div>
          ) : allSongs.length === 0 ? (
            <div className="text-center py-16">
              <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-xs">No songs available. Check backend connection.</p>
              <button onClick={fetchAllSongs} className="mt-4 text-xs text-[#1DB954] underline cursor-pointer">Retry</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {allSongs.map((song) => {
                const isCurrent = currentSong?.id === song.id;
                const isFav = favorites.includes(song.id);
                return (
                  <div
                    key={`trending-${song.id || song.providerTrackId}`}
                    className="bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-[#1DB954]/20 rounded-3xl p-3 flex flex-col gap-2 group transition-all duration-300 hover:-translate-y-1 shadow-md"
                  >
                    <div className="aspect-square w-full rounded-2xl overflow-hidden relative">
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=60'; }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                        <button
                          onClick={() => playSong(song, allSongs)}
                          className="p-3 bg-gradient-to-tr from-[#1DB954] to-[#00D4FF] rounded-full text-black shadow-xl cursor-pointer hover:scale-110 transition-transform"
                        >
                          <Play className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                      {/* Language badge */}
                      <span className="absolute top-2 left-2 text-[8px] font-bold uppercase bg-black/60 text-slate-300 px-1.5 py-0.5 rounded-full">
                        {song.language || 'EN'}
                      </span>
                    </div>
                    <div className="flex justify-between items-start gap-1">
                      <div className="overflow-hidden flex-1">
                        <p className={`text-[11px] font-bold truncate ${isCurrent ? 'text-[#1db954]' : 'text-white'}`}>
                          {song.title}
                        </p>
                        <p className="text-[9px] text-slate-400 truncate mt-0.5">{song.artist}</p>
                        <p className="text-[8px] text-slate-600 truncate">{song.emotion}</p>
                      </div>
                      <button
                        onClick={() => handleToggleFavorite(song.id)}
                        className={`p-1.5 rounded-full hover:bg-white/5 shrink-0 transition-all ${isFav ? 'text-[#1db954]' : 'text-slate-600 hover:text-white'}`}
                      >
                        <Heart className="w-3 h-3" fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. MOOD VIBE GRID CARDS */}
      <div className="z-10 relative">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-[#1DB954]" />
          <h3 className="text-xl font-extrabold text-white font-poppins">Select Your Current Vibe</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {vibes.map((vibe) => (
            <div
              key={vibe.name}
              onClick={() => handleSelectVibe(vibe.name)}
              className={`glass-card p-4 flex flex-col justify-between min-h-[160px] cursor-pointer group rounded-3xl relative overflow-hidden border border-white/5 ${
                detectedEmotion === vibe.name ? 'border-[#1DB954]/50 shadow-lg shadow-[#1DB954]/5' : ''
              }`}
            >
              <div className={`absolute -right-8 -top-8 w-20 h-20 bg-gradient-to-br ${vibe.gradient} opacity-20 blur-xl group-hover:opacity-30 transition-opacity`} />
              
              <div className="space-y-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-black bg-gradient-to-tr ${vibe.gradient} w-max block font-poppins`}>
                  {vibe.name}
                </span>
                <p className="text-[10px] text-slate-500 leading-tight pt-2 font-medium">{vibe.desc}</p>
              </div>

              <div className="flex justify-between items-center mt-4">
                <span className="text-[10px] font-semibold text-slate-400">Play Mix</span>
                <button
                  onClick={(e) => handlePlayVibe(vibe.name, e)}
                  className="p-2.5 bg-gradient-to-tr from-[#1DB954] to-[#00D4FF] hover:scale-105 rounded-full text-black transition-all active:scale-95 shadow-md shadow-[#1DB954]/10 cursor-pointer flex items-center justify-center"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. COLUMNS LAYOUT (Split Main Area & Chatbot) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 relative">
        
        {/* Left Side: Voice/Text Analyzer & Recommended List (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Describe your day voice analyzer card */}
          <div className="glass-card p-6 border border-white/5 bg-black/20">
            <div className="flex items-center gap-2.5 mb-4">
              <Smile className="w-5 h-5 text-[#1DB954]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-poppins">Analyze Your Tone</h3>
            </div>

            <div className="relative">
              <textarea
                rows="2"
                value={emotionText}
                onChange={(e) => setEmotionText(e.target.value)}
                placeholder="How are you feeling right now? Type details or click microphone to capture voice speech..."
                className="w-full p-4 bg-white/5 border border-white/10 focus:border-[#1DB954]/40 rounded-2xl text-slate-200 placeholder-slate-500 focus:outline-none transition-all text-sm resize-none pr-12 font-medium"
              />
              
              {browserSupportsSpeechRecognition && (
                <button
                  onClick={handleToggleEmotionMic}
                  className={`absolute right-4 bottom-4 p-2 rounded-xl transition-all ${
                    emotionListening 
                      ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={emotionListening ? "Stop listening" : "Start speaking"}
                >
                  {emotionListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
            </div>

            <div className="flex justify-between items-center mt-5">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active State:</span>
                <span className="text-xs font-bold text-black bg-[#1DB954] px-3.5 py-1 rounded-full shadow-md shadow-[#1DB954]/10 uppercase tracking-widest font-poppins">
                  {detectedEmotion}
                </span>
              </div>
              
              <button
                onClick={handleAnalyzeEmotion}
                disabled={emotionLoading || !emotionText.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-[#1DB954] to-[#00D4FF] hover:from-[#1ed760] hover:to-[#2be0ff] text-black text-xs font-bold rounded-full transition-all duration-200 hover:scale-105 active:scale-100 disabled:opacity-50 cursor-pointer shadow-lg shadow-[#1DB954]/10"
              >
                {emotionLoading ? 'Analyzing...' : 'Analyze Mood'}
              </button>
            </div>
          </div>

          {/* Recommended list */}
          <div className="glass-card p-6 border border-white/5 bg-black/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1DB954]" />
                <h3 className="text-lg font-bold text-white font-poppins">Trending Mood Tracks</h3>
              </div>
              {recommendedSongs.length > 0 && (
                <button
                  onClick={handleCreatePlaylistFromEmotion}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-white/20 text-xs text-slate-300 font-bold transition-all cursor-pointer bg-white/5 hover:bg-white/10 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Playlist</span>
                </button>
              )}
            </div>

            {recommendedSongs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs font-semibold">
                No tracks loaded. Click a Vibe card above or submit voice analysis.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recommendedSongs.map((song) => {
                  const isCurrent = currentSong?.id === song.id;
                  const isFav = favorites.includes(song.id);
                  return (
                    <div
                      key={song.id}
                      className="bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 rounded-3xl p-4 flex flex-col gap-3 group relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-md"
                    >
                      <div className="aspect-square w-full rounded-2xl overflow-hidden relative">
                        <img
                          src={song.thumbnail}
                          alt={song.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 backdrop-blur-[2px]">
                          <button
                            onClick={() => playSong(song, recommendedSongs)}
                            className="p-3 bg-gradient-to-tr from-[#1DB954] to-[#00D4FF] hover:from-[#1ed760] hover:to-[#2be0ff] rounded-full text-black transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 shadow-xl cursor-pointer"
                          >
                            <Play className="w-4.5 h-4.5 fill-current" />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-start gap-1">
                        <div className="overflow-hidden flex-1">
                          <p className={`text-xs font-bold truncate ${isCurrent ? 'text-[#1db954]' : 'text-white'}`}>
                            {song.title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{song.artist}</p>
                        </div>
                        <button
                          onClick={() => handleToggleFavorite(song.id)}
                          className={`p-1.5 rounded-full hover:bg-white/5 active:scale-95 transition-all shrink-0 ${
                            isFav ? 'text-[#1db954]' : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          <Heart className="w-3.5 h-3.5" fill={isFav ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Notion Style Chat Assistant (4 cols) */}
        <div className="lg:col-span-4 flex flex-col h-[560px] glass-card overflow-hidden border border-white/5 bg-black/20">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bot className="w-4.5 h-4.5 text-[#1db954]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-poppins">Vibe Assistant</span>
            </div>
            <span className="w-2 h-2 bg-[#1db954] rounded-full animate-ping" />
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 text-slate-500">
                <Sparkles className="w-8 h-8 text-[#1db954]/40 mb-3" />
                <p className="text-xs font-bold text-slate-400 font-poppins">AuraBeat AI Bot</p>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] leading-relaxed">
                  Type details about your day or query music statistics. The chatbot handles voice controls directly.
                </p>
              </div>
            ) : (
              chatHistory.map((chat, idx) => {
                const isBot = chat.sender === 'Bot';
                return (
                  <div key={idx} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        isBot
                          ? 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-none font-medium'
                          : 'bg-gradient-to-r from-[#1DB954] to-[#00D4FF] text-black font-semibold rounded-tr-none shadow-md shadow-[#1DB954]/5'
                      }`}
                    >
                      {chat.message}
                    </div>
                  </div>
                );
              })
            )}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none px-3.5 py-2.5 flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-[#1db954] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#1db954] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-[#1db954] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Console */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChatMessage();
            }}
            className="p-3 bg-white/5 border-t border-white/5"
          >
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder={chatListening ? 'Listening...' : 'Type message to bot...'}
                  className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/15 focus:border-[#1DB954]/30 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none transition-all text-xs font-medium"
                />
                <button
                  type="button"
                  onClick={handleToggleChatMic}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                    chatListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="Voice dictation"
                >
                  {chatListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={chatLoading || !chatMessage.trim()}
                className="p-3 bg-gradient-to-tr from-[#1DB954] to-[#00D4FF] hover:scale-102 text-black rounded-xl shadow-md transition-all disabled:opacity-50 shrink-0 cursor-pointer active:scale-95 flex items-center justify-center"
              >
                <Send className="w-4 h-4 fill-current" />
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* 8. POPULAR ARTISTS SECTION */}
      <div className="glass-card p-6 border border-white/5 bg-black/20 z-10 relative">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-[#1DB954]" />
          <h3 className="text-xl font-extrabold text-white font-poppins">Popular Artists</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {popularArtists.map((artist, idx) => {
            const isFollowing = followedArtists[artist.name];
            return (
              <div key={idx} className="flex flex-col items-center text-center group">
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-[#1DB954]/50 shadow-lg transition-all duration-300 group-hover:scale-105">
                  <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <Play className="w-6 h-6 text-white fill-current animate-pulse" />
                  </div>
                </div>
                
                <h4 className="text-xs font-bold text-white mt-3 truncate w-full font-poppins">{artist.name}</h4>
                <p className="text-[10px] text-slate-500 font-semibold">{artist.followers} Followers</p>
                
                <button
                  onClick={() => toggleFollowArtist(artist.name)}
                  className={`mt-3.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 ${
                    isFollowing 
                      ? 'bg-[#1DB954] text-black border border-transparent' 
                      : 'bg-transparent text-slate-300 border border-white/10 hover:border-white'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;