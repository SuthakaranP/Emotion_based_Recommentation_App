import React, { useState, useEffect } from 'react';
import { useMusic } from '../context/MusicContext';
import { 
  Play, Pause, Trash2, Download, Share2, Plus, FolderHeart, Calendar, 
  Clock, PlusCircle, CheckCircle, Disc 
} from 'lucide-react';
import API from '../services/api';

const Playlist = () => {
  const { playSong, currentSong, isPlaying, pauseSong, resumeSong } = useMusic();
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  
  // Playlist Creator States
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [selectedEmotion, setSelectedEmotion] = useState('Neutral');
  const [loading, setLoading] = useState(false);
  const [activePlaylistId, setActivePlaylistId] = useState(null);

  useEffect(() => {
    fetchPlaylists();
    fetchSongs();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await API.get('/api/playlists');
      setPlaylists(response.data);
      if (response.data.length > 0 && !activePlaylistId) {
        setActivePlaylistId(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching playlists:', err);
    }
  };

  const fetchSongs = async () => {
    try {
      const response = await API.get('/api/songs');
      setSongs(response.data);
    } catch (err) {
      console.error('Error fetching songs:', err);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim() || selectedSongs.length === 0) return;
    setLoading(true);

    try {
      const response = await API.post('/api/playlists', {
        playlistName: newPlaylistName,
        emotion: selectedEmotion,
        songIds: selectedSongs
      });
      
      setPlaylists(prev => [...prev, response.data]);
      setActivePlaylistId(response.data.id);
      setNewPlaylistName('');
      setSelectedSongs([]);
      alert('Playlist created successfully!');
    } catch (err) {
      console.error('Error creating playlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    try {
      await API.delete(`/api/playlists/${id}`);
      setPlaylists(prev => prev.filter(p => p.id !== id));
      if (activePlaylistId === id) setActivePlaylistId(null);
    } catch (err) {
      console.error('Error deleting playlist:', err);
    }
  };

  const handleToggleSongSelection = (songId) => {
    setSelectedSongs(prev =>
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const handlePlayPlaylist = (playlist) => {
    if (playlist.songs && playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    } else {
      alert('This playlist is empty.');
    }
  };

  const handleDownloadPlaylist = (playlist) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(playlist, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${playlist.playlistName.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSharePlaylist = (playlist) => {
    const shareUrl = `${window.location.origin}/playlist?id=${playlist.id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        alert(`Copied share link to clipboard: ${shareUrl}`);
      })
      .catch((err) => {
        console.error('Could not copy link:', err);
      });
  };

  const activePlaylist = playlists.find(p => p.id === activePlaylistId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-inter pb-12 relative select-none">
      
      {/* Background radial mesh */}
      <div className="absolute top-[-5%] left-[-5%] w-[40vw] h-[40vw] bg-radial from-[#00D4FF]/5 via-transparent to-transparent blur-[120px] pointer-events-none z-0"></div>

      {/* 1. Playlists Sidebar Drawer (4 cols) */}
      <div className="lg:col-span-4 space-y-6 z-10 relative">
        <div className="glass-card p-6 border border-white/5 bg-black/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <FolderHeart className="w-5 h-5 text-[#1db954]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-poppins">Playlists Library</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">{playlists.length} Mixes</span>
          </div>

          {playlists.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs font-semibold">
              No playlists found. Build one using the form below.
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  onClick={() => setActivePlaylistId(playlist.id)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                    activePlaylistId === playlist.id
                      ? 'bg-white/5 border-l-4 border-l-[#1db954] border-white/10'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="overflow-hidden pr-2">
                      <h4 className="font-bold text-xs text-white truncate font-poppins">{playlist.playlistName}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">
                        {playlist.emotion || 'Mixed'} • {playlist.songs?.length || 0} tracks
                      </p>
                    </div>

                    <div className="flex gap-1 items-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handlePlayPlaylist(playlist)}
                        className="p-2 text-black hover:scale-105 bg-[#1db954] hover:bg-[#1ed760] rounded-full transition-all flex items-center justify-center shadow-md cursor-pointer"
                        title="Play playlist"
                      >
                        <Play className="w-3 h-3 fill-current" />
                      </button>
                      <button
                        onClick={(e) => handleDeletePlaylist(playlist.id, e)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-full transition-all cursor-pointer"
                        title="Delete playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Playlist detailed tracks tabular list & creator form (8 cols) */}
      <div className="lg:col-span-8 space-y-6 z-10 relative">
        
        {/* Detail Viewer */}
        {activePlaylist ? (
          <div className="glass-card overflow-hidden border border-white/5 bg-black/20">
            {/* Header Ambient Banner */}
            <div className="bg-gradient-to-b from-white/10 to-transparent p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-end relative overflow-hidden">
              <div className="w-28 h-28 bg-[#171717] flex items-center justify-center rounded-2xl shadow-2xl border border-white/10 shrink-0">
                <Disc className="w-12 h-12 text-[#1db954] animate-spin-slow" />
              </div>

              <div className="space-y-2.5 flex-1">
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest font-poppins">Playlist Mixer</span>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-poppins">{activePlaylist.playlistName}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>Emotion: <span className="text-[#1db954] font-bold uppercase">{activePlaylist.emotion || 'Mixed'}</span></span>
                  <span>•</span>
                  <span>{activePlaylist.songs?.length || 0} tracks</span>
                </div>
              </div>
            </div>

            {/* Play/Control Bar */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handlePlayPlaylist(activePlaylist)}
                  className="px-6 py-3 bg-gradient-to-r from-[#1DB954] to-[#00D4FF] hover:from-[#1ed760] hover:to-[#2be0ff] text-black font-bold text-xs uppercase tracking-wider rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#1DB954]/10 cursor-pointer flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" /> Play Mix
                </button>
                <button
                  onClick={() => handleDownloadPlaylist(activePlaylist)}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Export playlist metadata"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSharePlaylist(activePlaylist)}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy share link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tracks List Table (Spotify-style) */}
            {(!activePlaylist.songs || activePlaylist.songs.length === 0) ? (
              <div className="text-center py-12 text-slate-500 text-xs font-semibold">
                No songs inside this playlist.
              </div>
            ) : (
              <div className="p-4 md:p-6">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-3 w-12 text-center font-poppins">#</th>
                      <th className="py-3 px-3 font-poppins">Title</th>
                      <th className="py-3 px-3 hidden sm:table-cell font-poppins">Genre</th>
                      <th className="py-3 px-3 text-right font-poppins pr-6">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePlaylist.songs.map((song, idx) => {
                      const isCurrent = currentSong?.id === song.id;
                      return (
                        <tr
                          key={song.id}
                          className="hover:bg-white/5 border-b border-white/5 transition-colors group"
                        >
                          <td className="py-4 px-3 text-center text-slate-500 font-mono">
                            {isCurrent && isPlaying ? (
                              <div className="eq-container">
                                <div className="eq-bar" />
                                <div className="eq-bar" />
                                <div className="eq-bar" />
                              </div>
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </td>
                          <td className="py-4 px-3">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <img
                                src={song.thumbnail}
                                alt={song.title}
                                className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0"
                              />
                              <div className="overflow-hidden">
                                <p className={`font-bold truncate ${isCurrent ? 'text-[#1db954]' : 'text-white'}`}>
                                  {song.title}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate mt-0.5">{song.artist}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-3 text-slate-400 hidden sm:table-cell font-medium">{song.genre}</td>
                          <td className="py-4 px-3 text-right pr-6">
                            <button
                              onClick={() => playSong(song, activePlaylist.songs)}
                              className="p-2 bg-gradient-to-tr from-[#1DB954] to-[#00D4FF] text-black hover:scale-105 rounded-full transition-all active:scale-95 shadow-md cursor-pointer flex items-center justify-center"
                            >
                              <Play className="w-3 h-3 fill-current" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card p-10 border border-white/5 text-center text-slate-500 text-xs font-semibold">
            Select a playlist from the library side panel to explore tracks.
          </div>
        )}

        {/* Custom Playlist Creator Builder */}
        <div className="glass-card p-6 border border-white/5 bg-black/20">
          <div className="flex items-center gap-2 mb-6">
            <PlusCircle className="w-5 h-5 text-[#1db954]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-poppins">Custom Playlist Creator</h3>
          </div>

          <form onSubmit={handleCreatePlaylist} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-poppins">Playlist Title</label>
                <input
                  type="text"
                  required
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Enter playlist name"
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-poppins">Vibe association</label>
                <select
                  value={selectedEmotion}
                  onChange={(e) => setSelectedEmotion(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#171717] border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all text-sm font-medium"
                >
                  <option value="Happy">Happy</option>
                  <option value="Sad">Sad</option>
                  <option value="Relaxed">Relaxed</option>
                  <option value="Angry">Angry</option>
                  <option value="Fear">Fear</option>
                  <option value="Excited">Excited</option>
                  <option value="Neutral">Neutral</option>
                </select>
              </div>
            </div>

            {/* Song Selection List */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-poppins block">
                Select Songs ({selectedSongs.length} selected)
              </label>
              <div className="h-44 overflow-y-auto border border-white/10 rounded-2xl p-4 bg-white/5 space-y-2">
                {songs.map((song) => {
                  const isChecked = selectedSongs.includes(song.id);
                  return (
                    <div
                      key={song.id}
                      onClick={() => handleToggleSongSelection(song.id)}
                      className={`flex items-center justify-between p-2 px-3.5 rounded-xl cursor-pointer transition-all border ${
                        isChecked 
                          ? 'bg-white/5 border-[#1db954]/40 text-white' 
                          : 'hover:bg-white/[0.02] border-transparent hover:border-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden mr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-[#1db954] focus:ring-[#1db954] accent-[#1db954]"
                        />
                        <img
                          src={song.thumbnail}
                          alt={song.title}
                          className="w-8 h-8 rounded-lg object-cover border border-white/5"
                        />
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold truncate">{song.title}</p>
                          <p className="text-[9px] text-slate-400 truncate">{song.artist}</p>
                        </div>
                      </div>
                      <span className="text-[8px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-slate-400 font-poppins shrink-0">
                        {song.emotion}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !newPlaylistName.trim() || selectedSongs.length === 0}
              className="w-full py-4 bg-gradient-to-r from-[#1DB954] to-[#00D4FF] hover:from-[#1ed760] hover:to-[#2be0ff] text-black font-bold text-xs sm:text-sm uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-[#1DB954]/10"
            >
              {loading ? (
                <span className="w-4.5 h-4.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="font-bold flex items-center gap-1.5">Create Playlist <Plus className="w-4 h-4" /></span>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Playlist;
