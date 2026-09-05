import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Music, Home, Search, PlaySquare, Heart, User, LogOut, Menu, X, 
  ChevronLeft, ChevronRight, Bell, Settings, Mic, MicOff, Compass, 
  Flame, Clock, Sparkles, ShieldAlert, Terminal, MessageSquare
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { useAI } from '../context/AIContext';
import API from '../services/api';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    'Arabic Kuthu', 'Lofi Generator', 'Pradeep Kumar'
  ]);
  const dropdownRef = useRef(null);

  const { searchQuery, setSearchQuery } = useMusic();

  // Consume global AI Context
  const { isAiTalking, processAIChatResponse, transcriptLogs, setTranscriptLogs } = useAI();
  const [alwaysListen, setAlwaysListen] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const recognitionRef = useRef(null);
  const isRecognitionActiveRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (alwaysListen && !isAiTalking) {
      if (!recognitionRef.current) {
        const rec = new SpeechRecognition();
        rec.continuous = false; // Use non-continuous: restart manually for better reliability
        rec.interimResults = false;
        rec.lang = 'en-US';
        rec._shouldRestart = false; // control flag — avoids stale closure

        rec.onstart = () => {
          isRecognitionActiveRef.current = true;
          console.log("[AlwaysListen] Listening...");
        };

        rec.onresult = async (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript.trim()) {
            const query = finalTranscript.trim();
            console.log("[AlwaysListen] Heard command: ", query);
            
            // Add user voice command to transcript logs
            setTranscriptLogs(prev => [
              { action: 'Voice Command', param: query, timestamp: new Date(), outcome: 'Processing...' },
              ...prev.slice(0, 19)
            ]);

            try {
              const response = await API.post('/api/chat', { message: query });
              const chatResult = response.data;
              
              setTranscriptLogs(prev => {
                const updated = [...prev];
                if (updated.length > 0 && updated[0].param === query) {
                  updated[0].outcome = `AI: "${chatResult.botResponse}" [Action: ${chatResult.action || 'none'}]`;
                }
                return updated;
              });

              processAIChatResponse(chatResult);
            } catch (err) {
              console.error("[AlwaysListen] AI Command error: ", err);
              setTranscriptLogs(prev => {
                const updated = [...prev];
                if (updated.length > 0 && updated[0].param === query) {
                  updated[0].outcome = 'Failed to execute command';
                }
                return updated;
              });
            }
          }
        };

        rec.onerror = (event) => {
          // 'no-speech' is normal silence — don't log it as error, onend handles restart
          if (event.error === 'no-speech' || event.error === 'audio-capture') {
            return; // Silently ignore
          }
          if (event.error === 'not-allowed') {
            console.warn("[AlwaysListen] Mic permission denied. Disabling always-listen.");
            setAlwaysListen(false);
            return;
          }
          console.warn("[AlwaysListen] Recognition error (non-critical):", event.error);
        };

        rec.onend = () => {
          isRecognitionActiveRef.current = false;
          // Check _shouldRestart flag instead of stale state closure
          if (rec._shouldRestart) {
            // 600ms backoff prevents tight loop on persistent no-speech
            setTimeout(() => {
              if (rec._shouldRestart) {
                try {
                  rec.start();
                } catch (e) {
                  // Already started — ignore
                }
              }
            }, 600);
          }
        };

        recognitionRef.current = rec;
      }

      recognitionRef.current._shouldRestart = true;
      if (!isRecognitionActiveRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("[AlwaysListen] Error starting recognition: ", e);
        }
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current._shouldRestart = false;
        if (isRecognitionActiveRef.current) {
          recognitionRef.current.stop();
        }
      }
    }

    return () => {
      if (recognitionRef.current && isRecognitionActiveRef.current) {
        recognitionRef.current._shouldRestart = false;
        recognitionRef.current.stop();
      }
    };
  }, [alwaysListen, isAiTalking]);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const isActive = (path) => {
    const [linkPath, linkQuery] = path.split('?');
    if (linkQuery) {
      const params = new URLSearchParams(linkQuery);
      const linkTab = params.get('tab');
      const currentParams = new URLSearchParams(location.search);
      const currentTab = currentParams.get('tab');
      return location.pathname === linkPath && currentTab === linkTab;
    }
    return location.pathname === path && !location.search;
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Web Speech API Voice Search
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Google Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      if (location.pathname !== '/dashboard') {
        navigate('/dashboard');
      }
      setIsListening(false);
    };
    recognition.onerror = (e) => {
      console.error(e);
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.start();
  };

  // Sidebar Links config
  const mainNavLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Discover', path: '/dashboard?tab=discover', icon: Compass },
    { name: 'Trending', path: '/dashboard?tab=trending', icon: Flame },
    { name: 'AI Assistant', path: '/dashboard?tab=ai', icon: Sparkles }
  ];

  const libraryLinks = [
    { name: 'Playlists', path: '/playlist', icon: PlaySquare },
    { name: 'Favorites', path: '/playlist?tab=favorites', icon: Heart },
    { name: 'Profile & Stats', path: '/profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-slate-100 flex flex-col font-inter selection:bg-[#1DB954] selection:text-black">
      {/* 1. PUBLIC HEADER (When user is NOT logged in) */}
      {!token && (
        <nav className="sticky top-0 z-50 w-full glass-navbar py-4">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2.5 bg-gradient-to-tr from-[#1DB954] to-[#00D4FF] rounded-full text-black shadow-lg shadow-[#1DB954]/20 group-hover:scale-105 transition-all">
                <Music className="w-5 h-5 fill-current" />
              </div>
              <span className="font-manrope font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                AuraBeat
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-slate-400 hover:text-white px-4 py-2 transition-colors">
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-[#1DB954] to-[#00D4FF] hover:from-[#1ed760] hover:to-[#2be0ff] text-black text-sm font-bold rounded-full transition-all duration-200 hover:scale-105 active:scale-100 shadow-md shadow-[#1DB954]/10"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </nav>
      )}

      {/* 2. AUTHENTICATED WEB APP CONTAINER */}
      {token && (
        <div className="flex flex-col md:flex-row flex-1">
          {/* LEFT SIDEBAR (Floating Glass Layout - Linear Style) */}
          <aside className="hidden md:flex flex-col w-64 bg-[#0A0A0A] border-r border-white/5 p-6 fixed h-screen z-20">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 mb-8 cursor-pointer group" 
              onClick={() => navigate('/dashboard')}
            >
              <div className="p-2 bg-gradient-to-tr from-[#1DB954] to-[#00D4FF] rounded-full text-black shadow-md shadow-[#1DB954]/10 group-hover:rotate-12 transition-all">
                <Music className="w-5 h-5 fill-current" />
              </div>
              <h1 className="font-manrope font-extrabold text-xl text-white tracking-tight">
                AuraBeat
              </h1>
            </div>

            {/* Navigation Lists */}
            <div className="flex-grow space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">Menu</span>
                {mainNavLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive(link.path) 
                          ? 'bg-white/5 text-[#1DB954] border-l-2 border-[#1DB954]' 
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="space-y-1 pt-4 border-t border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">Your Library</span>
                {libraryLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive(link.path) 
                          ? 'bg-white/5 text-[#1DB954] border-l-2 border-[#1DB954]' 
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>

              {user?.email?.toLowerCase().includes('admin') && (
                <div className="space-y-1 pt-4 border-t border-white/5">
                  <span className="text-[10px] font-bold text-[#1DB954] uppercase tracking-widest px-3">Admin</span>
                  <Link
                    to="/admin"
                    className={`flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive('/admin') 
                        ? 'bg-white/5 text-[#1DB954] border-l-2 border-[#1DB954]' 
                        : 'text-[#1DB954]/80 hover:text-[#1DB954] hover:bg-[#1DB954]/5'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 text-[#1DB954]" />
                    <span>Admin Console</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Logout button at bottom */}
            <div className="pt-4 border-t border-white/5">
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* MAIN PAGE SHELL (Sticky Glass Header + Fluid Scroll Container) */}
          <div className="flex-1 flex flex-col md:pl-64">
            
            {/* STICKY GLASS NAVBAR */}
            <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 glass-navbar">
              {/* Back / Forward History arrows */}
              <div className="hidden md:flex items-center gap-2">
                <button 
                  onClick={() => navigate(-1)} 
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer border border-white/5"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => navigate(1)} 
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer border border-white/5"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile menu toggle button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="md:hidden p-2 text-slate-400 hover:text-white bg-white/5 rounded-full border border-white/5"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* SEARCH BAR (Center Pill Shape, Suggestions, Voice) */}
              <div className="flex-1 max-w-md mx-6 relative">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 absolute left-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search songs, artists, moods..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (location.pathname !== '/dashboard') {
                        navigate('/dashboard');
                      }
                    }}
                    onFocus={() => setShowSearchSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                    className="w-full pl-11 pr-12 py-2 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-full text-sm placeholder-slate-400 focus:outline-none transition-all"
                  />
                  <button 
                    onClick={handleVoiceSearch}
                    className={`absolute right-4 p-1 rounded-full hover:bg-white/10 transition-all ${
                      isListening ? 'text-[#1DB954] animate-pulse bg-[#1DB954]/10' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Voice Search"
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>

                {/* Auto Suggestions Panel */}
                {showSearchSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#171717] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Recent Searches</span>
                    <div className="space-y-1">
                      {recentSearches.map((term, index) => (
                        <button
                          key={index}
                          onMouseDown={() => {
                            setSearchQuery(term);
                            if (location.pathname !== '/dashboard') navigate('/dashboard');
                          }}
                          className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION TOGGLES & USER PROFILE (Right) */}
              <div className="flex items-center gap-3">
                <button 
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white border border-white/5 transition-all relative"
                  onClick={() => alert("No new notifications")}
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#1DB954] rounded-full"></span>
                </button>
                <button 
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white border border-white/5 transition-all"
                  onClick={() => navigate('/profile')}
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Profile drop tag */}
                <div className="relative" ref={dropdownRef}>
                  <div 
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 bg-[#171717] hover:bg-[#282828] py-1.5 pl-1.5 pr-3 rounded-full cursor-pointer border border-white/10 transition-all select-none"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#1DB954] to-[#00D4FF] flex items-center justify-center font-bold text-black uppercase text-[10px]">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-xs font-bold text-white truncate max-w-[80px]">
                      {user?.name || 'User'}
                    </span>
                  </div>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#171717] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
                      {user?.email?.toLowerCase().includes('admin') && (
                        <button 
                          onClick={() => { setUserDropdownOpen(false); navigate('/admin'); }}
                          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs text-[#1DB954] hover:bg-white/5 transition-all text-left font-bold"
                        >
                          <ShieldAlert className="w-4 h-4 text-[#1DB954]" />
                          Admin Console
                        </button>
                      )}
                      <button 
                        onClick={() => { setUserDropdownOpen(false); navigate('/profile'); }}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-all text-left"
                      >
                        <User className="w-4 h-4" />
                        Profile Settings
                      </button>
                      <button 
                        onClick={() => { setUserDropdownOpen(false); handleLogout(); }}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/5 transition-all text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
              <div className="md:hidden fixed inset-0 top-[68px] z-40 bg-[#0F0F0F]/95 backdrop-blur-2xl flex flex-col p-6 space-y-6">
                <nav className="flex-1 space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Navigation</span>
                  {mainNavLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl text-md font-bold ${
                          isActive(link.path) ? 'bg-[#1DB954]/10 text-[#1DB954]' : 'text-slate-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                  
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mt-6 mb-2">Library</span>
                  {libraryLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl text-md font-bold ${
                          isActive(link.path) ? 'bg-[#1DB954]/10 text-[#1DB954]' : 'text-slate-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}

                  {user?.email?.toLowerCase().includes('admin') && (
                    <>
                      <span className="text-[10px] font-bold text-[#1DB954] uppercase tracking-widest block mt-6 mb-2">Admin</span>
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl text-md font-bold ${
                          isActive('/admin') ? 'bg-[#1DB954]/10 text-[#1DB954]' : 'text-[#1DB954]/80'
                        }`}
                      >
                        <ShieldAlert className="w-5 h-5 text-[#1DB954]" />
                        <span>Admin Console</span>
                      </Link>
                    </>
                  )}
                </nav>
                <div className="pt-4 border-t border-white/5">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-md font-bold text-red-400 bg-red-500/5"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}

            {/* MAIN APP CONTAINER */}
            <main className="flex-grow p-4 md:p-8 pb-32 md:pb-36 max-w-7xl mx-auto w-full">
              {children}
            </main>
          </div>
        </div>
      )}

      {/* RENDER PUBLIC VIEW (Home page, login, register headers) */}
      {!token && (
        <main className="flex-grow">
          {children}
        </main>
      )}

      {/* ALWAYS LISTEN FLOATING WIDGET */}
      {token && (
        <div className="fixed bottom-28 right-6 md:right-8 z-40 flex flex-col items-end gap-3 select-none">
          {/* Transcript Logs Console Window */}
          {showConsole && (
            <div className="w-80 h-64 rounded-3xl border border-white/10 bg-black/80 backdrop-blur-2xl p-4 shadow-2xl flex flex-col justify-between overflow-hidden animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-poppins">
                  <Terminal className="w-3.5 h-3.5 text-[#1DB954]" /> AI Assistant Audit Logs
                </span>
                <button 
                  onClick={() => setShowConsole(false)}
                  className="text-xs text-slate-500 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 scrollbar-thin">
                {transcriptLogs.length === 0 ? (
                  <div className="text-center text-slate-500 text-[11px] py-12">
                    No logs logged. Activate voice/text commands.
                  </div>
                ) : (
                  transcriptLogs.map((log, idx) => (
                    <div key={idx} className="border-b border-white/5 pb-2 text-[10px]">
                      <div className="flex justify-between items-center text-slate-500 mb-0.5">
                        <span className="font-semibold uppercase tracking-wider text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-[#00D4FF]">
                          {log.action}
                        </span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-300 font-medium font-mono">
                        &gt; "{log.param}"
                      </p>
                      <p className="text-[#1DB954] mt-0.5 font-medium">
                        {log.outcome}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Floating Pill Toggle Button Bar */}
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl">
            {/* Terminal toggle button */}
            <button
              onClick={() => setShowConsole(!showConsole)}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                showConsole 
                  ? 'bg-white/10 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Show Assistant Logs"
            >
              <Terminal className="w-4 h-4" />
            </button>

            {/* Always Listen microphone trigger button */}
            <button
              onClick={() => setAlwaysListen(!alwaysListen)}
              className={`px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                alwaysListen 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse shadow-lg shadow-red-500/20' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
              title={alwaysListen ? "Turn Off Always Listening" : "Turn On Always Listening"}
            >
              {alwaysListen ? (
                <>
                  <Mic className="w-3.5 h-3.5 text-white" />
                  <span>Listening</span>
                </>
              ) : (
                <>
                  <MicOff className="w-3.5 h-3.5 text-slate-400" />
                  <span>Always Listen</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;