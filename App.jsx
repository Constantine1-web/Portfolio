import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, Search, Code, Server, Database, Layers, Shield, 
  Cpu, Rocket, Play, ChevronRight, X, ExternalLink, Activity, 
  MessageSquare, Copy, Check, Github, Mail, Globe, LayoutDashboard, ShoppingCart, 
  Key, Sparkles, Filter, Menu, User, Facebook, MessageCircle, PenTool, Coffee
} from 'lucide-react';

// --- CONSTANTS & DATA ---
const SYSTEM_PERSONA = `You are a Principal Software Architect answering for Constantine at Eulogic Studios. Your tone is authoritative, technical, and concise. You engineer full-stack systems, relational DBs, and fintech pipelines.`;

const ICON_MAP = {
  TerminalIcon, Search, Code, Server, Database, Layers, Shield, Cpu, Rocket, Play, ChevronRight, X, ExternalLink, Activity, MessageSquare, Copy, Check, Github, Mail, Globe, LayoutDashboard, ShoppingCart, Key, Sparkles, Filter, Menu, User, PenTool, Coffee
};

const FALLBACK_PROJECTS = [
  {
    id: "errandrun",
    name: "ErrandRun",
    category: "Fintech & Logistics",
    icon: Activity,
    link: "https://errandrun-1-0.vercel.app/",
    tagline: "On-demand peer-to-peer campus logistics & micro-services platform.",
    techStack: ["Next.js", "React", "Tailwind", "PostgreSQL", "Prisma", "Paystack"],
    highlights: [
      "Automated escrow payment pipeline utilizing Paystack Webhook events.",
      "3-tier Role-Based Access Control (RBAC) separating Students, Runners, and Admins.",
      "Optimistic UI state transitions for low-bandwidth mobile networks."
    ],
    lifecycle: "PENDING ➔ CLAIMED ➔ IN_PROGRESS ➔ VERIFIED ➔ SETTLED",
    entities: ["User", "ErrandOrder", "EscrowTransaction", "RunnerPayoutProfile", "AuditLog"],
    aiSuggestions: ["How does Paystack webhook security work?", "Explain the escrow state machine", "How do you handle race conditions during CLAIMED state?"]
  },
  {
    id: "wof",
    name: "Word of Faith Portal",
    category: "Enterprise Software",
    icon: LayoutDashboard,
    link: "https://word-of-faith-portal-4puf.vercel.app/",
    tagline: "Institutional academic records & multi-role management portal.",
    techStack: ["Next.js", "PostgreSQL", "Supabase", "Tailwind", "Prisma"],
    highlights: [
      "Automated gradebook computation engine handling weighted scores.",
      "Relational database schema with cascading integrity constraints.",
      "4-tier permission model isolating Super Admins, Teachers, Students, and Parents."
    ],
    lifecycle: "ENROLLMENT ➔ TERM_ASSESSMENT ➔ GRADE_ENTRY ➔ AUDIT_LOCK ➔ REPORT_DISPATCH",
    entities: ["AcademicSession", "StudentProfile", "TermRecord", "SubjectGrade", "StaffAccessPolicy"],
    aiSuggestions: ["Explain the 4-tier permission model", "How do you optimize CGPA computation?", "Describe the cascading integrity constraints"]
  },
  {
    id: "demanchy",
    name: "De Manchy's Place",
    category: "E-Commerce",
    icon: ShoppingCart,
    link: "https://de-manchys-place.vercel.app/",
    tagline: "Mobile-first digital food ordering application with conversational checkout routing.",
    techStack: ["Next.js", "React", "Tailwind", "WhatsApp API", "Vercel Edge"],
    highlights: [
      "Zero-signup barrier eliminating user account drop-offs.",
      "Structured URI serialization formatting complex cart selections into WhatsApp slips.",
      "Sub-second mobile load times and instant cart computation."
    ],
    lifecycle: "MENU_BROWSE ➔ CLIENT_CART_SYNC ➔ PAYLOAD_ENCODING ➔ WHATSAPP_DISPATCH",
    entities: ["MenuItemCatalog", "AddonSchema", "CartPayloadState"],
    aiSuggestions: ["How is URI serialization formatted?", "Explain the local-storage cart persistence"]
  },
  {
    id: "mays",
    name: "May's Bites",
    category: "E-Commerce",
    icon: Coffee,
    link: "https://constantine1-web.github.io/mays-bites-/",
    tagline: "High-performance frontend showcase for local culinary enterprise.",
    techStack: ["HTML5", "CSS3", "JavaScript", "GitHub Pages"],
    highlights: [
      "Zero heavy runtime dependencies guaranteeing rapid First Contentful Paint.",
      "Mobile-first responsive grid adapting up to 4K displays with zero layout shift."
    ],
    lifecycle: "REQUEST ➔ EDGE_CACHE_HIT ➔ SUB-SECOND_FCP ➔ DIRECT_INQUIRY",
    entities: ["StaticCatalogIndex", "StructuredRecipeMetadata"],
    aiSuggestions: ["How do you achieve FCP < 0.8s?", "Explain the responsive grid strategy"]
  }
];

const TEMPLATES = [
  "Campus P2P Delivery Marketplace with Paystack",
  "Multi-Tenant Healthcare Clinic Booking Portal",
  "Conversational WhatsApp Ordering Engine"
];

const BENTO_CARDS = [
  {
    icon: Database,
    title: "Schema-First Data Modeling",
    description: "Robust relational foreign keys, cascading safety, and Prisma ORM ensure absolute data integrity across complex historical datasets.",
    color: "bg-sage"
  },
  {
    icon: Shield,
    title: "Role-Based Access Control",
    description: "Strict multi-tenant route guards and permission isolation, preventing unauthorized access across overlapping user cohorts.",
    color: "bg-mustard text-ink"
  },
  {
    icon: Activity,
    title: "Fintech & Webhook Pipelines",
    description: "Cryptographic HMAC SHA-512 signature validation and idempotent escrow settlement for flawless, secure financial transactions.",
    color: "bg-coral text-white"
  }
];

// --- SVGs for Hand-Drawn aesthetic ---
const TapeSVG = ({ className }) => (
  <svg className={className} viewBox="0 0 100 30" preserveAspectRatio="none" fill="currentColor">
    <path d="M0 5 Q 5 0, 10 5 T 20 2 T 30 5 T 40 2 T 50 6 T 60 2 T 70 5 T 80 1 T 90 4 T 100 2 L 100 28 Q 95 30, 90 28 T 80 30 T 70 27 T 60 30 T 50 27 T 40 30 T 30 27 T 20 29 T 10 26 T 0 29 Z" />
  </svg>
);

const ScribbleUnderline = ({ className }) => (
  <svg className={className} viewBox="0 0 200 20" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <path d="M5 15 Q 50 5, 100 12 T 195 10" />
  </svg>
);

// --- UTILS ---
const callGeminiAPI = async (prompt, systemInstruction, apiKey, retries = 3) => {
  if (!apiKey) throw new Error("API Key is missing. Add VITE_GEMINI_API_KEY to your environment variables.");
  
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-ink/40">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-paper border-4 border-ink rough-border shadow-drawn-lg overflow-hidden flex flex-col md:flex-row bg-paper-texture">
        {/* Tape decoration */}
        <TapeSVG className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 text-mustard z-20 drop-shadow-md rotate-2" />
        
        <button onClick={onClose} className="absolute top-4 right-4 text-ink hover:text-rust z-10 p-2 bg-white rounded-full border-2 border-ink shadow-drawn transition-transform hover:-translate-y-1">
          <X className="w-5 h-5" />
        </button>

        {/* Left: Architecture Details */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 border-b-4 md:border-b-0 md:border-r-4 border-ink">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-mustard border-2 border-ink text-ink font-handwriting text-lg font-bold mb-6 rotate-[-2deg] shadow-drawn">
            {project.category}
          </div>
          <h2 className="text-4xl font-display font-bold text-ink mb-2">{project.name}</h2>
          <p className="text-ink/70 font-semibold mb-6">{project.tagline}</p>
          
          {project.link && (
            <a href={project.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-rust text-white font-bold rounded-lg border-2 border-ink hover:bg-rust/90 transition-transform shadow-drawn hover:translate-x-1 hover:translate-y-1 hover:shadow-none mb-8 text-sm">
              <ExternalLink className="w-4 h-4" /> Visit Live Site
            </a>
          )}
          
          <div className="space-y-8 font-sans">
            <section>
              <h3 className="text-xl font-display font-bold text-ink mb-4 flex items-center gap-2">
                <Layers className="w-6 h-6 text-rust" /> State Machine & Lifecycle
              </h3>
              <div className="bg-white p-4 rounded-xl border-2 border-ink shadow-drawn text-sm text-ink/80 font-mono">
                {project.lifecycle.split(' ➔ ').map((step, i, arr) => (
                  <span key={i}>
                    {step}
                    {i < arr.length - 1 && <span className="text-mustard mx-2 font-bold text-lg">➔</span>}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xl font-display font-bold text-ink mb-4 flex items-center gap-2">
                <Database className="w-6 h-6 text-coral" /> PostgreSQL Entities
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.entities.map(ent => (
                  <span key={ent} className="px-3 py-1 bg-sage border-2 border-ink rounded font-handwriting text-lg text-ink shadow-drawn">
                    {ent}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xl font-display font-bold text-ink mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-rust" /> Engineering Highlights
              </h3>
              <ul className="space-y-3">
                {project.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-ink/80 font-medium text-sm">
                    <Check className="w-5 h-5 text-mustard shrink-0 stroke-[3px]" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Right: Embedded Ask Gemini */}
        <div className="w-full md:w-[450px] flex flex-col bg-white">
          <div className="p-5 border-b-4 border-ink bg-sage flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-ink flex items-center justify-center shadow-drawn">
              <PenTool className="w-5 h-5 text-ink" />
            </div>
            <div>
              <h3 className="text-xl font-handwriting font-bold text-ink">Architect's Notepad</h3>
              <p className="text-sm text-ink/60 font-sans font-semibold">Gemini AI Connected</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-paper-texture">
            {chat.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm font-bold text-ink/70 mb-4">Select a question or ask anything about this system's architecture.</p>
                {project.aiSuggestions.map((sug, i) => (
                  <button 
                    key={i} 
                    onClick={() => askQuestion(sug)}
                    className="w-full text-left px-4 py-3 rounded bg-white border-2 border-ink shadow-drawn hover:-translate-y-1 transition-transform text-sm font-semibold text-ink"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
            {chat.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-3 text-sm font-semibold border-2 border-ink shadow-drawn ${
                  msg.type === 'user' ? 'bg-mustard text-ink' : 
                  msg.type === 'error' ? 'bg-red-200 text-red-900' : 
                  'bg-white text-ink'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border-2 border-ink shadow-drawn rounded-lg p-3 text-sm font-bold text-ink flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-mustard" /> Drafting response...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t-4 border-ink bg-white">
            <form onSubmit={(e) => { e.preventDefault(); askQuestion(question); }} className="relative">
              <input 
                type="text" 
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Jot down a question..."
                disabled={loading}
                className="w-full bg-paper border-2 border-ink rounded py-3 pl-4 pr-12 font-handwriting text-xl text-ink placeholder-ink/40 focus:outline-none focus:bg-white shadow-drawn disabled:opacity-50 transition-colors"
              />
              <button 
                type="submit" 
                disabled={loading || !question.trim()}
                className="absolute right-2 top-2 p-2 bg-rust hover:bg-rust/90 text-white rounded disabled:opacity-50 transition-colors border-2 border-ink"
              >
                <ChevronRight className="w-5 h-5" />
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
  const [activeModalProject, setActiveModalProject] = useState(null);

  const [scoperInput, setScoperInput] = useState('');
  const [scoperResult, setScoperResult] = useState('');
  const [scoperLoading, setScoperLoading] = useState(false);

  const [projects, setProjects] = useState([]);
  const [appStatus, setAppStatus] = useState('booting'); 
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchContentfulProjects = async () => {
      const SPACE_ID = import.meta.env?.VITE_CONTENTFUL_SPACE_ID || '';
      const ACCESS_TOKEN = import.meta.env?.VITE_CONTENTFUL_ACCESS_TOKEN || '';
      
      if (!SPACE_ID || !ACCESS_TOKEN) {
        setProjects(FALLBACK_PROJECTS);
        setTimeout(() => setAppStatus('ready'), 800);
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
        setProjects(mappedProjects.length ? mappedProjects : FALLBACK_PROJECTS);
      } catch (err) {
        console.error("Failed fetching Contentful projects:", err);
        setProjects(FALLBACK_PROJECTS);
      } finally {
        setTimeout(() => setAppStatus('ready'), 800);
      }
    };
    
    fetchContentfulProjects();
  }, []);

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
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center relative overflow-hidden bg-paper-texture">
        <div className="flex flex-col items-center gap-6 z-10 p-12 bg-white border-4 border-ink shadow-drawn-lg rough-border rotate-2">
          <TerminalIcon className="w-12 h-12 text-rust animate-bounce" strokeWidth={3} />
          <span className="text-ink text-4xl font-display font-black tracking-widest">EULOGIC<br/>STUDIOS</span>
          <div className="text-ink/60 font-handwriting text-2xl mt-4 flex items-center gap-2">
            Sketching blueprints... <PenTool className="w-5 h-5 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-mustard selection:text-ink relative overflow-x-hidden pb-12">
      
      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-40 bg-paper/95 border-b-4 border-ink backdrop-blur-sm pt-4 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between relative">
          <a href="#" className="relative inline-flex items-center gap-3 group">
            <div className="w-12 h-12 bg-rust border-2 border-ink rounded-lg flex items-center justify-center shadow-drawn group-hover:translate-y-1 transition-transform">
              <TerminalIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-2xl text-ink leading-none">Edidiong.</span>
              <span className="font-handwriting text-rust text-lg leading-none mt-1">Eulogic Studios</span>
            </div>
          </a>

          <div className="hidden md:flex gap-10 text-lg font-bold font-sans items-center mt-2">
            <a href="#hero" className="hover:text-rust transition-colors relative group">
              Home
              <ScribbleUnderline className="absolute -bottom-2 left-0 w-full h-3 text-mustard opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href="#systems" className="hover:text-rust transition-colors relative group">
              Systems
              <ScribbleUnderline className="absolute -bottom-2 left-0 w-full h-3 text-mustard opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href="#capabilities" className="hover:text-rust transition-colors relative group">
              Capabilities
              <ScribbleUnderline className="absolute -bottom-2 left-0 w-full h-3 text-mustard opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>

          <div className="flex gap-4 items-center">
            {/* User mentioned: "Will have to link a calendy account for this 'Book a call' section to work for me." So using a placeholder link for now */}
            <a href="https://calendly.com/edidiongakpan1420/30min" target="_blank" rel="noreferrer" className="hidden sm:flex relative items-center justify-center px-6 py-2.5 font-display font-bold text-lg bg-mustard text-ink border-2 border-ink hover:bg-amber-400 transition-colors shadow-drawn">
              Book A Call
              <TapeSVG className="absolute -top-3 -left-4 w-12 h-6 text-coral opacity-80 -rotate-12" />
              <TapeSVG className="absolute -bottom-3 -right-4 w-12 h-6 text-coral opacity-80 rotate-12" />
            </a>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-ink">
              {menuOpen ? <X className="w-8 h-8"/> : <Menu className="w-8 h-8"/>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-paper pt-32 px-6 flex flex-col gap-8">
          <a href="#hero" onClick={() => setMenuOpen(false)} className="text-4xl font-display font-black text-ink">Home</a>
          <a href="#systems" onClick={() => setMenuOpen(false)} className="text-4xl font-display font-black text-ink">Systems</a>
          <a href="#capabilities" onClick={() => setMenuOpen(false)} className="text-4xl font-display font-black text-ink">Capabilities</a>
          <a href="https://calendly.com/edidiongakpan1420/30min" target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)} className="mt-8 text-2xl font-handwriting bg-mustard px-6 py-4 border-4 border-ink shadow-drawn text-center w-fit">
            Book A Call (Calendly)
          </a>
        </div>
      )}

      {/* Hero Section */}
      <section id="hero" className="pt-32 md:pt-48 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
        <div className="relative order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sage border-2 border-ink text-ink font-handwriting text-xl font-bold mb-8 shadow-drawn rotate-[-2deg]">
            Available for software engineering contracts <PenTool className="w-4 h-4"/>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black text-ink leading-[1.1] mb-6">
            Architecting <br/>
            <span className="relative inline-block mt-2 text-rust">
              Resilient Systems.
              <ScribbleUnderline className="absolute -bottom-4 left-0 w-full h-6 text-mustard" />
            </span>
          </h1>
          <p className="text-lg md:text-xl font-bold font-sans text-ink/80 mb-10 max-w-xl leading-relaxed mt-8">
            Full-stack engineer and systems architect specializing in production Next.js applications, high-integrity PostgreSQL schemas, and secure Fintech pipelines. Turning complex logic into fast, resilient software.
          </p>
          <div className="flex flex-wrap gap-6 font-display font-bold">
            <a href="#systems" className="px-8 py-4 bg-ink text-white rounded-lg border-2 border-ink hover:bg-ink/90 transition-transform shadow-drawn hover:translate-x-1 hover:translate-y-1 hover:shadow-none text-lg">
              View My Work
            </a>
            <a href="#ai-scoper" className="px-8 py-4 bg-white text-ink rounded-lg border-2 border-ink hover:bg-gray-50 transition-transform shadow-drawn hover:translate-x-1 hover:translate-y-1 hover:shadow-none text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-mustard" /> Project Scoper
            </a>
          </div>
        </div>

        {/* Logo / Image Frame */}
        <div className="relative order-1 lg:order-2 flex justify-center">
          <div className="relative bg-white p-6 pb-16 border-2 border-ink shadow-drawn-lg w-full max-w-md rotate-3 transition-transform hover:rotate-1">
            <TapeSVG className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 text-sage z-10" />
            {/* Profile Image */}
            <div className="bg-paper border-2 border-ink w-full aspect-[4/5] flex items-center justify-center p-2 mb-10">
               <img src="/profile.png" alt="Edidiong Akpan Profile" className="w-full h-full object-cover grayscale-[20%] contrast-125" />
            </div>
            <div className="absolute bottom-4 w-full left-0 text-center flex flex-col items-center">
              <p className="font-handwriting text-3xl text-ink font-bold leading-none">Edidiong Akpan</p>
              <p className="font-sans text-xs font-bold text-rust uppercase tracking-widest mt-1">Full-Stack Maestro</p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities (Bento) */}
      <section id="capabilities" className="py-24 border-y-4 border-ink bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-black text-ink mb-4 relative inline-block">
              Core Architectural Pillars
              <ScribbleUnderline className="absolute -bottom-3 left-0 w-full h-4 text-rust" />
            </h2>
            <p className="text-xl font-handwriting text-ink/70 mt-6 max-w-2xl">Engineering principles that guarantee performance, security, and absolute reliability.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {BENTO_CARDS.map((card, i) => (
              <div key={i} className={`p-8 border-4 border-ink shadow-drawn-lg relative transition-transform hover:-translate-y-2 ${card.color} rough-border ${i%2===0 ? 'rotate-[-1deg]' : 'rotate-[2deg]'}`}>
                <TapeSVG className={`absolute -top-4 left-6 w-16 h-6 ${i%2===0 ? 'text-coral' : 'text-sage'}`} />
                <div className="w-14 h-14 bg-white border-2 border-ink rounded-full flex items-center justify-center mb-6 shadow-drawn">
                  <card.icon className="w-7 h-7 text-ink" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-4">{card.title}</h3>
                <p className="font-bold font-sans text-sm md:text-base leading-relaxed opacity-90">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Systems Grid */}
      <section id="systems" className="py-24 bg-paper-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-black text-ink mb-4 relative inline-block">
              Verified Systems
              <TapeSVG className="absolute -bottom-2 -right-12 w-20 h-6 text-mustard rotate-6" />
            </h2>
            <p className="text-xl font-handwriting text-ink/70 mt-6 max-w-2xl">A roster of deployed platforms showcasing complex state management and secure pipelines.</p>
          </div>

          <div className="space-y-24">
            {projects.map((project, index) => (
              <div key={project.id} className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}>
                
                {/* Visual / Abstract Representation of Project */}
                <div className="w-full lg:w-1/2 relative">
                  <div className={`bg-white p-6 border-4 border-ink shadow-drawn-lg relative ${index % 2 === 0 ? 'rotate-[-2deg]' : 'rotate-[2deg]'}`}>
                    <TapeSVG className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 text-coral opacity-90" />
                    <div className="aspect-[4/3] bg-paper border-2 border-ink overflow-hidden flex flex-col p-6 relative">
                      {/* Abstract Tech wireframe aesthetic inside */}
                      <div className="absolute top-4 right-4 text-ink font-display font-black text-6xl opacity-10">0{index+1}</div>
                      <project.icon className="w-16 h-16 text-rust mb-6" strokeWidth={1.5} />
                      <h3 className="text-3xl font-display font-black text-ink leading-tight mb-2">{project.name}</h3>
                      <div className="text-sm font-bold text-ink/60 font-handwriting uppercase tracking-wider">{project.category}</div>
                      
                      <div className="mt-auto flex flex-wrap gap-2">
                        {project.techStack.slice(0, 4).map(tech => (
                          <span key={tech} className="px-3 py-1 bg-white border-2 border-ink shadow-[2px_2px_0_0_#292524] text-xs font-bold text-ink">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="w-full lg:w-1/2 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-mustard border-2 border-ink text-ink font-handwriting text-xl font-bold shadow-drawn rotate-[-1deg]">
                    Project Case Study
                  </div>
                  <h3 className="text-4xl md:text-5xl font-display font-black text-ink">{project.name}</h3>
                  <p className="text-lg font-bold font-sans text-ink/80 leading-relaxed">{project.tagline}</p>
                  
                  <ul className="space-y-4 my-8">
                    {project.highlights.slice(0, 2).map((h, i) => (
                      <li key={i} className="flex items-start gap-3 font-bold text-ink text-base">
                        <Check className="w-6 h-6 text-rust shrink-0 stroke-[3px]" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => setActiveModalProject(project)}
                      className="px-6 py-3 bg-ink text-white font-display font-bold text-lg border-2 border-ink shadow-drawn hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
                    >
                      <Layers className="w-5 h-5"/> Read Blueprint
                    </button>
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noreferrer" className="px-6 py-3 bg-white text-ink font-display font-bold text-lg border-2 border-ink shadow-drawn hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2">
                        Live Site <ExternalLink className="w-5 h-5"/>
                      </a>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* AI Scoper - Drafting Notebook Style */}
      <section id="ai-scoper" className="py-24 border-y-4 border-ink bg-mustard relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] opacity-50 mix-blend-multiply pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-black text-ink mb-6">
              AI Blueprint Scoper
            </h2>
            <p className="text-2xl font-handwriting text-ink/80 max-w-2xl mx-auto">
              Got an idea? Describe your business problem below, and I'll sketch a high-level architectural blueprint right on this notepad.
            </p>
          </div>

          <div className="bg-white border-4 border-ink shadow-drawn-lg p-6 md:p-10 relative rough-border">
            <TapeSVG className="absolute -top-4 left-1/2 -translate-x-1/2 w-48 h-8 text-sage" />
            
            <div className="mb-6 flex flex-wrap gap-2 items-center">
              <span className="font-handwriting text-xl text-ink font-bold mr-2">Try a preset:</span>
              {TEMPLATES.map((tmpl, i) => (
                <button 
                  key={i} 
                  onClick={() => setScoperInput(tmpl)}
                  className="px-3 py-1 bg-paper border-2 border-ink text-sm font-bold text-ink hover:bg-mustard transition-colors shadow-[2px_2px_0_0_#292524] rounded-sm"
                >
                  {tmpl}
                </button>
              ))}
            </div>

            <textarea 
              value={scoperInput}
              onChange={e => setScoperInput(e.target.value)}
              placeholder="Jot down your project requirements, target audience, and key features..."
              className="w-full h-48 bg-paper border-2 border-ink p-6 font-handwriting text-2xl text-ink placeholder-ink/40 focus:outline-none focus:bg-white transition-colors resize-none shadow-inner leading-relaxed mb-6 bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')]"
              style={{ lineHeight: '2rem' }}
            />

            <div className="flex justify-between items-center">
              {!apiKey ? (
                <span className="text-rust font-bold font-sans text-sm flex items-center gap-1">
                  <Key className="w-4 h-4"/> VITE_GEMINI_API_KEY missing in .env
                </span>
              ) : <span></span>}
              <button 
                onClick={generateTechSpec}
                disabled={!scoperInput.trim() || scoperLoading}
                className="px-8 py-4 bg-rust text-white font-display font-bold text-xl border-2 border-ink shadow-drawn hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {scoperLoading ? <PenTool className="w-6 h-6 animate-pulse" /> : <Sparkles className="w-6 h-6" />}
                {scoperLoading ? 'Drafting...' : 'Generate Blueprint'}
              </button>
            </div>
          </div>

          {scoperResult && (
            <div className="mt-12 bg-[#fefce8] border-4 border-ink p-8 md:p-12 shadow-drawn-lg relative rough-border transform rotate-1">
              <TapeSVG className="absolute -top-4 -right-4 w-32 h-8 text-coral rotate-[25deg]" />
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 border-b-4 border-ink pb-6">
                <h3 className="text-3xl font-display font-black text-ink">Architect's Notes</h3>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => navigator.clipboard.writeText(scoperResult)} className="flex items-center gap-2 font-bold font-sans text-sm bg-white border-2 border-ink px-4 py-2 shadow-drawn hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">
                    <Copy className="w-4 h-4" /> Copy Text
                  </button>
                  <a href={`https://wa.me/2347044732970?text=${encodeURIComponent("Hey Constantine, let's discuss this blueprint!\n\n" + scoperResult)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-bold font-sans text-sm bg-[#25D366] text-ink border-2 border-ink px-4 py-2 shadow-drawn hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                </div>
              </div>
              
              {/* Markdown Content styling for notebook */}
              <div className="prose prose-lg prose-headings:font-display prose-headings:font-black prose-p:font-sans prose-p:font-bold prose-p:leading-relaxed prose-li:font-sans prose-li:font-bold text-ink max-w-none whitespace-pre-wrap">
                {scoperResult}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-20 bg-ink border-t-4 border-ink relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-10">
            Let's build something brilliant.
          </h2>
          <div className="flex justify-center gap-6 mb-16 flex-wrap">
            <a href="mailto:eulogicstudiosltd@gmail.com" className="px-8 py-4 bg-paper text-ink font-display font-bold text-xl border-4 border-paper shadow-[6px_6px_0_0_#fefce8] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-3">
              <Mail className="w-6 h-6" /> Email Me
            </a>
            <a href="https://wa.me/2347044732970" target="_blank" rel="noreferrer" className="px-8 py-4 bg-[#25D366] text-ink font-display font-bold text-xl border-4 border-transparent shadow-[6px_6px_0_0_#16a34a] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-3">
              <MessageCircle className="w-6 h-6" /> WhatsApp
            </a>
          </div>

          <div className="flex justify-center items-center gap-10 text-white font-handwriting text-2xl flex-wrap mb-10">
            <a href="https://github.com/Constantine1-web" target="_blank" rel="noreferrer" className="hover:text-mustard transition-colors flex items-center gap-2"><Github className="w-6 h-6"/> GitHub</a>
            <a href="https://www.facebook.com/profile.php?id=61582485633812" target="_blank" rel="noreferrer" className="hover:text-mustard transition-colors flex items-center gap-2"><Facebook className="w-6 h-6"/> Facebook</a>
            <a href="https://eulogic.studios" className="hover:text-mustard transition-colors flex items-center gap-2"><Globe className="w-6 h-6"/> eulogic.studios</a>
          </div>
          
          <div className="border-t-4 border-white/10 pt-10 mt-10">
            <p className="font-sans font-bold text-white/50 text-sm">
              &copy; {new Date().getFullYear()} Eulogic Studios. All rights reserved. <br/>
              Handcrafted with React, Tailwind & Gemini API.
            </p>
          </div>
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
    </div>
  );
}
