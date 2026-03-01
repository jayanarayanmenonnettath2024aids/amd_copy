import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import ThreeDImageCarousel from '../components/ThreeDImageCarousel';

const LandingPage = () => {
  const { translations } = useLanguage();

  const carouselSlides = [
    { id: 1, src: '/images/legal_ai_1.png', href: '#' },
    { id: 2, src: '/images/legal_ai_2.png', href: '#' },
    { id: 3, src: '/images/legal_ai_3.png', href: '#' },
    { id: 4, src: '/images/legal_ai_4.png', href: '#' },
    { id: 5, src: '/images/legal_ai_5.png', href: '#' },
  ];

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content animate-fade-in">
          <div className="badge-premium">{translations.nextGenAI}</div>
          <h1 className="hero-title">
            {translations.heroTitle} <br />
            <span className="gradient-text">{translations.heroSubtitle}</span>
          </h1>
          <p className="hero-description">
            {translations.heroDescription}
          </p>
          <div className="hero-btns">
            <Link to="/analyze" className="btn-primary">{translations.initializeWorkspace}</Link>
            <Link to="/about" className="btn-secondary">{translations.exploreTechnology}</Link>
          </div>
        </div>
      </section>

      {/* 3D Carousel Section */}
      <section className="carousel-section animate-fade-in" style={{ padding: '4rem 0' }}>
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          {translations.carouselTitle.split(' ')[0]} <span className="gradient-text">{translations.carouselTitle.split(' ').slice(1).join(' ')}</span>
        </h2>
        <ThreeDImageCarousel
          slides={carouselSlides}
          autoplay={true}
          delay={4}
        />
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="glass-card stats-grid">
          <div className="stat-item">
            <h4>99.8%</h4>
            <p>{translations.accuracyRate}</p>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <h4>{"< 2s"}</h4>
            <p>{translations.analysisSpeed}</p>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <h4>100%</h4>
            <p>{translations.privateOffline}</p>
          </div>
        </div>
      </section>

      {/* Tools Showcase */}
      <section className="tools-section animate-fade-in">
        <h2 className="section-title">
          {translations.capabilitiesTitle.split(' ')[0]} <span className="gradient-text">{translations.capabilitiesTitle.split(' ')[1]}</span>
        </h2>
        <div className="tools-grid">
          <Link to="/analyze" className="tool-card">
            <div className="tool-icon">🔍</div>
            <h3>{translations.analyzeTitle}</h3>
            <p>{translations.analyzeDesc}</p>
            <div className="tool-link-arrow">→</div>
          </Link>

          <Link to="/ask" className="tool-card highlight">
            <div className="tool-icon">⚡</div>
            <h3>{translations.askTitle}</h3>
            <p>{translations.askDesc}</p>
            <div className="tool-link-arrow">→</div>
          </Link>

          <Link to="/draft" className="tool-card">
            <div className="tool-icon">🖋️</div>
            <h3>{translations.draftTitle}</h3>
            <p>{translations.draftDesc}</p>
            <div className="tool-link-arrow">→</div>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section animate-fade-in">
        <div className="glass-card cta-box">
          <h2 className="gradient-text">{translations.ctaTitle}</h2>
          <p className="text-muted">{translations.ctaDescription}</p>
          <Link to="/register" className="btn-primary" style={{ marginTop: '2rem', padding: '1rem 3rem' }}>
            {translations.getStartedFree}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
