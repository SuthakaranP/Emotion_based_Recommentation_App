import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Robust SpeechRecognition hook.
 *
 * Key improvements over the original:
 *  - Uses non-continuous mode + manual restart to avoid Chrome's silent truncation bug.
 *  - `shouldRestartRef` flag ensures the recognition restarts automatically after each
 *    utterance while the caller wants it running (no more "hear once then stop" issue).
 *  - Proper cleanup: abort on unmount to prevent resource leaks.
 *  - Ignores `no-speech` and `aborted` errors — these are expected and non-fatal.
 */
const useSpeechRecognition = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState(true);

  const recognitionRef = useRef(null);
  const shouldRestartRef = useRef(false);
  const isActiveRef = useRef(false); // tracks whether .start() was called and not yet ended

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setBrowserSupportsSpeechRecognition(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;      // restart manually for reliability
    rec.interimResults = true;   // show live transcript while user speaks
    rec.lang = 'en-US';
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      isActiveRef.current = true;
      setListening(true);
    };

    rec.onend = () => {
      isActiveRef.current = false;
      setListening(false);
      // Auto-restart if caller still wants listening active
      if (shouldRestartRef.current) {
        setTimeout(() => {
          if (shouldRestartRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (_) {
              // Already started — ignore
            }
          }
        }, 250);
      }
    };

    rec.onerror = (event) => {
      // These are expected and non-fatal — silently ignore
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        console.error('[Speech] Microphone permission denied — disabling.');
        setBrowserSupportsSpeechRecognition(false);
        shouldRestartRef.current = false;
        return;
      }
      console.warn('[Speech] Recognition error (non-fatal):', event.error);
    };

    rec.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += chunk;
        } else {
          interim += chunk;
        }
      }
      // Prefer final over interim; accumulate finals
      setTranscript(final || interim);
    };

    recognitionRef.current = rec;

    return () => {
      shouldRestartRef.current = false;
      try { recognitionRef.current?.abort(); } catch (_) {}
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    shouldRestartRef.current = true;
    setTranscript('');
    if (!isActiveRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('[Speech] start() error:', err.message);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    if (recognitionRef.current && isActiveRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('[Speech] stop() error:', err.message);
      }
    }
  }, []);

  const resetTranscript = useCallback(() => setTranscript(''), []);

  return {
    listening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  };
};

export default useSpeechRecognition;
