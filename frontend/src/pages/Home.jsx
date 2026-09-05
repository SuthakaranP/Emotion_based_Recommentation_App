import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Music, Mic, Bot, Heart, ArrowRight, Sparkles, Play, ShieldCheck, 
  Layers, Headphones, Activity, ChevronRight 
} from 'lucide-react';

const Home = () => {
  const token = localStorage.getItem('token');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const features = [
    {
      title: 'Speech Emotion Analysis',
      description: 'Capture acoustic tones and spoken statements. AuraBeat translates voice frequencies to identify Happy, Sad, or Relaxed states in real-time.',
      icon: Mic,
      gradient: 'from-[#1DB954] to-[#00D4FF]',
    },
    {
      title: 'Voice-Activated AI Assistant',
      description: 'Interact with VibeBot using text or voice. Talk about your day, ask music-related questions, and let the assistant recommend custom playlists.',
      icon: Bot,
      gradient: 'from-[#8B5CF6] to-[#EC4899]',
    },
    {
      title: 'Adaptive Music Feed',
      description: 'Dynamically generated listening grid mapped to your cognitive mood. Instantly save customized selections to your profile library.',
      icon: Play,
      gradient: 'from-[#F59E0B] to-[#EF4444]',
    },
    {
      title: 'Stripe-Grade Authorization',
      description: 'Fully protected user accounts featuring JWT session validation, CORS guards, and hashed credentials for secure logins.',
      icon: ShieldCheck,
      gradient: 'from-[#10B981] to-[#3B82F6]',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-slate-100 flex flex-col relative overflow-hidden pb-20 selection:bg-[#1DB954] selection:text-black">
      
      {/* Background Neon Glowing Meshes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-radial from-[#1DB954]/10 via-transparent to-transparent blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[45vw] h-[45vw] bg-radial from-[#00D4FF]/10 via-transparent to-transparent blur-[100px] pointer-events-none z-0"></div>
      
      <div className="max-w-7xl mx-auto px-6 flex-grow flex flex-col items-center justify-center pt-20 relative z-10">
        
        {/* HERO SECTION */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl flex flex-col items-center"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold tracking-wide mb-8 shadow-sm backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-[#1DB954]" />
            <span>Next-Generation SaaS Music Platform</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight leading-[0.95] mb-8 font-poppins"
          >
            Discover Music That Understands{' '}
            <span className="bg-gradient-to-r from-[#1DB954] via-[#00D4FF] to-[#8B5CF6] bg-clip-text text-transparent font-extrabold">
              Your Soul
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12 font-medium"
          >
            AuraBeat combines voice frequency analysis and natural language AI processing to identify your emotions, generating custom music recommendations in a gorgeous, glassmorphic player.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto">
            {token ? (
              <Link
                to="/dashboard"
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[#1DB954] to-[#00D4FF] hover:from-[#1ed760] hover:to-[#2be0ff] text-black font-bold text-sm flex items-center gap-2 shadow-xl shadow-[#1DB954]/20 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 group w-full sm:w-auto justify-center"
              >
                <span>Go to App Console</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-[#1DB954] to-[#00D4FF] hover:from-[#1ed760] hover:to-[#2be0ff] text-black font-bold text-sm flex items-center gap-2 shadow-xl shadow-[#1DB954]/20 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 group w-full sm:w-auto justify-center"
                >
                  <span>Launch AuraBeat Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 rounded-full border border-white/10 hover:border-white/20 text-white font-bold text-sm w-full sm:w-auto text-center transition-all bg-white/5 hover:bg-white/10 backdrop-blur-md hover:-translate-y-1 active:translate-y-0"
                >
                  Sign In
                </Link>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* INTERACTIVE MOCKUP VIEWPORT (Linear/Stripe Style) */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl mt-24 px-4 z-10"
        >
          <div className="glass-card overflow-hidden shadow-2xl relative border border-white/10 bg-black/40 backdrop-blur-3xl rounded-3xl flex flex-col">
            {/* Header row */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
              <div className="flex gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500/40" />
                <span className="w-3.5 h-3.5 rounded-full bg-yellow-500/40" />
                <span className="w-3.5 h-3.5 rounded-full bg-green-500/40" />
              </div>
              <span className="text-xs text-slate-500 font-mono tracking-tight select-none">http://localhost:5174/dashboard</span>
              <div className="w-8" />
            </div>
            
            {/* Inner Dashboard Mockup */}
            <div className="flex bg-[#0A0A0A]/85 min-h-[360px] relative">
              {/* Sidebar */}
              <div className="w-1/4 border-r border-white/5 p-5 space-y-6 hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#1DB954]/20 flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#1DB954]" />
                  </div>
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                </div>
                <div className="space-y-3 pt-4">
                  <div className="h-4 bg-[#1DB954]/10 border-l-2 border-[#1DB954] rounded-r w-full" />
                  <div className="h-4 bg-white/5 rounded w-5/6" />
                  <div className="h-4 bg-white/5 rounded w-4/5" />
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="h-8 bg-gradient-to-r from-[#1DB954]/20 to-[#00D4FF]/20 rounded-xl w-1/3" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-16 bg-white/5 rounded-xl border border-white/5" />
                    <div className="h-16 bg-white/5 rounded-xl border border-white/5" />
                    <div className="h-16 bg-white/5 rounded-xl border border-white/5" />
                  </div>
                </div>
                {/* Floating Bottom Player */}
                <div className="h-16 bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-4 mt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-lg" />
                    <div className="space-y-1">
                      <div className="h-3 bg-white/20 rounded w-20" />
                      <div className="h-2.5 bg-white/10 rounded w-12" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-black"><Play className="w-3.5 h-3.5 fill-current" /></div>
                  </div>
                  <div className="w-32 h-1 bg-white/10 rounded" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FEATURE GRID */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-6xl mt-40 px-4 z-10"
        >
          <div className="text-center mb-24">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">AI-Powered SaaS Architecture</h2>
            <p className="text-slate-400 max-w-lg mx-auto text-base leading-relaxed">
              Blending voice acoustics and transformer NLP to construct an active, customized listening experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -6 }}
                  className="glass-card p-8 rounded-3xl border border-white/5 relative overflow-hidden group transition-all duration-300 hover:border-white/10"
                >
                  {/* Glowing hover mesh */}
                  <div className={`absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-10 blur-2xl transition-opacity`} />
                  
                  <div className="flex items-start gap-5">
                    <div className={`p-4 bg-gradient-to-br ${feature.gradient} rounded-2xl text-black shadow-lg shadow-black/30`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2.5 font-poppins">{feature.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed font-medium">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

      </div>
    </div>
  );
};

export default Home;
