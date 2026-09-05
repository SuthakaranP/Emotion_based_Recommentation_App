import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, AlertCircle, ArrowRight, Check, X, Mic } from 'lucide-react';
import API from '../services/api';
import VoiceOnboardingModal from '../components/VoiceOnboardingModal';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Google Login modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  // Voice onboarding modal state
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const presetGoogleAccounts = [
    { name: 'Balaji S', email: 'balaji@gmail.com' },
    { name: 'Guest User', email: 'guest@aurabeat.com' },
    { name: 'Admin Account', email: 'admin@aurabeat.com' }
  ];

  // Password strength states
  const [pwStrength, setPwStrength] = useState({ score: 0, label: 'Too Short', color: 'bg-red-500/20 text-red-400 border-red-500/20' });

  useEffect(() => {
    evaluatePasswordStrength(password);
  }, [password]);

  const evaluatePasswordStrength = (pass) => {
    if (!pass) {
      setPwStrength({ score: 0, label: 'Too Short', color: 'bg-slate-800 text-slate-400 border-white/5' });
      return;
    }
    
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    let label = 'Weak';
    let color = 'bg-red-500/10 text-red-400 border-red-500/20';

    if (pass.length < 6) {
      label = 'Too Short';
      color = 'bg-red-500/10 text-red-400 border-red-500/20';
    } else if (score <= 2) {
      label = 'Weak';
      color = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    } else if (score === 3) {
      label = 'Good';
      color = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    } else if (score === 4) {
      label = 'Strong';
      color = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }

    setPwStrength({ score, label, color });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match! Please verify your password entry.');
      return;
    }

    setLoading(true);

    try {
      await API.post('/api/register', { name, email, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try using a different email.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (name, email) => {
    setGoogleError('');
    setGoogleLoading(true);
    try {
      const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`;
      const response = await API.post('/api/oauth/google', { name, email, avatarUrl });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setShowGoogleModal(false);
      navigate('/dashboard');
    } catch (err) {
      setGoogleError(err.response?.data?.message || 'Google Authentication failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#1DB954] selection:text-black">
      
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-radial from-[#1DB954]/5 via-transparent to-transparent blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-radial from-[#00D4FF]/5 via-transparent to-transparent blur-[120px] pointer-events-none z-0"></div>

      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 cursor-pointer relative z-10 group" onClick={() => navigate('/')}>
        <div className="p-2.5 bg-gradient-to-tr from-[#1DB954] to-[#00D4FF] rounded-full text-black shadow-md shadow-[#1DB954]/10 group-hover:scale-105 transition-all">
          <Music className="w-5 h-5 fill-current" />
        </div>
        <span className="font-manrope font-extrabold text-2xl text-white">AuraBeat</span>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md glass-card p-8 sm:p-10 shadow-2xl relative z-10 flex flex-col bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[32px] hover:translate-y-0 hover:border-white/10 animate-fadeIn">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-2 font-poppins">
          Create Account
        </h2>
        <p className="text-xs text-slate-400 text-center mb-6 font-medium">Join AuraBeat today for custom mood-aware playlists</p>

        {/* Onboarding buttons */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            className="py-3 border border-white/10 hover:border-white/20 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all bg-white/5 hover:bg-white/10 cursor-pointer active:scale-98"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.428-2.534 4.114-5.267 4.114-3.418 0-6.192-2.774-6.192-6.192s2.774-6.192 6.192-6.192c1.488 0 2.854.526 3.923 1.403l3.05-3.048C18.665 1.95 15.65 1 12.24 1 6.04 1 12.24 6.04 12.24 12.24S6.04 23.48 12.24 23.48c6.24 0 10.84-4.385 10.84-10.84 0-.74-.067-1.485-.2-2.355H12.24z"/>
            </svg>
            <span className="font-poppins">Google Login</span>
          </button>

          <button
            type="button"
            onClick={() => setShowVoiceModal(true)}
            className="py-3 border border-[#1DB954]/20 hover:border-[#1DB954]/40 text-[#1DB954] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all bg-[#1DB954]/5 hover:bg-[#1DB954]/10 cursor-pointer active:scale-98"
          >
            <Mic className="w-3.5 h-3.5 shrink-0 text-[#1db954]" />
            <span className="font-poppins">Voice Sign-Up</span>
          </button>
        </div>

        {/* Separator */}
        <div className="relative flex py-1 items-center mb-5">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold font-poppins">or</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5 animate-fadeIn font-semibold">
            <Check className="w-4.5 h-4.5 shrink-0 text-emerald-400 animate-bounce" />
            <span>Account created! Redirecting to sign in page...</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-poppins">What should we call you?</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Profile name"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all text-sm font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-poppins">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all text-sm font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-poppins">Choose a password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all text-sm font-medium"
            />

            {/* Strength meter indicator */}
            {password && (
              <div className="pt-1.5 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold font-poppins">
                  <span className="text-slate-500 uppercase tracking-wider">Strength:</span>
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold transition-all ${pwStrength.color}`}>{pwStrength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      pwStrength.score === 1 ? 'bg-red-500' :
                      pwStrength.score === 2 ? 'bg-orange-500' :
                      pwStrength.score === 3 ? 'bg-yellow-500' :
                      pwStrength.score === 4 ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                    style={{ width: `${(pwStrength.score / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-poppins">Confirm password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-4 mt-4 rounded-full bg-gradient-to-r from-[#1DB954] to-[#00D4FF] hover:from-[#1ed760] hover:to-[#2be0ff] text-black font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98 shadow-lg shadow-[#1DB954]/10 hover:shadow-[#1DB954]/20"
          >
            {loading ? (
              <span className="w-4.5 h-4.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="flex items-center gap-1.5 font-bold">Sign Up Free <ArrowRight className="w-4 h-4" /></span>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs sm:text-sm text-slate-400 font-semibold font-poppins">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1DB954] hover:text-[#1ed760] font-bold underline underline-offset-4">
            Sign In Here
          </Link>
        </p>
      </div>

      {/* GOOGLE AUTHENTICATION SIMULATOR DIALOG */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm glass-card bg-[#111] border border-white/10 rounded-[28px] overflow-hidden shadow-2xl p-6 sm:p-7 relative">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center mb-6">
              <svg className="w-8 h-8 mb-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <h3 className="font-poppins text-lg font-bold text-white text-center">Sign in with Google</h3>
              <p className="text-[11px] text-slate-400 text-center mt-1">Select an account to continue to AuraBeat</p>
            </div>

            {googleError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{googleError}</span>
              </div>
            )}

            {/* Account List */}
            <div className="space-y-2 mb-5 max-h-[180px] overflow-y-auto pr-1">
              {presetGoogleAccounts.map((acc, index) => (
                <button
                  key={index}
                  onClick={() => handleGoogleLogin(acc.name, acc.email)}
                  disabled={googleLoading}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-left transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1DB954] to-[#00D4FF] flex items-center justify-center font-bold text-black text-xs shrink-0">
                    {acc.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{acc.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{acc.email}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Simulated Custom Login fields */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-poppins">Or use custom Google account</p>
              
              <input
                type="text"
                placeholder="Google Name (e.g. John Doe)"
                value={customGoogleName}
                onChange={(e) => setCustomGoogleName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-500 focus:outline-none text-xs"
              />
              <input
                type="email"
                placeholder="Google Email (e.g. john@gmail.com)"
                value={customGoogleEmail}
                onChange={(e) => setCustomGoogleEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-500 focus:outline-none text-xs"
              />

              <button
                onClick={() => handleGoogleLogin(customGoogleName, customGoogleEmail)}
                disabled={googleLoading || !customGoogleName || !customGoogleEmail}
                className="w-full py-2.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
              >
                {googleLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Sign In Custom Account</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Assistant Onboarding Modal */}
      <VoiceOnboardingModal isOpen={showVoiceModal} onClose={() => setShowVoiceModal(false)} type="register" />

    </div>
  );
};

export default Register;