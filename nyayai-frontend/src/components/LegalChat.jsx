import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { askQuestion } from '../services/api';
import LoadingSpinner from './ui/LoadingSpinner';
import { cn } from '../lib/utils';

const LegalChat = () => {
    const { language, translations } = useLanguage();
    const [question, setQuestion] = useState('');
    const [file, setFile] = useState(null);
    const fileInputRef = React.useRef(null);
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!question.trim()) return;

        const userMsg = { role: 'user', text: question, file: file };
        setChat(prev => [...prev, userMsg]);
        const currentFile = file;
        setQuestion('');
        setFile(null);
        setLoading(true);

        try {
            const data = await askQuestion(question, language, currentFile);
            setChat(prev => [...prev, { role: 'ai', text: data.answer }]);
        } catch (error) {
            console.error(error);
            setChat(prev => [...prev, { role: 'ai', text: 'Error getting answer.' }]);
        }
        setLoading(false);
    };

    return (
        <div className="feature-container">
            <div className="chat-window">
                <div className="messages">
                    {chat.length === 0 && (
                        <div className="welcome-msg">
                            <span className="welcome-icon">🧠</span>
                            <h2 className="gradient-text">{translations.askTitle}</h2>
                            <p className="text-muted">
                                {translations.welcomeTextChat}
                            </p>
                        </div>
                    )}

                    {chat.map((msg, i) => (
                        <div key={i} className={`message ${msg.role}`}>
                            <div className="message-bubble">
                                <span className="ai-meta">
                                    {msg.role === 'ai' ? translations.aiRole : translations.userRole}
                                </span>
                                <div className="message-text">
                                    {msg.file && (
                                        <div style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', marginBottom: '8px', fontSize: '0.85em' }}>
                                            📎 {msg.file.name}
                                        </div>
                                    )}
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="message ai">
                            <div className="message-bubble">
                                <span className="ai-meta">{translations.aiRole}</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <LoadingSpinner size={16} color="var(--primary)" />
                                    <span className="text-xs opacity-70">Justice is thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="chat-input-area" style={{ position: 'relative' }}>
                    {file && (
                        <div style={{ position: 'absolute', top: '-30px', left: '10px', background: '#333', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#fff' }}>📄 {file.name}</span>
                            <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>×</button>
                        </div>
                    )}
                    <input
                        type="file"
                        hidden
                        ref={fileInputRef}
                        onChange={(e) => setFile(e.target.files[0])}
                        accept="image/*,.pdf"
                    />
                    <button
                        className="attach-btn"
                        onClick={() => fileInputRef.current.click()}
                        style={{ background: 'none', border: 'none', color: '#a0aec0', cursor: 'pointer', padding: '0 10px' }}
                        title="Attach Document"
                    >
                        📎
                    </button>
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={translations.placeholderAsk || "Describe your legal situation..."}
                        className="neural-input"
                    />
                    <button
                        onClick={handleSend}
                        className={cn("send-btn", loading && "opacity-50 pointer-events-none")}
                        disabled={loading || !question.trim()}
                        title="Send Message"
                    >
                        {loading ? (
                            <LoadingSpinner size={20} color="white" />
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LegalChat;


