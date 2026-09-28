import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import JoinQuizPage from './pages/public/JoinQuizPage';

// Participant Gameplay
import PlayPage from './pages/play/PlayPage';

// Super Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminQuizzes from './pages/admin/AdminQuizzes';
import AdminQuestions from './pages/admin/AdminQuestions';
import QuizEditor from './pages/admin/QuizEditor';

import LiveControlPanel from './pages/admin/LiveControlPanel';
import AdminAnalytics from './pages/admin/AdminAnalytics';

function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            {/* Participant & Public Flow (With Navbar & Footer) */}
            <Route
              path="/"
              element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1">
                    <LandingPage />
                  </main>
                  <Footer />
                </div>
              }
            />

            <Route
              path="/join"
              element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1">
                    <JoinQuizPage />
                  </main>
                </div>
              }
            />

            <Route
              path="/join/:sessionCode"
              element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1">
                    <JoinQuizPage />
                  </main>
                </div>
              }
            />

            {/* Immersive Participant Gameplay Route */}
            <Route
              path="/play/:sessionCode"
              element={
                <div className="flex flex-col min-h-screen bg-[#F8F9FC]">
                  <Navbar />
                  <main className="flex-1">
                    <PlayPage />
                  </main>
                </div>
              }
            />

            {/* Admin Login */}
            <Route
              path="/admin/login"
              element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1">
                    <AdminLogin />
                  </main>
                  <Footer />
                </div>
              }
            />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="quizzes" element={<AdminQuizzes />} />
              <Route path="questions" element={<AdminQuestions />} />
              <Route path="quizzes/:id" element={<QuizEditor />} />

              <Route path="sessions/:id" element={<LiveControlPanel />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="analytics/:id" element={<AdminAnalytics />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </AuthProvider>
  );
}

export default App;
