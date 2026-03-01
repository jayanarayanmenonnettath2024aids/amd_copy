import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { cn } from '../lib/utils';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { translations } = useLanguage();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    setLoading(true);
    try {
      await register({ name: formData.name, email: formData.email, password: formData.password });
      navigate('/');
    } catch (error) {
      console.error("Registration failed:", error);
      alert(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="glass-card auth-card">
        <div className="auth-header">
          <h2 className="gradient-text">{translations.registerTitle}</h2>
          <p className="auth-subtitle">{translations.registerSubtitle}</p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label>{translations.fullNameLabel}</label>
            <input
              type="text"
              placeholder="John Doe"
              className="glass-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>{translations.emailLabel}</label>
            <input
              type="email"
              placeholder="name@company.com"
              className="glass-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>{translations.passwordLabel}</label>
            <input
              type="password"
              placeholder="••••••••"
              className="glass-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>{translations.passwordLabel} (Confirm)</label>
            <input
              type="password"
              placeholder="••••••••"
              className="glass-input"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            className={cn("btn-primary auth-btn", loading && "btn-loading")}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size={20} color="white" />
                <span>Creating Account...</span>
              </>
            ) : translations.register}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <p className="auth-footer">
          {translations.haveAccount} <Link to="/login">{translations.signInLink}</Link>
        </p>
      </div>
    </div>

  );
};

export default RegisterPage;
