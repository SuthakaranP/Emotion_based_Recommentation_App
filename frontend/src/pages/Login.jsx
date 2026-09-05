import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, AlertCircle, ArrowRight, X, Mail, KeyRound, Check, Mic } from 'lucide-react';
import API from '../services/api';
import VoiceOnboardingModal from '../components/VoiceOnboardingModal';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Safely decode a Google JWT ID-token payload (no signature verification needed
 *  client-side — Google already verified it before handing it to us). */
const decodeGoogleJWT = (credential) => {
  try {
    const base64Payload = credential.split('.')[1];
    // Pad to a valid base64 length
    const padded = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = request, 2 = reset
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Google login state
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const gisInitialized = useRef(false);

  // Voice assistant modal state
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // Dev-mode Google bypass modal (shown when VITE_GOOGLE_CLIENT_ID is not configured)
  const [showGoogleDevModal, setShowGoogleDevModal] = useState(false);
  const [devGoogleName, setDevGoogleName] = useState('');
  const [devGoogleEmail, setDevGoogleEmail] = useState('');

  // ─── GIS Initialisation ─────────────────────────────────────────────────────

  /**
   * Called by the GIS library once the user selects an account and Google
   * returns a signed JWT credential (ID token).  We decode the payload to get
   * name/email/picture then hand them to the backend, which issues our own JWT.
   */
  const handleGISCredential = async (response) => {
    if (!response?.credential) {
      setGoogleError('Google did not return a credential. Please try again.');
      return;
    }

    const profile = decodeGoogleJWT(response.credential);
    if (!profile) {
      setGoogleError('Failed to read Google profile from credential. Please try again.');
      return;
    }

    const { name, email: gEmail, picture } = profile;
    console.log('[GIS] Credential received for:', gEmail);
    await callGoogleLoginBackend(name, gEmail, picture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${gEmail}`);
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      // Nothing to init — error shown on button click instead
      return;
    }

    // GIS script is loaded via <script> tag in index.html (async).
    // Poll until window.google is available (usually <500 ms after script loads).
    let attempts = 0;
    const interval = setInterval(() => {
      if (window?.google?.accounts?.id) {
        clearInterval(interval);
        if (!gisInitialized.current) {
          gisInitialized.current = true;
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGISCredential,
            // Use popup so the user stays on the login page
            ux_mode: 'popup',
          });
          console.log('[GIS] Initialized with client_id:', clientId.slice(0, 16) + '…');
        }
      }
      if (++attempts > 50) clearInterval(interval); // give up after ~5 s
    }, 100);

    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Google button click ─────────────────────────────────────────────────────

  const handleGoogleButtonClick = () => {
    setGoogleError('');
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // Guard: no Client ID configured → open dev-bypass modal instead
    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      setShowGoogleDevModal(true);
      return;
    }

    // Guard: GIS library not yet loaded
    if (!window?.google?.accounts?.id) {
      setGoogleError(
        'Google sign-in library is still loading. Wait a moment and try again.'
      );
      return;
    }

    setGoogleLoading(true);

    try {
      // Trigger the One Tap / popup chooser.
      // GIS will call handleGISCredential when the user selects an account.
      window.google.accounts.id.prompt((notification) => {
        // notification tells us what happened with the prompt
        if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason();
          console.warn('[GIS] Prompt not displayed:', reason);
          setGoogleLoading(false);

          if (reason === 'suppressed_by_user') {
            setGoogleError(
              'Google sign-in was suppressed. Click the "G" icon in your browser address bar to re-enable it, or try the button again.'
            );
          } else if (reason === 'opt_out_or_no_session') {
            setGoogleError(
              'No Google session found in this browser. Make sure you are signed into a Google account first.'
            );
          } else {
            setGoogleError(`Google sign-in could not be displayed (${reason}). Please try again.`);
          }
        }

        if (notification.isSkippedMoment()) {
          const reason = notification.getSkippedReason();
          console.warn('[GIS] Prompt skipped:', reason);
          setGoogleLoading(false);
          setGoogleError('Sign-in was cancelled. Please try again.');
        }

        if (notification.isDismissedMoment()) {
          const reason = notification.getDismissedReason();
          console.warn('[GIS] Prompt dismissed:', reason);
          setGoogleLoading(false);
          if (reason !== 'credential_returned') {
            // credential_returned means success — callback fires separately
            setGoogleError('Sign-in was closed before completing. Please try again.');
          }
        }
      });
    } catch (err) {
      console.error('[GIS] prompt() threw:', err);
      setGoogleLoading(false);
      setGoogleError(`Google sign-in error: ${err.message}`);
    }
  };

  // ─── Backend call ────────────────────────────────────────────────────────────

  const callGoogleLoginBackend = async (name, gEmail, avatarUrl) => {
    setGoogleLoading(true);
    setGoogleError('');
    try {
      console.log('[Google Auth] Sending profile to backend:', gEmail);
      const response = await API.post('/api/oauth/google', { name, email: gEmail, avatarUrl });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('[Google Auth] Login successful, navigating to dashboard');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Google Authentication failed.';
      console.error('[Google Auth] Backend error:', msg);
      setGoogleError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  // ─── Standard login ───────────────────────────────────────────────────────────

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/api/login', { email, password });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Forgot / reset password ──────────────────────────────────────────────────

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const response = await API.post('/api/forgot-password', { email: forgotEmail });
      setForgotSuccess(response.data.message || 'Token sent successfully.');
      if (response.data.token) {
        setResetToken(response.data.token);
      }
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      await API.post('/api/reset-password', {
        email: forgotEmail,
        token: resetToken,
        newPassword: newPassword
      });
      setForgotSuccess('Password reset successful! You can now log in.');
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotEmail('');
        setResetToken('');
        setNewPassword('');
        setForgotSuccess('');
      }, 2000);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Reset failed. Verify the token.');
    } finally {
      setForgotLoading(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#1DB954] selection:text-black">

      {/* ── Dev-mode Google bypass modal ── */}
      {showGoogleDevModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-2xl p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Sign in with Google</h3>
              <button onClick={() => setShowGoogleDevModal(false)} className="text-white/40 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-white/40 mb-5">
              Google OAuth is not configured. Enter your name &amp; email to continue (demo mode).
            </p>
            <input
              type="text"
              placeholder="Your full name"
              value={devGoogleName}
              onChange={e => setDevGoogleName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 mb-3 focus:outline-none focus:border-[#1DB954]/60"
            />
            <input
              type="email"
              placeholder="your@email.com"
              value={devGoogleEmail}
              onChange={e => setDevGoogleEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 mb-5 focus:outline-none focus:border-[#1DB954]/60"
            />
            <button
              onClick={async () => {
                if (!devGoogleName.trim() || !devGoogleEmail.trim()) {
                  setGoogleError('Please enter both name and email.');
                  setShowGoogleDevModal(false);
                  return;
                }
                setShowGoogleDevModal(false);
                await callGoogleLoginBackend(
                  devGoogleName.trim(),
                  devGoogleEmail.trim(),
                  `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(devGoogleEmail.trim())}`
                );
              }}
              className="w-full py-3 bg-gradient-to-r from-[#1DB954] to-[#00D4FF] text-black font-bold rounded-xl hover:opacity-90 transition text-sm"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

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
          Welcome Back
        </h2>
        <p className="text-xs text-slate-400 text-center mb-8 font-medium">Please enter your credentials to access your console</p>

        {/* Quick-sign-in buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* ── Real Google Sign-In button ── */}
          <button
            id="google-login-btn"
            type="button"
            onClick={handleGoogleButtonClick}
            disabled={googleLoading}
            className="py-3 border border-white/10 hover:border-white/20 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all bg-white/5 hover:bg-white/10 cursor-pointer active:scale-98 disabled:opacity-60"
          >
            {googleLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span className="font-poppins">Google Login</span>
          </button>

          <button
            type="button"
            onClick={() => setShowVoiceModal(true)}
            className="py-3 border border-[#1DB954]/20 hover:border-[#1DB954]/40 text-[#1DB954] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all bg-[#1DB954]/5 hover:bg-[#1DB954]/10 cursor-pointer active:scale-98"
          >
            <Mic className="w-3.5 h-3.5 shrink-0 text-[#1db954]" />
            <span className="font-poppins">Voice Sign-In</span>
          </button>
        </div>

        {/* Google error — always visible, includes the specific error code/reason */}
        {googleError && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{googleError}</span>
          </div>
        )}

        {/* Separator */}
        <div className="relative flex py-2 items-center mb-6">
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

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-poppins">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all text-sm font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-poppins">Password</label>
              <button
                type="button"
                onClick={() => {
                  setForgotStep(1);
                  setForgotError('');
                  setForgotSuccess('');
                  setShowForgotModal(true);
                }}
                className="text-[10px] font-bold text-[#1DB954] hover:text-[#1ed760] uppercase tracking-widest font-poppins cursor-pointer bg-transparent border-none"
              >
                Forgot?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-6 rounded-full bg-gradient-to-r from-[#1DB954] to-[#00D4FF] hover:from-[#1ed760] hover:to-[#2be0ff] text-black font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98 shadow-lg shadow-[#1DB954]/10 hover:shadow-[#1DB954]/20"
          >
            {loading ? (
              <span className="w-4.5 h-4.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="flex items-center gap-1.5 font-bold">Log In <ArrowRight className="w-4 h-4" /></span>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs sm:text-sm text-slate-400 font-semibold font-poppins">
          New to AuraBeat?{' '}
          <Link to="/register" className="text-[#1DB954] hover:text-[#1ed760] font-bold underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>

      {/* FORGOT / RESET PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm glass-card bg-[#111] border border-white/10 rounded-[28px] overflow-hidden shadow-2xl p-6 sm:p-7 relative">

            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-poppins text-lg font-extrabold text-white mb-1.5 pr-6">
              {forgotStep === 1 ? 'Forgot Password?' : 'Reset Password'}
            </h3>
            <p className="text-xs text-slate-400 mb-6 font-medium">
              {forgotStep === 1
                ? 'Enter your email address below and we will generate a temporary security code.'
                : 'Enter the security code and choose your new password.'
              }
            </p>

            {forgotError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-poppins">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-500 focus:outline-none text-xs font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#1DB954] to-[#00D4FF] text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {forgotLoading ? (
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Generate Reset Code</span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-poppins">Reset Code / Token</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Enter the 8-character token"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-500 focus:outline-none text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-poppins">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-[#1DB954]/50 rounded-xl text-white placeholder-slate-500 focus:outline-none text-xs font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#1DB954] to-[#00D4FF] text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {forgotLoading ? (
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Save New Password</span>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Go back to Step 1
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Voice Assistant Onboarding Modal */}
      <VoiceOnboardingModal isOpen={showVoiceModal} onClose={() => setShowVoiceModal(false)} type="login" />

    </div>
  );
};

export default Login;