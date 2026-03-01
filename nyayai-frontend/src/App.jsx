import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import DocumentAnalyzer from './components/DocumentAnalyzer';
import LegalChat from './components/LegalChat';
import DraftingTool from './components/DraftingTool';
import NyayWorkspace from './components/NyayWorkspace';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <div className="app-container">
              <Header />

              <main className="app-content">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/analyze" element={<ProtectedRoute><DocumentAnalyzer /></ProtectedRoute>} />
                  <Route path="/ask" element={<ProtectedRoute><LegalChat /></ProtectedRoute>} />
                  <Route path="/draft" element={<ProtectedRoute><DraftingTool /></ProtectedRoute>} />
                  <Route path="/workspace" element={<ProtectedRoute><NyayWorkspace /></ProtectedRoute>} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                </Routes>
              </main>

              <Footer />

            </div>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
