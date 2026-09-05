import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMusic } from './MusicContext';
import API from '../services/api';

const AIContext = createContext(null);

export const AIProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    playSong, currentSong, isPlaying, pauseSong, resumeSong, 
    nextSong, prevSong, volume, setVolume, searchQuery, setSearchQuery 
  } = useMusic();

  const [aiResponse, setAiResponse] = useState('');
  const [isAiTalking, setIsAiTalking] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false); // Global webcam trigger state

  // Assistant active transcripts logs state
  const [transcriptLogs, setTranscriptLogs] = useState([]);

  // Expose browser Text-To-Speech (TTS)
  const speakText = (text, callback) => {
    if (!window.speechSynthesis) {
      if (callback) callback();
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    
    utterance.onstart = () => setIsAiTalking(true);
    utterance.onend = () => {
      setIsAiTalking(false);
      if (callback) callback();
    };
    utterance.onerror = () => {
      setIsAiTalking(false);
      if (callback) callback();
    };
    
    window.speechSynthesis.speak(utterance);
  };

  // Central AI Action Manager
  const executeAICommand = async (action, param, message) => {
    if (!action || action === 'none') return;
    
    console.log(`[AI Agent Action] Executing: ${action} with param: ${param}`);

    // Log action outcome in transcript log
    setTranscriptLogs(prev => [
      { action, param, timestamp: new Date(), outcome: 'Executing' },
      ...prev.slice(0, 19) // Keep last 20 logs
    ]);

    switch (action) {
      case 'navigate':
        if (param === 'dashboard') {
          navigate('/dashboard');
        } else if (param === 'discover') {
          navigate('/dashboard?tab=discover');
        } else if (param === 'trending') {
          navigate('/dashboard?tab=trending');
        } else if (param === 'playlists') {
          navigate('/playlist');
        } else if (param === 'favorites') {
          navigate('/playlist?tab=favorites');
        } else if (param === 'profile') {
          navigate('/profile');
        } else if (param === 'admin') {
          navigate('/admin');
        }
        break;

      case 'play_song':
        if (param && param !== 'none') {
          try {
            let searchVal = param;
            let langParam = "";
            let emotionParam = "";

            const lower = param.toLowerCase();
            if (lower.includes("in tamil") || lower.includes("tamil songs") || lower.includes("tamil")) {
              langParam = "Tamil";
              searchVal = searchVal.replace(/in tamil|tamil songs|tamil/gi, "").trim();
            } else if (lower.includes("in telugu") || lower.includes("telugu songs") || lower.includes("telugu")) {
              langParam = "Telugu";
              searchVal = searchVal.replace(/in telugu|telugu songs|telugu/gi, "").trim();
            } else if (lower.includes("in hindi") || lower.includes("hindi songs") || lower.includes("hindi")) {
              langParam = "Hindi";
              searchVal = searchVal.replace(/in hindi|hindi songs|hindi/gi, "").trim();
            } else if (lower.includes("in english") || lower.includes("english songs") || lower.includes("english")) {
              langParam = "English";
              searchVal = searchVal.replace(/in english|english songs|english/gi, "").trim();
            }

            const moods = ["happy", "sad", "relaxed", "excited", "angry", "fear", "neutral"];
            for (let m of moods) {
              if (lower.includes(m)) {
                emotionParam = m.charAt(0).toUpperCase() + m.slice(1);
                searchVal = searchVal.replace(new RegExp(m, "gi"), "").trim();
              }
            }

            let apiPath = `/api/songs?`;
            if (searchVal && searchVal !== emotionParam) {
              apiPath += `search=${encodeURIComponent(searchVal)}&`;
            }
            if (langParam) apiPath += `language=${langParam}&`;
            if (emotionParam) apiPath += `emotion=${emotionParam}&`;

            const response = await API.get(apiPath);
            const songs = response.data;
            if (songs.length > 0) {
              playSong(songs[0], songs);
            } else {
              speakText(`I couldn't find any songs matching ${param} in the catalog.`);
            }
          } catch (e) {
            console.error("AI play song query failed:", e);
          }
        } else {
          resumeSong();
        }
        break;

      case 'pause':
      case 'pause_music':
        pauseSong();
        break;

      case 'skip_next':
      case 'next_song':
        nextSong();
        break;

      case 'skip_previous':
      case 'prev_song':
        prevSong();
        break;

      case 'set_volume':
        if (param === 'up') {
          setVolume(Math.min(1, volume + 0.15));
        } else if (param === 'down') {
          setVolume(Math.max(0, volume - 0.15));
        } else {
          const val = parseFloat(param);
          if (!isNaN(val) && val >= 0 && val <= 1) {
            setVolume(val);
          }
        }
        break;

      case 'search_songs':
        if (param && param !== 'none') {
          setSearchQuery(param);
          if (location.pathname !== '/dashboard') {
            navigate('/dashboard');
          }
        }
        break;

      case 'create_playlist':
        if (param && param !== 'none') {
          try {
            await API.post('/api/playlists', { playlistName: param });
            speakText(`I have created the playlist named ${param} for you.`);
          } catch (e) {
            console.error("AI playlist creation failed:", e);
          }
        }
        break;

      case 'like_song':
      case 'add_favorite':
        if (currentSong) {
          try {
            const payload = currentSong.id 
              ? { songId: currentSong.id } 
              : { 
                  title: currentSong.title,
                  artist: currentSong.artist,
                  genre: currentSong.genre,
                  emotion: currentSong.emotion,
                  songUrl: currentSong.songUrl,
                  thumbnail: currentSong.thumbnail,
                  language: currentSong.language || 'English',
                  durationMs: currentSong.durationMs || 180000,
                  providerId: currentSong.providerId,
                  providerTrackId: currentSong.providerTrackId
                };
            await API.post('/api/favorites', payload);
            speakText(`Added ${currentSong.title} to your favorites list.`);
          } catch (e) {
            console.error("AI like song failed:", e);
          }
        }
        break;

      case 'scan_emotion':
        setShowScanModal(true);
        if (location.pathname !== '/dashboard') {
          navigate('/dashboard');
        }
        speakText("Triggering expression scanner now. Please look at the camera.");
        break;

      case 'get_stats':
        try {
          const res = await API.get('/api/users/profile');
          const emoRes = await API.get('/api/emotion/history');
          const count = emoRes.data.length;
          speakText(`You have logged ${count} mood scanning sessions since joining AuraBeat.`);
        } catch(e) {
          speakText("I'm unable to load your statistics details right now.");
        }
        break;

      case 'logout':
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        break;

      default:
        console.warn("AI command matches no action: " + action);
    }
  };

  // Helper to trigger commands directly from chat actions
  const processAIChatResponse = (chatResult) => {
    const { botResponse, action, param } = chatResult;
    setAiResponse(botResponse);
    speakText(botResponse);
    if (action && action !== 'none') {
      executeAICommand(action, param, botResponse);
    }
  };

  return (
    <AIContext.Provider value={{
      aiResponse,
      isAiTalking,
      speakText,
      executeAICommand,
      processAIChatResponse,
      showScanModal,
      setShowScanModal,
      transcriptLogs,
      setTranscriptLogs
    }}>
      {children}
    </AIContext.Provider>
  );
};

export default AIContext;

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
