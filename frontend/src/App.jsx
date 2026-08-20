import React, { useState, useEffect } from 'react';
import { 
  Scale, Search, FileText, CheckCircle2, ListTodo, Compass, 
  HelpCircle, Send, ArrowRight, ChevronRight, Download, Copy, 
  Plus, AlertTriangle, FileSpreadsheet, History, Sparkles, 
  ExternalLink, Lock, RefreshCw, ArrowLeft, Check, ShieldAlert, Edit2, Info
} from 'lucide-react';
import { jsPDF } from 'jspdf';

const UI_TRANSLATIONS = {
  en: {
    title: "Civic Action Engine",
    subtitle: "AI-Powered Civic & Legal Empowerment",
    intakeHeader: "How Can We Help?",
    intakePlaceholder: "Describe your civic issue or problem in natural language...",
    submitBtn: "Analyze Issue",
    analyzing: "Analyzing...",
    landingBtn: "Access Engine Dashboard",
    orChoosePath: "OR CHOOSE A PATH",
    rightsNavigator: "Rights Navigator",
    schemeEligibility: "Scheme Eligibility",
    rtiDrafting: "RTI Drafting",
    formFiller: "Form Assistant",
    language: "Language",
    readAloud: "Read Aloud",
    pause: "Pause",
    resume: "Resume",
    stop: "Stop",
    whatWeUnderstand: "What We Understand",
    informationMayApply: "Information That May Apply",
    whyThisMatters: "Why This Matters",
    whatYouCanDo: "What You Can Do Next",
    evidenceChecklist: "Evidence & Documents That Help",
    limitations: "Important Limitations",
    disclaimer: "Disclaimer",
    safeFallbackTitle: "Supported Grounding Unavailable",
    safeFallbackHelp: "How We Can Help:",
    safeFallbackCannotVerify: "What We Cannot Verify Yet:",
    safeFallbackWouldHelp: "What Details Would Help:",
    sourcesTitle: "Verified Grounding Sources",
    authorityLabel: "Authority / Organization",
    originalExcerpt: "Original Source Excerpt",
    explanationLabel: "AI Grounded Explanation",
    whySourceMatters: "Why This Source Matters",
    officialLink: "Official Reference URL",
    readAloudSpeechWarning: "Read Aloud voice depends on browser and system settings.",
    backToDashboard: "Back to Dashboard",
    backBtn: "Back",
    evidenceTitle: "Evidence Checklist",
    historyTitle: "Recent Sessions History",
    noHistory: "No recent sessions found.",
    loadMore: "Load More",
    delete: "Delete",
    viewBtn: "View",
    demoModeText: "DEMO MODE (Using local rule database)"
  },
  te: {
    title: "సివిక్ యాక్షన్ ఇంజిన్",
    subtitle: "ఏఐ-ఆధారిత పౌర మరియు చట్టపరమైన సాధికారత",
    intakeHeader: "మేము మీకు ఎలా సహాయం చేయగలం?",
    intakePlaceholder: "మీ పౌర సమస్య లేదా ఇబ్బందిని సాధారణ భాషలో వివరించండి...",
    submitBtn: "సమస్యను విశ్లేషించు",
    analyzing: "విశ్లేషిస్తోంది...",
    landingBtn: "ఇంజిన్ డాష్‌బోర్డ్ ప్రవేశించండి",
    orChoosePath: "లేదా ఒక మార్గాన్ని ఎంచుకోండి",
    rightsNavigator: "హక్కుల నావిగేటర్",
    schemeEligibility: "పథకాల అర్హత",
    rtiDrafting: "RTI డ్రాఫ్టింగ్",
    formFiller: "ఫారమ్ అసిస్టెంట్",
    language: "భాష",
    readAloud: "గట్టిగా చదవండి",
    pause: "తాత్కాలికంగా ఆపు",
    resume: "తిరిగి ప్రారంభించు",
    stop: "ఆపు",
    whatWeUnderstand: "మేము గ్రహించినది",
    informationMayApply: "వర్తించే సమాచారం",
    whyThisMatters: "ఇది ఎందుకు ముఖ్యం",
    whatYouCanDo: "మీరు తదుపరి చేయవలసిన పనులు",
    evidenceChecklist: "సహాయపడే ఆధారాలు & పత్రాలు",
    limitations: "ముఖ్యమైన పరిమితులు",
    disclaimer: "నిరాకరణ",
    safeFallbackTitle: "మద్దతు ఉన్న ఆధారాలు అందుబాటులో లేవు",
    safeFallbackHelp: "మేము సహాయపడగల విషయాలు:",
    safeFallbackCannotVerify: "మేము ఇంకా ధృవీకరించలేనివి:",
    safeFallbackWouldHelp: "ఏ వివరాలు సహాయపడతాయి:",
    sourcesTitle: "ధృవీకరించబడిన మూల వనరులు",
    authorityLabel: "అథారిటీ / సంస్థ",
    originalExcerpt: "అసలు మూల భాగం",
    explanationLabel: "ఏఐ ఆధారిత వివరణ",
    whySourceMatters: "ఈ మూలం ఎందుకు ముఖ్యం",
    officialLink: "అధికారిక సూచన URL",
    readAloudSpeechWarning: "స్పీచ్ వాయిస్ బ్రౌజర్ మరియు సిస్టమ్ సెట్టింగ్‌లపై ఆధారపడి ఉంటుంది.",
    backToDashboard: "డాష్‌బోర్డ్‌కు తిరిగి వెళ్ళు",
    backBtn: "వెనుకకు",
    evidenceTitle: "ఆధారాల చెక్‌లిస్ట్",
    historyTitle: "ఇటీవలి సెషన్ల చరిత్ర",
    noHistory: "ఇటీవలి సెషన్లు ఏవీ కనుగొనబడలేదు.",
    loadMore: "మరింత లోడ్ చేయి",
    delete: "తొలగించు",
    viewBtn: "చూడండి",
    demoModeText: "డెమో మోడ్ (స్థానిక నియమ డేటాబేస్ ఉపయోగించబడుతోంది)"
  },
  hi: {
    title: "सिविक एक्शन इंजन",
    subtitle: "एआई-संचालित नागरिक और कानूनी सशक्तिकरण",
    intakeHeader: "हम आपकी क्या सहायता कर सकते हैं?",
    intakePlaceholder: "अपनी नागरिक समस्या या कठिनाई का सामान्य भाषा में वर्णन करें...",
    submitBtn: "समस्या का विश्लेषण करें",
    analyzing: "विश्लेषण किया जा रहा है...",
    landingBtn: "इंजन डैशबोर्ड तक पहुंचें",
    orChoosePath: "या एक मार्ग चुनें",
    rightsNavigator: "अधिकार नेविगेटर",
    schemeEligibility: "योजना पात्रता",
    rtiDrafting: "आरटीआई ड्राफ्टिंग",
    formFiller: "फॉर्म सहायक",
    language: "भाषा",
    readAloud: "ज़ोर से पढ़ें",
    pause: "पॉज़ करें",
    resume: "फिर से शुरू करें",
    stop: "रोकें",
    whatWeUnderstand: "हमारी समझ",
    informationMayApply: "लागू होने वाली जानकारी",
    whyThisMatters: "यह क्यों महत्वपूर्ण है",
    whatYouCanDo: "आप आगे क्या कर सकते हैं",
    evidenceChecklist: "सहायक साक्ष्य और दस्तावेज",
    limitations: "महत्वपूर्ण सीमाएं",
    disclaimer: "अस्वीकरण",
    safeFallbackTitle: "समर्थित ग्राउंडिंग अनुपलब्ध",
    safeFallbackHelp: "हम कैसे सहायता कर सकते हैं:",
    safeFallbackCannotVerify: "हम अभी क्या सत्यापित नहीं कर सकते:",
    safeFallbackWouldHelp: "कौन से विवरण सहायक होंगे:",
    sourcesTitle: "सत्यापित ग्राउंडिंग स्रोत",
    authorityLabel: "प्राधिकरण / संगठन",
    originalExcerpt: "मूल स्रोत अंश",
    explanationLabel: "एआई ग्राउंडेड स्पष्टीकरण",
    whySourceMatters: "यह स्रोत क्यों महत्वपूर्ण है",
    officialLink: "आधिकारिक संदर्भ URL",
    readAloudSpeechWarning: "स्पीच आवाज़ ब्राउज़र और सिस्टम सेटिंग्स पर निर्भर करती है।",
    backToDashboard: "डैशबोर्ड पर वापस जाएं",
    backBtn: "पीछे",
    evidenceTitle: "साक्ष्य चेकलिस्ट",
    historyTitle: "हाल के सत्रों का इतिहास",
    noHistory: "कोई हालिया सत्र नहीं मिला।",
    loadMore: "और लोड करें",
    delete: "हटाएं",
    viewBtn: "देखें",
    demoModeText: "डेमो मोड (स्थानीय नियम डेटाबेस का उपयोग किया जा रहा है)"
  }
};

const EXEMPLARS = {
  en: [
    { tag: "TENANT DISPUTE", text: "My landlord hasn't returned my deposit." },
    { tag: "EMPLOYEE GRIEVANCE", text: "My employer hasn't paid my salary." },
    { tag: "POLICE MISCONDUCT", text: "Police used excessive force against my brother." },
    { tag: "CIVIC SANITATION", text: "Garbage hasn't been collected for weeks." },
    { tag: "RTI INFORMATION", text: "I want to know how much was spent repairing a road." },
    { tag: "WELFARE SCHEME", text: "Can I qualify for a scholarship?" }
  ],
  te: [
    { tag: "అద్దెదారుల వివాదం", text: "నా భూస్వామి నా డిపాజిట్ తిరిగి ఇవ్వడం లేదు." },
    { tag: "ఉద్యోగుల సమస్య", text: "నా యజమాని నాకు జీతం ఇవ్వలేదు." },
    { tag: "పోలీసుల దౌర్జన్యం", text: "పోలీసులు నా సోదరుడిపై అధిక బలాన్ని ఉపయోగించారు." },
    { tag: "పరిశుభ్రత సమస్య", text: "వారాలుగా చెత్త సేకరించడం లేదు." },
    { tag: "RTI సమాచారం", text: "రహదారి మరమ్మతు కోసం ఎంత ఖర్చు చేశారో నేను తెలుసుకోవాలనుకుంటున్నాను." },
    { tag: "ప్రభుత్వ పథకాలు", text: "నేను స్కాలర్‌షిప్‌కు అర్హుడినా?" }
  ],
  hi: [
    { tag: "किरायेदार विवाद", text: "मेरे मकान मालिक ने मेरी सुरक्षा जमा राशि वापस नहीं की है।" },
    { tag: "कर्मचारी शिकायत", text: "मेरे नियोक्ता ने मुझे वेतन नहीं दिया है।" },
    { tag: "पुलिस दुर्व्यवहार", text: "पुलिस ने मेरे भाई के खिलाफ अत्यधिक बल का प्रयोग किया।" },
    { tag: "स्वच्छता शिकायत", text: "हफ्तों से कचरा जमा है और साफ नहीं किया गया।" },
    { tag: "आरटीआई सूचना", text: "मैं जानना चाहता हूँ कि सड़क मरम्मत पर कितना खर्च हुआ।" },
    { tag: "कल्याणकारी योजना", text: "क्या मैं छात्रवृत्ति के लिए पात्र हूँ?" }
  ]
};

const CLARIFICATION_TRANSLATIONS = {
  en: {
    police: {
      step1: {
        q: "What specific action occurred during the incident?",
        opts: ["Excessive physical force", "Threat / intimidation", "Detention / arrest", "Property damage", "Other"]
      },
      step2: {
        q: "Where did this incident occur?",
        opts: ["Inside a police station", "During arrest / transfer", "Public street or open place", "Other location"]
      },
      step3: {
        q: "Do you have physical documentation, photos, or medical receipts?",
        opts: ["Yes, physical medical/video evidence", "No, only personal witness testimony", "Not sure what to collect"]
      }
    },
    wage: {
      step1: {
        q: "What is the core workplace dispute?",
        opts: ["Unpaid wages / salary delay", "Arbitrary termination", "Workplace harassment", "Unsafe working conditions", "Other dispute"]
      }
    },
    general: {
      step1: {
        q: "Could you select the closest sub-topic for your dispute?",
        opts: ["General service delay", "Billing / financial discrepancy", "Unfair treatment / denial of service", "Other specific matter"]
      }
    },
    header: "We detected your situation relates to:",
    original: "Original Query:"
  },
  te: {
    police: {
      step1: {
        q: "సంఘటన సమయంలో ఖచ్చితంగా ఏం జరిగింది?",
        opts: ["అధిక శారీరక బలాన్ని ఉపయోగించడం", "బెదిరింపులు / దౌర్జన్యం", "అక్రమ నిర్బంధం / అరెస్టు", "ఆస్తి నష్టం", "ఇతర విషయాలు"]
      },
      step2: {
        q: "ఈ సంఘటన ఎక్కడ జరిగింది?",
        opts: ["పోలీస్ స్టేషన్ లోపల", "అరెస్టు / బదిలీ సమయంలో", "పబ్లిక్ వీధి లేదా బహిరంగ ప్రదేశం", "ఇతర ప్రదేశం"]
      },
      step3: {
        q: "మీ వద్ద వైద్య నివేదికలు, ఫోటోలు లేదా ఇతర ఆధారాలు ఉన్నాయా?",
        opts: ["అవును, వైద్య నివేదికలు/వీడియో ఆధారాలు ఉన్నాయి", "లేదు, కేవలం వ్యక్తిగత సాక్ష్యం మాత్రమే", "ఏం సేకరించాలో ఖచ్చితంగా తెలియదు"]
      }
    },
    wage: {
      step1: {
        q: "పనిప్రదేశంలో ప్రధాన వివాదం ఏమిటి?",
        opts: ["జీతం చెల్లించకపోవడం / ఆలస్యం", "అక్రమంగా తొలగించడం", "వేధింపులు", "అసురక్షిత పని పరిస్థితులు", "ఇతర వివాదాలు"]
      }
    },
    general: {
      step1: {
        q: "దయచేసి మీ వివాదానికి సంబంధించిన సరైన విషయాన్ని ఎంచుకోండి:",
        opts: ["సాధారణ సేవా ఆలస్యం", "బిల్లింగ్ / ఆర్థిక వ్యత్యాసం", "అన్యాయమైన ప్రవర్తన / సేవ నిరాకరణ", "ఇతర నిర్దిష్ట విషయం"]
      }
    },
    header: "మేము మీ పరిస్థితిని దీనికి సంబంధించినదిగా గుర్తించాము:",
    original: "అసలు ప్రశ్న:"
  },
  hi: {
    police: {
      step1: {
        q: "घटना के दौरान विशेष रूप से क्या हुआ?",
        opts: ["अत्यधिक शारीरिक बल का प्रयोग", "धमकी / उत्पीड़न", "अवैध हिरासत / गिरफ्तारी", "संपत्ति की क्षति", "अन्य"]
      },
      step2: {
        q: "यह घटना कहाँ हुई?",
        opts: ["पुलिस स्टेशन के भीतर", "गिरफ्तारी / स्थानांतरण के दौरान", "सार्वजनिक सड़क या खुला स्थान", "अन्य स्थान"]
      },
      step3: {
        q: "क्या आपके पास चिकित्सा रिपोर्ट, तस्वीरें या अन्य सबूत हैं?",
        opts: ["हाँ, चिकित्सा रिपोर्ट/वीडियो साक्ष्य उपलब्ध हैं", "नहीं, केवल व्यक्तिगत गवाही", "निश्चित नहीं कि क्या एकत्र किया जाए"]
      }
    },
    wage: {
      step1: {
        q: "कार्यस्थल पर मुख्य विवाद क्या है?",
        opts: ["वेतन का भुगतान न होना / देरी", "अवैध बर्खास्तगी", "कार्यस्थल पर उत्पीड़न", "असुरक्षित कार्य परिस्थितियां", "अन्य विवाद"]
      }
    },
    general: {
      step1: {
        q: "कृपया अपने विवाद का सबसे करीबी उप-विषय चुनें:",
        opts: ["सामान्य सेवा में देरी", "बिलिंग / वित्तीय विसंगति", "अनुचित व्यवहार / सेवा से इनकार", "अन्य विशिष्ट मामला"]
      }
    },
    header: "हमने आपकी स्थिति का पता लगाया है जो इससे संबंधित है:",
    original: "मूल प्रश्न:"
  }
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [activeModule, setActiveModule] = useState('intake');
  const [lang, setLang] = useState('en');
  const [speechState, setSpeechState] = useState('stopped');
  const [speechUtterance, setSpeechUtterance] = useState(null);

  useEffect(() => {
    window.speechSynthesis.cancel();
    setSpeechState('stopped');
  }, [lang, activeModule, currentScreen]);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    if (rightsResult) {
      const promptToReanalyze = rightsResult.prompt || rightsInput;
      if (promptToReanalyze) {
        executeRightsAnalysis(promptToReanalyze, newLang);
      }
    }
  };

  const resetDemo = () => {
    window.speechSynthesis.cancel();
    setSpeechState('stopped');
    setSpeechUtterance(null);
    setIntakeInput('');
    setRightsInput('');
    setRtiInput('');
    setFormInput('');
    setRightsResult(null);
    setSchemeResult(null);
    setRtiResult(null);
    setFormDraftText('');
    setFormSessionId(null);
    setClarificationTarget(null);
    setSchemeStep(0);
    setFormStatus('IDLE');
    setFormAnswers({});
    setCurrentScreen('landing');
    setActiveModule('intake');
    setLang('en');
  };

  const handleReadAloud = (result) => {
    if (!result || !result.response) return;
    window.speechSynthesis.cancel();
    
    const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.en;
    const speechParts = [];
    
    if (result.status === 'UNSUPPORTED_FALLBACK') {
      if (result.response.whatWeUnderstand) {
        speechParts.push(result.response.whatWeUnderstand);
      }
      if (result.response.whatWeCanHelpWith) {
        speechParts.push(`${t.safeFallbackHelp} ${result.response.whatWeCanHelpWith}`);
      }
      if (result.response.whatWeCannotVerifyYet) {
        speechParts.push(`${t.safeFallbackCannotVerify} ${result.response.whatWeCannotVerifyYet}`);
      }
      if (result.response.whatWouldHelp && result.response.whatWouldHelp.length) {
        speechParts.push(`${t.safeFallbackWouldHelp} ` + result.response.whatWouldHelp.join(". "));
      }
    } else {
      if (result.response.whatWeUnderstand) {
        speechParts.push(`${t.whatWeUnderstand}: ${result.response.whatWeUnderstand}`);
      }
      if (result.response.informationThatMayApply) {
        speechParts.push(`${t.informationMayApply}: ${result.response.informationThatMayApply}`);
      }
      if (result.response.whatYouMayDoNext && result.response.whatYouMayDoNext.length) {
        speechParts.push(`${t.whatYouCanDo}: ` + result.response.whatYouMayDoNext.join(". "));
      }
      if (result.response.importantLimitations) {
        speechParts.push(`${t.limitations}: ${result.response.importantLimitations}`);
      }
    }

    const textToSpeak = speechParts.join(". ");
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const voices = window.speechSynthesis.getVoices();
    let matchingVoice = null;
    
    if (lang === 'te') {
      matchingVoice = voices.find(v => v.lang.includes('te-IN')) || voices.find(v => v.lang.toLowerCase().includes('te'));
      utterance.lang = 'te-IN';
    } else if (lang === 'hi') {
      matchingVoice = voices.find(v => v.lang.includes('hi-IN')) || voices.find(v => v.lang.toLowerCase().includes('hi'));
      utterance.lang = 'hi-IN';
    } else {
      matchingVoice = voices.find(v => v.lang.includes('en-IN')) || voices.find(v => v.lang.includes('en-US')) || voices.find(v => v.lang.includes('en-GB'));
      utterance.lang = 'en-US';
    }
    
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    
    utterance.onend = () => setSpeechState('stopped');
    utterance.onerror = () => setSpeechState('stopped');
    
    setSpeechUtterance(utterance);
    setSpeechState('playing');
    window.speechSynthesis.speak(utterance);
  };

  const handlePauseSpeech = () => {
    window.speechSynthesis.pause();
    setSpeechState('paused');
  };

  const handleResumeSpeech = () => {
    window.speechSynthesis.resume();
    setSpeechState('playing');
  };

  const handleStopSpeech = () => {
    window.speechSynthesis.cancel();
    setSpeechState('stopped');
  };
  
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
        body: JSON.stringify({ text: intakeInput, lang })
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
  const executeRightsAnalysis = async (inputText, overrideLang) => {
    const textToAnalyze = inputText || rightsInput;
    if (!textToAnalyze.trim()) return;

    setRightsLoading(true);
    setRightsError('');
    setRightsResult(null);

    const targetLang = overrideLang || lang;

    try {
      const res = await fetch('/api/rights/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToAnalyze, lang: targetLang })
      });
      const data = await res.json();
      
      if (!res.ok || data.error) {
        setRightsError(data.message || 'Error analyzing rights details.');
        setRightsResult(null);
      } else {
        setRightsResult(data);
      }
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
      
      if (!res.ok || data.error) {
        setSchemeError(data.message || 'Error checking scheme eligibility.');
        setSchemeResult(null);
      } else {
        setSchemeResult(data.response);
        setSchemeStep(5);
        loadSessionHistory();
      }
      setSchemeLoading(false);
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
      
      if (!res.ok || data.error) {
        setRtiError(data.message || 'Error generating the RTI draft.');
        setRtiResult(null);
      } else {
        setRtiResult(data.response);
      }
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
      
      if (!res.ok || data.error) {
        setFormError(data.message || 'Failed to initialize form filler session.');
        setFormStatus('IDLE');
      } else {
        setFormSessionId(data.sessionId);
        setFormCurrentField(data.currentField);
        setFormProgress(data.progressPercent);
        setFormSummary([]);
      }
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
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5" role="group" aria-label="Select Language">
              <button
                onClick={() => changeLanguage('en')}
                aria-pressed={lang === 'en'}
                className={`px-2.5 py-1 text-xs font-extrabold rounded-md transition-all focus-visible:ring-2 focus-visible:ring-indigo-900 focus-visible:outline-hidden ${
                  lang === 'en' ? 'bg-indigo-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                onClick={() => changeLanguage('te')}
                aria-pressed={lang === 'te'}
                className={`px-2.5 py-1 text-xs font-extrabold rounded-md transition-all focus-visible:ring-2 focus-visible:ring-indigo-900 focus-visible:outline-hidden ${
                  lang === 'te' ? 'bg-indigo-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                తెలుగు
              </button>
              <button
                onClick={() => changeLanguage('hi')}
                aria-pressed={lang === 'hi'}
                className={`px-2.5 py-1 text-xs font-extrabold rounded-md transition-all focus-visible:ring-2 focus-visible:ring-indigo-900 focus-visible:outline-hidden ${
                  lang === 'hi' ? 'bg-indigo-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिन्दी
              </button>
            </div>

            <button
              onClick={resetDemo}
              className="px-2.5 py-1.5 bg-rose-55 hover:bg-rose-100 text-rose-700 text-xs font-black rounded-lg border border-rose-200 transition-all flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-500 cursor-pointer"
              title="Reset application to landing state"
            >
              <span>🔄 Reset</span>
            </button>

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
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center space-y-3">
                  <h1 className="text-4xl font-black text-indigo-950 tracking-tight">
                    {lang === 'te' ? 'సివిక్ యాక్షన్ ఇంజిన్' : lang === 'hi' ? 'सिविक एक्शन इंजन' : 'CIVIC ACTION ENGINE'}
                  </h1>
                  <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
                    {lang === 'te' 
                      ? "మీ పౌర సమస్యను మీ స్వంత మాటలలో వివరించండి. ఏ నిబంధనలు వర్తిస్తాయో అర్థం చేసుకోవడానికి, అందుబాటులో ఉన్న వనరులను ధృవీకరించడానికి మరియు ఆచరణాత్మక తదుపరి దశలను గుర్తించడానికి మేము మీకు సహాయం చేస్తాము."
                      : lang === 'hi'
                      ? "अपनी नागरिक समस्या का अपने शब्दों में वर्णन करें। हम आपको यह समझने में मदद करेंगे कि क्या लागू हो सकता है, उपलब्ध स्रोतों को सत्यापित करेंगे, और व्यावहारिक अगले कदमों की पहचान करेंगे।"
                      : "Describe a civic problem in your own words. We'll help you understand what may apply, verify the available sources, and identify practical next steps."}
                  </p>
                </div>

                <form onSubmit={handleIntakeSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <label htmlFor="intake-textarea" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {UI_TRANSLATIONS[lang].intakeHeader}
                    </label>
                    <textarea 
                      id="intake-textarea"
                      value={intakeInput}
                      onChange={(e) => setIntakeInput(e.target.value)}
                      placeholder={UI_TRANSLATIONS[lang].intakePlaceholder}
                      rows={4}
                      className="w-full p-4 border border-slate-300 rounded-lg text-sm focus:ring-indigo-900 focus:border-indigo-900 shadow-inner resize-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-900"
                    ></textarea>
                  </div>

                  {intakeError && (
                    <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200">
                      {intakeError}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-505">
                      {lang === 'te' ? 'సమాధానాలు ధృవీకరించబడిన మూలాలకు మ్యాప్ చేయబడతాయి.' : lang === 'hi' ? 'उत्तरों को सत्यापित स्रोतों से मैप किया गया है।' : "Answers are mapped to verified taxonomy sources."}
                    </span>
                    <button 
                      type="submit" 
                      disabled={intakeLoading || !intakeInput.trim()}
                      className="bg-indigo-900 hover:bg-opacity-95 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-xs flex items-center space-x-2 transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-900"
                    >
                      {intakeLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>{UI_TRANSLATIONS[lang].analyzing}</span>
                        </>
                      ) : (
                        <>
                          <span>{UI_TRANSLATIONS[lang].submitBtn}</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* CLICKABLE EXEMPLARS */}
                <div className="mt-8">
                  <h4 className="text-xs font-bold text-slate-550 mb-4 uppercase tracking-wider">
                    {lang === 'te' ? 'ఉదాహరణ పౌర సమస్యలు' : lang === 'hi' ? 'उदाहरण नागरिक समस्याएं' : 'Example Citizen Situations'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {EXEMPLARS[lang].map((item, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleQuickPrompt(item.text)}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 text-left hover:border-indigo-900 transition-all hover:bg-slate-50/50 focus-visible:ring-2 focus-visible:ring-indigo-900"
                      >
                        <span className="font-bold text-[10px] text-slate-400 block mb-1 uppercase">{item.tag}</span>
                        <p className="text-xs font-semibold text-slate-700">"{item.text}"</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* DIRECT WORKFLOW PATHS */}
                <div className="mt-8 border-t border-slate-200 pt-6">
                  <h4 className="text-xs font-bold text-slate-505 mb-4 text-center uppercase tracking-wider">
                    {UI_TRANSLATIONS[lang].orChoosePath}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button 
                      onClick={() => { setActiveModule('rights'); setRightsInput(''); setRightsResult(null); }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-3 rounded-lg text-xs font-bold transition-all text-center flex flex-col items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-900"
                    >
                      <Compass className="h-4 w-4 text-indigo-900" />
                      <span>{UI_TRANSLATIONS[lang].rightsNavigator}</span>
                    </button>
                    <button 
                      onClick={() => { setActiveModule('scheme'); setSchemeStep(0); setSchemeResult(null); }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-3 rounded-lg text-xs font-bold transition-all text-center flex flex-col items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-900"
                    >
                      <CheckCircle2 className="h-4 w-4 text-teal-650" />
                      <span>{UI_TRANSLATIONS[lang].schemeEligibility}</span>
                    </button>
                    <button 
                      onClick={() => { setActiveModule('rti'); setRtiInput(''); setRtiResult(null); }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-3 rounded-lg text-xs font-bold transition-all text-center flex flex-col items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-900"
                    >
                      <FileText className="h-4 w-4 text-amber-500" />
                      <span>{UI_TRANSLATIONS[lang].rtiDrafting}</span>
                    </button>
                    <button 
                      onClick={() => { setActiveModule('form'); startFormSession(); }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-3 rounded-lg text-xs font-bold transition-all text-center flex flex-col items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-900"
                    >
                      <ListTodo className="h-4 w-4 text-purple-650" />
                      <span>{UI_TRANSLATIONS[lang].formFiller}</span>
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
                    {CLARIFICATION_TRANSLATIONS[lang].header} <span className="text-teal-400 font-extrabold">{clarificationTarget.category}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 italic">
                    "{CLARIFICATION_TRANSLATIONS[lang].original} {clarificationTarget.originalQuery}"
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
                          <h4 className="text-sm font-bold text-slate-700">
                            {CLARIFICATION_TRANSLATIONS[lang].police.step1.q}
                          </h4>
                          <div className="flex flex-col gap-2">
                            {CLARIFICATION_TRANSLATIONS[lang].police.step1.opts.map((opt, idx) => (
                              <button 
                                key={idx}
                                onClick={() => handleClarificationChoice(CLARIFICATION_TRANSLATIONS.en.police.step1.opts[idx])}
                                className="w-full text-left p-3 rounded-lg border border-slate-250 hover:border-indigo-900 hover:bg-slate-50 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-900 focus-visible:outline-hidden"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {clarificationTarget.step === 2 && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-slate-700">
                            {CLARIFICATION_TRANSLATIONS[lang].police.step2.q}
                          </h4>
                          <div className="flex flex-col gap-2">
                            {CLARIFICATION_TRANSLATIONS[lang].police.step2.opts.map((opt, idx) => (
                              <button 
                                key={idx}
                                onClick={() => handleClarificationChoice(CLARIFICATION_TRANSLATIONS.en.police.step2.opts[idx])}
                                className="w-full text-left p-3 rounded-lg border border-slate-250 hover:border-indigo-900 hover:bg-slate-50 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-900 focus-visible:outline-hidden"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {clarificationTarget.step === 3 && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-slate-700">
                            {CLARIFICATION_TRANSLATIONS[lang].police.step3.q}
                          </h4>
                          <div className="flex flex-col gap-2">
                            {CLARIFICATION_TRANSLATIONS[lang].police.step3.opts.map((opt, idx) => (
                              <button 
                                key={idx}
                                onClick={() => handleClarificationChoice(CLARIFICATION_TRANSLATIONS.en.police.step3.opts[idx])}
                                className="w-full text-left p-3 rounded-lg border border-slate-250 hover:border-indigo-900 hover:bg-slate-50 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-900 focus-visible:outline-hidden"
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
                      <h4 className="text-sm font-bold text-slate-700">
                        {CLARIFICATION_TRANSLATIONS[lang].wage.step1.q}
                      </h4>
                      <div className="flex flex-col gap-2">
                        {CLARIFICATION_TRANSLATIONS[lang].wage.step1.opts.map((opt, idx) => (
                          <button 
                            key={idx}
                            onClick={() => handleClarificationChoice(CLARIFICATION_TRANSLATIONS.en.wage.step1.opts[idx])}
                            className="w-full text-left p-3 rounded-lg border border-slate-255 hover:border-indigo-900 hover:bg-slate-50 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-900 focus-visible:outline-hidden"
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
                      <h4 className="text-sm font-bold text-slate-700">
                        {CLARIFICATION_TRANSLATIONS[lang].general.step1.q}
                      </h4>
                      <div className="flex flex-col gap-2">
                        {CLARIFICATION_TRANSLATIONS[lang].general.step1.opts.map((opt, idx) => (
                          <button 
                            key={idx}
                            onClick={() => handleClarificationChoice(CLARIFICATION_TRANSLATIONS.en.general.step1.opts[idx])}
                            className="w-full text-left p-3 rounded-lg border border-slate-250 hover:border-indigo-900 hover:bg-slate-50 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-900 focus-visible:outline-hidden"
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

                  {rightsLoading && (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-4 py-16 animate-pulse">
                      <RefreshCw className="h-8 w-8 text-indigo-900 animate-spin" />
                      <div className="text-center space-y-2">
                        <h4 className="font-bold text-slate-800 text-sm">
                          {lang === 'te' ? 'విశ్లేషిస్తోంది...' : lang === 'hi' ? 'विश्लेषण किया जा रहा है...' : "Analyzing..."}
                        </h4>
                        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                          {lang === 'te' 
                            ? 'ధృవీకరించబడిన చట్టపరమైన ఆధారాలను వెతుకుతోంది మరియు కార్యాచరణ ప్రణాళికను సిద్ధం చేస్తోంది...' 
                            : lang === 'hi' 
                            ? 'सत्यापित कानूनी स्रोतों की खोज और आपकी कार्य योजना तैयार की जा रही है...' 
                            : "Finding verified sources, checking legal taxonomy, and preparing your action plan..."}
                        </p>
                      </div>
                    </div>
                  )}

                  {rightsResult && (
                    <div className="space-y-6">
                      
                      {/* SPEECH SYNTHESIS CONTROLLER BAR */}
                      <div className="bg-indigo-50 border border-indigo-150 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="h-5 w-5 text-indigo-900 animate-pulse" />
                          <div>
                            <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                              {UI_TRANSLATIONS[lang].readAloud}
                            </h4>
                            <p className="text-[10px] text-slate-500">
                              {UI_TRANSLATIONS[lang].readAloudSpeechWarning}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {speechState === 'stopped' && (
                            <button
                              onClick={() => handleReadAloud(rightsResult)}
                              className="bg-indigo-900 hover:bg-opacity-95 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-900"
                            >
                              <span>▶ {UI_TRANSLATIONS[lang].readAloud}</span>
                            </button>
                          )}
                          {speechState === 'playing' && (
                            <button
                              onClick={handlePauseSpeech}
                              className="bg-amber-600 hover:bg-opacity-95 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-600"
                            >
                              <span>⏸ {UI_TRANSLATIONS[lang].pause}</span>
                            </button>
                          )}
                          {speechState === 'paused' && (
                            <button
                              onClick={handleResumeSpeech}
                              className="bg-emerald-600 hover:bg-opacity-95 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-600"
                            >
                              <span>▶ {UI_TRANSLATIONS[lang].resume}</span>
                            </button>
                          )}
                          {speechState !== 'stopped' && (
                            <button
                              onClick={handleStopSpeech}
                              className="bg-red-650 hover:bg-opacity-95 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-650"
                            >
                              <span>⏹ {UI_TRANSLATIONS[lang].stop}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* DETECTED UNSUPPORTED / SAFE FALLBACK SCREEN (Section 9) */}
                      {rightsResult.status === 'UNSUPPORTED_FALLBACK' ? (
                        <div className="space-y-6 animate-fadeIn">
                          
                          {/* We understand card */}
                          <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200 shadow-xs space-y-4">
                            <div className="flex items-center space-x-2">
                              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
                              <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">
                                {lang === 'te' ? 'మా వద్ద ప్రస్తుతం తగినంత ధృవీకరించబడిన సమాచారం లేదు' : lang === 'hi' ? 'हमारे पास वर्तमान में पर्याप्त सत्यापित जानकारी नहीं है' : "WE DON'T HAVE ENOUGH VERIFIED INFORMATION YET"}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 leading-relaxed">
                              {lang === 'te' ? 'మేము వాస్తవాలను整理 చేయడంలో మీకు సహాయపడగలము, కానీ ప్రస్తుతానికి కేసు-నిర్దిష్ట సమాధానం ఇవ్వడానికి తగినంత ధృవీకరించబడిన వనరులు లేవు.' : lang === 'hi' ? 'हम तथ्यों को व्यवस्थित करने में आपकी सहायता कर सकते हैं, लेकिन वर्तमान में हमारे पास मामला-विशिष्ट उत्तर देने के लिए पर्याप्त सत्यापित सामग्री नहीं है।' : "We can help you organize the facts, but we don't currently have enough verified source material to provide a case-specific answer."}
                            </h3>
                            <div className="bg-amber-600 text-white font-black px-3.5 py-1.5 rounded-lg text-xs inline-block tracking-wide uppercase shadow-sm">
                              {lang === 'te' ? 'మేము ఊహించి చెప్పము.' : lang === 'hi' ? 'हम अनुमान नहीं लगाएंगे।' : "We will not guess."}
                            </div>
                          </div>

                          {/* Help checklist & Not verify */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                              <span className="bg-slate-100 text-slate-700 text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wide border border-slate-200 inline-block">
                                🤖 AI GUIDANCE
                              </span>
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{UI_TRANSLATIONS[lang].safeFallbackHelp}</h4>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {rightsResult.response.whatWeCanHelpWith}
                              </p>
                            </div>

                            <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                              <span className="bg-red-50 text-red-700 text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wide border border-red-200 inline-block">
                                ⚠️ VERIFICATION LIMIT
                              </span>
                              <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider block">{UI_TRANSLATIONS[lang].safeFallbackCannotVerify}</h4>
                              <p className="text-xs text-red-800 leading-relaxed font-semibold">
                                {rightsResult.response.whatWeCannotVerifyYet}
                              </p>
                            </div>
                          </div>

                          {/* What would help bullet checklist */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-250 shadow-xs space-y-4">
                            <h4 className="text-xs font-bold text-slate-550 uppercase tracking-wider">
                              {lang === 'te' ? 'మా పరిశోధనకు ఏ వివరాలు సహాయపడతాయి?' : lang === 'hi' ? 'हमारे शोध में क्या मदद करेगा?' : "WHAT WOULD HELP US RESEARCH?"}
                            </h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 font-semibold">
                              <li className="flex items-center space-x-2">
                                <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                                <span>{lang === 'te' ? 'ఖచ్చితంగా ఏమి జరిగింది?' : lang === 'hi' ? 'विशेष रूप से क्या हुआ?' : "What happened?"}</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                                <span>{lang === 'te' ? 'ఇది ఎక్కడ జరిగింది?' : lang === 'hi' ? 'यह कहाँ हुआ?' : "Where did this happen?"}</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                                <span>{lang === 'te' ? 'ఇది ఎప్పుడు జరిగింది?' : lang === 'hi' ? 'यह कब हुआ?' : "When did it happen?"}</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                                <span>{lang === 'te' ? 'ఏ అధికారి పాలుపంచుకున్నారు?' : lang === 'hi' ? 'कौन सा प्राधिकरण शामिल था?' : "Who was involved?"}</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                                <span>{lang === 'te' ? 'మీ వద్ద ఏ ఆధారాలు ఉన్నాయి?' : lang === 'hi' ? 'आपके पास क्या सबूत हैं?' : "What evidence do you have?"}</span>
                              </li>
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
                        <div className="space-y-6 animate-fadeIn">
                          {/* 1. What we understand */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="bg-slate-100 text-slate-700 text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wide border border-slate-200 inline-block">
                                🤖 AI EXPLANATION
                              </span>
                              <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest">
                                1. {UI_TRANSLATIONS[lang].whatWeUnderstand}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-slate-800 leading-relaxed">{rightsResult.response.whatWeUnderstand}</p>
                          </div>

                          {/* 2. Information that may apply */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="bg-slate-100 text-slate-700 text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wide border border-slate-200 inline-block">
                                🤖 AI EXPLANATION
                              </span>
                              <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest">
                                2. {UI_TRANSLATIONS[lang].informationMayApply}
                              </span>
                            </div>
                            <p className="text-sm text-slate-750 leading-relaxed">{rightsResult.response.informationThatMayApply}</p>
                          </div>

                          {/* 3. Why */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="bg-slate-100 text-slate-700 text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wide border border-slate-200 inline-block">
                                🤖 AI EXPLANATION
                              </span>
                              <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest">
                                3. {UI_TRANSLATIONS[lang].whyThisMatters}
                              </span>
                            </div>
                            <p className="text-sm text-slate-750 leading-relaxed">{rightsResult.response.why}</p>
                          </div>

                          {/* 4. What you may do next */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                            <div className="flex items-center space-x-2">
                              <span className="bg-slate-100 text-slate-700 text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wide border border-slate-200 inline-block">
                                🤖 AI EXPLANATION
                              </span>
                              <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest">
                                4. {UI_TRANSLATIONS[lang].whatYouCanDo}
                              </span>
                            </div>
                            <ul className="space-y-3">
                              {rightsResult.response.whatYouMayDoNext.map((step, idx) => (
                                <li key={idx} className="flex items-start space-x-3 text-sm text-slate-750">
                                  <span className="h-5 w-5 rounded-full bg-indigo-50 border border-slate-300 text-indigo-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">{idx + 1}</span>
                                  <span className="leading-relaxed">{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* 5. Documents that may help */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                            <div className="flex items-center space-x-2">
                              <span className="bg-slate-100 text-slate-700 text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wide border border-slate-200 inline-block">
                                🤖 AI EXPLANATION
                              </span>
                              <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest">
                                5. {UI_TRANSLATIONS[lang].evidenceTitle}
                              </span>
                            </div>
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
                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="bg-slate-100 text-slate-700 text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wide border border-slate-200 inline-block">
                                🤖 AI EXPLANATION
                              </span>
                              <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest">
                                6. {UI_TRANSLATIONS[lang].limitations}
                              </span>
                            </div>
                            <p className="text-xs text-slate-655 leading-relaxed italic">{rightsResult.response.importantLimitations}</p>
                          </div>

                          {/* Safety Disclaimer */}
                          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl flex items-start space-x-3">
                            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs leading-relaxed">{rightsResult.response.disclaimer}</p>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>

                {/* Grounding Source panel */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
                      {rightsResult ? UI_TRANSLATIONS[lang].sourcesTitle : "Supporting Sources"}
                    </h3>
                    
                    {rightsResult && rightsResult.status === 'UNSUPPORTED_FALLBACK' ? (
                      <div className="text-center py-8">
                        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                        <h4 className="text-xs font-bold text-slate-750 font-black">Fallback Mode Active</h4>
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
                                <div className="flex items-center justify-between">
                                  <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wide border border-emerald-200 inline-block">
                                    ⚖️ VERIFIED OFFICIAL SOURCE
                                  </span>
                                  <span className="bg-teal-50 text-teal-650 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-teal-100">{src.category}</span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-850 leading-snug">{src.title}</h4>
                                
                                <blockquote className="border-l-2 border-slate-350 pl-3 my-2 text-[11px] text-slate-600 leading-relaxed italic font-sans font-medium text-slate-700 bg-slate-100/50 p-2 rounded-lg">
                                  {src.content}
                                </blockquote>

                                <div className="border-t border-slate-100 pt-2 mt-2 flex justify-between items-center text-[10px] text-slate-400">
                                  <span className="truncate max-w-[150px] font-semibold">{UI_TRANSLATIONS[lang].authorityLabel}: {src.authority}</span>
                                  <a href={src.source_url || src.sourceUrl} target="_blank" rel="noreferrer" className="text-teal-650 hover:underline flex items-center space-x-0.5 font-bold">
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
