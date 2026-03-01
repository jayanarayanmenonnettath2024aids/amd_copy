import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { draftResponse } from '../services/api';

const DraftingTool = () => {
    const { language, translations } = useLanguage();
    const [file, setFile] = useState(null);
    const [situation, setSituation] = useState('');
    const [draft, setDraft] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDraft = async () => {
        if (!situation) return;
        setLoading(true);
        try {
            const data = await draftResponse(null, situation, language, file);
            setDraft(data.draft);
        } catch (error) {
            console.error(error);
            alert('Error generating draft');
        }
        setLoading(false);
    };

    return (
        <div className="feature-container">
            <div className="glass-card composer-card">
                <h2 className="gradient-text">{translations.draftTitle}</h2>
                <p className="text-muted mt-2">
                    {translations.draftSubtitle}
                </p>

                <div className="composer-section">
                    <div className="composer-field">
                        <label>{translations.docExcerptLabel}</label>
                        <div className="upload-box-small" style={{ border: '2px dashed rgba(255,255,255,0.2)', padding: '15px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}>
                            <input
                                type="file"
                                id="draft-file"
                                hidden
                                accept="image/*,.pdf"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                            <label htmlFor="draft-file" style={{ cursor: 'pointer', display: 'block', margin: 0 }}>
                                {file ? file.name : "Click to upload notice/document (PDF/Image)"}
                            </label>
                        </div>
                    </div>

                    <div className="composer-field">
                        <label>{translations.situationLabel}</label>
                        <textarea
                            className="composer-textarea"
                            value={situation}
                            onChange={(e) => setSituation(e.target.value)}
                            placeholder={translations.placeholderSituation || "Describe what you need the draft to accomplish..."}
                        />
                    </div>

                    <button
                        onClick={handleDraft}
                        className="btn-primary w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="typing-indicator">
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
                            </div>
                        ) : (
                            translations.generate
                        )}
                    </button>
                </div>

                {draft && (
                    <div className="composer-result-card">
                        <h3 className="ai-meta">{translations.draftResultTitle}</h3>
                        <div className="draft-output">
                            {draft}
                        </div>
                        <div className="composer-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => navigator.clipboard.writeText(draft)}
                            >
                                {translations.copyBtn}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DraftingTool;

