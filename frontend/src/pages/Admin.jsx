import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Users, Music, PlaySquare, Trash2, Plus, Edit2, 
  Search, ShieldAlert, Check, X, FileAudio, Image as ImageIcon, Sparkles
} from 'lucide-react';
import API from '../services/api';

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [songs, setSongs] = useState([]);
  
  // Tab State
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, songs

  // Feedback Notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Song Form Modal State
  const [showSongModal, setShowSongModal] = useState(false);
  const [isEditingSong, setIsEditingSong] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songGenre, setSongGenre] = useState('');
  const [songEmotion, setSongEmotion] = useState('Happy');
  const [songUrl, setSongUrl] = useState('');
  const [songThumbnail, setSongThumbnail] = useState('');
  const [songFormLoading, setSongFormLoading] = useState(false);

  // Deletion modals state
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);

  const [showDeleteSongModal, setShowDeleteSongModal] = useState(false);
  const [deleteSongLoading, setDeleteSongLoading] = useState(false);

  // Search Filter states
  const [userSearch, setUserSearch] = useState('');
  const [songSearch, setSongSearch] = useState('');

  const genresList = ['Pop', 'Jazz', 'Lo-Fi', 'Cinematic', 'Classical', 'Rock', 'Electronic', 'Acoustic'];
  const emotionsList = ['Happy', 'Sad', 'Relaxed', 'Angry', 'Fear', 'Excited', 'Neutral'];

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Get Analytics
      const analyticsResponse = await API.get('/api/admin/analytics');
      setAnalytics(analyticsResponse.data);

      // Get Users
      const usersResponse = await API.get('/api/users');
      setUsers(usersResponse.data);

      // Get Songs
      const songsResponse = await API.get('/api/songs');
      setSongs(songsResponse.data);
    } catch (err) {
      console.error('Error fetching admin details:', err);
      setErrorMsg(err.response?.data?.message || 'Access Denied. Admin privileges required.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddSong = () => {
    setIsEditingSong(false);
    setSelectedSongId(null);
    setSongTitle('');
    setSongArtist('');
    setSongGenre('Pop');
    setSongEmotion('Happy');
    setSongUrl('');
    setSongThumbnail('');
    setShowSongModal(true);
  };

  const handleOpenEditSong = (song) => {
    setIsEditingSong(true);
    setSelectedSongId(song.id);
    setSongTitle(song.title);
    setSongArtist(song.artist);
    setSongGenre(song.genre);
    setSongEmotion(song.emotion);
    setSongUrl(song.songUrl);
    setSongThumbnail(song.thumbnail);
    setShowSongModal(true);
  };

  const handleSaveSong = async (e) => {
    e.preventDefault();
    setSongFormLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      title: songTitle,
      artist: songArtist,
      genre: songGenre,
      emotion: songEmotion,
      songUrl: songUrl,
      thumbnail: songThumbnail
    };

    try {
      if (isEditingSong) {
        await API.put(`/api/songs/${selectedSongId}`, payload);
        setSuccessMsg('Song updated successfully!');
      } else {
        await API.post('/api/songs', payload);
        setSuccessMsg('New song added to database!');
      }
      setShowSongModal(false);
      fetchAdminData(); // Refresh list
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save song.');
    } finally {
      setSongFormLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setDeleteUserLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await API.delete(`/api/users/${selectedUserId}`);
      setSuccessMsg('User account deleted successfully!');
      setShowDeleteUserModal(false);
      fetchAdminData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleteUserLoading(false);
    }
  };

  const handleDeleteSong = async () => {
    setDeleteSongLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await API.delete(`/api/songs/${selectedSongId}`);
      setSuccessMsg('Song deleted from database!');
      setShowDeleteSongModal(false);
      fetchAdminData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete song.');
    } finally {
      setDeleteSongLoading(false);
    }
  };

  // Process Emotion frequencies for overview chart visualization
  const getEmotionStatistics = () => {
    if (!analytics || !analytics.emotionHistory) return {};
    const counts = {};
    emotionsList.forEach(m => counts[m] = 0);
    analytics.emotionHistory.forEach(log => {
      if (counts[log.detectedEmotion] !== undefined) {
        counts[log.detectedEmotion]++;
      }
    });
    return counts;
  };

  const emotionStats = getEmotionStatistics();
  const maxEmotionCount = Math.max(...Object.values(emotionStats), 1);

  // Filter lists based on searches
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredSongs = songs.filter(s => 
    s.title?.toLowerCase().includes(songSearch.toLowerCase()) || 
    s.artist?.toLowerCase().includes(songSearch.toLowerCase()) ||
    s.genre?.toLowerCase().includes(songSearch.toLowerCase()) ||
    s.emotion?.toLowerCase().includes(songSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60svh] select-none">
        <span className="w-8 h-8 border-4 border-[#1db954] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-inter pb-12 select-none relative">
      
      {/* Background glow mesh */}
      <div className="absolute top-[-5%] left-[-5%] w-[40vw] h-[40vw] bg-radial from-[#1DB954]/5 via-transparent to-transparent blur-[120px] pointer-events-none z-0"></div>

      {/* 1. Header Banner */}
      <div className="glass-card p-6 md:p-8 border border-white/5 flex flex-col sm:flex-row gap-6 items-center bg-black/20 z-10 relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#1DB954] to-[#00D4FF] flex items-center justify-center font-bold text-black uppercase text-3xl border border-white/10 shadow-2xl shrink-0">
          A
        </div>

        <div className="space-y-1.5 text-center sm:text-left flex-grow">
          <span className="text-[9px] font-bold text-[#1DB954] uppercase tracking-widest font-poppins">System Administration</span>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-poppins">AuraBeat Console</h3>
          <p className="text-xs text-slate-400 font-semibold pt-1">
            Manage registered accounts, song catalogs, and audit system analytics logs.
          </p>
        </div>
      </div>

      {/* Feedback banners */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5 animate-fadeIn font-semibold z-10 relative">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5 animate-fadeIn font-semibold z-10 relative">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-white/5 z-10 relative">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider font-poppins border-b-2 transition-all cursor-pointer ${
            activeTab === 'overview' 
              ? 'border-[#1DB954] text-white' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider font-poppins border-b-2 transition-all cursor-pointer ${
            activeTab === 'users' 
              ? 'border-[#1DB954] text-white' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          User Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('songs')}
          className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider font-poppins border-b-2 transition-all cursor-pointer ${
            activeTab === 'songs' 
              ? 'border-[#1DB954] text-white' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Song Database ({songs.length})
        </button>
      </div>

      {/* 3. Tab Contents */}
      <div className="z-10 relative">
        
        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-6">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-5 border border-white/5 bg-black/20">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold font-poppins block">Total Accounts</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-2xl font-bold font-mono text-white">{analytics.totalUsers}</span>
                  <Users className="w-5 h-5 text-[#1DB954]" />
                </div>
              </div>
              <div className="glass-card p-5 border border-white/5 bg-black/20">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold font-poppins block">Tracks Loaded</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-2xl font-bold font-mono text-white">{analytics.totalSongs}</span>
                  <Music className="w-5 h-5 text-[#00D4FF]" />
                </div>
              </div>
              <div className="glass-card p-5 border border-white/5 bg-black/20">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold font-poppins block">Playlists Created</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-2xl font-bold font-mono text-white">{analytics.totalPlaylists}</span>
                  <PlaySquare className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div className="glass-card p-5 border border-white/5 bg-black/20">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold font-poppins block">Mood Face Scans</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-2xl font-bold font-mono text-white">{analytics.totalEmotionScans}</span>
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Sub Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Emotion distributions horizontal graph */}
              <div className="md:col-span-7 glass-card p-6 border border-white/5 bg-black/20 shadow-xl space-y-5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4.5 h-4.5 text-slate-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-poppins">Scanned Vibe Frequencies</h4>
                </div>

                <div className="space-y-4">
                  {emotionsList.map((emotion) => {
                    const count = emotionStats[emotion] || 0;
                    const percent = Math.round((count / maxEmotionCount) * 100);
                    
                    let barColor = 'bg-[#1DB954]';
                    if (emotion === 'Sad') barColor = 'bg-[#00D4FF]';
                    if (emotion === 'Angry') barColor = 'bg-red-500';
                    if (emotion === 'Excited') barColor = 'bg-yellow-500';
                    if (emotion === 'Relaxed') barColor = 'bg-purple-500';

                    return (
                      <div key={emotion} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300 font-poppins">{emotion}</span>
                          <span className="text-slate-400 font-mono">{count} times</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chat interaction panel */}
              <div className="md:col-span-5 glass-card p-6 border border-white/5 bg-black/20 shadow-xl space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-poppins">Interactive Audit</h4>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3.5">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold font-poppins block">AI Chat Logs Volume</span>
                  <span className="text-4xl font-extrabold text-[#1DB954] font-mono block">{analytics.totalChatLogs} Logs</span>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    Chat history logs are preserved inside the SQL database. These logs help refine the Gemini prompt models and voice-commands parsing mappings.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: USER ACCOUNT LIST */}
        {activeTab === 'users' && (
          <div className="glass-card p-6 border border-white/5 bg-black/20 shadow-xl space-y-5">
            {/* Action headers */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-poppins self-start sm:self-center">Registered Users Accounts</h4>
              
              <div className="relative w-full sm:max-w-xs">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user email or name..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-full text-xs placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs font-semibold">
                No users accounts found matching search filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-3 font-poppins">ID</th>
                      <th className="py-3 px-3 font-poppins">Name</th>
                      <th className="py-3 px-3 font-poppins">Email Address</th>
                      <th className="py-3 px-3 font-poppins">Created At</th>
                      <th className="py-3 px-3 text-right font-poppins pr-6">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-white/5 border-b border-white/5 transition-colors">
                        <td className="py-3 px-3 text-slate-500 font-mono">{u.id}</td>
                        <td className="py-3 px-3 text-white font-bold">{u.name}</td>
                        <td className="py-3 px-3 text-slate-300 font-medium">{u.email}</td>
                        <td className="py-3 px-3 text-slate-400 font-mono">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-right pr-6">
                          <button
                            onClick={() => {
                              setSelectedUserId(u.id);
                              setShowDeleteUserModal(true);
                            }}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white border border-transparent rounded-lg text-red-400 transition-all cursor-pointer"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SONG DATABASE MANAGER */}
        {activeTab === 'songs' && (
          <div className="glass-card p-6 border border-white/5 bg-black/20 shadow-xl space-y-5">
            {/* Search and Add panel */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-poppins">Song Catalog</h4>
                <button
                  onClick={handleOpenAddSong}
                  className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#1DB954] to-[#00D4FF] hover:from-[#1ed760] hover:to-[#2be0ff] text-black font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Track</span>
                </button>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search song title, artist, genre..."
                  value={songSearch}
                  onChange={(e) => setSongSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-full text-xs placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {filteredSongs.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs font-semibold">
                No songs loaded in catalog. Click "Add Track" to upload some music.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-3 font-poppins">Thumb</th>
                      <th className="py-3 px-3 font-poppins">Title</th>
                      <th className="py-3 px-3 font-poppins">Artist</th>
                      <th className="py-3 px-3 font-poppins">Genre</th>
                      <th className="py-3 px-3 font-poppins">Emotion Vibe</th>
                      <th className="py-3 px-3 text-right font-poppins pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSongs.map((s) => (
                      <tr key={s.id} className="hover:bg-white/5 border-b border-white/5 transition-colors">
                        <td className="py-2.5 px-3">
                          <img
                            src={s.thumbnail}
                            alt={s.title}
                            className="w-8 h-8 rounded-lg object-cover border border-white/10"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-white font-bold truncate max-w-[150px]">{s.title}</td>
                        <td className="py-2.5 px-3 text-slate-300 font-semibold">{s.artist}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[9px] font-bold">
                            {s.genre}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-[#1db954]/10 border border-[#1db954]/20 text-[#1db954] text-[9px] font-bold font-poppins uppercase tracking-wider">
                            {s.emotion}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right pr-6 space-x-1.5">
                          <button
                            onClick={() => handleOpenEditSong(s)}
                            className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer"
                            title="Edit Track"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSongId(s.id);
                              setShowDeleteSongModal(true);
                            }}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white border border-transparent rounded-lg text-red-400 transition-all cursor-pointer"
                            title="Delete Song"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL: ADD / EDIT SONG */}
      {showSongModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md glass-card bg-[#111] border border-white/10 rounded-[28px] overflow-hidden shadow-2xl p-6 sm:p-7 relative">
            <button
              onClick={() => setShowSongModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-poppins text-lg font-extrabold text-white mb-5 pr-6">
              {isEditingSong ? 'Edit Song Details' : 'Add New Track'}
            </h3>

            <form onSubmit={handleSaveSong} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-poppins">Song Title</label>
                  <input
                    type="text"
                    required
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    placeholder="e.g. Lofi Dreamer"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-600 focus:outline-none text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-poppins">Artist Name</label>
                  <input
                    type="text"
                    required
                    value={songArtist}
                    onChange={(e) => setSongArtist(e.target.value)}
                    placeholder="e.g. Purrple Cat"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-600 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-poppins">Genre</label>
                  <select
                    value={songGenre}
                    onChange={(e) => setSongGenre(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white focus:outline-none text-xs cursor-pointer select-none [&>option]:bg-[#111]"
                  >
                    {genresList.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-poppins">Emotion Vibe</label>
                  <select
                    value={songEmotion}
                    onChange={(e) => setSongEmotion(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white focus:outline-none text-xs cursor-pointer select-none [&>option]:bg-[#111]"
                  >
                    {emotionsList.map(em => (
                      <option key={em} value={em}>{em}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-poppins">Audio File Direct Link (URL)</label>
                <div className="relative">
                  <FileAudio className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="url"
                    required
                    value={songUrl}
                    onChange={(e) => setSongUrl(e.target.value)}
                    placeholder="https://domain.com/music.mp3"
                    className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-600 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-poppins">Thumbnail Image Link (URL)</label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="url"
                    required
                    value={songThumbnail}
                    onChange={(e) => setSongThumbnail(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-600 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={songFormLoading}
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#1DB954] to-[#00D4FF] hover:from-[#1ed760] hover:to-[#2be0ff] text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98"
              >
                {songFormLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{isEditingSong ? 'Save Track Changes' : 'Publish Song Track'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM: DELETE USER ACCOUNT */}
      {showDeleteUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm glass-card bg-[#111] border border-red-500/20 rounded-[28px] overflow-hidden shadow-2xl p-6 sm:p-7 relative">
            <h3 className="font-poppins text-lg font-extrabold text-red-400 mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>Confirm User Deletion</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6 font-semibold leading-relaxed">
              Are you sure you want to delete this user? Their account registration, preferences, playlists, and histories will be wiped out from the system.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteUserModal(false)}
                disabled={deleteUserLoading}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleteUserLoading}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded-full flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
              >
                {deleteUserLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Delete Account</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM: DELETE SONG */}
      {showDeleteSongModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm glass-card bg-[#111] border border-red-500/20 rounded-[28px] overflow-hidden shadow-2xl p-6 sm:p-7 relative">
            <h3 className="font-poppins text-lg font-extrabold text-red-400 mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>Delete Song Track</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6 font-semibold leading-relaxed">
              Are you sure you want to delete this song track? Users will no longer be able to search, like, listen to, or see this track in recommendations.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteSongModal(false)}
                disabled={deleteSongLoading}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSong}
                disabled={deleteSongLoading}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded-full flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
              >
                {deleteSongLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Remove Track</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
