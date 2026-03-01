from fastapi import UploadFile
from pathlib import Path

from core.ocr_engine import extract_text_from_image, extract_text_from_pdf
from core.translator import translate_to_english, translate_to_native
from core.rag_engine import query_rag
from core.model_loader import run_llm
from utils.text_cleaning import clean_extracted_text
from utils.logger import app_logger

async def process_document(file: UploadFile, lang: str = "hindi"):
    """
    Unified Pipeline 1: OCR -> Clean -> RAG -> LLM -> Translate
    """
    ext = Path(file.filename).suffix.lower()
    
    # OCR
    app_logger.info(f"Extracting text from {file.filename}")
    file_bytes = await file.read()
    
    if ext == ".pdf":
        raw_text = extract_text_from_pdf(file_bytes)
    else:
        raw_text = extract_text_from_image(file_bytes)
        
    # Clean
    cleaned_text = clean_extracted_text(raw_text)
    
    # Translate
    english_source_text = translate_to_english(cleaned_text)
    
    # RAG Search
    app_logger.info("Querying RAG index...")
    rag_context = query_rag(english_source_text)
    
    # LLM inference
    messages = [
        {"role": "system", "content": "You are a highly capable Indian Legal Assistant. Analyze the document provided and explain its legal implications clearly. Provide the entire gist and explanation in simple layman terms so that a regular citizen can easily understand it. Also, explicitly list practical 'Next Steps' the user should take. Use the retrieved context."},
        {"role": "user", "content": f"Context:\n{rag_context}\n\nDocument:\n{english_source_text}\n\nPlease provide your response formatted STRICTLY as follows:\nEXPLANATION:\n[Your layman explanation here]\n\nNEXT_STEPS:\n[Bullet points of next steps here]"}
    ]
    english_explanation = await run_llm(messages)
    
    # Parse explanation and next steps
    exp_text = english_explanation
    steps_text = "Consult a legal professional for specific next steps."
    
    if "NEXT_STEPS:" in english_explanation:
        parts = english_explanation.split("NEXT_STEPS:")
        exp_text = parts[0].replace("EXPLANATION:", "").strip()
        steps_text = parts[1].strip()
    
    # Translate targets
    final_explanation = translate_to_native(exp_text, lang)
    final_next_steps = translate_to_native(steps_text, lang)
    
    # Placeholder for accurate derived legal references parsing
    references = ["IPC Example", "CrPC Example"]
    
    return {
        "document_type": "Analyzed Document",
        "explanation": final_explanation,
        "next_steps": final_next_steps,
        "extracted_text": cleaned_text,
        "legal_references": references
    }

async def answer_question(query: str, lang: str = "hindi", file: UploadFile = None):
    """
    Unified Pipeline 2: Request -> Translation -> RAG -> LLM -> Translation
    """
    en_query = translate_to_english(query)
    
    file_context = ""
    if file:
        app_logger.info(f"Extracting text from {file.filename} for question answering")
        file_bytes = await file.read()
        ext = Path(file.filename).suffix.lower()
        if ext == ".pdf":
            file_context = extract_text_from_pdf(file_bytes)
        else:
            file_context = extract_text_from_image(file_bytes)
        file_context = clean_extracted_text(file_context)
        file_context = translate_to_english(file_context)
    
    rag_context = query_rag(en_query)
    
    messages = [
        {"role": "system", "content": "You are a highly capable Indian Legal Assistant providing definitive advice for regular citizens. Do NOT simply advise the user to consult a lawyer; provide the most practical, actionable advice possible based on the provided text. Act as their definitive legal counsel. Respond in simple layman terms."},
        {"role": "user", "content": f"Context/KB:\n{rag_context}\n\nUploaded Document Context (if any):\n{file_context}\n\nQuestion:\n{en_query}\n\nPlease answer the question in layman terms based on the context."}
    ]
    en_answer = await run_llm(messages)
    
    final_answer = translate_to_native(en_answer, lang)
    
    return {
        "answer": final_answer
    }

from typing import Optional

async def draft_legal_reply(situation: str, lang: str = "hindi", file: Optional[UploadFile] = None, document_text: Optional[str] = None):
    """
    Unified Pipeline 3: Draft generation
    """
    en_situation = translate_to_english(situation)
    
    en_text = ""
    if file:
        app_logger.info(f"Extracting text from {file.filename} for drafting")
        file_bytes = await file.read()
        ext = Path(file.filename).suffix.lower()
        if ext == ".pdf":
            raw_text = extract_text_from_pdf(file_bytes)
        else:
            raw_text = extract_text_from_image(file_bytes)
        cleaned_text = clean_extracted_text(raw_text)
        en_text = translate_to_english(cleaned_text)
    elif document_text:
        en_text = translate_to_english(document_text)
    
    messages = [
        {"role": "system", "content": "You are a highly capable Indian Legal Assistant. Draft professional legal responses and letters on behalf of clients."},
        {"role": "user", "content": f"Received Notice/Letter:\n{en_text}\n\nClient's Defense/Situation:\n{en_situation}\n\nPlease draft a professional legal reply letter based on this information."}
    ]
    en_draft = await run_llm(messages)
    
    final_draft = translate_to_native(en_draft, lang)
    
    return {
        "draft": final_draft
    }
