import React, { useState, useEffect } from 'react';
import { useMusic } from '../context/MusicContext';
import { Heart, User, Mail, Calendar, BarChart3, ShieldAlert, KeyRound, Save, Trash2 } from 'lucide-react';
import API from '../services/api';

const Profile = () => {
  const { playSong, currentSong } = useMusic();
  const [profileData, setProfileData] = useState(null);
  const [likedSongs, setLikedSongs] = useState([]);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'settings'

  // Settings Forms State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchProfileAndData();
  }, []);

  const fetchProfileAndData = async () => {
    try {
      const profileResponse = await API.get('/api/users/profile');
      setProfileData(profileResponse.data);
      setEditName(profileResponse.data.name || '');
      setEditEmail(profileResponse.data.email || '');

      const favResponse = await API.get('/api/favorites');
      setLikedSongs(favResponse.data.map(fav => fav.song));

      const emotionResponse = await API.get('/api/emotion/history');
      setEmotionHistory(emotionResponse.data);
    } catch (err) {
      console.error('Error fetching profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);

    try {
      const response = await API.post('/api/users/profile/update', {
        name: editName,
        email: editEmail
      });
      setProfileSuccess(response.data.message || 'Profile updated successfully!');
      
      // Update local storage user profile name/email
      const currentLocalUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentLocalUser, name: editName, email: editEmail };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update context profileData state
      setProfileData(prev => ({ ...prev, name: editName, email: editEmail }));
      
      // reload page or trigger header sync
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match!');
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await API.post('/api/users/password/change', {
        oldPassword,
        newPassword
      });
      setPasswordSuccess(response.data.message || 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteLoading(true);

    try {
      await API.delete('/api/users/profile/delete');
      // Success, remove credentials
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete account.');
      setDeleteLoading(false);
    }
  };

  const getDominantEmotion = () => {
    if (emotionHistory.length === 0) return 'None';
    const counts = {};
    let maxCount = 0;
    let dominant = 'Neutral';

    emotionHistory.forEach((log) => {
      counts[log.detectedEmotion] = (counts[log.detectedEmotion] || 0) + 1;
      if (counts[log.detectedEmotion] > maxCount) {
        maxCount = counts[log.detectedEmotion];
        dominant = log.detectedEmotion;
      }
    });

    return dominant;
  };

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

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
          {profileData?.name?.charAt(0) || 'U'}
        </div>

        <div className="space-y-1.5 text-center sm:text-left flex-grow">
          <span className="text-[9px] font-bold text-[#1DB954] uppercase tracking-widest font-poppins">Premium Subscriber</span>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-poppins">{profileData?.name || 'User'}</h3>
          <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 font-semibold pt-1">
            <div className="flex items-center gap-1.5 justify-center">
              <Mail className="w-4 h-4 text-[#1db954]" />
              <span>{profileData?.email}</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Member since {new Date(profileData?.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-white/5 z-10 relative">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider font-poppins border-b-2 transition-all cursor-pointer ${
            activeTab === 'profile' 
              ? 'border-[#1DB954] text-white' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Overview & Stats
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider font-poppins border-b-2 transition-all cursor-pointer ${
            activeTab === 'settings' 
              ? 'border-[#1DB954] text-white' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Account Settings
        </button>
      </div>

      {/* 3. Tab Content */}
      <div className="z-10 relative">
        {activeTab === 'profile' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Side: Favorites (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass-card p-6 border border-white/5 bg-black/20 shadow-xl">
                <div className="flex items-center gap-2.5 mb-5">
                  <Heart className="w-4.5 h-4.5 text-[#1db954] fill-current" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-poppins">Liked Tracks</h4>
                </div>

                {likedSongs.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs font-semibold">
                    Your liked list is empty.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {likedSongs.map((song) => {
                      const isCurrent = currentSong?.id === song.id;
                      return (
                        <div
                          key={song.id}
                          onClick={() => playSong(song, likedSongs)}
                          className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.02] hover:bg-white/5 border border-transparent hover:border-white/5 cursor-pointer transition-all"
                        >
                          <img
                            src={song.thumbnail}
                            alt={song.title}
                            className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                          />
                          <div className="overflow-hidden flex-grow mr-2">
                            <p className={`text-xs font-bold truncate ${isCurrent ? 'text-[#1db954]' : 'text-white'}`}>
                              {song.title}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{song.artist}</p>
                          </div>
                          <span className="text-[8px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-slate-400 font-poppins shrink-0">
                            {song.emotion}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Logs & Metrics (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Stats indicators */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-5 border border-white/5 bg-black/20 text-center">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold font-poppins block">Dominant Vibe</span>
                  <span className="text-sm font-bold text-[#1db954] mt-2 block uppercase tracking-widest font-poppins">{getDominantEmotion()}</span>
                </div>
                <div className="glass-card p-5 border border-white/5 bg-black/20 text-center">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold font-poppins block">Listening Logs</span>
                  <span className="text-lg font-bold text-white mt-2 block font-mono">{emotionHistory.length} Sessions</span>
                </div>
              </div>

              {/* Table history logs */}
              <div className="glass-card p-6 border border-white/5 bg-black/20 shadow-xl">
                <div className="flex items-center gap-2.5 mb-5">
                  <BarChart3 className="w-4.5 h-4.5 text-slate-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-poppins">Acoustic Logs history</h4>
                </div>

                {emotionHistory.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs font-semibold">
                    No logs generated yet. Use the voice analyzer on the dashboard.
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[250px] overflow-y-auto pr-1">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-3 px-3 font-poppins">Date</th>
                          <th className="py-3 px-3 font-poppins">Spoken / Text Input</th>
                          <th className="py-3 px-3 text-right font-poppins pr-4">State</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emotionHistory.map((log) => (
                          <tr
                            key={log.id}
                            className="hover:bg-white/5 border-b border-white/5 transition-colors"
                          >
                            <td className="py-3.5 px-3 text-slate-500 font-mono whitespace-nowrap">{formatDateTime(log.detectedAt)}</td>
                            <td className="py-3.5 px-3 text-slate-200 truncate max-w-[200px] font-medium">{log.userInput}</td>
                            <td className="py-3.5 px-3 text-right pr-4">
                              <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-bold text-[9px] font-poppins uppercase">
                                {log.detectedEmotion}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Side: Profile Forms (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Form 1: Update Details */}
              <div className="glass-card p-6 border border-white/5 bg-black/20 shadow-xl">
                <div className="flex items-center gap-2.5 mb-5">
                  <User className="w-4.5 h-4.5 text-[#1db954]" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-poppins">Profile Details</h4>
                </div>

                {profileError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                {profileSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <span>{profileSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-poppins">Full Name</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-500 focus:outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-poppins">Email Address</label>
                      <input
                        type="email"
                        required
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-500 focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="py-2.5 px-6 rounded-full bg-gradient-to-r from-[#1DB954] to-[#00D4FF] hover:from-[#1ed760] hover:to-[#2be0ff] text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98 shadow-md"
                  >
                    {profileLoading ? (
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Form 2: Change Password */}
              <div className="glass-card p-6 border border-white/5 bg-black/20 shadow-xl">
                <div className="flex items-center gap-2.5 mb-5">
                  <KeyRound className="w-4.5 h-4.5 text-slate-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-poppins">Change Password</h4>
                </div>

                {passwordError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-poppins">Current Password</label>
                    <input
                      type="password"
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-500 focus:outline-none text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-poppins">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-500 focus:outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-poppins">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-500 focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="py-2.5 px-6 rounded-full bg-gradient-to-r from-[#1DB954] to-[#00D4FF] hover:from-[#1ed760] hover:to-[#2be0ff] text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98 shadow-md"
                  >
                    {passwordLoading ? (
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>

            {/* Right Side: Account Actions & Danger Zone (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Danger Zone Card */}
              <div className="glass-card p-6 border border-red-500/20 bg-red-950/5 shadow-xl">
                <div className="flex items-center gap-2.5 mb-3 text-red-400">
                  <ShieldAlert className="w-5 h-5" />
                  <h4 className="text-sm font-bold uppercase tracking-wider font-poppins">Danger Zone</h4>
                </div>

                <p className="text-xs text-slate-400 mb-5 font-semibold leading-relaxed">
                  Deleting your account is permanent. All your playlists, favorites, emotion history logs, and AI logs will be wiped out completely.
                </p>

                {deleteError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                    <span>{deleteError}</span>
                  </div>
                )}

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full py-3 rounded-xl bg-red-600/10 hover:bg-red-600 border border-red-500/30 hover:border-red-600 text-red-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account</span>
                </button>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm glass-card bg-[#111] border border-red-500/20 rounded-[28px] overflow-hidden shadow-2xl p-6 sm:p-7 relative">
            <h3 className="font-poppins text-lg font-extrabold text-red-400 mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>Confirm Account Deletion</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6 font-semibold leading-relaxed">
              Are you absolutely sure you want to delete your account? This action is irreversible. All of your personal preferences and records on AuraBeat will be lost forever.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded-full flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
              >
                {deleteLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
