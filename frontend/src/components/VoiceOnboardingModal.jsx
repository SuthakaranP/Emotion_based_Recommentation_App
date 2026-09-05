import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, X, Keyboard, Check, ShieldAlert, ArrowRight } from 'lucide-react';
import API from '../services/api';

const VoiceOnboardingModal = ({ isOpen, onClose, type }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState('GREETING'); 
  // STEPS: GREETING, GET_NAME, CONFIRM_NAME, GET_EMAIL, CONFIRM_EMAIL, GET_PASSWORD, CONFIRM_PASSWORD, SUBMITTING
  
  // Data state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Dialog state
  const [botMessage, setBotMessage] = useState('');
  const [userTranscript, setUserTranscript] = useState('');
  const [micStatus, setMicStatus] = useState('idle'); // idle, listening, processing, speaking
  
  // Fallback states
  const [failCount, setFailCount] = useState(0);
  const [manualInputActive, setManualInputActive] = useState(false);
  const [manualText, setManualText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittingLoading, setSubmittingLoading] = useState(false);

  const recognitionRef = useRef(null);

  // Initialize dialog prompt
  useEffect(() => {
    if (isOpen) {
      setStep('GREETING');
      setName('');
      setEmail('');
      setPassword('');
      setUserTranscript('');
      setFailCount(0);
      setManualInputActive(false);
      setManualText('');
      setErrorMsg('');
      
      const welcome = type === 'login'
        ? "Welcome to AuraBeat Voice Sign-in. You can say 'Hi I am' followed by your name to sign in quickly, or say 'start' to begin."
        : "Welcome to AuraBeat. Let's create your account. Say 'start' or 'yes' to begin.";
      setBotMessage(welcome);
      speak(welcome, () => {
        startListening();
      });
    } else {
      stopAllVoice();
    }
    return () => stopAllVoice();
  }, [isOpen]);

  const stopAllVoice = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setMicStatus('idle');
  };

  const speak = (text, callback) => {
    if (!window.speechSynthesis) {
      if (callback) callback();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.onstart = () => setMicStatus('speaking');
    utterance.onend = () => {
      setMicStatus('idle');
      if (callback) callback();
    };
    utterance.onerror = () => {
      setMicStatus('idle');
      if (callback) callback();
    };
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Browser does not support Speech Recognition.");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }

    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => {
      setMicStatus('listening');
      setUserTranscript('');
    };

    rec.onresult = (event) => {
      setMicStatus('processing');
      const resultText = event.results[0][0].transcript;
      setUserTranscript(resultText);
      handleSpeechResult(resultText);
    };

    rec.onerror = (e) => {
      console.error("[STT Error]:", e);
      setMicStatus('idle');
      handleSpeechError();
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const handleSpeechError = () => {
    // Increment fail count
    const nextFails = failCount + 1;
    setFailCount(nextFails);

    if (nextFails >= 3) {
      setManualInputActive(true);
      const text = "I'm having trouble hearing you. Please enter the details in the text box below.";
      setBotMessage(text);
      speak(text);
    } else {
      const retryText = "I didn't catch that. Could you please repeat it?";
      setBotMessage(retryText);
      speak(retryText, () => {
        startListening();
      });
    }
  };

  const cleanEmail = (text) => {
    return text
      .toLowerCase()
      .replace(/\s+at\s+/g, '@')
      .replace(/\s+dot\s+/g, '.')
      .replace(/\s+/g, '');
  };

  const cleanPassword = (text) => {
    return text.replace(/\s+/g, '');
  };

  const handleSpeechResult = (speech) => {
    setFailCount(0); // Reset on successful STT result
    const lower = speech.toLowerCase().trim();

    switch (step) {
      case 'GREETING': {
        // --- Fast-path: "Hi I am [name]" / "I'm [name]" / "My name is [name]" ---
        const nameIntroMatch = lower.match(
          /(?:hi|hello|hey)[,\s]+(?:i[`']?m|i\s+am|my\s+name\s+is)\s+([a-z]+)|(?:i[`']?m|i\s+am|my\s+name\s+is)\s+([a-z]+)/
        );
        if (nameIntroMatch) {
          const spokenName = (nameIntroMatch[1] || nameIntroMatch[2] || '').trim();
          if (spokenName.length > 1) {
            const displayName = spokenName.charAt(0).toUpperCase() + spokenName.slice(1);
            if (type === 'login') {
              // Pre-fill name and skip straight to email
              setName(displayName);
              setStep('GET_EMAIL');
              const msg = `Hi ${displayName}! Great to hear from you. Please tell me your email address to sign you in.`;
              setBotMessage(msg);
              speak(msg, () => startListening());
            } else {
              // Register: confirm name then continue
              setName(displayName);
              setStep('CONFIRM_NAME');
              const msg = `Nice to meet you, ${displayName}! Is that spelling correct? Say yes or no.`;
              setBotMessage(msg);
              speak(msg, () => startListening());
            }
            break;
          }
        }

        // --- Normal flow: "start" / "yes" / "ok" ---
        if (lower.includes('start') || lower.includes('yes') || lower.includes('ok') || lower.includes('begin') || lower.includes('sure')) {
          if (type === 'register') {
            setStep('GET_NAME');
            const msg = "What is your full name?";
            setBotMessage(msg);
            speak(msg, () => startListening());
          } else {
            setStep('GET_EMAIL');
            const msg = "Please tell me your email address.";
            setBotMessage(msg);
            speak(msg, () => startListening());
          }
        } else {
          // Anything else — just repeat the greeting and keep listening
          speak(botMessage, () => startListening());
        }
        break;
      }

      case 'GET_NAME':
        setName(speech);
        setStep('CONFIRM_NAME');
        const confirmNameMsg = `I heard ${speech}. Is that correct? Say yes or no.`;
        setBotMessage(`I heard "${speech}". Is that correct?`);
        speak(confirmNameMsg, () => startListening());
        break;

      case 'CONFIRM_NAME':
        if (lower.includes('yes') || lower.includes('correct') || lower.includes('sure') || lower.includes('right')) {
          setStep('GET_EMAIL');
          const msg = "Excellent. What is your email address?";
          setBotMessage(msg);
          speak(msg, () => startListening());
        } else {
          setStep('GET_NAME');
          const msg = "Let's try again. What is your name?";
          setBotMessage(msg);
          speak(msg, () => startListening());
        }
        break;

      case 'GET_EMAIL':
        const parsedEmail = cleanEmail(speech);
        setEmail(parsedEmail);
        setStep('CONFIRM_EMAIL');
        const confirmEmailMsg = `I heard ${parsedEmail.split('').join(' ')}. Is that correct? Say yes or no.`;
        setBotMessage(`I heard "${parsedEmail}". Is that correct?`);
        speak(confirmEmailMsg, () => startListening());
        break;

      case 'CONFIRM_EMAIL':
        if (lower.includes('yes') || lower.includes('correct') || lower.includes('sure') || lower.includes('right')) {
          setStep('GET_PASSWORD');
          const msg = "Got it. Please say your password.";
          setBotMessage(msg);
          speak(msg, () => startListening());
        } else {
          setStep('GET_EMAIL');
          const msg = "Let's try again. What is your email address?";
          setBotMessage(msg);
          speak(msg, () => startListening());
        }
        break;

      case 'GET_PASSWORD':
        const parsedPass = cleanPassword(speech);
        setPassword(parsedPass);
        setStep('CONFIRM_PASSWORD');
        const confirmPassMsg = `I heard password ${parsedPass.split('').join(' ')}. Is that correct? Say yes or no.`;
        setBotMessage(`I heard "${parsedPass}". Is that correct?`);
        speak(confirmPassMsg, () => startListening());
        break;

      case 'CONFIRM_PASSWORD':
        if (lower.includes('yes') || lower.includes('correct') || lower.includes('sure') || lower.includes('right')) {
          setStep('SUBMITTING');
          submitOnboarding(email, password, name);
        } else {
          setStep('GET_PASSWORD');
          const msg = "No problem. Please say your password again.";
          setBotMessage(msg);
          speak(msg, () => startListening());
        }
        break;

      default:
        break;
    }
  };

  const handleManualConfirm = () => {
    if (!manualText.trim()) return;
    
    setFailCount(0);
    setManualInputActive(false);
    const value = manualText.trim();
    setManualText('');

    switch (step) {
      case 'GET_NAME':
        setName(value);
        setStep('CONFIRM_NAME');
        setBotMessage(`I captured "${value}". Is that correct?`);
        speak(`I captured ${value}. Is that correct? Say yes or no.`, () => startListening());
        break;
      case 'GET_EMAIL':
        const parsedEmail = cleanEmail(value);
        setEmail(parsedEmail);
        setStep('CONFIRM_EMAIL');
        setBotMessage(`I captured "${parsedEmail}". Is that correct?`);
        speak(`I captured ${parsedEmail}. Is that correct? Say yes or no.`, () => startListening());
        break;
      case 'GET_PASSWORD':
        setPassword(value);
        setStep('CONFIRM_PASSWORD');
        setBotMessage(`I captured "${value}". Is that correct?`);
        speak(`I captured that password. Is that correct? Say yes or no.`, () => startListening());
        break;
      default:
        break;
    }
  };

  const submitOnboarding = async (subEmail, subPassword, subName) => {
    setSubmittingLoading(true);
    setErrorMsg('');
    setBotMessage("Verifying details with the database server...");
    speak("Verifying details with the server now.");

    try {
      if (type === 'login') {
        const response = await API.post('/api/login', { email: subEmail, password: subPassword });
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setBotMessage("Success! Access granted. Redirecting you to your dashboard console.");
        speak("Sign in successful! Welcome to AuraBeat.", () => {
          onClose();
          navigate('/dashboard');
        });
      } else {
        await API.post('/api/register', { name: subName, email: subEmail, password: subPassword });
        setBotMessage("Success! Account created. Redirecting to sign in page.");
        speak("Account created successfully! Redirecting you to sign in page now.", () => {
          onClose();
          navigate('/login');
        });
      }
    } catch (err) {
      const apiErr = err.response?.data?.message || 'Verification failed. Please check credentials or retry.';
      setErrorMsg(apiErr);
      setBotMessage("Oh! I encountered an error: " + apiErr);
      speak("An error occurred during verification. Let's restart.");
      setStep('GREETING');
      setFailCount(0);
    } finally {
      setSubmittingLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md glass-card bg-[#111]/90 border border-white/10 rounded-[32px] p-6 sm:p-8 flex flex-col items-center relative overflow-hidden shadow-2xl">
        
        {/* Background glow orb */}
        <div className="absolute -top-[50px] -left-[50px] w-48 h-48 bg-gradient-to-tr from-[#1DB954]/20 to-[#00D4FF]/20 rounded-full blur-3xl pointer-events-none z-0"></div>

        {/* Close Button */}
        <button
          onClick={() => { stopAllVoice(); onClose(); }}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. Header icon */}
        <div className="relative mb-6 z-10">
          <div className={`p-4 rounded-full transition-all duration-300 ${
            micStatus === 'listening' ? 'bg-[#1DB954]/20 text-[#1DB954] scale-110 shadow-lg shadow-[#1DB954]/20' :
            micStatus === 'speaking' ? 'bg-purple-500/20 text-purple-400 scale-105' :
            micStatus === 'processing' ? 'bg-cyan-500/20 text-cyan-400 animate-pulse' :
            'bg-white/5 text-slate-400'
          }`}>
            {micStatus === 'listening' ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
          </div>

          {/* Sound pulse waves during listening */}
          {micStatus === 'listening' && (
            <div className="absolute inset-0 rounded-full border border-[#1DB954]/30 animate-ping"></div>
          )}
        </div>

        {/* 2. Visual Mic Status Banner */}
        <div className="mb-4 z-10">
          <span className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all ${
            micStatus === 'listening' ? 'bg-[#1DB954]/10 text-[#1DB954] border-[#1DB954]/30 animate-pulse' :
            micStatus === 'processing' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
            micStatus === 'speaking' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
            'bg-slate-800 text-slate-500 border-white/5'
          }`}>
            {micStatus === 'listening' ? 'Listening...' :
             micStatus === 'processing' ? 'Processing...' :
             micStatus === 'speaking' ? 'AI Speaking...' :
             'Mic Idle'}
          </span>
        </div>

        {/* 3. Bot Prompt Text */}
        <div className="w-full text-center mb-6 z-10">
          <p className="text-md sm:text-lg font-bold text-white font-poppins leading-snug">
            {botMessage}
          </p>
          {errorMsg && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center justify-center gap-1.5 font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* 4. Subtitle transcript */}
        {userTranscript && (
          <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-3.5 mb-6 text-center text-xs text-slate-300 italic font-medium z-10 max-h-[80px] overflow-y-auto">
            " {userTranscript} "
          </div>
        )}

        {/* 5. Keyboard manual fallback input */}
        {manualInputActive && (
          <div className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-6 space-y-3 z-10 animate-slideUp">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#1DB954] uppercase tracking-wider font-poppins">
              <Keyboard className="w-4 h-4" />
              <span>Manual Entry Fallback</span>
            </div>

            <div className="flex gap-2">
              <input
                type={step === 'GET_PASSWORD' ? 'password' : 'text'}
                placeholder={
                  step === 'GET_NAME' ? 'Enter your name' :
                  step === 'GET_EMAIL' ? 'Enter email address' :
                  'Enter password'
                }
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#1DB954]/50"
                onKeyDown={(e) => { if (e.key === 'Enter') handleManualConfirm(); }}
              />
              <button
                onClick={handleManualConfirm}
                className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-200 active:scale-95"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 6. Form progress visual tracker */}
        <div className="w-full grid grid-cols-3 gap-2 mt-2 z-10">
          <div className={`h-1 rounded-full transition-all ${
            step !== 'GREETING' ? 'bg-[#1DB954]' : 'bg-white/10'
          }`} />
          <div className={`h-1 rounded-full transition-all ${
            step === 'GET_PASSWORD' || step === 'CONFIRM_PASSWORD' || step === 'SUBMITTING' || (type === 'register' && (step === 'GET_EMAIL' || step === 'CONFIRM_EMAIL')) ? 'bg-[#1DB954]' : 'bg-white/10'
          }`} />
          <div className={`h-1 rounded-full transition-all ${
            step === 'SUBMITTING' ? 'bg-gradient-to-r from-[#1DB954] to-[#00D4FF]' : 'bg-white/10'
          }`} />
        </div>

        {submittingLoading && (
          <div className="absolute inset-0 bg-black/60 z-20 flex flex-col items-center justify-center">
            <span className="w-8 h-8 border-4 border-[#1db954] border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-poppins">Submitting Auth Credentials</span>
          </div>
        )}

      </div>
    </div>
  );
};

export default VoiceOnboardingModal;
