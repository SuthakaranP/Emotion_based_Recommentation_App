import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import API from '../services/api';

const MusicContext = createContext(null);

/**
 * Resolve the best playable URL for a given song:
 *  1. If the stored URL is a soundhelix placeholder → call /api/songs/resolve-stream
 *     to get a real JioSaavn CDN URL for the title+artist combination.
 *  2. If the URL lives on Saavn CDN → route it through the backend audio proxy
 *     (/api/audio/stream) so CORS restrictions on the CDN are bypassed.
 *  3. Everything else is returned as-is.
 */
const resolveAudioUrl = async (song) => {
  let url = song.songUrl;

  if (!url) return url;

  // Step 1 — swap soundhelix placeholder for a real JioSaavn track
  if (url.includes('soundhelix.com')) {
    try {
      const res = await API.get(
        `/api/songs/resolve-stream?title=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(song.artist)}`
      );
      if (res.data?.streamUrl) {
        url = res.data.streamUrl;
        console.log(`[Music] Resolved real stream for "${song.title}":`, url.substring(0, 60) + '...');
      }
    } catch (e) {
      console.warn(`[Music] Could not resolve real stream for "${song.title}" — using placeholder.`);
    }
  }

  // Step 2 — proxy JioSaavn CDN URLs through the backend to avoid CORS
  if (url && (url.includes('saavncdn.com') || url.includes('jiosaavn'))) {
    url = `/api/audio/stream?url=${encodeURIComponent(url)}`;
  }

  return url;
};

export const MusicProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [queue, setQueue] = useState([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(-1);

  // Advanced play modes
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('all'); // 'off', 'one', 'all'

  const [searchQuery, setSearchQuery] = useState('');

  const audioRef = useRef(null);

  // Refs to sync state with audio events (avoids stale closure issues)
  const isShuffleRef = useRef(isShuffle);
  const repeatModeRef = useRef(repeatMode);
  const queueRef = useRef(queue);
  const currentQueueIndexRef = useRef(currentQueueIndex);

  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { currentQueueIndexRef.current = currentQueueIndex; }, [currentQueueIndex]);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const handleTimeUpdate = () => {
      setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audioRef.current.duration);
    };

    const handleEnded = () => {
      const mode = repeatModeRef.current;
      if (mode === 'one') {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(err => console.error("Replay failed:", err));
        }
      } else {
        handleNext();
      }
    };

    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle source changes — resolve real URL before setting on <audio>
  useEffect(() => {
    if (currentSong && audioRef.current) {
      const loadAndPlay = async () => {
        try {
          const resolvedUrl = await resolveAudioUrl(currentSong);
          if (!audioRef.current) return;
          audioRef.current.src = resolvedUrl || currentSong.songUrl;

          if (isPlaying) {
            audioRef.current.play().catch(err => {
              console.error("Audio playback interrupted:", err);
              setIsPlaying(false);
            });
          }
        } catch (err) {
          console.error('[Music] loadAndPlay error:', err);
        }
      };
      loadAndPlay();
    }
  }, [currentSong]);

  // Handle play/pause toggle
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.error("Playback failed:", err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const playSong = (song, playlistQueue = []) => {
    if (playlistQueue.length > 0) {
      setQueue(playlistQueue);
      const index = playlistQueue.findIndex(
        s => s.id === song.id || (s.providerTrackId && s.providerTrackId === song.providerTrackId)
      );
      setCurrentQueueIndex(index >= 0 ? index : 0);
    } else {
      setQueue([song]);
      setCurrentQueueIndex(0);
    }

    setCurrentSong(song);
    setIsPlaying(true);
  };

  const pauseSong = () => {
    setIsPlaying(false);
  };

  const resumeSong = () => {
    if (currentSong) {
      setIsPlaying(true);
    }
  };

  const seek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleNext = () => {
    const q = queueRef.current;
    const index = currentQueueIndexRef.current;
    const shuffle = isShuffleRef.current;
    const mode = repeatModeRef.current;

    if (q.length === 0 || index === -1) return;

    let nextIndex;
    if (shuffle) {
      if (q.length > 1) {
        do {
          nextIndex = Math.floor(Math.random() * q.length);
        } while (nextIndex === index);
      } else {
        nextIndex = 0;
      }
    } else {
      nextIndex = index + 1;
      if (nextIndex >= q.length) {
        if (mode === 'all') {
          nextIndex = 0;
        } else {
          setIsPlaying(false);
          return;
        }
      }
    }

    setCurrentQueueIndex(nextIndex);
    setCurrentSong(q[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    const q = queueRef.current;
    const index = currentQueueIndexRef.current;
    const shuffle = isShuffleRef.current;

    if (q.length === 0 || index === -1) return;

    let prevIndex;
    if (shuffle) {
      if (q.length > 1) {
        do {
          prevIndex = Math.floor(Math.random() * q.length);
        } while (prevIndex === index);
      } else {
        prevIndex = 0;
      }
    } else {
      prevIndex = index - 1;
      if (prevIndex < 0) prevIndex = q.length - 1;
    }

    setCurrentQueueIndex(prevIndex);
    setCurrentSong(q[prevIndex]);
    setIsPlaying(true);
  };

  const toggleShuffle = () => setIsShuffle(prev => !prev);

  const cycleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  return (
    <MusicContext.Provider value={{
      currentSong,
      isPlaying,
      duration,
      currentTime,
      volume,
      isShuffle,
      repeatMode,
      queue,
      currentQueueIndex,
      searchQuery,
      setSearchQuery,
      playSong,
      pauseSong,
      resumeSong,
      seek,
      setVolume,
      handleNext,
      handlePrev,
      toggleShuffle,
      cycleRepeat,
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used within a MusicProvider');
  return ctx;
};

export default MusicContext;
