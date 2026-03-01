import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { cn } from '../lib/utils';

const ContactPage = () => {
  const { translations } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate an API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    alert('Message sent successfully!');
    // In a real app, you'd handle form submission logic here
  };

  return (
    <div className="contact-page">
      <section className="glass-card page-header">
        <h1 className="gradient-text">{translations.contactTitle}</h1>
        <p>{translations.contactSubtitle}</p>
      </section>

      <div className="contact-container">
        <div className="glass-card contact-form">
          <h2>Send a Message</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" placeholder="Your Name" className="glass-input" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="Your Email" className="glass-input" />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea placeholder="How can we help?" className="glass-input" rows="5"></textarea>
            </div>
            <button
              type="submit"
              className={cn("btn-primary", isLoading && "btn-loading")}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size={20} color="white" />
                  <span>Sending...</span>
                </>
              ) : translations.sendMessage || "Send Message"}
            </button>
          </form>
        </div>

        <div className="glass-card contact-info">
          <h2>Get in Touch</h2>
          <div className="info-item">
            <span className="icon">📍</span>
            <div>
              <h4>Location</h4>
              <p>Justice Plaza, Tech City, IN</p>
            </div>
          </div>
          <div className="info-item">
            <span className="icon">📧</span>
            <div>
              <h4>Email</h4>
              <p>support@nyayai.com</p>
            </div>
          </div>
          <div className="info-item">
            <span className="icon">📞</span>
            <div>
              <h4>Phone</h4>
              <p>+91 123 456 7890</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
