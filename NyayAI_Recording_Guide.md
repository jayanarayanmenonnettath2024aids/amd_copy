# NyayAI: Prototype Testing & Recording Guide

This guide is for the person recording the final Submission Video for NyayAI. Follow these steps exactly to demonstrate the core functionality and aesthetic superiority of the application.

## Prerequisites Before Recording
1. **Ensure the Backend is Running:**
   - Open a terminal in `nyayai-backend`.
   - Run: `.\venv\Scripts\uvicorn main:app --reload`
   - Wait for it to say *Application startup complete*.

2. **Ensure the Frontend is Running:**
   - Open a terminal in `nyayai-frontend`.
   - Run: `npm run dev`
   - Open the browser to `http://localhost:5173`.

3. **Prepare your Test Files:**
   - Have the `Test_Notice_English.pdf` easily accessible on your desktop or downloads folder so you can drag-and-drop it quickly.

---

## 🎬 Recording Step-by-Step

### Part 1: The Landing Page (0:00 - 0:20)
* **Goal:** Show off the beautiful UI and glassmorphism design.
1. Start recording on the `Home` page (`/`).
2. Slowly scroll down to show the **"Precision Analysis"**, **"Neural Hub"**, and **"Smart Composer"** interactive cards.
3. Hover over the cards to show the glowing micro-animations.
4. Scroll to the footer, then scroll back up.
5. Emphasize that the UI looks highly polished and professional.

### Part 2: Document Analysis [Core Feature] (0:20 - 1:00)
* **Goal:** Prove that the OCR and local AI inference works perfectly offline.
1. Click the **"Analyze"** tab at the top.
2. Drag and drop the `Test_Notice_English.pdf` into the upload box (or click to select it).
3. The UI will show a preview of the PDF with a "READY FOR PROCESSING" badge.
4. Click the orange **"Start Neural Analysis"** button.
5. **(WAIT):** The system is using the local LLaMA AI model. It might take 15-30 seconds to read the PDF and generate the response offline. Just let the loading spinner run.
6. Once it succeeds, scroll down slightly to show the Dashboard.
   - Point out the **Brain Summary** (now specifically configured to explain the document in Layman's Terms!).
   - Point out the 99.2% Confidence and detected statutes.
   - Mention the **Intelligence Note** at the bottom stating all processing was done locally and securely.

### Part 3: Neural Hub Chat (1:00 - 1:30)
* **Goal:** Show the Chatbot component.
1. Click the **"Chat"** tab.
2. Type a question like: *"What should I do if I receive a legal notice for a cheque bounce?"*
3. Click send. Wait for the local AI to process and respond with a helpful legal answer.
4. Show the clean chat bubble UI comparing the "Legal Inquirer" vs "Neural Counsel".

### Part 4: Smart Composer (1:30 - 2:00)
* **Goal:** Show the Drafting UI.
1. Click the **"Draft"** tab.
2. In the "Legal Document Excerpt", type something brief like: *"Notice of unpaid dues amounting to Rs 50,000."*
3. In "Your Situation", type: *"I already paid this amount last week via bank transfer."*
4. Click **"Generate Neural Draft"**.
5. Wait for the AI to output a professional legal response letter in the dark output console perfectly formatted.

## Best Practices
- Keep your mouse movements smooth.
- Do not resize the browser window frantically during recording. 
- If the AI takes 30 seconds to respond due to running purely offline on your CPU/GPU, **mention that out loud!** Say *"Because this handles sensitive legal data, you can see the AI is running entirely locally and offline on this machine."* This turns a loading spinner into a massive security selling-point for the prototype!
