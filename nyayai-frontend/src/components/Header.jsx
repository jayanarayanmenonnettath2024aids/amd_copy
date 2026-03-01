import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

import { useAuth } from '../context/AuthContext';
import ToggleTheme from './ToggleTheme';

const Header = () => {
  const { toggleLanguage, translations } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="site-header-container">
      <div className="site-header glass-card">
        <Link to="/" className="branding">
          <div className="logo-icon">N</div>
          <h1 className="logo-text">
            Nyay<span className="logo-accent">AI</span>
          </h1>
        </Link>

        <nav className="nav-menu">
          <Link to="/" className={isActive('/') ? 'active' : ''}>{translations.home}</Link>
          <Link to="/workspace" className={isActive('/workspace') ? 'active' : ''}>{translations.workspace}</Link>
          <Link to="/analyze" className={isActive('/analyze') ? 'active' : ''}>{translations.analyze}</Link>
          <Link to="/ask" className={isActive('/ask') ? 'active' : ''}>{translations.ask}</Link>
          <Link to="/draft" className={isActive('/draft') ? 'active' : ''}>{translations.draft}</Link>
        </nav>

        <div className="header-meta">
          <ToggleTheme />
          <button className="lang-btn" onClick={toggleLanguage} title="Switch Language">
            {translations.toggle}
          </button>

          <div className="auth-section">
            {isAuthenticated ? (
              <div className="user-profile">
                <span className="user-name">{user?.name || "User"}</span>
                <button onClick={logout} className="logout-btn-header">{translations.logout}</button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary auth-btn-header">Sign In</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
