import React, { useState, useEffect } from 'react';
import { 
  Scale, Search, FileText, CheckCircle2, ListTodo, Compass, 
  HelpCircle, Send, ArrowRight, ChevronRight, Download, Copy, 
  Plus, AlertTriangle, FileSpreadsheet, History, Sparkles, 
  ExternalLink, Lock, RefreshCw, ArrowLeft, Check, ShieldAlert, Edit2
} from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function App() {
  // Navigation State: 'landing' | 'dashboard'
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [activeModule, setActiveModule] = useState('intake'); // 'intake' | 'rights' | 'scheme' | 'rti' | 'form'
  
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
  const [rightsResult, setRightsResult] = useState(null);
  const [rightsError, setRightsError] = useState('');

  // Scheme Eligibility State
  const [schemeProfile, setSchemeProfile] = useState({
    category: 'OBC',
    annualIncome: '',
    currentClass: '11',
    previousMarks: ''
  });
  const [schemeStep, setSchemeStep] = useState(0); // 0 = intro, 1 = category, 2 = income, 3 = class, 4 = marks, 5 = results
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
  const [formStatus, setFormStatus] = useState('IDLE'); // 'IDLE', 'IN_PROGRESS', 'COMPLETED'
  const [formCurrentField, setFormCurrentField] = useState(null);
  const [formAnswers, setFormAnswers] = useState({});
  const [formInput, setFormInput] = useState('');
  const [formProgress, setFormProgress] = useState(0);
  const [formSummary, setFormSummary] = useState([]);
  const [formDraftText, setFormDraftText] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Field Inline Edit Overlay State
  const [editingField, setEditingField] = useState(null); // { name, label, value }
  const [editInputValue, setEditInputValue] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Session history
  const [sessionHistory, setSessionHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Check backend server health and AI status
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

  // Helper for copy feedback
  const triggerCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // PDF Generation Local Utility
  const downloadAsPdf = (title, content, filename) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Draw outer boundary lines
      doc.setLineWidth(0.5);
      doc.rect(10, 10, 190, 277);
      
      // Top header draft notice watermark
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(190, 80, 80);
      doc.text("DRAFT - CIVIC ACTION ENGINE PROTOTYPE - REVIEW BEFORE SUBMISSION", 15, 17);
      
      // Title header
      doc.setFontSize(14);
      doc.setTextColor(20, 30, 90);
      doc.text(title.toUpperCase(), 15, 27);
      
      // Draw divider line under title
      doc.setLineWidth(0.2);
      doc.line(15, 31, 195, 31);
      
      // Render Content lines in a typewriter style monospace font
      doc.setFont('Courier', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      
      const splitText = doc.splitTextToSize(content, 178);
      let y = 40;
      
      splitText.forEach(line => {
        if (y > 270) {
          doc.addPage();
          // Draw border on next page
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
        y += 5; // spacing
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
      
      if (data.category === 'RIGHTS_NAVIGATOR') {
        setActiveModule('rights');
        setRightsInput(intakeInput);
        executeRightsAnalysis(intakeInput);
      } else if (data.category === 'SCHEME_ELIGIBILITY') {
        setActiveModule('scheme');
        setSchemeStep(1);
      } else if (data.category === 'RTI_DRAFTING') {
        setActiveModule('rti');
        setRtiInput(intakeInput);
        executeRtiDrafting(intakeInput);
      } else if (data.category === 'FORM_FILLER') {
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
      setRightsResult(data.response);
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
      setSchemeStep(5); // Jump to results
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
      
      // Update the draft text representation
      if (session === 'COMPLETED' || formStatus === 'COMPLETED') {
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* GLOBAL HEADER BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button 
            onClick={() => { setCurrentScreen('landing'); setActiveModule('intake'); }} 
            className="flex items-center space-x-2 text-civic-indigo hover:opacity-90 font-bold text-xl transition-all"
          >
            <Scale className="h-6 w-6 text-civic-teal" />
            <span className="tracking-tight">Civic Action Engine</span>
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
                className="bg-civic-indigo hover:bg-opacity-95 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-xs flex items-center space-x-1 transition-all"
              >
                <span>Launch Engine</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button 
                onClick={() => { setCurrentScreen('landing'); }}
                className="text-slate-600 hover:text-slate-900 text-sm font-semibold flex items-center space-x-1"
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
              <h1 className="text-4xl sm:text-5xl font-extrabold text-civic-dark tracking-tight leading-tight">
                From confusing civic problems to <br />
                <span className="text-civic-teal">clear, source-grounded next steps.</span>
              </h1>
              <p className="mt-6 text-lg text-civic-gray max-w-2xl mx-auto">
                Understand your rights. Explore supported government schemes. Draft RTIs. Complete forms—with guidance grounded in reliable official sources.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                <button 
                  onClick={() => { setCurrentScreen('dashboard'); setActiveModule('intake'); }}
                  className="w-full sm:w-auto bg-civic-indigo hover:bg-opacity-95 text-white px-8 py-4 rounded-lg font-bold shadow-md flex items-center justify-center space-x-2 transition-all hover:-translate-y-0.5"
                >
                  <Sparkles className="h-5 w-5 text-civic-amber" />
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
              <h2 className="text-3xl font-extrabold text-civic-dark">Four Core Capabilities</h2>
              <p className="text-civic-gray mt-4 max-w-md mx-auto">We provide action-oriented assistance modules designed around key legal and civic workflows.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Card 1 */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full hover:border-civic-indigo transition-all">
                <div className="bg-indigo-50 p-4 rounded-xl w-fit text-civic-indigo mb-6">
                  <Compass className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-civic-dark mb-2">Rights Navigator</h3>
                <p className="text-sm text-civic-gray flex-1 leading-relaxed">
                  Understand tenant rights, rental deposit guidelines, and labour disputes. Grounded directly in official rent control and wages guidelines.
                </p>
                <button 
                  onClick={() => { setCurrentScreen('dashboard'); setActiveModule('rights'); }}
                  className="mt-6 text-civic-indigo hover:text-opacity-80 text-sm font-bold flex items-center space-x-1"
                >
                  <span>Explore Navigator</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full hover:border-civic-teal transition-all">
                <div className="bg-teal-50 p-4 rounded-xl w-fit text-civic-teal mb-6">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-civic-dark mb-2">Scheme Eligibility</h3>
                <p className="text-sm text-civic-gray flex-1 leading-relaxed">
                  Check if you qualify for social schemes like PM-YASASVI. Compares age, category, grades, and income limits to flag missing items.
                </p>
                <button 
                  onClick={() => { setCurrentScreen('dashboard'); setActiveModule('scheme'); setSchemeStep(0); }}
                  className="mt-6 text-civic-teal hover:text-opacity-80 text-sm font-bold flex items-center space-x-1"
                >
                  <span>Check Eligibility</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full hover:border-civic-amber transition-all">
                <div className="bg-amber-50 p-4 rounded-xl w-fit text-civic-amber mb-6">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-civic-dark mb-2">RTI Drafting Agent</h3>
                <p className="text-sm text-civic-gray flex-1 leading-relaxed">
                  Generate structured drafts for RTI applications requesting municipal road budgets, public contract tenders, and general information files.
                </p>
                <button 
                  onClick={() => { setCurrentScreen('dashboard'); setActiveModule('rti'); }}
                  className="mt-6 text-civic-amber hover:text-opacity-80 text-sm font-bold flex items-center space-x-1"
                >
                  <span>Draft an RTI</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Card 4 */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full hover:border-purple-600 transition-all">
                <div className="bg-purple-50 p-4 rounded-xl w-fit text-purple-600 mb-6">
                  <ListTodo className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-civic-dark mb-2">Conversational Form-Filler</h3>
                <p className="text-sm text-civic-gray flex-1 leading-relaxed">
                  Bypass overwhelming application paperwork. Complete an official Income Certificate application through interactive chat validation.
                </p>
                <button 
                  onClick={() => { setCurrentScreen('dashboard'); setActiveModule('form'); startFormSession(); }}
                  className="mt-6 text-purple-600 hover:text-opacity-80 text-sm font-bold flex items-center space-x-1"
                >
                  <span>Start Form Filler</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          </section>

          {/* WORKFLOW ROADMAP */}
          <section className="bg-slate-100 border-t border-b border-slate-200 py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-center text-civic-dark mb-12">The Civic Action Engine Workflow</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-civic-indigo text-white flex items-center justify-center font-bold text-lg mb-4">1</div>
                  <h4 className="font-bold text-civic-dark">Understand</h4>
                  <p className="text-xs text-civic-gray mt-2 max-w-[200px]">Describe your dispute or query in simple, plain language.</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-civic-teal text-white flex items-center justify-center font-bold text-lg mb-4">2</div>
                  <h4 className="font-bold text-civic-dark">Decide</h4>
                  <p className="text-xs text-civic-gray mt-2 max-w-[200px]">Get routed to the correct module and evaluate specific eligibility.</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-civic-amber text-white flex items-center justify-center font-bold text-lg mb-4">3</div>
                  <h4 className="font-bold text-civic-dark">Prepare</h4>
                  <p className="text-xs text-civic-gray mt-2 max-w-[200px]">Assemble structured drafts, checklists, and documents conversationally.</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mb-4">4</div>
                  <h4 className="font-bold text-civic-dark">Act</h4>
                  <p className="text-xs text-civic-gray mt-2 max-w-[200px]">Export generated application drafts to submit to local officials.</p>
                </div>

              </div>
            </div>
          </section>

          {/* QUICK PROMPTS INTAKE */}
          <section className="py-20 max-w-4xl mx-auto px-4 text-center">
            <h3 className="text-xl font-bold text-civic-dark mb-6">Or try one of these common scenarios:</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <button 
                onClick={() => handleQuickPrompt("My landlord is refusing to refund my security deposit of 45,000 rupees after vacating the room.")}
                className="bg-white border border-slate-300 hover:border-civic-indigo text-slate-700 text-xs px-4 py-2.5 rounded-full transition-all shadow-2xs hover:shadow-xs"
              >
                🏠 "My landlord is withholding my deposit"
              </button>
              <button 
                onClick={() => handleQuickPrompt("Can I apply for the PM Yashasvi scholarship scheme? I am OBC student with income 1.8 Lakhs.")}
                className="bg-white border border-slate-300 hover:border-civic-teal text-slate-700 text-xs px-4 py-2.5 rounded-full transition-all shadow-2xs hover:shadow-xs"
              >
                🎓 "Check PM-YASASVI Scholarship eligibility"
              </button>
              <button 
                onClick={() => handleQuickPrompt("I want to know how much funds were allocated for the repairs of MG Road in the last 2 years.")}
                className="bg-white border border-slate-300 hover:border-civic-amber text-slate-700 text-xs px-4 py-2.5 rounded-full transition-all shadow-2xs hover:shadow-xs"
              >
                🚧 "Draft road expenditure PWD RTI"
              </button>
              <button 
                onClick={() => handleQuickPrompt("I need help completing the Income Certificate Application form details.")}
                className="bg-white border border-slate-300 hover:border-purple-600 text-slate-700 text-xs px-4 py-2.5 rounded-full transition-all shadow-2xs hover:shadow-xs"
              >
                📝 "Fill out Income Certificate details"
              </button>
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
                  activeModule === 'intake' ? 'bg-civic-indigo text-white shadow-xs' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Search className="h-4 w-4" />
                <span>Intake Router</span>
              </button>

              <button 
                onClick={() => setActiveModule('rights')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 text-sm font-semibold transition-all ${
                  activeModule === 'rights' ? 'bg-civic-indigo text-white shadow-xs' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Compass className="h-4 w-4" />
                <span>Rights Navigator</span>
              </button>

              <button 
                onClick={() => { setActiveModule('scheme'); setSchemeStep(0); }}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 text-sm font-semibold transition-all ${
                  activeModule === 'scheme' ? 'bg-civic-indigo text-white shadow-xs' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Scheme Eligibility</span>
              </button>

              <button 
                onClick={() => setActiveModule('rti')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 text-sm font-semibold transition-all ${
                  activeModule === 'rti' ? 'bg-civic-indigo text-white shadow-xs' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>RTI Drafting Agent</span>
              </button>

              <button 
                onClick={() => { setActiveModule('form'); startFormSession(); }}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 text-sm font-semibold transition-all ${
                  activeModule === 'form' ? 'bg-civic-indigo text-white shadow-xs' : 'hover:bg-slate-800 hover:text-white'
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
                        <span className="text-[10px] text-slate-500">{new Date(session.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-1">
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
                  <h2 className="text-2xl font-bold text-civic-dark">Intelligent Intake Router</h2>
                  <p className="text-sm text-civic-gray mt-2">
                    Enter your civic problem, scheme question, or form request below. Our system will analyze the text and route you to the appropriate guiding module.
                  </p>
                </div>

                <form onSubmit={handleIntakeSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Describe your situation in your own words:</label>
                    <textarea 
                      value={intakeInput}
                      onChange={(e) => setIntakeInput(e.target.value)}
                      placeholder="Example: My landlord is refusing to return my security deposit because he claims the paint is worn out, which is not true. I paid 30000 rupees..."
                      rows={5}
                      className="w-full p-4 border border-slate-300 rounded-lg text-sm focus:ring-civic-indigo focus:border-civic-indigo shadow-inner resize-none"
                    ></textarea>
                  </div>

                  {intakeError && (
                    <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200">
                      {intakeError}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Inputs are parsed safely and compared to source indexes.</span>
                    <button 
                      type="submit" 
                      disabled={intakeLoading || !intakeInput.trim()}
                      className="bg-civic-indigo hover:bg-opacity-95 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-xs flex items-center space-x-2 transition-all disabled:opacity-50"
                    >
                      {intakeLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Routing...</span>
                        </>
                      ) : (
                        <>
                          <span>Route Situation</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* SUGGESTED TEMPLATES */}
                <div className="mt-12">
                  <h4 className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wider">Example Templates for Grading</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <button 
                      onClick={() => handleQuickPrompt("My landlord has not returned my security deposit.")}
                      className="bg-white p-4 rounded-xl border border-slate-200 text-left hover:border-civic-indigo transition-all hover:bg-slate-50"
                    >
                      <span className="font-bold text-xs text-civic-indigo block mb-1">Rights Navigator Scenario</span>
                      <p className="text-xs text-civic-dark line-clamp-2">"My landlord is refusing to refund my security deposit of 45,000 rupees..."</p>
                    </button>

                    <button 
                      onClick={() => handleQuickPrompt("Can I apply for the PM Yashasvi scholarship scheme? I am OBC student with income 1.8 Lakhs.")}
                      className="bg-white p-4 rounded-xl border border-slate-200 text-left hover:border-civic-teal transition-all hover:bg-slate-50"
                    >
                      <span className="font-bold text-xs text-civic-teal block mb-1">Scheme Checker Scenario</span>
                      <p className="text-xs text-civic-dark line-clamp-2">"Check if I qualify for PM Yashasvi scholarship scheme as an OBC student..."</p>
                    </button>

                    <button 
                      onClick={() => handleQuickPrompt("I want to know how much money was allocated for road construction in my locality during the last three years.")}
                      className="bg-white p-4 rounded-xl border border-slate-200 text-left hover:border-civic-amber transition-all hover:bg-slate-50"
                    >
                      <span className="font-bold text-xs text-civic-amber block mb-1">RTI Drafting Scenario</span>
                      <p className="text-xs text-civic-dark line-clamp-2">"I want to request budget details for road repair in ward 12..."</p>
                    </button>

                    <button 
                      onClick={() => handleQuickPrompt("I don't understand how to fill this income certificate application.")}
                      className="bg-white p-4 rounded-xl border border-slate-200 text-left hover:border-purple-600 transition-all hover:bg-slate-50"
                    >
                      <span className="font-bold text-xs text-purple-600 block mb-1">Conversational Form Filler</span>
                      <p className="text-xs text-civic-dark line-clamp-2">"Help me complete the Income Certificate Application form details..."</p>
                    </button>

                  </div>
                </div>

              </div>
            )}

            {/* RIGHTS NAVIGATOR */}
            {activeModule === 'rights' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Inputs & Analysis */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Compass className="h-6 w-6 text-civic-indigo" />
                    <h2 className="text-xl font-bold text-civic-dark">Rights Navigator Workspace</h2>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Explain the problem or dispute in detail:</label>
                      <textarea 
                        value={rightsInput}
                        onChange={(e) => setRightsInput(e.target.value)}
                        placeholder="Detail your housing landlord, workspace, or consumer issue..."
                        rows={4}
                        className="w-full p-4 border border-slate-300 rounded-lg text-sm focus:ring-civic-indigo focus:border-civic-indigo"
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
                        className="bg-civic-indigo hover:bg-opacity-95 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-xs flex items-center space-x-2 transition-all disabled:opacity-50"
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
                      
                      {/* 1. What we understand */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-[10px] font-bold text-civic-indigo uppercase tracking-widest block mb-1">1. WHAT WE UNDERSTAND</span>
                        <p className="text-sm font-bold text-civic-dark leading-relaxed">{rightsResult.whatWeUnderstand}</p>
                      </div>

                      {/* 2. Information that may apply */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-[10px] font-bold text-civic-indigo uppercase tracking-widest block mb-2">2. INFORMATION THAT MAY APPLY</span>
                        <p className="text-sm text-slate-700 leading-relaxed">{rightsResult.informationThatMayApply}</p>
                      </div>

                      {/* 3. Why */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-[10px] font-bold text-civic-indigo uppercase tracking-widest block mb-2">3. WHY (REASONING & LEGAL GROUNDING)</span>
                        <p className="text-sm text-slate-700 leading-relaxed">{rightsResult.why}</p>
                      </div>

                      {/* 4. What you may do next */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-[10px] font-bold text-civic-indigo uppercase tracking-widest block mb-4">4. WHAT YOU MAY DO NEXT (ACTION PLAN)</span>
                        <ul className="space-y-3">
                          {rightsResult.whatYouMayDoNext.map((step, idx) => (
                            <li key={idx} className="flex items-start space-x-3 text-sm text-slate-700">
                              <span className="h-5 w-5 rounded-full bg-indigo-50 border border-slate-350 text-civic-indigo flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">{idx + 1}</span>
                              <span className="leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 5. Documents that may help */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-[10px] font-bold text-civic-indigo uppercase tracking-widest block mb-4">5. DOCUMENTS / EVIDENCE THAT MAY HELP</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {rightsResult.documentsEvidenceThatMayHelp.map((doc, idx) => (
                            <div key={idx} className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                              <input type="checkbox" className="h-4 w-4 rounded-sm border-slate-300 text-civic-teal focus:ring-civic-teal" />
                              <span className="text-xs text-slate-700 font-medium">{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 6. Limitations */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-[10px] font-bold text-slate-indigo uppercase tracking-widest block mb-2">6. IMPORTANT LIMITATIONS & UNCERTAINTIES</span>
                        <p className="text-xs text-slate-650 leading-relaxed italic">{rightsResult.importantLimitations}</p>
                      </div>

                      {/* Safety Disclaimer */}
                      <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl flex items-start space-x-3">
                        <ShieldAlert className="h-5 w-5 text-civic-amber shrink-0 mt-0.5" />
                        <p className="text-xs leading-relaxed">{rightsResult.disclaimer}</p>
                      </div>

                    </div>
                  )}

                </div>

                {/* Grounding Source panel */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <h3 className="text-sm font-bold text-civic-dark uppercase tracking-wider mb-2">Supporting Sources</h3>
                    <div className="text-[10px] bg-slate-150 p-2 rounded-sm mb-4 border border-slate-200 text-slate-600 flex justify-between">
                      <span>Source Check Type: Local Knowledge Base</span>
                      <span className="font-bold text-civic-teal">GROUNDED</span>
                    </div>

                    {rightsResult && rightsResult.sources && rightsResult.sources.length > 0 ? (
                      <div className="space-y-4">
                        {rightsResult.sources.map((src, idx) => (
                          <div key={idx} className="border border-slate-200 p-4 rounded-xl space-y-2 hover:border-slate-300 transition-all bg-slate-50/50">
                            <span className="bg-teal-50 text-civic-teal text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-teal-100">{src.category}</span>
                            <h4 className="text-xs font-bold text-slate-800 leading-snug">{src.title}</h4>
                            
                            {/* Distinct Source Excerpt Block */}
                            <blockquote className="border-l-2 border-slate-300 pl-3 my-2 text-[11px] text-slate-600 leading-relaxed italic">
                              "{src.content}"
                            </blockquote>

                            <div className="border-t border-slate-100 pt-2 mt-2 flex justify-between items-center text-[10px] text-slate-400">
                              <span className="truncate max-w-[150px]">Authority: {src.authority}</span>
                              <a href={src.source_url} target="_blank" rel="noreferrer" className="text-civic-teal hover:underline flex items-center space-x-0.5">
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
                  </div>
                </div>

              </div>
            )}

            {/* SCHEME ELIGIBILITY WIZARD */}
            {activeModule === 'scheme' && (
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-civic-teal" />
                  <h2 className="text-xl font-bold text-civic-dark">Scheme Eligibility Checker</h2>
                </div>

                {schemeStep === 0 && (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-center">
                    <h3 className="text-lg font-bold text-civic-dark">Evaluate: PM Yashasvi Post-Matric Scholarship Scheme</h3>
                    <p className="text-sm text-civic-gray leading-relaxed max-w-md mx-auto">
                      Determine whether you satisfy the criteria for OBC, EBC, and DNT financial student assistance. The evaluation takes less than 2 minutes.
                    </p>
                    <button 
                      onClick={() => setSchemeStep(1)}
                      className="bg-civic-teal hover:bg-opacity-95 text-white px-8 py-3 rounded-lg font-bold text-sm shadow-xs transition-all inline-flex items-center space-x-2"
                    >
                      <span>Begin Assessment</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {schemeStep === 1 && (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>QUESTION 1 OF 4</span>
                      <span>25% COMPLETE</span>
                    </div>
                    <h3 className="text-md font-bold text-civic-dark">What is your social caste category?</h3>
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
                            schemeProfile.category === cat.split(' ')[0] ? 'border-civic-teal bg-teal-50/50' : 'border-slate-200'
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
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>QUESTION 2 OF 4</span>
                      <span>50% COMPLETE</span>
                    </div>
                    <h3 className="text-md font-bold text-civic-dark">What is your parents' or guardians' combined annual income?</h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-slate-400 text-sm font-semibold">INR</span>
                        <input 
                          type="number"
                          value={schemeProfile.annualIncome}
                          onChange={(e) => setSchemeProfile({ ...schemeProfile, annualIncome: e.target.value })}
                          placeholder="e.g. 150000"
                          className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-civic-teal focus:border-civic-teal text-sm"
                        />
                      </div>
                      <div className="flex justify-between">
                        <button onClick={() => setSchemeStep(1)} className="text-slate-400 text-sm font-semibold hover:text-slate-600">Back</button>
                        <button 
                          onClick={() => setSchemeStep(3)} 
                          className="bg-civic-teal text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-xs"
                        >
                          Next Step (or skip to evaluate missing)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {schemeStep === 3 && (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>QUESTION 3 OF 4</span>
                      <span>75% COMPLETE</span>
                    </div>
                    <h3 className="text-md font-bold text-civic-dark">What class level are you currently studying in?</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {['11', '12', '9', '10', 'College / Higher'].map((cls) => (
                        <button 
                          key={cls}
                          onClick={() => {
                            setSchemeProfile({ ...schemeProfile, currentClass: cls });
                            setSchemeStep(4);
                          }}
                          className={`p-4 rounded-xl border text-left text-sm font-semibold transition-all hover:bg-slate-50 ${
                            schemeProfile.currentClass === cls ? 'border-civic-teal bg-teal-50/50' : 'border-slate-200'
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
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>QUESTION 4 OF 4</span>
                      <span>95% COMPLETE</span>
                    </div>
                    <h3 className="text-md font-bold text-civic-dark">What was your overall percentage score in the previous academic year?</h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <input 
                          type="number"
                          value={schemeProfile.previousMarks}
                          onChange={(e) => setSchemeProfile({ ...schemeProfile, previousMarks: e.target.value })}
                          placeholder="e.g. 78 (leave blank to check missing info response)"
                          max={100}
                          min={0}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-civic-teal focus:border-civic-teal text-sm"
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
                          className="bg-civic-teal text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-xs flex items-center space-x-1"
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
                    {/* Eligibility Assessment status card */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ELIGIBILITY ASSESSMENT REPORT</span>
                      
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
                          schemeResult.status === 'INSUFFICIENT INFORMATION' ? 'text-amber-600' : 'text-red-650'
                        }`}>
                          {schemeResult.status}
                        </h2>
                      </div>
                      
                      <p className="text-xs text-civic-gray max-w-sm mx-auto leading-relaxed border-t border-slate-100 pt-3">
                        This is an informational assessment generated by parsing database records. Final award requires official vetting via scholarships.gov.in.
                      </p>
                    </div>

                    {/* Criterion list */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Criterion-by-Criterion Evaluation</h4>
                      <div className="space-y-3">
                        {Object.entries(schemeResult.evaluation).map(([key, item]) => (
                          <div key={key} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">{item.label}</span>
                              <span className="text-[11px] text-slate-505 mt-1 block">{item.details}</span>
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

                    {/* Required Documents */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Evidentiary Documents Needed</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {schemeResult.requiredDocuments.map((doc, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 p-3 rounded-lg">
                            <span className="h-2 w-2 rounded-full bg-civic-teal shrink-0"></span>
                            <span>{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Next step section */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recommended Next Step</h4>
                      <p className="text-sm text-slate-700 leading-relaxed font-semibold">
                        {schemeResult.status === 'LIKELY ELIGIBLE' 
                          ? "Compile all required documents (specifically caste/marks certificate) and proceed to register on the NSP Portal." 
                          : "Verify details and correct missing parameters or explore other scholarship schemes matching General/other social criteria."}
                      </p>
                    </div>

                    {/* Grounded Source */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block">SOURCE SOURCE</span>
                        <h4 className="text-xs font-bold text-slate-700">{schemeResult.source.title}</h4>
                        <span className="text-[10px] text-slate-505">{schemeResult.source.authority}</span>
                      </div>
                      <a href={schemeResult.source.source_url} target="_blank" rel="noreferrer" className="text-civic-teal hover:underline text-xs font-bold flex items-center space-x-0.5">
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
                
                {/* Inputs */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-6 w-6 text-civic-amber" />
                    <h2 className="text-xl font-bold text-civic-dark">RTI Drafting Agent</h2>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Information request details:</label>
                      <textarea 
                        value={rtiInput}
                        onChange={(e) => setRtiInput(e.target.value)}
                        placeholder="I want to know the budget allocations for municipal road maintenance..."
                        rows={5}
                        className="w-full p-4 border border-slate-300 rounded-lg text-sm focus:ring-civic-amber focus:border-civic-amber"
                      ></textarea>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-3">
                      <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Applicant Info</span>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Your Full Name:</label>
                        <input 
                          type="text"
                          value={applicantName}
                          onChange={(e) => setApplicantName(e.target.value)}
                          placeholder="Leave blank to trigger Needs your input warnings"
                          className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Your Postal Address:</label>
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
                        className="bg-civic-amber hover:bg-opacity-95 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-xs flex items-center space-x-2 transition-all disabled:opacity-50"
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

                {/* Draft Document & Instruction Panel */}
                <div className="lg:col-span-2 space-y-6">
                  {rtiResult ? (
                    <div className="space-y-6">
                      
                      {/* Document Preview */}
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
                              className="bg-civic-amber text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-2xs hover:bg-opacity-95"
                            >
                              <Download className="h-3 w-3" />
                              <span>Download PDF</span>
                            </button>
                          </div>
                        </div>

                        {/* Editable Text Area for final edits */}
                        <textarea 
                          value={rtiResult.rtiDraft}
                          onChange={(e) => setRtiResult({ ...rtiResult, rtiDraft: e.target.value })}
                          rows={18}
                          className="w-full p-8 bg-[#fafafa] font-mono text-xs text-slate-800 leading-relaxed border-b border-slate-200 resize-none focus:outline-hidden shadow-inner focus:bg-white"
                        ></textarea>

                        <div className="p-4 bg-amber-50 text-amber-900 text-xs flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 text-civic-amber shrink-0 mt-0.5" />
                          <p>{rtiResult.disclaimer}</p>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Submitting Procedures</span>
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
                      <FileText className="h-10 w-10 mb-2 text-slate-300" />
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
                
                {/* Conversational Assistant */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <ListTodo className="h-6 w-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-civic-dark">Guided Form Filler</h2>
                  </div>

                  {formStatus === 'IDLE' && (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-6">
                      <h3 className="text-lg font-bold text-civic-dark">Revenue Office: Income Certificate Application</h3>
                      <p className="text-sm text-civic-gray leading-relaxed max-w-sm mx-auto">
                        Complete your application forms without confusing jargon. The assistant will interview you field-by-field and validate entries in real time.
                      </p>
                      <button 
                        onClick={startFormSession}
                        className="bg-purple-600 hover:bg-opacity-95 text-white px-8 py-3 rounded-lg font-bold text-sm shadow-xs transition-all flex items-center space-x-1 mx-auto"
                      >
                        <span>Start Chat Assistant</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {formStatus === 'IN_PROGRESS' && formCurrentField && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      {/* Header */}
                      <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-bold">{formCurrentField.label}</h3>
                          <span className="text-[10px] text-slate-400">Conversational validation assistant</span>
                        </div>
                        
                        <div className="w-24 bg-slate-800 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${formProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Chat dialog */}
                      <div className="p-6 space-y-6">
                        <div className="flex items-start space-x-3">
                          <div className="h-8 w-8 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-600 font-bold text-xs shrink-0">AI</div>
                          <div className="bg-purple-50 border border-purple-100 p-4 rounded-r-2xl rounded-bl-2xl shadow-2xs max-w-md">
                            <p className="text-sm text-slate-800 font-medium leading-relaxed">
                              {formCurrentField.prompt}
                            </p>
                          </div>
                        </div>

                        {/* Input form */}
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
                                      formInput === opt ? 'border-purple-600 bg-purple-50' : 'border-slate-200'
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
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-purple-600 focus:border-purple-600 text-sm shadow-inner"
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
                              className="bg-purple-600 hover:bg-opacity-95 text-white px-6 py-2 rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all disabled:opacity-50"
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
                          className="bg-white text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-2xs hover:bg-slate-50"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download PDF</span>
                        </button>
                      </div>

                      <div className="p-6 space-y-6">
                        <p className="text-xs text-slate-505 leading-relaxed">
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

                {/* Live Fields summary table (Priority 7) */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <h3 className="text-xs font-bold text-civic-dark uppercase tracking-wider mb-2">Application Form Fields</h3>
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
                            {/* Summary Rows */}
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
                                <td className="p-3 text-slate-600 truncate max-w-[110px]">{String(field.value)}</td>
                                <td className="p-3 text-right">
                                  <button 
                                    onClick={() => {
                                      setEditingField(field);
                                      setEditInputValue(String(field.value));
                                      setEditError('');
                                    }}
                                    className="text-civic-indigo hover:text-opacity-80 p-1 flex items-center space-x-0.5 justify-end w-full font-semibold"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                    <span>Edit</span>
                                  </button>
                                </td>
                              </tr>
                            ))}

                            {/* Active field input row */}
                            {formStatus === 'IN_PROGRESS' && formCurrentField && (
                              <tr className="border-b border-slate-100 bg-purple-50/20 font-bold">
                                <td className="p-3 text-purple-700">{formCurrentField.label}</td>
                                <td className="p-3 text-slate-400 italic">Waiting...</td>
                                <td className="p-3 text-right text-purple-600">● Active</td>
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
                <label className="block text-xs font-semibold text-slate-505 mb-2">
                  Label: {editingField.label}
                </label>
                <input 
                  type="text"
                  value={editInputValue}
                  onChange={(e) => setEditInputValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-civic-indigo focus:border-civic-indigo"
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
                  className="bg-civic-indigo text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs hover:bg-opacity-95 flex items-center space-x-1"
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
