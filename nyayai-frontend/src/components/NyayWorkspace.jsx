import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { analyzeDocument, askQuestion, draftResponse } from '../services/api';

const NyayWorkspace = () => {
    const { language, translations } = useLanguage();
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // Chat State
    const [chatQuestion, setChatQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isChatting, setIsChatting] = useState(false);

    // Draft State
    const [situation, setSituation] = useState('');
    const [draftResult, setDraftResult] = useState('');
    const [isDrafting, setIsDrafting] = useState(false);

    const formatText = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => (
            <React.Fragment key={i}>
                <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                <br />
            </React.Fragment>
        ));
    };

    const handleFileChange = async (selectedFile) => {
        if (selectedFile && (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf')) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setAnalysisResult(null);
            setChatHistory([]);
            setDraftResult('');

            // Auto-analyze on upload for a seamless experience
            setIsAnalyzing(true);
            try {
                const data = await analyzeDocument(selectedFile, language);
                setAnalysisResult(data);
            } catch (error) {
                console.error(error);
                alert('Error analyzing document in workspace.');
            }
            setIsAnalyzing(false);
        } else if (selectedFile) {
            alert('Please upload an image or PDF file.');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFileChange(droppedFile);
    };

    const handleSendChat = async () => {
        if (!chatQuestion.trim()) return;

        const userMsg = { role: 'user', text: chatQuestion };
        setChatHistory(prev => [...prev, userMsg]);
        const questionText = chatQuestion;
        setChatQuestion('');
        setIsChatting(true);

        try {
            const data = await askQuestion(questionText, language, file);
            setChatHistory(prev => [...prev, { role: 'ai', text: data.answer }]);
        } catch (error) {
            console.error(error);
            setChatHistory(prev => [...prev, { role: 'ai', text: 'Error getting answer.' }]);
        }
        setIsChatting(false);
    };

    const handleGenerateDraft = async () => {
        if (!situation.trim()) return;
        setIsDrafting(true);
        try {
            const data = await draftResponse(null, situation, language, file);
            setDraftResult(data.draft);
        } catch (error) {
            console.error(error);
            alert('Error generating draft.');
        }
        setIsDrafting(false);
    };

    return (
        <div className="analyzer-container animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>

            {!analysisResult && !isAnalyzing && (
                <div className="analyzer-hero">
                    <h1 className="hero-title">
                        <span className="gradient-text">{translations.workspaceTitle?.split(' ')[0] || "Unified"}</span> {translations.workspaceTitle?.split(' ').slice(1).join(' ') || "Workspace"}
                    </h1>
                    <p className="hero-description">
                        {translations.workspaceSubtitle || "Upload your legal document to instantly unlock Neural Analysis, Contextual Q&A, and Automated Drafting in one place."}
                    </p>

                    <div
                        className={`glass-card upload-card ${isDragging ? 'dragging' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                        style={{ marginTop: '2rem' }}
                    >
                        <input
                            type="file"
                            hidden
                            ref={fileInputRef}
                            onChange={(e) => handleFileChange(e.target.files[0])}
                            accept="image/*,.pdf"
                        />
                        <span className="upload-icon-large">📄</span>
                        <h3>{translations.dropFileText}</h3>
                        <p className="text-muted">{translations.browseFiles}</p>
                    </div>
                </div>
            )}

            {isAnalyzing && (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <div className="typing-indicator" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
                        <span className="typing-dot" style={{ width: '12px', height: '12px' }}></span>
                        <span className="typing-dot" style={{ width: '12px', height: '12px' }}></span>
                        <span className="typing-dot" style={{ width: '12px', height: '12px' }}></span>
                    </div>
                    <h2 className="gradient-text">{translations.processingText || "Analyzing Document..."}</h2>
                </div>
            )}

            {analysisResult && (
                <div className="workspace-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Top Row: File Preview & Brain Summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>

                        <div className="glass-card" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 className="ai-meta" style={{ margin: 0 }}>{file.name}</h3>
                                <button className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => { setFile(null); setAnalysisResult(null); }}>
                                    {translations.changeFile || "Change File"}
                                </button>
                            </div>
                            {file.type === 'application/pdf' ? (
                                <iframe src={previewUrl} title="PDF Preview" style={{ width: '100%', height: '300px', borderRadius: '12px', border: 'none' }} />
                            ) : (
                                <img src={previewUrl} alt="Document Preview" style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', maxHeight: '300px' }} />
                            )}
                        </div>

                        <div className="glass-card explanation-main" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <h3 className="gradient-text">{translations.brainSummary}</h3>
                            <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
                                {formatText(analysisResult.explanation)}
                            </p>

                            {analysisResult.next_steps && (
                                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', borderLeft: '4px solid #6366f1' }}>
                                    <h4 className="gradient-text">{translations.nextSteps}</h4>
                                    <p className="text-muted" style={{ fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
                                        {formatText(analysisResult.next_steps)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Row: Chat & Composer */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                        {/* Interactive Chat */}
                        <div className="feature-container" style={{ margin: 0, padding: 0 }}>
                            <div className="chat-window" style={{ height: '500px' }}>
                                <div className="messages" style={{ flexGrow: 1, overflowY: 'auto' }}>
                                    {chatHistory.length === 0 && (
                                        <div className="welcome-msg" style={{ padding: '2rem' }}>
                                            <h3 className="gradient-text">{translations.askTitle}</h3>
                                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                                {translations.workspaceChatSubtitle || "Ask any specific questions regarding the document above. The AI has it in context."}
                                            </p>
                                        </div>
                                    )}
                                    {chatHistory.map((msg, i) => (
                                        <div key={i} className={`message ${msg.role}`}>
                                            <div className="message-bubble">
                                                <span className="ai-meta">{msg.role === 'ai' ? translations.aiRole : translations.userRole}</span>
                                                <div className="message-text">
                                                    {formatText(msg.text)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {isChatting && (
                                        <div className="message ai">
                                            <div className="message-bubble">
                                                <span className="ai-meta">{translations.aiRole}</span>
                                                <div className="typing-indicator">
                                                    <span className="typing-dot"></span><span className="typing-dot"></span><span className="typing-dot"></span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="chat-input-area">
                                    <input
                                        type="text"
                                        value={chatQuestion}
                                        onChange={(e) => setChatQuestion(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                                        placeholder={translations.placeholderAsk || "Ask a question..."}
                                        className="neural-input"
                                    />
                                    <button onClick={handleSendChat} className="send-btn" disabled={isChatting || !chatQuestion.trim()}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="22" y1="2" x2="11" y2="13"></line>
                                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Drafting Tool */}
                        <div className="feature-container" style={{ margin: 0, padding: 0 }}>
                            <div className="glass-card composer-card" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
                                <h3 className="gradient-text">{translations.draftTitle}</h3>
                                <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                    {translations.workspaceDraftSubtitle || "Describe your situation to instantly draft a formal reply based on the uploaded document."}
                                </p>

                                <div className="composer-section" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                    <textarea
                                        className="composer-textarea"
                                        style={{ flexGrow: 1 }}
                                        value={situation}
                                        onChange={(e) => setSituation(e.target.value)}
                                        placeholder={translations.placeholderSituation || "Describe what you need the draft to accomplish..."}
                                    />
                                    <button onClick={handleGenerateDraft} className="btn-primary" disabled={isDrafting || !situation.trim()}>
                                        {isDrafting ? "Drafting..." : translations.generate}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Draft Output Modal or Popout below if generated */}
                    {draftResult && (
                        <div className="composer-result-card glass-card" style={{ marginTop: '0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 className="ai-meta">{translations.draftResultTitle}</h3>
                                <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(draftResult)}>{translations.copyBtn}</button>
                            </div>
                            <div className="draft-output" style={{ marginTop: '1rem' }}>
                                {formatText(draftResult)}
                            </div>
                        </div>
                    )}

                </div>
            )}

        </div>
    );
};

export default NyayWorkspace;
