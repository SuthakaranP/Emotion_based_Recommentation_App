import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MusicProvider } from './context/MusicContext';
import { AIProvider } from './context/AIContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import MusicPlayer from './components/MusicPlayer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Playlist from './pages/Playlist';
import Profile from './pages/Profile';
import Admin from './pages/Admin'; // Import Admin panel

function App() {
  return (
    <MusicProvider>
      <BrowserRouter>
        <AIProvider>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/playlist" element={<ProtectedRoute><Playlist /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            </Routes>
            <MusicPlayer />
          </Layout>
        </AIProvider>
      </BrowserRouter>
    </MusicProvider>
  );
}

export default App;
