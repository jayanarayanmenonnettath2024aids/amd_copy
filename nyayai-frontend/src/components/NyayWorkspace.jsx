import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { analyzeDocument, askQuestion, draftResponse } from '../services/api';
import LoadingSpinner from './ui/LoadingSpinner';
import { cn } from '../lib/utils';
import Button from './ui/Button';

const STEPS = {
    UPLOAD: 1,
    SUMMARY: 2,
    CHOOSE_PATH: 3,
    ACTION: 4
};

const NyayWorkspace = () => {
    const { language, translations } = useLanguage();
    const [currentStep, setCurrentStep] = useState(STEPS.UPLOAD);
    const [activePath, setActivePath] = useState(null); // 'chat' or 'draft'

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

    const handleFileChange = (selectedFile) => {
        if (selectedFile && (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf')) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setAnalysisResult(null);
            setChatHistory([]);
            setDraftResult('');
        } else if (selectedFile) {
            alert('Please upload an image or PDF file.');
        }
    };

    const startAnalysis = async () => {
        if (!file) return;
        setIsAnalyzing(true);
        setCurrentStep(STEPS.SUMMARY);
        try {
            const data = await analyzeDocument(file, language);
            setAnalysisResult(data);
        } catch (error) {
            console.error(error);
            alert('Error analyzing document in workspace.');
        }
        setIsAnalyzing(false);
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

    const renderStepIndicator = () => {
        const steps = [
            { id: 1, label: translations.uploadText || "Upload" },
            { id: 2, label: translations.summaryText || "Summary" },
            { id: 3, label: translations.actionsText || "Actions" },
            { id: 4, label: translations.resultText || "Result" }
        ];

        return (
            <div className="step-indicator-container">
                {steps.map((s, i) => (
                    <React.Fragment key={s.id}>
                        <div className={`step-item ${currentStep >= s.id ? 'active' : ''} ${currentStep > s.id ? 'completed' : ''}`}>
                            <div className="step-circle">{currentStep > s.id ? '✓' : s.id}</div>
                            <span className="step-label">{s.label}</span>
                        </div>
                        {i < steps.length - 1 && <div className={`step-line ${currentStep > s.id ? 'filled' : ''}`}></div>}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className="analyzer-container animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

            {renderStepIndicator()}

            {/* STAGE 1: UPLOAD & PREVIEW */}
            {currentStep === STEPS.UPLOAD && (
                <div className="workspace-stage">
                    <div className="analyzer-hero">
                        <h1 className="hero-title">
                            <span className="gradient-text">{translations.workspaceTitle?.split(' ')[0] || "Guided"}</span> {translations.workspaceTitle?.split(' ').slice(1).join(' ') || "Workflow"}
                        </h1>
                        <p className="hero-description">
                            {translations.workspaceSubtitle || "Start by uploading your document for professional neural analysis."}
                        </p>
                    </div>

                    <div
                        className={`glass-card upload-card ${isDragging ? 'dragging' : ''} ${file ? 'file-ready' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !file && fileInputRef.current.click()}
                        style={{ marginTop: '2rem', height: file ? 'auto' : '300px' }}
                    >
                        <input
                            type="file"
                            hidden
                            ref={fileInputRef}
                            onChange={(e) => handleFileChange(e.target.files[0])}
                            accept="image/*,.pdf"
                        />

                        {!file ? (
                            <>
                                <span className="upload-icon-large">📄</span>
                                <h3>{translations.dropFileText}</h3>
                                <p className="text-muted">{translations.browseFiles}</p>
                            </>
                        ) : (
                            <div className="file-preview-mini">
                                <div className="preview-header">
                                    <span className="file-icon">📄</span>
                                    <h3 style={{ margin: 0 }}>{file.name}</h3>
                                    <button className="remove-file-btn" onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewUrl(null); }}>×</button>
                                </div>
                                <div className="preview-container-guided">
                                    {file.type === 'application/pdf' ? (
                                        <iframe src={previewUrl} title="PDF Preview" style={{ width: '100%', height: '350px', borderRadius: '12px', border: 'none' }} />
                                    ) : (
                                        <img src={previewUrl} alt="Document Preview" style={{ width: '100%', borderRadius: '12px', maxHeight: '400px', objectFit: 'contain' }} />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {file && (
                        <div className="stage-actions">
                            <Button onClick={startAnalysis} className="btn-proceed">
                                {translations.proceedToAnalysis || "Proceed to Analysis"} →
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* STAGE 2: NEURAL SUMMARY */}
            {currentStep === STEPS.SUMMARY && (
                <div className="workspace-stage">
                    <div className="glass-card explanation-main animate-slide-up">
                        <div className="stage-header">
                            <h2 className="gradient-text">{translations.brainSummary}</h2>
                            <span className="badge-premium">{file?.name}</span>
                        </div>

                        {isAnalyzing ? (
                            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                                <div className="mb-6 flex justify-center">
                                    <LoadingSpinner size={64} color="var(--primary)" />
                                </div>
                                <h2 className="gradient-text">{translations.processingText || "Analyzing Document..."}</h2>
                            </div>
                        ) : analysisResult ? (
                            <>
                                <div className="summary-content" style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                                    {formatText(analysisResult.explanation)}
                                </div>
                                {analysisResult.next_steps && (
                                    <div className="next-steps-guided">
                                        <h4>{translations.nextSteps}</h4>
                                        <div className="steps-grid">
                                            {formatText(analysisResult.next_steps)}
                                        </div>
                                    </div>
                                )}
                                <div className="stage-actions">
                                    <Button variant="secondary" onClick={() => setCurrentStep(STEPS.UPLOAD)}>← {translations.back || "Back"}</Button>
                                    <Button onClick={() => setCurrentStep(STEPS.CHOOSE_PATH)} className="btn-proceed">
                                        {translations.chooseAction || "Choose Next Action"} →
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="error-state">
                                <p>Failed to analyze document.</p>
                                <Button onClick={startAnalysis}>{translations.retry || "Retry"}</Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* STAGE 3: PATH SELECTION */}
            {currentStep === STEPS.CHOOSE_PATH && (
                <div className="workspace-stage">
                    <div className="path-selection-container animate-fade-in">
                        <h2 className="text-center mb-10 gradient-text" style={{ fontSize: '2rem' }}>
                            {translations.howToProceed || "How would you like to proceed?"}
                        </h2>

                        <div className="path-options">
                            <div className="path-card glass-card" onClick={() => { setActivePath('chat'); setCurrentStep(STEPS.ACTION); }}>
                                <div className="path-icon">💬</div>
                                <h3>{translations.interactiveChat || "Interactive Chat"}</h3>
                                <p>{translations.chatDescription || "Ask specific questions about clauses, deadlines, or risks."}</p>
                                <div className="path-action">Select Path →</div>
                            </div>

                            <div className="path-card glass-card" onClick={() => { setActivePath('draft'); setCurrentStep(STEPS.ACTION); }}>
                                <div className="path-icon">✍️</div>
                                <h3>{translations.responseComposer || "Response Composer"}</h3>
                                <p>{translations.draftDescription || "Automatically draft a formal legal reply or notice."}</p>
                                <div className="path-action">Select Path →</div>
                            </div>
                        </div>

                        <div className="stage-actions mt-10">
                            <Button variant="secondary" onClick={() => setCurrentStep(STEPS.SUMMARY)}>← {translations.backToSummary || "Back to Summary"}</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* STAGE 4: ACTION (CHAT OR DRAFT) */}
            {currentStep === STEPS.ACTION && (
                <div className="workspace-stage animate-fade-in">

                    {activePath === 'chat' && (
                        <div className="feature-container" style={{ margin: 0, padding: 0 }}>
                            <div className="stage-header mb-4">
                                <h2 className="gradient-text">{translations.interactiveChat}</h2>
                                <Button variant="secondary" size="small" onClick={() => setCurrentStep(STEPS.CHOOSE_PATH)}>Change Path</Button>
                            </div>
                            <div className="chat-window" style={{ height: '600px' }}>
                                <div className="messages" style={{ flexGrow: 1, overflowY: 'auto' }}>
                                    {chatHistory.length === 0 && (
                                        <div className="welcome-msg" style={{ padding: '2rem' }}>
                                            <h3 className="gradient-text">{translations.askTitle}</h3>
                                            <p className="text-muted">
                                                {translations.workspaceChatSubtitle || "Ask any specific questions regarding the document. The AI has the full context."}
                                            </p>
                                        </div>
                                    )}
                                    {chatHistory.map((msg, i) => (
                                        <div key={i} className={`message ${msg.role}`}>
                                            <div className="message-bubble">
                                                <span className="ai-meta">{msg.role === 'ai' ? translations.aiRole : translations.userRole}</span>
                                                <div className="message-text">{formatText(msg.text)}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {isChatting && (
                                        <div className="message ai">
                                            <div className="message-bubble">
                                                <span className="ai-meta">{translations.aiRole}</span>
                                                <LoadingSpinner size={20} color="var(--primary)" />
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
                                    <button onClick={handleSendChat} className={cn("send-btn", isChatting && "opacity-50 pointer-events-none")} disabled={isChatting || !chatQuestion.trim()}>
                                        {isChatting ? (
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
                            <div className="stage-actions mt-6">
                                <Button variant="secondary" onClick={() => setCurrentStep(STEPS.CHOOSE_PATH)}>← {translations.back || "Back"}</Button>
                                <Button onClick={() => { setActivePath('draft'); }} className="btn-proceed">
                                    {translations.proceedToDraft || "Proceed to Drafting"} →
                                </Button>
                            </div>
                        </div>
                    )}

                    {activePath === 'draft' && (
                        <div className="feature-container" style={{ margin: 0, padding: 0 }}>
                            <div className="stage-header mb-4">
                                <h2 className="gradient-text">{translations.responseComposer}</h2>
                                <Button variant="secondary" size="small" onClick={() => setCurrentStep(STEPS.CHOOSE_PATH)}>Change Path</Button>
                            </div>
                            <div className="glass-card composer-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <p className="text-muted">
                                    {translations.workspaceDraftSubtitle || "Describe your situation to instantly draft a formal reply based on the uploaded document."}
                                </p>

                                <div className="composer-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <textarea
                                        className="composer-textarea"
                                        style={{ minHeight: '200px' }}
                                        value={situation}
                                        onChange={(e) => setSituation(e.target.value)}
                                        placeholder={translations.placeholderSituation || "Describe what you need the draft to accomplish..."}
                                    />
                                    <Button onClick={handleGenerateDraft} loading={isDrafting} disabled={!situation.trim()}>
                                        {translations.generate}
                                    </Button>
                                </div>

                                {draftResult && (
                                    <div className="composer-result-card glass-card animate-slide-up" style={{ marginTop: '0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 className="ai-meta">{translations.draftResultTitle}</h3>
                                            <Button variant="secondary" onClick={() => navigator.clipboard.writeText(draftResult)}>{translations.copyBtn}</Button>
                                        </div>
                                        <div className="draft-output" style={{ marginTop: '1rem' }}>
                                            {formatText(draftResult)}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="stage-actions mt-6">
                                <Button variant="secondary" onClick={() => setCurrentStep(activePath === 'chat' ? STEPS.ACTION : STEPS.CHOOSE_PATH)}>
                                    ← {translations.back || "Back"}
                                </Button>
                                <Button onClick={() => alert('Workflow Completed!')} className="btn-proceed">
                                    {translations.finish || "Finish Workflow"} ✓
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NyayWorkspace;
