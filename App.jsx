import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, Search, Code, Server, Database, Layers, Shield, 
  Cpu, Rocket, Play, ChevronRight, X, ExternalLink, Activity, 
  MessageSquare, Copy, Check, Github, Mail, Globe, LayoutDashboard, ShoppingCart, 
  Key, Sparkles, Filter, Menu, User, Facebook, MessageCircle
} from 'lucide-react';

// --- CONSTANTS & DATA ---
const SYSTEM_PERSONA = `You are a Principal Software Architect answering for Constantine at Eulogic Studios. Your tone is authoritative, technical, and concise. You engineer full-stack systems, relational DBs, and fintech pipelines.`;

const ICON_MAP = {
  TerminalIcon, Search, Code, Server, Database, Layers, Shield, Cpu, Rocket, Play, ChevronRight, X, ExternalLink, Activity, MessageSquare, Copy, Check, Github, Mail, Globe, LayoutDashboard, ShoppingCart, Key, Sparkles, Filter, Menu, User
};

const FALLBACK_PROJECTS = [
  {
    id: "errandrun",
    name: "ErrandRun",
    category: "fintech",
    icon: Activity,
    link: "https://errandrun-1-0.vercel.app/",
    tagline: "On-demand peer-to-peer campus logistics & micro-services platform.",
    techStack: ["Next.js", "React", "Tailwind CSS", "PostgreSQL", "Prisma ORM", "Paystack API", "NextAuth"],
    highlights: [
      "Automated escrow payment pipeline utilizing Paystack Webhook events with HMAC SHA-512 cryptographic signature verification.",
      "3-tier Role-Based Access Control (RBAC) separating Students, verified Campus Runners, and System Admins.",
      "Optimistic UI state transitions with fallback handling for low-bandwidth mobile networks across campus hostels."
    ],
    lifecycle: "PENDING ➔ CLAIMED ➔ IN_PROGRESS ➔ VERIFIED ➔ SETTLED",
    entities: ["User (RUNNER | STUDENT | ADMIN)", "ErrandOrder", "EscrowTransaction", "RunnerPayoutProfile", "AuditLog"],
    aiSuggestions: ["How does Paystack webhook security work?", "Explain the escrow state machine", "How do you handle race conditions during CLAIMED state?"]
  },
  {
    id: "wof",
    name: "Word of Faith Schools Portal",
    category: "enterprise",
    icon: LayoutDashboard,
    link: "https://word-of-faith-portal-4puf.vercel.app/",
    tagline: "Institutional academic records & multi-role management portal.",
    techStack: ["Next.js", "PostgreSQL", "Supabase", "Tailwind CSS", "Prisma ORM", "Server Actions"],
    highlights: [
      "Automated gradebook computation engine handling weighted scores, CGPA calculation, and automated position ranking.",
      "Relational database schema with cascading integrity constraints preventing orphaned records across historical academic terms.",
      "4-tier permission model isolating Super Admins, Teachers, Students, and Parents."
    ],
    lifecycle: "ENROLLMENT ➔ TERM_ASSESSMENT ➔ GRADE_ENTRY ➔ AUDIT_LOCK ➔ REPORT_DISPATCH",
    entities: ["AcademicSession", "StudentProfile", "TermRecord", "SubjectGrade", "StaffAccessPolicy"],
    aiSuggestions: ["Explain the 4-tier permission model", "How do you optimize CGPA computation?", "Describe the cascading integrity constraints"]
  },
  {
    id: "demanchy",
    name: "De Manchy's Place",
    category: "ecommerce",
    icon: ShoppingCart,
    link: "https://de-manchys-place.vercel.app/",
    tagline: "Mobile-first digital food ordering application with conversational checkout routing.",
    techStack: ["Next.js", "React", "Tailwind CSS", "WhatsApp Business API", "Vercel Edge"],
    highlights: [
      "Zero-signup barrier eliminating user account drop-offs with local-storage cart persistence.",
      "Structured URI serialization formatting complex multi-item cart selections into clean, pre-filled WhatsApp Business ordering slips.",
      "Sub-second mobile load times and instant cart computation."
    ],
    lifecycle: "MENU_BROWSE ➔ CLIENT_CART_SYNC ➔ PAYLOAD_ENCODING ➔ WHATSAPP_DISPATCH",
    entities: ["MenuItemCatalog", "AddonSchema", "CartPayloadState"],
    aiSuggestions: ["How is URI serialization formatted?", "Explain the local-storage cart persistence", "Why use Vercel Edge for this?"]
  },
  {
    id: "mays",
    name: "May's Bites",
    category: "ecommerce",
    icon: ShoppingCart,
    link: "https://constantine1-web.github.io/mays-bites-/",
    tagline: "High-performance frontend showcase for local culinary enterprise.",
    techStack: ["HTML5", "CSS3", "Modern JavaScript", "Responsive UI", "GitHub Pages"],
    highlights: [
      "Zero heavy runtime dependencies guaranteeing rapid First Contentful Paint (FCP < 0.8s) on mobile cellular connections.",
      "Mobile-first responsive grid adapting from 320px screens up to 4K displays with zero layout shift."
    ],
    lifecycle: "REQUEST ➔ EDGE_CACHE_HIT ➔ SUB-SECOND_FCP ➔ DIRECT_INQUIRY",
    entities: ["StaticCatalogIndex", "StructuredRecipeMetadata"],
    aiSuggestions: ["How do you achieve FCP < 0.8s?", "Explain the responsive grid strategy"]
  }
];

const TEMPLATES = [
  "Campus P2P Delivery Marketplace with Paystack Escrow",
  "Multi-Tenant Healthcare Clinic Booking & Records Portal",
  "Conversational WhatsApp Ordering Engine for Restaurants"
];

const BENTO_CARDS = [
  {
    icon: Database,
    title: "Schema-First Data Modeling",
    description: "Robust relational foreign keys, cascading safety, and Prisma ORM ensure absolute data integrity across complex historical datasets.",
    color: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/20"
  },
  {
    icon: Shield,
    title: "Role-Based Access Control",
    description: "Strict multi-tenant route guards and permission isolation, preventing unauthorized access across overlapping user cohorts.",
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/20"
  },
  {
    icon: Activity,
    title: "Fintech & Webhook Pipelines",
    description: "Cryptographic HMAC SHA-512 signature validation and idempotent escrow settlement for flawless, secure financial transactions.",
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/20"
  }
];

// --- UTILS ---
const callGeminiAPI = async (prompt, systemInstruction, apiKey, retries = 3) => {
  if (!apiKey) throw new Error("API Key is missing. Add ?apiKey=YOUR_KEY to the URL.");
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.status === 429) {
        if (attempt === retries) throw new Error("Rate limit exceeded.");
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
        continue;
      }
      if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
};

// --- COMPONENTS ---

const ArchitectureModal = ({ project, onClose, apiKey }) => {
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const askQuestion = async (q) => {
    if (!q.trim() || loading) return;
    const newChat = [...chat, { type: 'user', text: q }];
    setChat(newChat);
    setQuestion("");
    setLoading(true);

    const context = `Context: Analyzing project '${project.name}'. Highlights: ${project.highlights.join(', ')}. Tech Stack: ${project.techStack.join(', ')}. DB Entities: ${project.entities.join(', ')}. Lifecycle: ${project.lifecycle}.`;
    const prompt = `${context}\n\nQuestion: ${q}`;

    try {
      const response = await callGeminiAPI(prompt, SYSTEM_PERSONA, apiKey);
      setChat([...newChat, { type: 'ai', text: response }]);
    } catch (error) {
      setChat([...newChat, { type: 'error', text: error.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-black/60">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#0a0f1d] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white z-10 p-2 bg-[#0d1424] rounded-full border border-gray-800">
          <X className="w-5 h-5" />
        </button>

        {/* Left: Architecture Details */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar border-b md:border-b-0 md:border-r border-gray-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-4 uppercase tracking-wider">
            {project.category} System
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">{project.name}</h2>
          <p className="text-gray-400 mb-6">{project.tagline}</p>
          {project.link && (
            <a href={project.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-[#070a11] font-semibold rounded-lg hover:bg-emerald-400 transition-colors mb-8 text-sm shadow-lg shadow-emerald-500/20">
              <ExternalLink className="w-4 h-4" /> Visit Live Site
            </a>
          )}
          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" /> State Machine & Lifecycle
              </h3>
              <div className="bg-[#0d1424] p-4 rounded-xl border border-gray-800 font-mono text-sm text-cyan-300 overflow-x-auto">
                {project.lifecycle.split(' ➔ ').map((step, i, arr) => (
                  <span key={i}>
                    {step}
                    {i < arr.length - 1 && <span className="text-gray-600 mx-2">➔</span>}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-400" /> PostgreSQL Entities
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.entities.map(ent => (
                  <span key={ent} className="px-3 py-1.5 bg-[#0d1424] border border-gray-700 rounded-lg text-sm font-mono text-gray-300">
                    {ent}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" /> Engineering Highlights
              </h3>
              <ul className="space-y-3">
                {project.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-400 text-sm">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Right: Embedded Ask Gemini */}
        <div className="w-full md:w-[400px] flex flex-col bg-[#070a11]">
          <div className="p-4 border-b border-gray-800 bg-[#0d1424] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Ask Architect AI</h3>
              <p className="text-xs text-gray-500 font-mono">Gemini 3 Flash Connected</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {chat.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400 mb-4">Select a suggestion or type your own question to analyze this system.</p>
                {project.aiSuggestions.map((sug, i) => (
                  <button 
                    key={i} 
                    onClick={() => askQuestion(sug)}
                    className="w-full text-left px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-purple-500/50 text-sm text-gray-300 transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
            {chat.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl p-3 text-sm ${
                  msg.type === 'user' ? 'bg-purple-600 text-white' : 
                  msg.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 
                  'bg-[#0d1424] border border-gray-800 text-gray-300'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#0d1424] border border-gray-800 text-purple-400 rounded-xl p-3 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" /> Analyzing architecture...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-gray-800 bg-[#0a0f1d]">
            <form onSubmit={(e) => { e.preventDefault(); askQuestion(question); }} className="relative">
              <input 
                type="text" 
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Ask about this project..."
                disabled={loading}
                className="w-full bg-[#0d1424] border border-gray-700 rounded-lg py-3 pl-4 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors"
              />
              <button 
                type="submit" 
                disabled={loading || !question.trim()}
                className="absolute right-2 top-2 p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-md disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [apiKey, setApiKey] = useState(import.meta.env?.VITE_GEMINI_API_KEY || '');
  const [history, setHistory] = useState([
    { type: 'system', text: 'Eulogic Studios Terminal v2.6. Type "help" for a list of commands.' },
    { type: 'command', text: 'whoami' },
    { type: 'response', text: 'Constantine - Principal Software Architect & Senior Frontend Engineer.\nBridging full-stack systems, relational DBs, and fintech pipelines.' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalRef = useRef(null);

  const [activeFilter, setActiveFilter] = useState('All Systems');
  const [activeModalProject, setActiveModalProject] = useState(null);

  const [scoperInput, setScoperInput] = useState('');
  const [scoperResult, setScoperResult] = useState('');
  const [scoperLoading, setScoperLoading] = useState(false);

  // --- CONTENTFUL FETCHING ---
  const [projects, setProjects] = useState([]);
  const [appStatus, setAppStatus] = useState('booting'); // 'booting' | 'ready'

  useEffect(() => {
    const fetchContentfulProjects = async () => {
      // Boilerplate for Contentful Delivery API
      const SPACE_ID = import.meta.env?.VITE_CONTENTFUL_SPACE_ID || '';
      const ACCESS_TOKEN = import.meta.env?.VITE_CONTENTFUL_ACCESS_TOKEN || '';
      
      if (!SPACE_ID || !ACCESS_TOKEN) {
        setProjects(FALLBACK_PROJECTS);
        setTimeout(() => setAppStatus('ready'), 1500); // Fake boot delay for aesthetic
        return;
      }

      try {
        const res = await fetch(`https://cdn.contentful.com/spaces/${SPACE_ID}/environments/master/entries?content_type=project`, {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
        });
        if (!res.ok) throw new Error("Contentful fetch failed");
        
        const data = await res.json();
        
        const mappedProjects = data.items.map(item => {
          const fields = item.fields;
          return {
            id: fields.id || item.sys.id,
            name: fields.name,
            category: fields.category,
            icon: ICON_MAP[fields.icon] || Activity,
            link: fields.link,
            tagline: fields.tagline,
            techStack: fields.techStack || [],
            highlights: fields.highlights || [],
            lifecycle: fields.lifecycle,
            entities: fields.entities || [],
            aiSuggestions: fields.aiSuggestions || []
          };
        });
        setProjects(mappedProjects);
      } catch (err) {
        console.error("Failed fetching Contentful projects:", err);
        setProjects(FALLBACK_PROJECTS);
      } finally {
        setTimeout(() => setAppStatus('ready'), 800);
      }
    };
    
    fetchContentfulProjects();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('apiKey');
    if (key) setApiKey(key);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const processTerminalCommand = async (cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    
    setHistory(prev => [...prev, { type: 'command', text: trimmed }]);
    const lowerCmd = trimmed.toLowerCase();
    
    if (lowerCmd === 'clear') { setHistory([]); return; }
    if (lowerCmd === 'whoami') {
      setHistory(prev => [...prev, { type: 'response', text: 'Constantine - Principal Software Architect & Senior Frontend Engineer.\nAvailable for software engineering & architecture contracts.' }]);
      return;
    }
    if (lowerCmd === 'status') {
      setHistory(prev => [...prev, { type: 'response', text: 'System Health: 100% Operational.\nAvailability: OPEN for new projects.' }]);
      return;
    }
    if (lowerCmd === 'contact') {
      setHistory(prev => [...prev, { type: 'response', text: 'Email: contact@eulogiastudios.com\nGitHub: github.com/eulogiastudios' }]);
      return;
    }
    if (lowerCmd === 'stack' || lowerCmd === 'cat stack.json') {
      setHistory(prev => [...prev, { type: 'response', text: '{\n  "frontend": ["React", "Next.js", "Tailwind CSS"],\n  "backend": ["Node.js", "PostgreSQL", "Supabase", "Prisma"],\n  "integrations": ["Paystack", "WhatsApp Business", "NextAuth"]\n}' }]);
      return;
    }
    if (lowerCmd === 'projects' || lowerCmd === 'ls -la projects') {
      const output = projects.map(p => `drwxr-xr-x 2 constantine staff 4096 ${p.name.replace(/ /g, '')}`).join('\n');
      setHistory(prev => [...prev, { type: 'response', text: output }]);
      return;
    }
    if (lowerCmd.startsWith('ai ') || lowerCmd.startsWith('ask ')) {
      const prompt = trimmed.substring(trimmed.indexOf(' ') + 1);
      const tempId = Date.now();
      setHistory(prev => [...prev, { type: 'ai-loading', text: 'Querying Gemini 1.5 Flash...', id: tempId }]);
      try {
        const response = await callGeminiAPI(prompt, SYSTEM_PERSONA, apiKey);
        setHistory(prev => prev.map(h => h.id === tempId ? { type: 'ai', text: response } : h));
      } catch (err) {
        setHistory(prev => prev.map(h => h.id === tempId ? { type: 'error', text: err.message } : h));
      }
      return;
    }
    
    setHistory(prev => [...prev, { type: 'error', text: `command not found: ${trimmed}. Type 'whoami', 'stack', 'projects', 'ai <prompt>', or 'clear'.` }]);
  };

  const copyHistory = () => {
    const text = history.map(h => {
      if (h.type === 'command') return `> ${h.text}`;
      return h.text;
    }).join('\n');
    navigator.clipboard.writeText(text);
  };

  const filteredProjects = activeFilter === 'All Systems' 
    ? projects 
    : projects.filter(p => {
        if (activeFilter === 'Platforms & Fintech') return p.category === 'fintech';
        if (activeFilter === 'Enterprise Portals') return p.category === 'enterprise';
        if (activeFilter === 'E-Commerce') return p.category === 'ecommerce';
        return true;
      });

  const generateTechSpec = async () => {
    if (!scoperInput.trim() || scoperLoading) return;
    setScoperLoading(true);
    setScoperResult('');
    
    const prompt = `You are a Principal Software Architect at Eulogic Studios. A potential client wants to build the following project:
"${scoperInput}"

Generate a high-level, impressive 4-part architectural blueprint that demonstrates expertise, but DO NOT give them every single detail needed to build it themselves. The goal is to impress them so they hire you. Keep the 'secret sauce' hidden. 
Make sure you emphasize that they need an expert architect to pull this off securely and efficiently. All roads must lead back to hiring you.

Required sections:
1. High-Level Architecture Strategy (Impressive but high-level).
2. Core Database Entities (Give a taste of the complexity).
3. Critical Edge Cases (Highlight severe risks if they don't hire an expert).
4. Estimated Timeline & Next Steps (Call to action to contact Eulogic Studios).

Format the output cleanly in Markdown.`;

    try {
      const result = await callGeminiAPI(prompt, SYSTEM_PERSONA, apiKey);
      setScoperResult(result);
    } catch (err) {
      setScoperResult(`Error: ${err.message}`);
    } finally {
      setScoperLoading(false);
    }
  };

  if (appStatus === 'booting') {
    return (
      <div className="min-h-screen bg-[#070a11] flex flex-col items-center justify-center font-mono relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-[#070a11] to-[#070a11]"></div>
        <div className="flex items-center gap-4 z-10">
          <TerminalIcon className="w-8 h-8 text-emerald-500 animate-pulse" />
          <span className="text-emerald-400 text-xl font-bold tracking-widest">EULOGIC.STUDIOS</span>
        </div>
        <div className="text-gray-500 mt-4 text-sm z-10 flex items-center gap-2">
          Syncing Contentful datasets... <Sparkles className="w-4 h-4 text-purple-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a11] text-gray-300 font-sans selection:bg-emerald-500/30 relative">
      {/* Background radial gradient */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-[#070a11] to-[#070a11]"></div>
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#070a11]/80 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center">
              <TerminalIcon className="w-5 h-5 text-[#070a11]" />
            </div>
            <span className="font-mono font-bold text-white tracking-wider">EULOGIC.STUDIOS</span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">v2.6</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <a href="#hero" className="hover:text-emerald-400 transition-colors">Home</a>
            <a href="#systems" className="hover:text-cyan-400 transition-colors">Systems</a>
            <a href="#capabilities" className="hover:text-purple-400 transition-colors">Architecture</a>
            <a href="#ai-scoper" className="hover:text-emerald-400 transition-colors">AI Scoper</a>
          </div>
          <div className="flex gap-4 items-center">
            <a href="#contact" className="hidden sm:flex px-4 py-2 bg-white hover:bg-gray-200 text-[#070a11] font-semibold rounded text-sm transition-colors items-center gap-2">
              <Mail className="w-4 h-4" /> Connect
            </a>
            <button className="md:hidden text-gray-400"><Menu className="w-6 h-6"/></button>
          </div>
        </div>
      </nav>

      {/* Hero & Terminal */}
      <section id="hero" className="relative pt-20 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div className="z-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-8">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Available for software engineering contracts
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
            Architecting <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500">Resilient Digital Systems.</span>
          </h1>
          <p className="text-lg text-gray-400 mb-10 max-w-xl leading-relaxed">
            Full-stack engineer and systems architect specializing in production Next.js applications, high-integrity PostgreSQL schemas, and secure Fintech payment pipelines. Turning complex domain logic into fast, resilient software.
          </p>
          <div className="flex flex-wrap gap-4 mb-12">
            <a href="#systems" className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-[#070a11] font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20">
              Explore Systems <ChevronRight className="w-4 h-4"/>
            </a>
            <a href="#ai-scoper" className="px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors border border-gray-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Initiate Project Scope
            </a>
          </div>
          <div className="flex flex-wrap gap-6 text-sm font-mono text-gray-400">
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 3+ RBAC Portals</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> 100% Serverless</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Paystack Escrow Integration</div>
          </div>
        </div>
        
        {/* Logo Section */}
        <div className="z-10 flex justify-center lg:justify-end relative">
          {/* Radial glow backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.08)_0%,_transparent_70%)] pointer-events-none"></div>
          <img
            src="/logo.png"
            alt="Eulogic Studios Logo"
            className="logo-animate logo-enter w-full max-w-sm lg:max-w-md object-contain cursor-pointer"
          />
        </div>
      </section>

      {/* Capabilities / Bento Grid */}
      <section id="capabilities" className="py-24 bg-gradient-to-b from-[#0a0f1d] to-[#0d1424] border-y border-gray-800 relative overflow-hidden">
        {/* Subtle grid pattern or glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Core Architectural Pillars</h2>
            <p className="text-gray-400">Engineering principles that guarantee performance, security, and absolute reliability across all production systems.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {BENTO_CARDS.map((card, i) => (
              <div key={i} className={`p-8 rounded-2xl bg-[#0f172a]/60 bg-gradient-to-br ${card.color} border ${card.border} backdrop-blur-md shadow-xl transition-all hover:scale-[1.02] duration-300 hover:shadow-2xl`}>
                <div className="w-12 h-12 rounded-xl bg-[#1e293b]/80 border border-gray-700 flex items-center justify-center mb-6 shadow-inner">
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{card.title}</h3>
                <p className="text-gray-300 leading-relaxed text-sm">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Systems Grid */}
      <section id="systems" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Verified Production Systems</h2>
              <p className="text-gray-400 max-w-2xl">A roster of deployed platforms showcasing complex state management, secure payment pipelines, and multi-tenant architectures.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['All Systems', 'Platforms & Fintech', 'Enterprise Portals', 'E-Commerce'].map(filter => (
                <button 
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === filter ? 'bg-white text-[#070a11]' : 'bg-[#0a0f1d] text-gray-400 border border-gray-800 hover:border-gray-600'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {filteredProjects.map(project => (
              <div key={project.id} className="group rounded-2xl bg-[#0a0f1d] border border-gray-800 overflow-hidden hover:border-gray-600 transition-colors flex flex-col h-full">
                <div className="p-8 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#070a11] border border-gray-800 flex items-center justify-center text-cyan-400">
                      <project.icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-gray-400 text-xs font-mono uppercase tracking-wider">
                      {project.category}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">{project.name}</h3>
                  <p className="text-gray-400 mb-6 min-h-[48px]">{project.tagline}</p>
                  
                  <div className="space-y-3 mb-8">
                    {project.highlights.slice(0, 2).map((h, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{h}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.techStack.map(tech => (
                      <span key={tech} className="px-2.5 py-1 rounded-md bg-[#0d1424] border border-gray-800 text-xs font-mono text-gray-400">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-4 border-t border-gray-800 bg-[#070a11] flex justify-between items-center">
                  {project.link ? (
                    <a href={project.link} target="_blank" rel="noreferrer" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                      <ExternalLink className="w-4 h-4" /> Live
                    </a>
                  ) : <div />}
                  <button 
                    onClick={() => setActiveModalProject(project)}
                    className="flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Inspect Architecture Deep Dive <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Scoper */}
      <section id="ai-scoper" className="py-24 bg-gradient-to-b from-[#070a11] to-[#0a0f1d] border-y border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono mb-4">
              <Sparkles className="w-3 h-3" /> Powered by Gemini 1.5 Flash
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">AI Project Scoper & Tech Spec Generator</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Describe your business problem, and I'll generate a comprehensive architectural blueprint, relational schema, and phased timeline.</p>
          </div>

          <div className="bg-[#0f172a]/50 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="p-6 md:p-8 border-b border-gray-800">
              <div className="mb-6 flex flex-wrap gap-2">
                <span className="text-sm text-gray-400 mr-2 self-center font-medium">Presets:</span>
                {TEMPLATES.map((tmpl, i) => (
                  <button 
                    key={i} 
                    onClick={() => setScoperInput(tmpl)}
                    className="px-3 py-1.5 rounded bg-[#1e293b] border border-gray-700 text-xs text-gray-300 hover:border-purple-500/50 hover:bg-[#334155] transition-colors"
                  >
                    {tmpl}
                  </button>
                ))}
              </div>
              <textarea 
                value={scoperInput}
                onChange={e => setScoperInput(e.target.value)}
                placeholder="Describe your project requirements, target audience, and key features..."
                className="w-full h-40 bg-[#070a11]/80 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none custom-scrollbar mb-6"
              />
              <div className="flex justify-between items-center flex-wrap gap-4">
                {!apiKey && (
                  <div className="text-xs text-red-400 flex items-center gap-1">
                    <Key className="w-4 h-4"/> API Key missing in URL
                  </div>
                )}
                <button 
                  onClick={generateTechSpec}
                  disabled={!scoperInput.trim() || scoperLoading}
                  className="ml-auto px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg shadow-purple-500/20"
                >
                  {scoperLoading ? <Sparkles className="w-5 h-5 animate-spin" /> : <Layers className="w-5 h-5" />}
                  {scoperLoading ? 'Generating Blueprint...' : 'Generate Tech Spec'}
                </button>
              </div>
            </div>
            
            {scoperResult && (
              <div className="p-6 md:p-8 bg-[#1e293b]/30">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h3 className="text-lg font-semibold text-white">Generated Architecture Blueprint</h3>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => navigator.clipboard.writeText(scoperResult)}
                      className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors px-3 py-1.5 border border-gray-700 rounded bg-[#070a11]"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                    <a 
                      href={`https://wa.me/2347044732970?text=${encodeURIComponent("Hey Constantine, I just generated this project outline on your portfolio. Let's discuss it!\n\n" + scoperResult)}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-1.5 border border-emerald-500/30 rounded bg-emerald-500/10"
                    >
                      <MessageCircle className="w-3 h-3" /> WhatsApp Me
                    </a>
                    <a 
                      href="https://m.me/61582485633812"
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 border border-blue-500/30 rounded bg-blue-500/10"
                      onClick={() => navigator.clipboard.writeText(scoperResult)}
                      title="Copies blueprint to clipboard and opens Messenger"
                    >
                      <Facebook className="w-3 h-3" /> Facebook Me
                    </a>
                  </div>
                </div>
                <div className="prose prose-invert prose-purple max-w-none text-gray-300 text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                  {scoperResult}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer / Contact Hub */}
      <footer id="contact" className="py-16 bg-gradient-to-b from-[#0a0f1d] to-[#0f172a] border-t border-gray-800 text-center relative overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-bold text-white mb-8">Ready to architect your next platform?</h2>
          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=eulogicstudiosltd@gmail.com" target="_blank" rel="noreferrer" className="px-6 py-3 bg-white text-[#0f172a] font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/10">
              <Mail className="w-4 h-4" /> eulogicstudiosltd@gmail.com
            </a>
            <a href="https://wa.me/2347044732970" target="_blank" rel="noreferrer" className="px-6 py-3 bg-[#1e293b] text-white border border-gray-600 font-semibold rounded-lg hover:bg-[#334155] transition-colors flex items-center gap-2 shadow-lg">
              <MessageCircle className="w-4 h-4 text-emerald-400" /> WhatsApp
            </a>
          </div>
          <div className="flex justify-center items-center gap-8 text-gray-400 text-sm mb-8 font-medium flex-wrap">
            <a href="https://github.com/Constantine1-web" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-2"><Github className="w-5 h-5"/> GitHub</a>
            <a href="https://www.facebook.com/profile.php?id=61582485633812" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-2"><Facebook className="w-5 h-5"/> Facebook</a>
            <a href="https://eulogic.studios" className="hover:text-emerald-400 transition-colors flex items-center gap-2"><Globe className="w-5 h-5"/> eulogic.studios</a>
          </div>
          <p className="text-sm text-gray-500 font-mono max-w-md mx-auto leading-relaxed border-t border-gray-800/50 pt-8">
            &copy; {new Date().getFullYear()} Eulogic Studios. All rights reserved. <br/>
            Engineered with React, Tailwind CSS & Gemini API.
          </p>
        </div>
      </footer>

      {/* Modal Render */}
      {activeModalProject && (
        <ArchitectureModal 
          project={activeModalProject} 
          onClose={() => setActiveModalProject(null)} 
          apiKey={apiKey}
        />
      )}
      
      {/* Global CSS overrides for custom scrollbars */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(13, 20, 36, 0.5); 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.4); 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.8); 
        }
      `}} />

      {/* Logo animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
        @keyframes glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(16,185,129,0.15)) drop-shadow(0 0 60px rgba(16,185,129,0.05)); }
          50% { filter: drop-shadow(0 0 40px rgba(16,185,129,0.45)) drop-shadow(0 0 100px rgba(6,182,212,0.2)); }
        }
        @keyframes rotate-slow {
          0% { transform: rotate(-1deg) translateY(0px); }
          25% { transform: rotate(0.5deg) translateY(-10px); }
          50% { transform: rotate(1deg) translateY(-18px); }
          75% { transform: rotate(0.5deg) translateY(-10px); }
          100% { transform: rotate(-1deg) translateY(0px); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0px) scale(1); }
        }
        .logo-animate {
          animation: rotate-slow 6s ease-in-out infinite, glow-pulse 4s ease-in-out infinite;
          animation-delay: 0s, 0.5s;
        }
        .logo-animate:hover {
          animation: glow-pulse 1s ease-in-out infinite;
          transform: scale(1.06);
          transition: transform 0.4s ease;
        }
        .logo-enter {
          animation: fade-in-up 1s ease-out forwards;
        }
      `}} />
    </div>
  );
}
