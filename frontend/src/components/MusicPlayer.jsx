import React, { useState, useEffect } from 'react';
import { useMusic } from '../context/MusicContext';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Heart, Shuffle, Repeat 
} from 'lucide-react';
import API from '../services/api';

const MusicPlayer = () => {
  const {
    currentSong,
    isPlaying,
    duration,
    currentTime,
    volume,
    setVolume,
    pauseSong,
    resumeSong,
    seek,
    nextSong,
    prevSong,
    isShuffle,
    setIsShuffle,
    repeatMode,
    setRepeatMode
  } = useMusic();

  const [isLiked, setIsLiked] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.8);

  useEffect(() => {
    if (currentSong) {
      checkFavoriteStatus();
    }
  }, [currentSong]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await API.get('/api/favorites');
      const favorites = response.data;
      const isFav = favorites.some(fav => fav.song.id === currentSong.id || (fav.song.providerTrackId && fav.song.providerTrackId === currentSong.providerTrackId));
      setIsLiked(isFav);
    } catch (err) {
      console.error('Error checking favorite status:', err);
    }
  };

  const handleLikeToggle = async () => {
    if (!currentSong) return;
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
      const response = await API.post('/api/favorites', payload);
      setIsLiked(response.data.isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      resumeSong();
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume);
    }
  };

  const handleProgressChange = (e) => {
    seek(parseFloat(e.target.value));
  };

  const handleRepeatCycle = () => {
    if (repeatMode === 'all') {
      setRepeatMode('one');
    } else if (repeatMode === 'one') {
      setRepeatMode('off');
    } else {
      setRepeatMode('all');
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-8 md:right-8 z-50 rounded-3xl border border-white/10 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 select-none bg-black/60 backdrop-blur-2xl shadow-2xl">
      
      {/* 1. Track Cover Details (Left) */}
      <div className="flex items-center gap-4 w-full md:w-1/4 justify-start">
        <div className="relative group">
          <img
            src={currentSong.thumbnail}
            alt={currentSong.title}
            className="w-14 h-14 rounded-2xl object-cover shadow-lg border border-white/10 group-hover:scale-105 transition-transform"
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
              <div className="eq-container">
                <span className="eq-bar"></span>
                <span className="eq-bar"></span>
                <span className="eq-bar"></span>
              </div>
            </div>
          )}
        </div>
        
        <div className="overflow-hidden max-w-[150px] sm:max-w-[200px]">
          <h4 className="text-sm font-bold text-white truncate hover:underline cursor-pointer">{currentSong.title}</h4>
          <p className="text-xs text-slate-400 truncate hover:text-white mt-0.5">{currentSong.artist}</p>
        </div>
        <button
          onClick={handleLikeToggle}
          className={`p-2 rounded-full hover:bg-white/5 active:scale-95 transition-all ${
            isLiked ? 'text-[#1db954]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Heart className="w-4.5 h-4.5" fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* 2. Audio Playback Control Panel (Center) */}
      <div className="flex flex-col items-center gap-2.5 w-full md:w-2/4">
        {/* Buttons row */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`p-2 rounded-full hover:bg-white/5 active:scale-95 transition-all ${
              isShuffle ? 'text-[#1db954] bg-[#1db954]/5' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          
          <button
            onClick={prevSong}
            className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-all active:scale-95"
            title="Previous Track"
          >
            <SkipBack className="w-4.5 h-4.5 fill-current" />
          </button>

          <button
            onClick={handlePlayPause}
            className="p-3 bg-gradient-to-tr from-[#1DB954] to-[#00D4FF] hover:from-[#1ed760] hover:to-[#2be0ff] text-black hover:scale-105 rounded-full transition-all active:scale-95 shadow-lg shadow-[#1DB954]/20 flex items-center justify-center cursor-pointer"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-[1px]" />}
          </button>

          <button
            onClick={nextSong}
            className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-all active:scale-95"
            title="Next Track"
          >
            <SkipForward className="w-4.5 h-4.5 fill-current" />
          </button>

          <button
            onClick={handleRepeatCycle}
            className={`p-2 rounded-full hover:bg-white/5 active:scale-95 transition-all relative ${
              repeatMode !== 'off' ? 'text-[#1db954] bg-[#1db954]/5' : 'text-slate-400 hover:text-white'
            }`}
            title={`Repeat mode: ${repeatMode}`}
          >
            <Repeat className="w-4 h-4" />
            {repeatMode === 'one' && (
              <span className="absolute bottom-[2px] right-[2px] bg-gradient-to-tr from-[#1DB954] to-[#00D4FF] text-black text-[6px] font-extrabold w-2.5 h-2.5 rounded-full flex items-center justify-center font-mono select-none">
                1
              </span>
            )}
          </button>
        </div>

        {/* Timeline progress slider row */}
        <div className="flex items-center gap-4 w-full max-w-xl group">
          <span className="text-[10px] text-slate-400 font-mono font-semibold w-9 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleProgressChange}
            className="flex-1 h-1 rounded-lg appearance-none cursor-pointer bg-white/10 accent-[#1db954] hover:accent-[#1ed760] transition-colors focus:outline-none"
            style={{
              background: `linear-gradient(to right, #1db954 0%, #1db954 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.1) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.1) 100%)`
            }}
          />
          <span className="text-[10px] text-slate-400 font-mono font-semibold w-9">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. Audio Volume and utility panel (Right) */}
      <div className="flex items-center justify-end gap-3 w-full md:w-1/4">
        <button
          onClick={toggleMute}
          className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {volume === 0 ? <VolumeX className="w-4.5 h-4.5 text-[#1db954]" /> : <Volume2 className="w-4.5 h-4.5" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-20 sm:w-28 h-1 rounded-lg appearance-none cursor-pointer bg-white/10 accent-[#1db954] focus:outline-none"
          style={{
            background: `linear-gradient(to right, #1db954 0%, #1db954 ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%, rgba(255,255,255,0.1) 100%)`
          }}
        />
      </div>

    </div>
  );
};

export default MusicPlayer;
