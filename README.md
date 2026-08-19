# Civic Action Engine

Civic Action Engine is a complete working prototype built for the OOSC 4.0 Hackathon (AI for Civic & Legal Empowerment). It helps citizens turn confusing civic and legal problems into clear, source-grounded actions—from understanding rights and checking scheme eligibility to drafting RTIs and completing forms.

---

## 🚀 Key Capability Pillars

1. **Rights Navigator**: Explains what a citizen may do about tenant, consumer, or workplace disputes, fully grounded in legal/civic source material.
2. **Scheme Eligibility Reader**: Collects details to evaluate scholarship or welfare scheme eligibility and maps them to criteria.
3. **RTI Drafting Agent**: Formulates clear Right to Information requests from plain-language user descriptions.
4. **Conversational Form-Filler**: Guides users step-by-step to populate complex applications with simple questions.

---

## 🛠️ Technology Stack & Architecture

- **Frontend**: React + Vite + Tailwind CSS + React Router
- **Backend**: Node.js + Express (API Routing & Orchestration)
- **AI Engine**: Gemini 1.5 Flash API with local **Demo Mode** fallback
- **Database**: Local JSON File Database for 100% hackathon reliability

---

## 💻 Getting Started

### Prerequisites

You need **Node.js (v18+)** and **npm** installed on your system. 

*(Note: During development on systems without Node globally installed, the portable Node.js binaries under `C:\Users\Sampreeth\node-portable` can be utilized).*

### Installation & Setup

1. **Scaffold Dependencies**:
   ```bash
   # In frontend directory
   cd frontend
   npm install

   # In backend directory
   cd ../backend
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env` in the root (or `backend/` directory) and add your `GEMINI_API_KEY`:
   ```env
   PORT=5000
   NODE_ENV=development
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Running the Application**:
   - **Backend**:
     ```bash
     cd backend
     npm run dev
     ```
   - **Frontend**:
     ```bash
     cd frontend
     npm run dev
     ```

---

## 🛡️ Trust & Safety Disclaimer
This engine is a civic navigating assistant and does **not** provide legal advice, nor does it replace professional legal representation or official government determinations.
