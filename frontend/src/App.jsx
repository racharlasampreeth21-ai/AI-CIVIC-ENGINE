import React, { useState, useEffect } from 'react';
import { 
  Scale, Search, FileText, CheckCircle2, ListTodo, Compass, 
  HelpCircle, Send, ArrowRight, ChevronRight, Download, Copy, 
  Plus, AlertTriangle, FileSpreadsheet, History, Sparkles, 
  ExternalLink, Lock, RefreshCw, ArrowLeft, Check, ShieldAlert, Edit2, Info
} from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function App() {
  // Navigation State: 'landing' | 'dashboard'
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [activeModule, setActiveModule] = useState('intake'); // 'intake' | 'rights' | 'scheme' | 'rti' | 'form' | 'clarification'
  
  // App-wide Status Info
  const [appStatus, setAppStatus] = useState({ hasKey: false, checked: false });
  const [copiedText, setCopiedText] = useState(false);

  // Unified Intake State
  const [intakeInput, setIntakeInput] = useState('');
  const [intakeLoading, setIntakeLoading] = useState(false);
  const [intakeError, setIntakeError] = useState('');

  // Rights Navigator State
  const [rightsInput, setRightsInput] = useState('');
  const [rightsLoading, setRightsLoading] = useState(false);
  const [rightsResult, setRightsResult] = useState(null); // Can be a standard session or fallback session
  const [rightsError, setRightsError] = useState('');

  // Clarification Wizard State
  const [clarificationTarget, setClarificationTarget] = useState(null); 
  // { category, originalQuery, module, step, answers: {} }

  // Scheme Eligibility State
  const [schemeProfile, setSchemeProfile] = useState({
    category: 'OBC',
    annualIncome: '',
    currentClass: '11',
    previousMarks: ''
  });
  const [schemeStep, setSchemeStep] = useState(0); 
  const [schemeLoading, setSchemeLoading] = useState(false);
  const [schemeResult, setSchemeResult] = useState(null);
  const [schemeError, setSchemeError] = useState('');

  // RTI State
  const [rtiInput, setRtiInput] = useState('');
  const [rtiLoading, setRtiLoading] = useState(false);
  const [rtiResult, setRtiResult] = useState(null);
  const [rtiError, setRtiError] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [applicantAddress, setApplicantAddress] = useState('');

  // Form Filler State
  const [formSessionId, setFormSessionId] = useState(null);
  const [formStatus, setFormStatus] = useState('IDLE'); 
  const [formCurrentField, setFormCurrentField] = useState(null);
  const [formAnswers, setFormAnswers] = useState({});
  const [formInput, setFormInput] = useState('');
  const [formProgress, setFormProgress] = useState(0);
  const [formSummary, setFormSummary] = useState([]);
  const [formDraftText, setFormDraftText] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Field Inline Edit Overlay State
  const [editingField, setEditingField] = useState(null); 
  const [editInputValue, setEditInputValue] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Session history
  const [sessionHistory, setSessionHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setAppStatus({ hasKey: data.hasKey, checked: true });
      })
      .catch(err => {
        console.error('Error checking server health:', err);
        setAppStatus({ hasKey: false, checked: true });
      });
    loadSessionHistory();
  }, []);

  const loadSessionHistory = () => {
    setHistoryLoading(true);
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        setSessionHistory(data);
        setHistoryLoading(false);
      })
      .catch(err => {
        console.error('Error fetching sessions:', err);
        setHistoryLoading(false);
      });
  };

  const deleteSession = (id) => {
    fetch(`/api/sessions/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        loadSessionHistory();
      })
      .catch(err => console.error('Error deleting session:', err));
  };

  const triggerCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const downloadAsPdf = (title, content, filename) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      doc.setLineWidth(0.5);
      doc.rect(10, 10, 190, 277);
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(190, 80, 80);
      doc.text("DRAFT - CIVIC ACTION ENGINE PROTOTYPE - REVIEW BEFORE SUBMISSION", 15, 17);
      
      doc.setFontSize(14);
      doc.setTextColor(20, 30, 90);
      doc.text(title.toUpperCase(), 15, 27);
      
      doc.line(15, 31, 195, 31);
      
      doc.setFont('Courier', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      
      const splitText = doc.splitTextToSize(content, 178);
      let y = 40;
      
      splitText.forEach(line => {
        if (y > 270) {
          doc.addPage();
          doc.setLineWidth(0.5);
          doc.rect(10, 10, 190, 277);
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(190, 80, 80);
          doc.text("DRAFT - CIVIC ACTION ENGINE PROTOTYPE - REVIEW BEFORE SUBMISSION", 15, 17);
          doc.setFont('Courier', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(60, 60, 60);
          y = 25;
        }
        doc.text(line, 15, y);
        y += 5;
      });
      
      doc.save(filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Could not compile PDF locally.');
    }
  };

  // 1. Unified Router execution
  const handleIntakeSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!intakeInput.trim()) return;

    setIntakeLoading(true);
    setIntakeError('');

    try {
      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: intakeInput })
      });
      const data = await res.json();
      
      setIntakeLoading(false);

      // Check if clarification is needed (e.g. Police/Wage categories)
      if (data.needsClarification) {
        setClarificationTarget({
          category: data.category,
          originalQuery: intakeInput,
          module: data.module,
          step: 1,
          answers: {}
        });
        setActiveModule('clarification');
        return;
      }
      
      if (data.module === 'RIGHTS_NAVIGATOR') {
        setActiveModule('rights');
        setRightsInput(intakeInput);
        executeRightsAnalysis(intakeInput);
      } else if (data.module === 'SCHEME_ELIGIBILITY') {
        setActiveModule('scheme');
        setSchemeStep(1);
      } else if (data.module === 'RTI_DRAFTING') {
        setActiveModule('rti');
        setRtiInput(intakeInput);
        executeRtiDrafting(intakeInput);
      } else if (data.module === 'FORM_FILLER') {
        setActiveModule('form');
        startFormSession();
      } else {
        setActiveModule('rights');
        setRightsInput(intakeInput);
        executeRightsAnalysis(intakeInput);
      }
    } catch (err) {
      console.error(err);
      setIntakeLoading(false);
      setIntakeError('Failed to contact the backend route classifier.');
    }
  };

  // 2. Rights Navigator execution
  const executeRightsAnalysis = async (inputText) => {
    const textToAnalyze = inputText || rightsInput;
    if (!textToAnalyze.trim()) return;

    setRightsLoading(true);
    setRightsError('');
    setRightsResult(null);

    try {
      const res = await fetch('/api/rights/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToAnalyze })
      });
      const data = await res.json();
      
      // Save full session payload (which contains status: 'UNSUPPORTED_FALLBACK' or standard response)
      setRightsResult(data);
      setRightsLoading(false);
      loadSessionHistory();
    } catch (err) {
      console.error(err);
      setRightsLoading(false);
      setRightsError('Error analyzing rights details.');
    }
  };

  // 3. Scheme Eligibility execution
  const executeSchemeEligibility = async () => {
    setSchemeLoading(true);
    setSchemeError('');

    try {
      const res = await fetch('/api/schemes/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: schemeProfile })
      });
      const data = await res.json();
      setSchemeResult(data.response);
      setSchemeLoading(false);
      setSchemeStep(5);
      loadSessionHistory();
    } catch (err) {
      console.error(err);
      setSchemeLoading(false);
      setSchemeError('Error checking scheme eligibility.');
    }
  };

  // 4. RTI Drafting execution
  const executeRtiDrafting = async (inputText) => {
    const textToDraft = inputText || rtiInput;
    if (!textToDraft.trim()) return;

    setRtiLoading(true);
    setRtiError('');
    setRtiResult(null);

    try {
      const res = await fetch('/api/rti/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToDraft,
          applicantName,
          applicantAddress
        })
      });
      const data = await res.json();
      setRtiResult(data.response);
      setRtiLoading(false);
      loadSessionHistory();
    } catch (err) {
      console.error(err);
      setRtiLoading(false);
      setRtiError('Error generating the RTI draft.');
    }
  };

  // 5. Conversational Form Filler execution
  const startFormSession = async () => {
    setFormLoading(true);
    setFormError('');
    setFormStatus('IN_PROGRESS');
    setFormAnswers({});
    setFormInput('');

    try {
      const res = await fetch('/api/forms/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: 'form-income-01' })
      });
      const data = await res.json();
      setFormSessionId(data.sessionId);
      setFormCurrentField(data.currentField);
      setFormProgress(data.progressPercent);
      setFormSummary([]);
      setFormLoading(false);
    } catch (err) {
      console.error(err);
      setFormLoading(false);
      setFormError('Failed to initialize form filler session.');
      setFormStatus('IDLE');
    }
  };

  const submitFormAnswer = async (e) => {
    if (e) e.preventDefault();
    if (formInput.trim() === '' && formCurrentField.type !== 'select') return;

    setFormLoading(true);
    setFormError('');

    try {
      const res = await fetch('/api/forms/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: formSessionId,
          answer: formInput
        })
      });
      
      const data = await res.json();
      setFormLoading(false);

      if (!res.ok) {
        setFormError(data.message || 'Validation failed.');
        return;
      }

      setFormAnswers(data.answers);
      setFormInput('');
      setFormProgress(data.progressPercent);

      if (data.status === 'COMPLETED') {
        setFormStatus('COMPLETED');
        setFormSummary(data.summary);
        fetchFormFinalDraft(data.sessionId);
      } else {
        setFormCurrentField(data.currentField);
      }
    } catch (err) {
      console.error(err);
      setFormLoading(false);
      setFormError('Connection issue submitting reply.');
    }
  };

  const handleSaveCorrection = async (e) => {
    if (e) e.preventDefault();
    setEditLoading(true);
    setEditError('');

    try {
      const res = await fetch('/api/forms/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: formSessionId,
          fieldName: editingField.name,
          answer: editInputValue
        })
      });
      
      const data = await res.json();
      setEditLoading(false);

      if (!res.ok) {
        setEditError(data.message || 'Validation failed.');
        return;
      }

      setFormAnswers(data.answers);
      setFormSummary(data.summary);
      
      if (formStatus === 'COMPLETED') {
        fetchFormFinalDraft(formSessionId);
      }
      setEditingField(null);
    } catch (err) {
      console.error(err);
      setEditLoading(false);
      setEditError('Could not sync correction to server.');
    }
  };

  const fetchFormFinalDraft = async (sid) => {
    try {
      const res = await fetch('/api/forms/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid })
      });
      const data = await res.json();
      setFormDraftText(data.draftText);
      loadSessionHistory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickPrompt = (text) => {
    setIntakeInput(text);
    if (currentScreen === 'landing') {
      setCurrentScreen('dashboard');
    }
    setActiveModule('intake');
  };

  // Clarification Step Handler
  const handleClarificationChoice = (choiceText) => {
    const nextStep = clarificationTarget.step + 1;
    const key = `step${clarificationTarget.step}`;
    const newAnswers = { ...clarificationTarget.answers, [key]: choiceText };

    // Assess max steps depending on category
    let maxSteps = 1;
    if (clarificationTarget.category === 'Police / Public Authority') {
      maxSteps = 3;
    }

    if (clarificationTarget.step >= maxSteps) {
      // Compile final text and route
      let refinedQuery = clarificationTarget.originalQuery;
      if (clarificationTarget.category === 'Police / Public Authority') {
        refinedQuery = `${clarificationTarget.originalQuery} (Incident Type: ${newAnswers.step1}, Location: ${newAnswers.step2}, Evidence Available: ${newAnswers.step3})`;
      } else {
        refinedQuery = `${clarificationTarget.originalQuery} (Issue details: ${newAnswers.step1})`;
      }

      setActiveModule('rights');
      setRightsInput(refinedQuery);
      executeRightsAnalysis(refinedQuery);
      setClarificationTarget(null);
    } else {
      setClarificationTarget({
        ...clarificationTarget,
        step: nextStep,
        answers: newAnswers
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* GLOBAL HEADER BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button 
            onClick={() => { setCurrentScreen('landing'); setActiveModule('intake'); }} 
            className="flex items-center space-x-2 text-indigo-900 hover:opacity-90 font-bold text-xl transition-all"
          >
            <Scale className="h-6 w-6 text-teal-650" />
            <span className="tracking-tight text-slate-800">Civic Action Engine</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              appStatus.hasKey ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                appStatus.hasKey ? 'bg-emerald-500' : 'bg-amber-500'
              }`}></span>
              {appStatus.hasKey ? 'Live AI Mode' : 'Demo Mode (Local Grounding)'}
            </span>
            
            {currentScreen === 'landing' ? (
              <button 
                onClick={() => setCurrentScreen('dashboard')} 
                className="bg-indigo-900 hover:bg-opacity-95 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-xs flex items-center space-x-1 transition-all"
              >
                <span>Launch Engine</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button 
                onClick={() => { setCurrentScreen('landing'); }}
                className="text-slate-655 hover:text-slate-900 text-sm font-semibold flex items-center space-x-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Home Page</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================
          LANDING SCREEN
          ======================================================== */}
      {currentScreen === 'landing' && (
        <main className="flex-1">
          {/* HERO */}
          <section className="bg-linear-to-b from-white to-slate-50 border-b border-slate-200 py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
                From confusing civic problems to <br />
                <span className="text-teal-650">clear, source-grounded next steps.</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
                Describe your civic problem or dispute in natural language, and we will identify the best supported path—grounded exclusively in verified official resources.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                <button 
                  onClick={() => { setCurrentScreen('dashboard'); setActiveModule('intake'); }}
                  className="w-full sm:w-auto bg-indigo-900 hover:bg-opacity-95 text-white px-8 py-4 rounded-lg font-bold shadow-md flex items-center justify-center space-x-2 transition-all hover:-translate-y-0.5"
                >
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <span>Start a Civic Action</span>
                </button>
                <button 
                  onClick={() => {
                    const el = document.getElementById('capabilities');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-lg font-bold shadow-xs transition-all"
                >
                  Explore How it Works
                </button>
              </div>
            </div>
          </section>

          {/* FOUR CAPABILITY CARDS */}
          <section id="capabilities" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-slate-800">Four Core Capabilities</h2>
              <p className="text-slate-600 mt-4 max-w-md mx-auto">We provide action-oriented assistance modules designed around key legal and civic workflows.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full hover:border-indigo-900 transition-all">
                <div className="bg-indigo-50 p-4 rounded-xl w-fit text-indigo-900 mb-6">
                  <Compass className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Rights Navigator</h3>
                <p className="text-sm text-slate-655 flex-1 leading-relaxed">
                  Understand tenant rights, rental deposit guidelines, workplace delays, and police misconduct guidelines. Grounded in code statutes.
                </p>
                <button 
                  onClick={() => { setCurrentScreen('dashboard'); setActiveModule('rights'); }}
                  className="mt-6 text-indigo-900 hover:text-opacity-80 text-sm font-bold flex items-center space-x-1"
                >
                  <span>Explore Navigator</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full hover:border-teal-650 transition-all">
                <div className="bg-teal-50 p-4 rounded-xl w-fit text-teal-650 mb-6">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Scheme Eligibility</h3>
                <p className="text-sm text-slate-655 flex-1 leading-relaxed">
                  Check if you qualify for social schemes like PM-YASASVI. Compares age, category, grades, and income limits to flag missing items.
                </p>
                <button 
                  onClick={() => { setCurrentScreen('dashboard'); setActiveModule('scheme'); setSchemeStep(0); }}
                  className="mt-6 text-teal-650 hover:text-opacity-80 text-sm font-bold flex items-center space-x-1"
                >
                  <span>Check Eligibility</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full hover:border-amber-500 transition-all">
                <div className="bg-amber-50 p-4 rounded-xl w-fit text-amber-500 mb-6">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">RTI Drafting Agent</h3>
                <p className="text-sm text-slate-655 flex-1 leading-relaxed">
                  Generate structured drafts for RTI applications requesting municipal road budgets, public contract tenders, and general information files.
                </p>
                <button 
                  onClick={() => { setCurrentScreen('dashboard'); setActiveModule('rti'); }}
                  className="mt-6 text-amber-500 hover:text-opacity-80 text-sm font-bold flex items-center space-x-1"
                >
                  <span>Draft an RTI</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full hover:border-purple-650 transition-all">
                <div className="bg-purple-50 p-4 rounded-xl w-fit text-purple-650 mb-6">
                  <ListTodo className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Conversational Form-Filler</h3>
                <p className="text-sm text-slate-655 flex-1 leading-relaxed">
                  Bypass overwhelming application paperwork. Complete an official Income Certificate application through interactive chat validation.
                </p>
                <button 
                  onClick={() => { setCurrentScreen('dashboard'); setActiveModule('form'); startFormSession(); }}
                  className="mt-6 text-purple-650 hover:text-opacity-80 text-sm font-bold flex items-center space-x-1"
                >
                  <span>Start Form Filler</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          </section>

        </main>
      )}

      {/* ========================================================
          APPLICATION / DASHBOARD
          ======================================================== */}
      {currentScreen === 'dashboard' && (
        <div className="flex-1 flex flex-col md:flex-row">
          
          {/* SIDEBAR */}
          <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
            <div className="p-4 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Engine Modules</span>
            </div>
            
            <nav className="flex-1 p-2 space-y-1">
              <button 
                onClick={() => setActiveModule('intake')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 text-sm font-semibold transition-all ${
                  activeModule === 'intake' ? 'bg-indigo-900 text-white shadow-xs' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Search className="h-4 w-4" />
                <span>Intake Router</span>
              </button>

              <button 
                onClick={() => setActiveModule('rights')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 text-sm font-semibold transition-all ${
                  activeModule === 'rights' ? 'bg-indigo-900 text-white shadow-xs' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Compass className="h-4 w-4" />
                <span>Rights Navigator</span>
              </button>

              <button 
                onClick={() => { setActiveModule('scheme'); setSchemeStep(0); }}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 text-sm font-semibold transition-all ${
                  activeModule === 'scheme' ? 'bg-indigo-900 text-white shadow-xs' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Scheme Eligibility</span>
              </button>

              <button 
                onClick={() => setActiveModule('rti')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 text-sm font-semibold transition-all ${
                  activeModule === 'rti' ? 'bg-indigo-900 text-white shadow-xs' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>RTI Drafting Agent</span>
              </button>

              <button 
                onClick={() => { setActiveModule('form'); startFormSession(); }}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 text-sm font-semibold transition-all ${
                  activeModule === 'form' ? 'bg-indigo-900 text-white shadow-xs' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ListTodo className="h-4 w-4" />
                <span>Form-Filler</span>
              </button>
            </nav>

            {/* SESSION LOGS */}
            <div className="p-4 border-t border-slate-800 max-h-60 overflow-y-auto">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                <span className="flex items-center space-x-1">
                  <History className="h-3 w-3" />
                  <span>Session Logs</span>
                </span>
                <button onClick={loadSessionHistory} className="hover:text-slate-300">
                  <RefreshCw className="h-3 w-3" />
                </button>
              </div>

              {historyLoading ? (
                <div className="text-xs text-slate-600 py-2">Loading...</div>
              ) : sessionHistory.length === 0 ? (
                <div className="text-xs text-slate-600 py-2">No past logs</div>
              ) : (
                <div className="space-y-2">
                  {sessionHistory.slice(0, 5).map(session => (
                    <div key={session.id} className="text-xs bg-slate-850 p-2 rounded-sm border border-slate-800 group relative">
                      <div className="flex justify-between font-semibold text-slate-300">
                        <span className="truncate max-w-[120px]">{session.type.replace('_', ' ')}</span>
                        <span className="text-[10px] text-slate-505">{new Date(session.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-505 truncate mt-1">
                        {session.prompt || session.profile?.category || 'Form filling'}
                      </p>
                      <button 
                        onClick={() => deleteSession(session.id)}
                        className="absolute right-1 top-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-900 text-xs text-slate-500">
              Grounded in local government regulations.
            </div>
          </aside>

          {/* MAIN MODULE CONTENT */}
          <main className="flex-1 p-6 md:p-10 overflow-y-auto">
            
            {/* INTAKE ROUTER */}
            {activeModule === 'intake' && (
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-extrabold text-slate-805 tracking-tight">HOW CAN WE HELP?</h2>
                  <p className="text-sm text-slate-600 mt-2">
                    Describe your civic problem or what you're trying to accomplish in natural language.
                  </p>
                </div>

                <form onSubmit={handleIntakeSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <textarea 
                      value={intakeInput}
                      onChange={(e) => setIntakeInput(e.target.value)}
                      placeholder="Type your situation here (e.g. My landlord refuses to return my security deposit, or Police used excessive force...)"
                      rows={4}
                      className="w-full p-4 border border-slate-300 rounded-lg text-sm focus:ring-indigo-900 focus:border-indigo-900 shadow-inner resize-none"
                    ></textarea>
                  </div>

                  {intakeError && (
                    <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200">
                      {intakeError}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-505">Answers are mapped to verified taxonomy sources.</span>
                    <button 
                      type="submit" 
                      disabled={intakeLoading || !intakeInput.trim()}
                      className="bg-indigo-900 hover:bg-opacity-95 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-xs flex items-center space-x-2 transition-all disabled:opacity-50"
                    >
                      {intakeLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Routing...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* CLICKABLE EXEMPLARS */}
                <div className="mt-8">
                  <h4 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Example Citizen Situations</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    <button 
                      onClick={() => handleQuickPrompt("Police used excessive force during an incident.")}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 text-left hover:border-indigo-900 transition-all hover:bg-slate-50/50"
                    >
                      <span className="font-bold text-[10px] text-slate-400 block mb-1">POLICE MISCONDUCT</span>
                      <p className="text-xs font-semibold text-slate-700">"Police used excessive force during an incident."</p>
                    </button>

                    <button 
                      onClick={() => handleQuickPrompt("My employer hasn't paid my salary.")}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 text-left hover:border-indigo-900 transition-all hover:bg-slate-50/50"
                    >
                      <span className="font-bold text-[10px] text-slate-400 block mb-1">EMPLOYEE GRIEVANCE</span>
                      <p className="text-xs font-semibold text-slate-700">"My employer hasn't paid my salary."</p>
                    </button>

                    <button 
                      onClick={() => handleQuickPrompt("My landlord hasn't returned my deposit.")}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 text-left hover:border-indigo-900 transition-all hover:bg-slate-50/50"
                    >
                      <span className="font-bold text-[10px] text-slate-400 block mb-1">TENANT DISPUTE</span>
                      <p className="text-xs font-semibold text-slate-700">"My landlord hasn't returned my deposit."</p>
                    </button>

                    <button 
                      onClick={() => handleQuickPrompt("I bought a phone online and the seller refuses to refund me.")}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 text-left hover:border-indigo-900 transition-all hover:bg-slate-50/50"
                    >
                      <span className="font-bold text-[10px] text-slate-400 block mb-1">CONSUMER COMPLAINT</span>
                      <p className="text-xs font-semibold text-slate-700">"Seller refuses to refund my defective phone."</p>
                    </button>

                    <button 
                      onClick={() => handleQuickPrompt("Garbage has not been collected in my area.")}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 text-left hover:border-indigo-900 transition-all hover:bg-slate-50/50"
                    >
                      <span className="font-bold text-[10px] text-slate-400 block mb-1">CIVIC SANITATION</span>
                      <p className="text-xs font-semibold text-slate-700">"Garbage has not been collected in my area."</p>
                    </button>

                    <button 
                      onClick={() => handleQuickPrompt("I want to know how much was spent on road construction.")}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 text-left hover:border-indigo-900 transition-all hover:bg-slate-50/50"
                    >
                      <span className="font-bold text-[10px] text-slate-400 block mb-1">RTI INFORMATION</span>
                      <p className="text-xs font-semibold text-slate-700">"Check municipal funds spent on road repair."</p>
                    </button>

                    <button 
                      onClick={() => handleQuickPrompt("Can I qualify for a supported government scholarship?")}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 text-left hover:border-indigo-900 transition-all hover:bg-slate-50/50"
                    >
                      <span className="font-bold text-[10px] text-slate-400 block mb-1">WELFARE SCHEME</span>
                      <p className="text-xs font-semibold text-slate-700">"Can I qualify for scholarship schemes?"</p>
                    </button>

                    <button 
                      onClick={() => handleQuickPrompt("I need help completing an application form.")}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 text-left hover:border-indigo-900 transition-all hover:bg-slate-50/50"
                    >
                      <span className="font-bold text-[10px] text-slate-400 block mb-1">FORM ASSISTANCE</span>
                      <p className="text-xs font-semibold text-slate-700">"Complete application for Income Certificate."</p>
                    </button>

                  </div>
                </div>

                {/* DIRECT WORKFLOW PATHS */}
                <div className="mt-8 border-t border-slate-200 pt-6">
                  <h4 className="text-xs font-bold text-slate-505 mb-4 text-center uppercase tracking-wider">Or Choose a Structured Path</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button 
                      onClick={() => { setActiveModule('rights'); setRightsInput(''); setRightsResult(null); }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-3 rounded-lg text-xs font-bold transition-all text-center flex flex-col items-center gap-1.5"
                    >
                      <Compass className="h-4 w-4 text-indigo-900" />
                      <span>Rights</span>
                    </button>
                    <button 
                      onClick={() => { setActiveModule('scheme'); setSchemeStep(0); setSchemeResult(null); }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-3 rounded-lg text-xs font-bold transition-all text-center flex flex-col items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4 text-teal-650" />
                      <span>Schemes</span>
                    </button>
                    <button 
                      onClick={() => { setActiveModule('rti'); setRtiInput(''); setRtiResult(null); }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-3 rounded-lg text-xs font-bold transition-all text-center flex flex-col items-center gap-1.5"
                    >
                      <FileText className="h-4 w-4 text-amber-500" />
                      <span>RTI Draft</span>
                    </button>
                    <button 
                      onClick={() => { setActiveModule('form'); startFormSession(); }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-3 rounded-lg text-xs font-bold transition-all text-center flex flex-col items-center gap-1.5"
                    >
                      <ListTodo className="h-4 w-4 text-purple-650" />
                      <span>Forms</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* REUSABLE CLARIFICATION ENGINE */}
            {activeModule === 'clarification' && clarificationTarget && (
              <div className="max-w-xl mx-auto bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                <div className="bg-slate-900 text-white p-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Clarification Engine</span>
                  <h3 className="text-md font-bold leading-normal">
                    We detected your situation relates to: <span className="text-teal-400 font-extrabold">{clarificationTarget.category}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 italic">
                    "Original Query: {clarificationTarget.originalQuery}"
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  
                  {/* Police Misconduct Wizard (3 Steps) */}
                  {clarificationTarget.category === 'Police / Public Authority' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                        <span>Step {clarificationTarget.step} of 3</span>
                        <span>{Math.round((clarificationTarget.step / 3) * 100)}% Complete</span>
                      </div>

                      {clarificationTarget.step === 1 && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-slate-700">What specific action occurred during the incident?</h4>
                          <div className="flex flex-col gap-2">
                            {["Excessive physical force", "Threat / intimidation", "Detention / arrest", "Property damage", "Other"].map(opt => (
                              <button 
                                key={opt}
                                onClick={() => handleClarificationChoice(opt)}
                                className="w-full text-left p-3 rounded-lg border border-slate-250 hover:border-indigo-900 hover:bg-slate-50 text-xs font-semibold transition-all"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {clarificationTarget.step === 2 && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-slate-700">Where did this incident occur?</h4>
                          <div className="flex flex-col gap-2">
                            {["Inside a police station", "During arrest / transfer", "Public street or open place", "Other location"].map(opt => (
                              <button 
                                key={opt}
                                onClick={() => handleClarificationChoice(opt)}
                                className="w-full text-left p-3 rounded-lg border border-slate-250 hover:border-indigo-900 hover:bg-slate-50 text-xs font-semibold transition-all"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {clarificationTarget.step === 3 && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-slate-700">Do you have physical documentation, photos, or medical receipts?</h4>
                          <div className="flex flex-col gap-2">
                            {["Yes, physical medical/video evidence", "No, only personal witness testimony", "Not sure what to collect"].map(opt => (
                              <button 
                                key={opt}
                                onClick={() => handleClarificationChoice(opt)}
                                className="w-full text-left p-3 rounded-lg border border-slate-250 hover:border-indigo-900 hover:bg-slate-50 text-xs font-semibold transition-all"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Employment/Wage dispute (1 Step) */}
                  {clarificationTarget.category === 'Employment / Wage' && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-700">What is the core workplace dispute?</h4>
                      <div className="flex flex-col gap-2">
                        {["Unpaid wages / salary delay", "Arbitrary termination", "Workplace harassment", "Unsafe working conditions", "Other dispute"].map(opt => (
                          <button 
                            key={opt}
                            onClick={() => handleClarificationChoice(opt)}
                            className="w-full text-left p-3 rounded-lg border border-slate-255 hover:border-indigo-900 hover:bg-slate-50 text-xs font-semibold transition-all"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* General fallback clarification */}
                  {clarificationTarget.category !== 'Police / Public Authority' && clarificationTarget.category !== 'Employment / Wage' && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-700">Could you select the closest sub-topic for your dispute?</h4>
                      <div className="flex flex-col gap-2">
                        {["General service delay", "Billing / financial discrepancy", "Unfair treatment / denial of service", "Other specific matter"].map(opt => (
                          <button 
                            key={opt}
                            onClick={() => handleClarificationChoice(opt)}
                            className="w-full text-left p-3 rounded-lg border border-slate-250 hover:border-indigo-900 hover:bg-slate-50 text-xs font-semibold transition-all"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* RIGHTS NAVIGATOR CONTAINER */}
            {activeModule === 'rights' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Inputs & Analysis */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Compass className="h-6 w-6 text-indigo-900" />
                    <h2 className="text-xl font-bold text-slate-800">Rights Navigator Workspace</h2>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Explain the problem or dispute in detail:</label>
                      <textarea 
                        value={rightsInput}
                        onChange={(e) => setRightsInput(e.target.value)}
                        placeholder="Detail your housing landlord, workplace wages, sanitation, road, or consumer dispute..."
                        rows={4}
                        className="w-full p-4 border border-slate-300 rounded-lg text-sm focus:ring-indigo-900 focus:border-indigo-900"
                      ></textarea>
                    </div>
                    {rightsError && (
                      <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200">
                        {rightsError}
                      </div>
                    )}
                    <div className="flex justify-end">
                      <button 
                        onClick={() => executeRightsAnalysis(rightsInput)}
                        disabled={rightsLoading || !rightsInput.trim()}
                        className="bg-indigo-900 hover:bg-opacity-95 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-xs flex items-center space-x-2 transition-all disabled:opacity-50"
                      >
                        {rightsLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <span>Retrieve & Analyze</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {rightsResult && (
                    <div className="space-y-6">
                      
                      {/* DETECTED UNSUPPORTED / SAFE FALLBACK SCREEN (Section 9) */}
                      {rightsResult.status === 'UNSUPPORTED_FALLBACK' ? (
                        <div className="space-y-6">
                          
                          {/* We understand card */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest block mb-1">
                              ⚠️ WE UNDERSTAND
                            </span>
                            <p className="text-sm font-bold text-slate-800 leading-relaxed">
                              Your message appears to concern: <span className="text-indigo-900 font-black">{rightsResult.category}</span>.
                            </p>
                          </div>

                          {/* Help checklist & Not verify */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">WHAT WE CAN HELP WITH</h4>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {rightsResult.response.whatWeCanHelpWith}
                              </p>
                            </div>

                            <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 shadow-xs">
                              <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">WHAT WE CANNOT VERIFY YET</h4>
                              <p className="text-xs text-red-800 leading-relaxed font-semibold">
                                {rightsResult.response.whatWeCannotVerifyYet}
                              </p>
                            </div>
                          </div>

                          {/* What would help bullet checklist */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-250 shadow-xs">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">WHAT WOULD HELP US RESEARCH</h4>
                            <ul className="space-y-3">
                              {rightsResult.response.whatWouldHelp.map((bullet, idx) => (
                                <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700 font-semibold">
                                  <span className="h-4 w-4 rounded-full bg-slate-100 text-slate-655 flex items-center justify-center font-bold text-[10px] mt-0.5">•</span>
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Fallback Warning */}
                          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl flex items-start space-x-3">
                            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs leading-relaxed">{rightsResult.response.disclaimer}</p>
                          </div>

                        </div>
                      ) : (
                        // STANDARD GRANTED RIGHTS DETAILS
                        <>
                          {/* 1. What we understand */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest block mb-1">1. WHAT WE UNDERSTAND</span>
                            <p className="text-sm font-bold text-slate-800 leading-relaxed">{rightsResult.response.whatWeUnderstand}</p>
                          </div>

                          {/* 2. Information that may apply */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest block mb-2">2. INFORMATION THAT MAY APPLY</span>
                            <p className="text-sm text-slate-750 leading-relaxed">{rightsResult.response.informationThatMayApply}</p>
                          </div>

                          {/* 3. Why */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest block mb-2">3. WHY (REASONING & LEGAL GROUNDING)</span>
                            <p className="text-sm text-slate-750 leading-relaxed">{rightsResult.response.why}</p>
                          </div>

                          {/* 4. What you may do next */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest block mb-4">4. WHAT YOU MAY DO NEXT (ACTION PLAN)</span>
                            <ul className="space-y-3">
                              {rightsResult.response.whatYouMayDoNext.map((step, idx) => (
                                <li key={idx} className="flex items-start space-x-3 text-sm text-slate-750">
                                  <span className="h-5 w-5 rounded-full bg-indigo-50 border border-slate-350 text-indigo-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">{idx + 1}</span>
                                  <span className="leading-relaxed">{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* 5. Documents that may help */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest block mb-4">5. DOCUMENTS / EVIDENCE THAT MAY HELP</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {rightsResult.response.documentsEvidenceThatMayHelp.map((doc, idx) => (
                                <div key={idx} className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                  <input type="checkbox" className="h-4 w-4 rounded-sm border-slate-300 text-teal-650 focus:ring-teal-650" />
                                  <span className="text-xs text-slate-700 font-medium">{doc}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 6. Limitations */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest block mb-2">6. IMPORTANT LIMITATIONS & UNCERTAINTIES</span>
                            <p className="text-xs text-slate-655 leading-relaxed italic">{rightsResult.response.importantLimitations}</p>
                          </div>

                          {/* Safety Disclaimer */}
                          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl flex items-start space-x-3">
                            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs leading-relaxed">{rightsResult.response.disclaimer}</p>
                          </div>
                        </>
                      )}

                    </div>
                  )}

                </div>

                {/* Grounding Source panel */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Supporting Sources</h3>
                    
                    {rightsResult && rightsResult.status === 'UNSUPPORTED_FALLBACK' ? (
                      <div className="text-center py-8">
                        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                        <h4 className="text-xs font-bold text-slate-750">Fallback Mode Active</h4>
                        <p className="text-[10px] text-slate-400 mt-1">No verified official source documents matched this query in our local database index.</p>
                      </div>
                    ) : (
                      <>
                        <div className="text-[10px] bg-slate-100 p-2 rounded-sm mb-4 border border-slate-200 text-slate-600 flex justify-between">
                          <span>Source Check Type: Local Knowledge Base</span>
                          <span className="font-bold text-teal-650">GROUNDED</span>
                        </div>

                        {rightsResult && rightsResult.response.sources && rightsResult.response.sources.length > 0 ? (
                          <div className="space-y-4">
                            {rightsResult.response.sources.map((src, idx) => (
                              <div key={idx} className="border border-slate-200 p-4 rounded-xl space-y-2 hover:border-slate-300 transition-all bg-slate-50/50">
                                <span className="bg-teal-50 text-teal-650 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-teal-100">{src.category}</span>
                                <h4 className="text-xs font-bold text-slate-850 leading-snug">{src.title}</h4>
                                
                                <blockquote className="border-l-2 border-slate-350 pl-3 my-2 text-[11px] text-slate-600 leading-relaxed italic">
                                  "{src.content}"
                                </blockquote>

                                <div className="border-t border-slate-100 pt-2 mt-2 flex justify-between items-center text-[10px] text-slate-400">
                                  <span className="truncate max-w-[150px]">Authority: {src.authority}</span>
                                  <a href={src.source_url || src.sourceUrl} target="_blank" rel="noreferrer" className="text-teal-650 hover:underline flex items-center space-x-0.5">
                                    <span>View Portal</span>
                                    <ExternalLink className="h-2.5 w-2.5" />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 italic text-center py-10 border border-dashed border-slate-200 rounded-xl">
                            No sources loaded yet. Perform analysis to search sources.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* SCHEME ELIGIBILITY WIZARD */}
            {activeModule === 'scheme' && (
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-teal-650" />
                  <h2 className="text-xl font-bold text-slate-800">Scheme Eligibility Checker</h2>
                </div>

                {schemeStep === 0 && (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-center">
                    <h3 className="text-lg font-bold text-slate-800">Evaluate: PM Yashasvi Post-Matric Scholarship Scheme</h3>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                      Determine whether you satisfy the criteria for OBC, EBC, and DNT financial student assistance. The evaluation takes less than 2 minutes.
                    </p>
                    <button 
                      onClick={() => setSchemeStep(1)}
                      className="bg-teal-650 hover:bg-opacity-95 text-white px-8 py-3 rounded-lg font-bold text-sm shadow-xs transition-all inline-flex items-center space-x-2"
                    >
                      <span>Begin Assessment</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {schemeStep === 1 && (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                    <div className="flex justify-between items-center text-xs text-slate-405">
                      <span>QUESTION 1 OF 4</span>
                      <span>25% COMPLETE</span>
                    </div>
                    <h3 className="text-md font-bold text-slate-805">What is your social caste category?</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {['OBC (Other Backward Class)', 'EBC (Economically Backward Class)', 'DNT (De-Notified Tribe)', 'General / Scheduled Caste / Other'].map((cat) => (
                        <button 
                          key={cat}
                          onClick={() => {
                            const cleanCat = cat.split(' ')[0];
                            setSchemeProfile({ ...schemeProfile, category: cleanCat });
                            setSchemeStep(2);
                          }}
                          className={`p-4 rounded-xl border text-left text-sm font-semibold transition-all hover:bg-slate-50 ${
                            schemeProfile.category === cat.split(' ')[0] ? 'border-teal-650 bg-teal-50/50' : 'border-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {schemeStep === 2 && (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                    <div className="flex justify-between items-center text-xs text-slate-405">
                      <span>QUESTION 2 OF 4</span>
                      <span>50% COMPLETE</span>
                    </div>
                    <h3 className="text-md font-bold text-slate-805">What is your parents' or guardians' combined annual income?</h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-slate-400 text-sm font-semibold">INR</span>
                        <input 
                          type="number"
                          value={schemeProfile.annualIncome}
                          onChange={(e) => setSchemeProfile({ ...schemeProfile, annualIncome: e.target.value })}
                          placeholder="e.g. 150000"
                          className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-teal-655 focus:border-teal-655 text-sm"
                        />
                      </div>
                      <div className="flex justify-between">
                        <button onClick={() => setSchemeStep(1)} className="text-slate-400 text-sm font-semibold hover:text-slate-600">Back</button>
                        <button 
                          onClick={() => setSchemeStep(3)} 
                          className="bg-teal-650 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-xs"
                        >
                          Next Step (or skip to evaluate missing)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {schemeStep === 3 && (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                    <div className="flex justify-between items-center text-xs text-slate-405">
                      <span>QUESTION 3 OF 4</span>
                      <span>75% COMPLETE</span>
                    </div>
                    <h3 className="text-md font-bold text-slate-805">What class level are you currently studying in?</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {['11', '12', '9', '10', 'College / Higher'].map((cls) => (
                        <button 
                          key={cls}
                          onClick={() => {
                            setSchemeProfile({ ...schemeProfile, currentClass: cls });
                            setSchemeStep(4);
                          }}
                          className={`p-4 rounded-xl border text-left text-sm font-semibold transition-all hover:bg-slate-50 ${
                            schemeProfile.currentClass === cls ? 'border-teal-650 bg-teal-50/50' : 'border-slate-200'
                          }`}
                        >
                          Class {cls}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setSchemeStep(2)} className="text-slate-400 text-sm font-semibold hover:text-slate-600">Back</button>
                  </div>
                )}

                {schemeStep === 4 && (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                    <div className="flex justify-between items-center text-xs text-slate-405">
                      <span>QUESTION 4 OF 4</span>
                      <span>95% COMPLETE</span>
                    </div>
                    <h3 className="text-md font-bold text-slate-805">What was your overall percentage score in the previous academic year?</h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <input 
                          type="number"
                          value={schemeProfile.previousMarks}
                          onChange={(e) => setSchemeProfile({ ...schemeProfile, previousMarks: e.target.value })}
                          placeholder="e.g. 78 (leave blank to check missing info response)"
                          max={100}
                          min={0}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-teal-650 focus:border-teal-655 text-sm"
                        />
                        <span className="absolute right-4 top-3.5 text-slate-400 text-sm font-semibold">%</span>
                      </div>
                      
                      {schemeError && (
                        <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200">
                          {schemeError}
                        </div>
                      )}

                      <div className="flex justify-between">
                        <button onClick={() => setSchemeStep(3)} className="text-slate-400 text-sm font-semibold hover:text-slate-600">Back</button>
                        <button 
                          onClick={executeSchemeEligibility} 
                          disabled={schemeLoading}
                          className="bg-teal-650 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-xs flex items-center space-x-1"
                        >
                          {schemeLoading ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              <span>Evaluating...</span>
                            </>
                          ) : (
                            <>
                              <span>Analyze Eligibility</span>
                              <ChevronRight className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {schemeStep === 5 && schemeResult && (
                  <div className="space-y-6">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
                      <span className="text-[10px] font-bold text-slate-405 uppercase tracking-widest block">ELIGIBILITY ASSESSMENT REPORT</span>
                      
                      <div className="flex flex-col items-center">
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center font-bold text-white mb-2 text-xl ${
                          schemeResult.status === 'LIKELY ELIGIBLE' ? 'bg-emerald-600' :
                          schemeResult.status === 'INSUFFICIENT INFORMATION' ? 'bg-amber-500' : 'bg-red-500'
                        }`}>
                          {schemeResult.status === 'LIKELY ELIGIBLE' ? '✓' :
                           schemeResult.status === 'INSUFFICIENT INFORMATION' ? '?' : '✗'}
                        </div>
                        <h2 className={`text-2xl font-black ${
                          schemeResult.status === 'LIKELY ELIGIBLE' ? 'text-emerald-700' :
                          schemeResult.status === 'INSUFFICIENT INFORMATION' ? 'text-amber-600' : 'text-red-700'
                        }`}>
                          {schemeResult.status}
                        </h2>
                      </div>
                      
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed border-t border-slate-100 pt-3">
                        This is an informational assessment generated by parsing database records. Final award requires official vetting via scholarships.gov.in.
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Criterion-by-Criterion Evaluation</h4>
                      <div className="space-y-3">
                        {Object.entries(schemeResult.evaluation).map(([key, item]) => (
                          <div key={key} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <div>
                              <span className="text-xs font-bold text-slate-805 block">{item.label}</span>
                              <span className="text-[11px] text-slate-500 mt-1 block">{item.details}</span>
                            </div>
                            <span className={`inline-flex px-3 py-1 text-[11px] font-bold rounded-sm ${
                              item.satisfied === true ? 'bg-emerald-100 text-emerald-800' :
                              item.satisfied === null ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.satisfied === true ? '✓ SATISFIED' :
                               item.satisfied === null ? '? MISSING' : '✗ NOT SATISFIED'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Evidentiary Documents Needed</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {schemeResult.requiredDocuments.map((doc, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 p-3 rounded-lg">
                            <span className="h-2 w-2 rounded-full bg-teal-650 shrink-0"></span>
                            <span>{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recommended Next Step</h4>
                      <p className="text-sm text-slate-700 leading-relaxed font-semibold">
                        {schemeResult.status === 'LIKELY ELIGIBLE' 
                          ? "Compile all required documents (specifically caste/marks certificate) and proceed to register on the NSP Portal." 
                          : "Verify details and correct missing parameters or explore other scholarship schemes matching General/other social criteria."}
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block">SOURCE OFFICIAL</span>
                        <h4 className="text-xs font-bold text-slate-700">{schemeResult.source.title}</h4>
                        <span className="text-[10px] text-slate-500">{schemeResult.source.authority}</span>
                      </div>
                      <a href={schemeResult.source.source_url} target="_blank" rel="noreferrer" className="text-teal-650 hover:underline text-xs font-bold flex items-center space-x-0.5">
                        <span>View Official Portal</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    <div className="flex justify-center">
                      <button onClick={() => setSchemeStep(0)} className="text-slate-500 text-xs font-semibold hover:underline">Reset Assessment Checker</button>
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* RTI DRAFTING WORKSPACE */}
            {activeModule === 'rti' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-1 space-y-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-6 w-6 text-amber-500" />
                    <h2 className="text-xl font-bold text-slate-805">RTI Drafting Agent</h2>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Information request details:</label>
                      <textarea 
                        value={rtiInput}
                        onChange={(e) => setRtiInput(e.target.value)}
                        placeholder="I want to know the budget allocations for municipal road maintenance..."
                        rows={5}
                        className="w-full p-4 border border-slate-300 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
                      ></textarea>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-3">
                      <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Applicant Info</span>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-655 mb-1">Your Full Name:</label>
                        <input 
                          type="text"
                          value={applicantName}
                          onChange={(e) => setApplicantName(e.target.value)}
                          placeholder="Leave blank to trigger Needs your input warnings"
                          className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-655 mb-1">Your Postal Address:</label>
                        <input 
                          type="text"
                          value={applicantAddress}
                          onChange={(e) => setApplicantAddress(e.target.value)}
                          placeholder="e.g. Flat 12, Block B, Rohini, Delhi"
                          className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    {rtiError && (
                      <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200">
                        {rtiError}
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={() => executeRtiDrafting(rtiInput)}
                        disabled={rtiLoading || !rtiInput.trim()}
                        className="bg-amber-500 hover:bg-opacity-95 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-xs flex items-center space-x-2 transition-all disabled:opacity-50"
                      >
                        {rtiLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Drafting...</span>
                          </>
                        ) : (
                          <>
                            <span>Generate Draft</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  {rtiResult ? (
                    <div className="space-y-6">
                      
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500 uppercase">Generated Document Preview</span>
                          
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => triggerCopy(rtiResult.rtiDraft)}
                              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-2xs"
                            >
                              {copiedText ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-600" />
                                  <span className="text-emerald-600">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy Draft</span>
                                </>
                              )}
                            </button>

                            <button 
                              onClick={() => downloadAsPdf("RTI Application Draft", rtiResult.rtiDraft, "rti_application_draft.pdf")}
                              className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-2xs hover:bg-opacity-95"
                            >
                              <Download className="h-3 w-3" />
                              <span>Download PDF</span>
                            </button>
                          </div>
                        </div>

                        <textarea 
                          value={rtiResult.rtiDraft}
                          onChange={(e) => setRtiResult({ ...rtiResult, rtiDraft: e.target.value })}
                          rows={18}
                          className="w-full p-8 bg-[#fafafa] font-mono text-xs text-slate-800 leading-relaxed border-b border-slate-200 resize-none focus:outline-hidden shadow-inner focus:bg-white"
                        ></textarea>

                        <div className="p-4 bg-amber-50 text-amber-900 text-xs flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <p>{rtiResult.disclaimer}</p>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-[10px] font-bold text-slate-405 uppercase tracking-widest block mb-4">Submitting Procedures</span>
                        <ul className="space-y-3">
                          {rtiResult.instructions.map((inst, idx) => (
                            <li key={idx} className="flex items-start space-x-3 text-sm text-slate-700">
                              <span className="h-5 w-5 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">{idx + 1}</span>
                              <span className="leading-normal">{inst}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  ) : (
                    <div className="h-96 bg-white border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-slate-400">
                      <FileText className="h-10 w-10 mb-2 text-slate-305" />
                      <span className="text-sm font-semibold">RTI Draft Preview Area</span>
                      <p className="text-xs text-slate-400 mt-1 max-w-[250px]">Describe what details you want to know on the left, then click Generate to construct the RTI.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* CONVERSATIONAL FORM FILLER */}
            {activeModule === 'form' && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                <div className="lg:col-span-3 space-y-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <ListTodo className="h-6 w-6 text-purple-650" />
                    <h2 className="text-xl font-bold text-slate-805">Guided Form Filler</h2>
                  </div>

                  {formStatus === 'IDLE' && (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-6">
                      <h3 className="text-lg font-bold text-slate-805">Revenue Office: Income Certificate Application</h3>
                      <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                        Complete your application forms without confusing jargon. The assistant will interview you field-by-field and validate entries in real time.
                      </p>
                      <button 
                        onClick={startFormSession}
                        className="bg-purple-650 hover:bg-opacity-95 text-white px-8 py-3 rounded-lg font-bold text-sm shadow-xs transition-all flex items-center space-x-1 mx-auto"
                      >
                        <span>Start Chat Assistant</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {formStatus === 'IN_PROGRESS' && formCurrentField && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-bold">{formCurrentField.label}</h3>
                          <span className="text-[10px] text-slate-400">Conversational validation assistant</span>
                        </div>
                        
                        <div className="w-24 bg-slate-800 rounded-full h-2">
                          <div 
                            className="bg-purple-550 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${formProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        <div className="flex items-start space-x-3">
                          <div className="h-8 w-8 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-650 font-bold text-xs shrink-0">AI</div>
                          <div className="bg-purple-50 border border-purple-100 p-4 rounded-r-2xl rounded-bl-2xl shadow-2xs max-w-md">
                            <p className="text-sm text-slate-800 font-medium leading-relaxed">
                              {formCurrentField.prompt}
                            </p>
                          </div>
                        </div>

                        <form onSubmit={submitFormAnswer} className="border-t border-slate-100 pt-4 space-y-4">
                          <div>
                            {formCurrentField.type === 'select' ? (
                              <div className="grid grid-cols-2 gap-2">
                                {formCurrentField.options.map((opt) => (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                      setFormInput(opt);
                                    }}
                                    className={`p-3 rounded-lg border text-left text-xs font-semibold transition-all hover:bg-slate-50 ${
                                      formInput === opt ? 'border-purple-650 bg-purple-50' : 'border-slate-200'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <input 
                                type={formCurrentField.type === 'number' ? 'number' : 'text'}
                                value={formInput}
                                onChange={(e) => setFormInput(e.target.value)}
                                placeholder="Type your reply here..."
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-purple-650 focus:border-purple-650 text-sm shadow-inner"
                                autoFocus
                              />
                            )}
                          </div>

                          {formError && (
                            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                              <span>{formError}</span>
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <button 
                              type="button" 
                              onClick={startFormSession} 
                              className="text-slate-400 text-xs hover:underline font-semibold"
                            >
                              Restart Session
                            </button>
                            <button 
                              type="submit"
                              disabled={formLoading || (formInput.trim() === '' && formCurrentField.type !== 'select')}
                              className="bg-purple-655 hover:bg-opacity-95 text-white px-6 py-2 rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all disabled:opacity-50"
                            >
                              {formLoading ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  <span>Submit Reply</span>
                                  <Send className="h-3.5 w-3.5" />
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>

                    </div>
                  )}

                  {formStatus === 'COMPLETED' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="bg-emerald-600 text-white px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="h-5 w-5" />
                          <h3 className="font-bold text-sm">Application Sheet Compiled</h3>
                        </div>

                        <button 
                          onClick={() => downloadAsPdf("Income Certificate Application Details", formDraftText, "income_certificate_draft.pdf")}
                          className="bg-white text-emerald-805 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-2xs hover:bg-slate-50"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download PDF</span>
                        </button>
                      </div>

                      <div className="p-6 space-y-6">
                        <p className="text-xs text-slate-500 leading-relaxed">
                          All fields validated successfully. You can review the final formatted draft text below.
                        </p>

                        <div className="bg-[#fafafa] font-mono text-xs text-slate-800 p-6 rounded-xl border border-slate-200 whitespace-pre-wrap shadow-inner max-h-80 overflow-y-auto">
                          {formDraftText}
                        </div>

                        <div className="flex gap-4">
                          <button 
                            onClick={() => triggerCopy(formDraftText)}
                            className="flex-1 bg-slate-900 hover:bg-black text-white px-4 py-3 rounded-lg text-xs font-bold flex justify-center items-center space-x-1"
                          >
                            {copiedText ? (
                              <>
                                <Check className="h-4 w-4 text-emerald-500" />
                                <span className="text-emerald-500">Copied text!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                <span>Copy Draft Data</span>
                              </>
                            )}
                          </button>
                          
                          <button 
                            onClick={startFormSession}
                            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-lg text-xs font-bold shadow-2xs"
                          >
                            Reset Form
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Application Form Fields</h3>
                    <p className="text-[10px] text-slate-400 mb-4 leading-normal">
                      Click the Edit icon on any field below to inline-correct and re-validate values directly in the active session.
                    </p>
                    
                    {formStatus === 'IDLE' ? (
                      <p className="text-xs text-slate-400 italic py-6 text-center">Start the assistant to populate fields.</p>
                    ) : (
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                              <th className="p-3">Field Label</th>
                              <th className="p-3">Value</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(formSummary.length > 0 ? formSummary : 
                              formCurrentField ? Object.entries(formAnswers).map(([k, v]) => ({
                                name: k,
                                label: k,
                                value: v,
                                status: 'VALID'
                              })) : []
                            ).map((field) => (
                              <tr key={field.name} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="p-3 font-medium text-slate-700">{field.label}</td>
                                <td className="p-3 text-slate-655 truncate max-w-[110px]">{String(field.value)}</td>
                                <td className="p-3 text-right">
                                  <button 
                                    onClick={() => {
                                      setEditingField(field);
                                      setEditInputValue(String(field.value));
                                      setEditError('');
                                    }}
                                    className="text-indigo-900 hover:text-opacity-80 p-1 flex items-center space-x-0.5 justify-end w-full font-semibold"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                    <span>Edit</span>
                                  </button>
                                </td>
                              </tr>
                            ))}

                            {formStatus === 'IN_PROGRESS' && formCurrentField && (
                              <tr className="border-b border-slate-100 bg-purple-50/20 font-bold">
                                <td className="p-3 text-purple-700">{formCurrentField.label}</td>
                                <td className="p-3 text-slate-400 italic">Waiting...</td>
                                <td className="p-3 text-right text-purple-650">● Active</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

          </main>
        </div>
      )}

      {/* FIELD CORRECTION EDIT MODAL OVERLAY */}
      {editingField && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Correct Field Value</h3>
              <button onClick={() => setEditingField(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">×</button>
            </div>
            
            <form onSubmit={handleSaveCorrection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">
                  Label: {editingField.label}
                </label>
                <input 
                  type="text"
                  value={editInputValue}
                  onChange={(e) => setEditInputValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-indigo-900 focus:border-indigo-900"
                  required
                />
              </div>

              {editError && (
                <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200">
                  {editError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={editLoading}
                  className="bg-indigo-900 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs hover:bg-opacity-95 flex items-center space-x-1"
                >
                  {editLoading ? 'Saving...' : 'Save Correction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER DISCLAIMERS */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 space-y-4 md:space-y-0">
          <p>© 2026 Civic Action Engine. OOSC 4.0 Hackathon Submission.</p>
          <div className="flex space-x-4">
            <span className="hover:underline">Bridges Comprehension & Action Gaps</span>
            <span>•</span>
            <span className="hover:underline">Not Legal Advice</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
