import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000',
});

export const analyzeDocument = async (file, language = 'hindi') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    const response = await api.post('/analyze-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const askQuestion = async (question, language, file = null) => {
    const formData = new FormData();
    formData.append('question', question);
    formData.append('language', language);
    if (file) formData.append('file', file);

    const response = await api.post('/ask-question', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const draftResponse = async (document_text, citizen_situation, language, file = null) => {
    const formData = new FormData();
    formData.append('citizen_situation', citizen_situation);
    formData.append('language', language);
    if (document_text) formData.append('document_text', document_text);
    if (file) formData.append('file', file);

    const response = await api.post('/draft-response', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export default api;
