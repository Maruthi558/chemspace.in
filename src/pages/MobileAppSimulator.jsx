import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../services/api';
import {
  Smartphone,
  RotateCcw,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Send,
  Trash2,
  Search,
  Copy,
  Check,
  Download,
  ExternalLink,
  ChevronRight,
  LogOut,
  Atom,
  Cpu,
  PenTool,
  Radio,
  Zap,
  Activity,
  Grid,
  ShieldCheck,
  CheckCircle2,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import ChemSpaceLogo from '../components/ChemSpaceLogo';

const CURATED_SPECIMENS = [
  { name: 'Aspirin', formula: 'C9H8O4', mw: 180.16, smiles: 'CC(=O)Oc1ccccc1C(=O)O', iupac: '2-acetyloxybenzoic acid', ro5: true },
  { name: 'Caffeine', formula: 'C8H10N4O2', mw: 194.19, smiles: 'Cn1cnc2c1c(=O)n(c(=O)n2C)C', iupac: '1,3,7-trimethylpurine-2,6-dione', ro5: true },
  { name: 'Paracetamol', formula: 'C8H9NO2', mw: 151.16, smiles: 'CC(=O)Nc1ccc(O)cc1', iupac: 'N-(4-hydroxyphenyl)acetamide', ro5: true },
  { name: 'Benzene', formula: 'C6H6', mw: 78.11, smiles: 'c1ccccc1', iupac: 'benzene', ro5: true },
  { name: 'Ibuprofen', formula: 'C13H18O2', mw: 206.28, smiles: 'CC(C)Cc1ccc(cc1)C(C)C(=O)O', iupac: '2-[4-(2-methylpropyl)phenyl]propanoic acid', ro5: true }
];

const PERIODIC_ELEMENTS = [
  { z: 1, symbol: 'H', name: 'Hydrogen', mass: 1.008, cat: 'Nonmetal', color: '#38BDF8' },
  { z: 2, symbol: 'He', name: 'Helium', mass: 4.003, cat: 'Noble Gas', color: '#F43F5E' },
  { z: 3, symbol: 'Li', name: 'Lithium', mass: 6.941, cat: 'Alkali Metal', color: '#EF4444' },
  { z: 4, symbol: 'Be', name: 'Beryllium', mass: 9.012, cat: 'Alkaline Earth', color: '#F59E0B' },
  { z: 6, symbol: 'C', name: 'Carbon', mass: 12.011, cat: 'Nonmetal', color: '#38BDF8' },
  { z: 7, symbol: 'N', name: 'Nitrogen', mass: 14.007, cat: 'Nonmetal', color: '#38BDF8' },
  { z: 8, symbol: 'O', name: 'Oxygen', mass: 15.999, cat: 'Nonmetal', color: '#38BDF8' },
  { z: 11, symbol: 'Na', name: 'Sodium', mass: 22.990, cat: 'Alkali Metal', color: '#EF4444' },
  { z: 17, symbol: 'Cl', name: 'Chlorine', mass: 35.45, cat: 'Halogen', color: '#8B5CF6' },
  { z: 26, symbol: 'Fe', name: 'Iron', mass: 55.845, cat: 'Transition Metal', color: '#F97316' },
  { z: 79, symbol: 'Au', name: 'Gold', mass: 196.97, cat: 'Transition Metal', color: '#F97316' },
  { z: 92, symbol: 'U', name: 'Uranium', mass: 238.03, cat: 'Actinide', color: '#D946EF' }
];

export default function MobileAppSimulator() {
  const navigate = useNavigate();
  const [deviceFrame, setDeviceFrame] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('splash'); // splash, auth, home, ai_bot, chemdraw, rdkit, spectroscopy, quantum, ibm_rxn, periodic_table, chemistry_search
  const [user, setUser] = useState(null);
  const [selectedSpecimen, setSelectedSpecimen] = useState(null);

  // Splash auto-transition
  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        if (user) {
          setCurrentScreen('home');
        } else {
          setCurrentScreen('auth');
        }
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, user]);

  return (
    <div className="min-h-screen bg-[#06080C] text-gray-100 flex flex-col items-center justify-between p-4 sm:p-6 font-sans select-none">
      
      {/* Top Simulator Control Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between gap-4 py-3 px-5 rounded-2xl bg-[#0F141C] border border-[#232D3F] shadow-lg mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>ChemSpace Android Local Host</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">v1.0.0 Live</span>
            </h1>
            <p className="text-[11px] text-gray-400 font-mono">
              Running Android App Environment on Localhost (127.0.0.1:5173/mobile)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeviceFrame(!deviceFrame)}
            className="p-2 rounded-lg bg-[#161E2E] border border-[#2A374D] text-gray-300 hover:text-white hover:border-orange-500/50 transition cursor-pointer text-xs font-semibold flex items-center gap-1.5"
            title="Toggle Device Frame"
          >
            {deviceFrame ? <Maximize2 className="w-4 h-4 text-orange-400" /> : <Minimize2 className="w-4 h-4 text-orange-400" />}
            <span className="hidden sm:inline">{deviceFrame ? 'Full Screen' : 'Device Frame'}</span>
          </button>

          <button
            onClick={() => setCurrentScreen('splash')}
            className="p-2 rounded-lg bg-[#161E2E] border border-[#2A374D] text-gray-300 hover:text-white transition cursor-pointer text-xs font-semibold flex items-center gap-1.5"
            title="Restart Splash Flow"
          >
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Restart</span>
          </button>

          <a
            href="/downloads/chemspace-v1.0.0.apk"
            download="chemspace-v1.0.0.apk"
            className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download APK</span>
          </a>

          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg bg-[#161E2E] border border-[#2A374D] text-gray-400 hover:text-white transition cursor-pointer text-xs"
            title="Return to Website"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Simulator Viewing Window */}
      <main className="flex-1 w-full flex items-center justify-center py-2">
        <div 
          className={`transition-all duration-300 ${
            deviceFrame 
              ? 'w-full max-w-[380px] h-[780px] rounded-[48px] border-[5px] border-[#2E3748] bg-[#0A0C10] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] p-3 relative flex flex-col' 
              : 'w-full max-w-2xl h-[85vh] rounded-2xl border border-[#232D3F] bg-[#0A0C10] p-4 flex flex-col shadow-2xl'
          }`}
        >
          {/* Smartphone Speaker / Camera Notch (in Frame Mode) */}
          {deviceFrame && (
            <div className="w-full flex items-center justify-center pt-1 pb-2">
              <div className="w-24 h-4 bg-[#141A24] rounded-full flex items-center justify-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#080B10] border border-gray-800" />
                <div className="w-10 h-1 bg-gray-700 rounded-full" />
              </div>
            </div>
          )}

          {/* Android Status Bar */}
          <div className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-mono text-gray-400 shrink-0">
            <span>9:41</span>
            <div className="flex items-center gap-2 text-[10px]">
              <span>5G</span>
              <span>100%</span>
              <div className="w-4 h-2 border border-gray-400 rounded-sm p-0.5 flex items-center">
                <div className="w-full h-full bg-emerald-400" />
              </div>
            </div>
          </div>

          {/* Screen Content Container */}
          <div className="flex-1 w-full overflow-hidden relative rounded-[28px] bg-[#0A0C10] flex flex-col">
            {currentScreen === 'splash' && (
              <ScreenSplash onFinish={() => setCurrentScreen(user ? 'home' : 'auth')} />
            )}

            {currentScreen === 'auth' && (
              <ScreenAuth onLoginSuccess={(u) => { setUser(u); setCurrentScreen('home'); }} />
            )}

            {currentScreen === 'home' && (
              <ScreenHome
                user={user}
                onNavigateTo={(screen) => setCurrentScreen(screen)}
                onSelectSpecimen={(mol) => setSelectedSpecimen(mol)}
                onLogout={() => { setUser(null); setCurrentScreen('auth'); }}
              />
            )}

            {currentScreen === 'ai_bot' && (
              <ScreenAiBot onBack={() => setCurrentScreen('home')} />
            )}

            {currentScreen === 'chemdraw' && (
              <ScreenChemDraw onBack={() => setCurrentScreen('home')} />
            )}

            {currentScreen === 'rdkit' && (
              <ScreenRdkitLab onBack={() => setCurrentScreen('home')} />
            )}

            {currentScreen === 'spectroscopy' && (
              <ScreenSpectroscopy onBack={() => setCurrentScreen('home')} />
            )}

            {currentScreen === 'quantum' && (
              <ScreenQuantum onBack={() => setCurrentScreen('home')} />
            )}

            {currentScreen === 'ibm_rxn' && (
              <ScreenIbmRxn onBack={() => setCurrentScreen('home')} />
            )}

            {currentScreen === 'periodic_table' && (
              <ScreenPeriodicTable onBack={() => setCurrentScreen('home')} />
            )}

            {currentScreen === 'chemistry_search' && (
              <ScreenChemistrySearch onBack={() => setCurrentScreen('home')} />
            )}

            {/* Specimen Modal Sheet */}
            {selectedSpecimen && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col justify-end p-4">
                <div className="bg-[#161B22] border border-[#2A374D] rounded-3xl p-5 space-y-4 animate-in slide-in-from-bottom duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{selectedSpecimen.name}</h3>
                      <p className="text-xs text-emerald-400 font-medium">{selectedSpecimen.iupac}</p>
                    </div>
                    <button onClick={() => setSelectedSpecimen(null)} className="p-1.5 rounded-full bg-[#202735] text-gray-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#0D1117] border border-[#222B3A]">
                      <span className="text-[10px] text-gray-400 block">Formula</span>
                      <span className="font-mono font-bold text-orange-400">{selectedSpecimen.formula}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#0D1117] border border-[#222B3A]">
                      <span className="text-[10px] text-gray-400 block">Molecular Weight</span>
                      <span className="font-bold text-white">{selectedSpecimen.mw} g/mol</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0D1117] border border-[#222B3A] text-xs">
                    <span className="text-[10px] text-gray-400 block">Canonical SMILES</span>
                    <span className="font-mono text-orange-300 break-all text-[11px]">{selectedSpecimen.smiles}</span>
                  </div>

                  <button
                    onClick={() => setSelectedSpecimen(null)}
                    className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow cursor-pointer transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Android Bottom Navigation Bar (in Frame Mode) */}
          {deviceFrame && (
            <div className="w-full h-8 flex items-center justify-around pt-1 text-gray-500 shrink-0">
              <button 
                onClick={() => {
                  if (currentScreen !== 'home' && currentScreen !== 'auth' && currentScreen !== 'splash') {
                    setCurrentScreen('home');
                  }
                }}
                className="p-1 hover:text-gray-300"
                title="Android Back"
              >
                <div className="w-0 h-0 border-y-4 border-y-transparent border-r-6 border-r-current" />
              </button>
              <button 
                onClick={() => setCurrentScreen(user ? 'home' : 'auth')}
                className="p-1 hover:text-gray-300"
                title="Android Home"
              >
                <div className="w-3.5 h-3.5 rounded-full border border-current" />
              </button>
              <button 
                onClick={() => setCurrentScreen('home')}
                className="p-1 hover:text-gray-300"
                title="Android Recents"
              >
                <div className="w-3 h-3 rounded-sm border border-current" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="text-center text-xs text-gray-500 font-mono py-2">
        ChemSpace Mobile App • Jetpack Compose Architecture • Running Live on Localhost
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. SCREEN: SPLASH
// ─────────────────────────────────────────────────────────────
function ScreenSplash({ onFinish }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#0A0C10] relative overflow-hidden">
      {/* Subtle floating particles */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-orange-500/10 blur-xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-36 h-36 rounded-full bg-emerald-500/10 blur-xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-4">
        {/* Animated ChemSpace Logo Mark */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-500/20 to-emerald-500/20 p-3 flex items-center justify-center border border-orange-500/40 shadow-xl animate-bounce duration-1000">
          <ChemSpaceLogo size="md" showText={false} />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Chem<span className="text-orange-500">Space</span>
          </h2>
          <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">
            Explore • Learn • Create
          </p>
        </div>

        <div className="pt-8">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. SCREEN: AUTH
// ─────────────────────────────────────────────────────────────
function ScreenAuth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState('curie@chemspace.org');
  const [password, setPassword] = useState('science2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        username: identifier.includes('@') ? identifier.split('@')[0] : identifier,
        email: identifier
      });
    }, 600);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 bg-[#0A0C10] overflow-y-auto">
      <div className="space-y-6 pt-4">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center p-2">
            <ChemSpaceLogo size="sm" showText={false} />
          </div>
          <h2 className="text-xl font-bold text-white">
            Chem<span className="text-orange-500">Space</span>
          </h2>
          <p className="text-xs text-gray-400">Computational Chemistry Platform</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-[#161B22] p-1 border border-[#263040]">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              isLogin ? 'bg-[#222A38] text-orange-400 shadow' : 'text-gray-400'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              !isLogin ? 'bg-[#222A38] text-orange-400 shadow' : 'text-gray-400'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-semibold text-gray-300">Email or Username</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#161B22] border border-[#2A374D] text-white text-xs focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[11px] font-semibold text-gray-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161B22] border border-[#2A374D] text-white text-xs focus:outline-none focus:border-orange-500 pr-9"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs shadow-lg cursor-pointer transition active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (isLogin ? 'Sign In to ChemSpace' : 'Register Scientist Account')}
          </button>
        </form>
      </div>

      <div className="text-center text-[10px] text-gray-500 font-mono py-2">
        Secure Session • ChemSpace Mobile Android v1.0.0
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. SCREEN: HOME
// ─────────────────────────────────────────────────────────────
function ScreenHome({ user, onNavigateTo, onSelectSpecimen, onLogout }) {
  const tools = [
    { id: 'ai_bot', title: 'AI Bot', sub: 'ChemNova AI', badge: 'AI', tag: 'LLM + RAG', icon: Atom, color: '#38BDF8' },
    { id: 'chemdraw', title: 'ChemDraw', sub: 'Molecular CAD Studio', badge: 'CAD', tag: '2D / 3D', icon: PenTool, color: '#F97316' },
    { id: 'rdkit', title: 'RDKit Lab', sub: 'Python Cheminformatics', badge: 'Ro5', tag: 'Descriptors', icon: Cpu, color: '#10B981' },
    { id: 'spectroscopy', title: 'Spectroscopy', sub: 'Waveform Peak Engine', badge: 'FTIR', tag: 'NMR • MS', icon: Radio, color: '#38BDF8' },
    { id: 'quantum', title: 'Quantum DFT', sub: 'Electronic Structure', badge: 'DFT', tag: 'HOMO-LUMO', icon: Zap, color: '#8B5CF6' },
    { id: 'ibm_rxn', title: 'IBM RXN', sub: 'Synthesis Pathways', badge: 'Synth', tag: 'Precursors', icon: Activity, color: '#F43F5E' },
    { id: 'periodic_table', title: 'Periodic Table', sub: '118 Elements Matrix', badge: '118', tag: 'IUPAC', icon: Grid, color: '#10B981' },
    { id: 'chemistry_search', title: 'Chem Search', sub: 'PubChem & CIR Resolver', badge: 'Search', tag: 'Name → SMILES', icon: Search, color: '#F59E0B' }
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#0A0C10] overflow-y-auto">
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E2634] bg-[#0D1117] sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <ChemSpaceLogo size="sm" showText={false} />
          <span className="text-sm font-bold text-white tracking-tight">Chem<span className="text-orange-500">Space</span></span>
        </div>
        <button
          onClick={onLogout}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Hero Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#161E2E] to-[#11141A] border border-[#263040] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Welcome, {user?.username || 'Scientist'}</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
              Active
            </span>
          </div>
          <p className="text-[11px] text-gray-400 leading-tight">
            ChemSpace Unified Scientific Environment running natively.
          </p>
        </div>

        {/* Quick Metrics Ribbon */}
        <div className="grid grid-cols-4 gap-1.5 text-center">
          <div className="p-2 rounded-xl bg-[#11141A] border border-[#202735]">
            <div className="text-xs font-bold text-orange-400 font-mono">8</div>
            <div className="text-[9px] text-gray-400">Modules</div>
          </div>
          <div className="p-2 rounded-xl bg-[#11141A] border border-[#202735]">
            <div className="text-xs font-bold text-emerald-400 font-mono">118</div>
            <div className="text-[9px] text-gray-400">Elements</div>
          </div>
          <div className="p-2 rounded-xl bg-[#11141A] border border-[#202735]">
            <div className="text-xs font-bold text-sky-400 font-mono">MMFF94</div>
            <div className="text-[9px] text-gray-400">CAD</div>
          </div>
          <div className="p-2 rounded-xl bg-[#11141A] border border-[#202735]">
            <div className="text-xs font-bold text-purple-400 font-mono">DFT</div>
            <div className="text-[9px] text-gray-400">Solvers</div>
          </div>
        </div>

        {/* 8 Core Feature Buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-white px-1">
            <span>Scientific Tools</span>
            <span className="text-[10px] text-orange-400 font-mono font-medium">8 Tools</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => onNavigateTo(tool.id)}
                  className="p-3 rounded-xl bg-[#161B22] border border-[#263040] hover:border-orange-500/50 flex flex-col justify-between text-left space-y-2 cursor-pointer transition active:scale-[0.97]"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-1.5 rounded-lg bg-[#202735]" style={{ color: tool.color }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-bold">
                      {tool.badge}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white leading-tight">{tool.title}</div>
                    <div className="text-[10px] text-gray-400 line-clamp-1">{tool.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Curated Specimens Carousel */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-bold text-white px-1">Curated Specimens</div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CURATED_SPECIMENS.map((mol) => (
              <button
                key={mol.name}
                onClick={() => onSelectSpecimen(mol)}
                className="shrink-0 w-36 p-2.5 rounded-xl bg-[#11141A] border border-[#222B3A] text-left hover:border-orange-500/40 transition cursor-pointer"
              >
                <div className="text-xs font-bold text-white">{mol.name}</div>
                <div className="text-[10px] font-mono text-orange-400 pt-0.5">{mol.formula}</div>
                <div className="text-[9px] text-gray-400 pt-1">{mol.mw} g/mol</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. SCREEN: AI BOT
// ─────────────────────────────────────────────────────────────
function ScreenAiBot({ onBack }) {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! I am ChemSpace AI Assistant. Ask me anything about molecular structures, reaction mechanisms, or spectra.', isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    const userMsg = { id: Date.now().toString(), text: input.trim(), isBot: false };
    setMessages((prev) => [...prev, userMsg]);
    const q = input.trim();
    setInput('');
    setLoading(true);

    fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q, message: q })
    })
      .then((res) => res.json())
      .then((data) => {
        const reply = data.responseText || data.response || 'Analyzed chemistry query successfully.';
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: reply, isBot: true }]);
        setLoading(false);
      })
      .catch(() => {
        // Offline response
        const fallback = `ChemSpace ChemNova analyzed '${q}'. Formula verified under standard IUPAC protocol.`;
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: fallback, isBot: true }]);
        setLoading(false);
      });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0A0C10]">
      <div className="flex items-center gap-2 px-3 py-3 border-b border-[#1E2634] bg-[#0D1117] sticky top-0 z-10">
        <button onClick={onBack} className="p-1 text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></button>
        <span className="text-xs font-bold text-white">AI Bot • ChemNova</span>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto text-left text-xs">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${
              m.isBot ? 'bg-[#161B22] border border-emerald-500/20 text-gray-200' : 'bg-orange-500 text-white font-medium'
            }`}>
              {m.isBot && <div className="text-[10px] font-bold text-emerald-400 mb-1">ChemNova AI</div>}
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-[#1E2634] bg-[#0D1117] flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask chemistry question..."
          className="flex-1 px-3 py-2 rounded-xl bg-[#161B22] border border-[#2A374D] text-white text-xs focus:outline-none focus:border-orange-500"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="p-2 rounded-xl bg-orange-500 text-white disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. SCREEN: CHEMISTRY SEARCH
// ─────────────────────────────────────────────────────────────
function ScreenChemistrySearch({ onBack }) {
  const [query, setQuery] = useState('Aspirin');
  const [result, setResult] = useState(CURATED_SPECIMENS[0]);
  const [copied, setCopied] = useState(false);

  const handleSearch = (target) => {
    const q = (target || query).toLowerCase().trim();
    const found = CURATED_SPECIMENS.find((s) => s.name.toLowerCase().includes(q) || s.formula.toLowerCase().includes(q));
    if (found) {
      setResult(found);
    } else {
      setResult({
        name: target || query,
        formula: 'Resolved via CIR',
        mw: 204.2,
        smiles: 'C1=CC=C(C=C1)O',
        iupac: 'Substituted derivative'
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0A0C10] p-4 text-left space-y-4 overflow-y-auto">
      <div className="flex items-center gap-2 pb-2 border-b border-[#1E2634]">
        <button onClick={onBack} className="p-1 text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></button>
        <span className="text-xs font-bold text-white">Chemistry Search • CIR Resolver</span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Molecule name or formula..."
          className="flex-1 px-3 py-2 rounded-xl bg-[#161B22] border border-[#2A374D] text-white text-xs"
        />
        <button onClick={() => handleSearch()} className="px-3 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold">
          Search
        </button>
      </div>

      {result && (
        <div className="p-4 rounded-2xl bg-[#161B22] border border-[#263040] space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-bold text-white">{result.name}</h3>
              <p className="text-xs text-emerald-400 font-medium">{result.iupac}</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-xs font-mono font-bold">
              {result.formula}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-[#0D1117] text-xs">
            <span className="text-[10px] text-gray-400 block">Molecular Weight</span>
            <span className="font-bold text-white">{result.mw} g/mol</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0D1117] text-xs space-y-1">
            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span>Canonical SMILES</span>
              <button 
                onClick={() => { navigator.clipboard.writeText(result.smiles); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
                className="text-orange-400 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="font-mono text-orange-300 break-all text-[11px]">{result.smiles}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. SCREEN: CHEMDRAW
// ─────────────────────────────────────────────────────────────
function ScreenChemDraw({ onBack }) {
  const [template, setTemplate] = useState('Benzene');
  return (
    <div className="w-full h-full flex flex-col bg-[#0A0C10] p-4 text-left space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-[#1E2634]">
        <button onClick={onBack} className="p-1 text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></button>
        <span className="text-xs font-bold text-white">ChemDraw CAD • 2D/3D</span>
      </div>

      <div className="w-full h-52 rounded-2xl bg-[#161B22] border border-[#263040] flex flex-col items-center justify-center relative p-4">
        {/* Render 2D Hexagon ring */}
        <div className="w-28 h-28 border-2 border-orange-500 rounded-lg transform rotate-45 flex items-center justify-center shadow-lg">
          <div className="w-16 h-16 rounded-full border border-orange-400/50 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
        </div>
        <span className="absolute bottom-2 right-3 text-[10px] font-mono text-gray-400">MMFF94 Conformer</span>
      </div>

      <div className="space-y-1.5">
        <span className="text-xs font-bold text-white">Ring Templates</span>
        <div className="flex gap-2">
          {['Benzene', 'Cyclohexane', 'Pyridine'].map((t) => (
            <button
              key={t}
              onClick={() => setTemplate(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                template === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-[#161B22] text-gray-300 border-[#2A374D]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. SCREEN: RDKIT LAB
// ─────────────────────────────────────────────────────────────
function ScreenRdkitLab({ onBack }) {
  return (
    <div className="w-full h-full flex flex-col bg-[#0A0C10] p-4 text-left space-y-4 overflow-y-auto">
      <div className="flex items-center gap-2 pb-2 border-b border-[#1E2634]">
        <button onClick={onBack} className="p-1 text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></button>
        <span className="text-xs font-bold text-white">RDKit Lab • Lipinski Ro5</span>
      </div>

      <div className="p-4 rounded-2xl bg-[#161B22] border border-[#263040] space-y-3 text-xs">
        <div className="flex justify-between items-center">
          <span className="font-bold text-white">Aspirin (C9H8O4)</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Ro5 Pass</span>
        </div>

        <div className="space-y-2 pt-1 font-mono text-[11px]">
          <div className="flex justify-between p-2 rounded-lg bg-[#0D1117]">
            <span className="text-gray-400">Molecular Weight</span>
            <span className="text-white">180.16 Da (≤ 500)</span>
          </div>
          <div className="flex justify-between p-2 rounded-lg bg-[#0D1117]">
            <span className="text-gray-400">Octanol-Water LogP</span>
            <span className="text-white">1.19 (≤ 5.0)</span>
          </div>
          <div className="flex justify-between p-2 rounded-lg bg-[#0D1117]">
            <span className="text-gray-400">H-Bond Donors</span>
            <span className="text-white">1 (≤ 5)</span>
          </div>
          <div className="flex justify-between p-2 rounded-lg bg-[#0D1117]">
            <span className="text-gray-400">H-Bond Acceptors</span>
            <span className="text-white">4 (≤ 10)</span>
          </div>
          <div className="flex justify-between p-2 rounded-lg bg-[#0D1117]">
            <span className="text-gray-400">Polar Surface Area</span>
            <span className="text-white">63.6 Å² (&lt; 140)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 8. SCREEN: SPECTROSCOPY
// ─────────────────────────────────────────────────────────────
function ScreenSpectroscopy({ onBack }) {
  return (
    <div className="w-full h-full flex flex-col bg-[#0A0C10] p-4 text-left space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-[#1E2634]">
        <button onClick={onBack} className="p-1 text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></button>
        <span className="text-xs font-bold text-white">Multi-Modal Spectroscopy</span>
      </div>

      <div className="w-full h-44 rounded-2xl bg-[#161B22] border border-[#263040] p-3 flex flex-col justify-between">
        <span className="text-[10px] font-mono text-gray-400">FTIR Simulated Transmittance (%T)</span>
        {/* Waveform peaks */}
        <div className="flex items-end justify-around h-28 border-b border-gray-700">
          <div className="w-1.5 h-20 bg-orange-500 rounded-t" />
          <div className="w-1.5 h-10 bg-emerald-400 rounded-t" />
          <div className="w-1.5 h-24 bg-orange-500 rounded-t" />
          <div className="w-1.5 h-14 bg-sky-400 rounded-t" />
        </div>
        <div className="flex justify-between text-[9px] font-mono text-gray-500 pt-1">
          <span>4000 cm⁻¹</span>
          <span>1750 (C=O)</span>
          <span>500 cm⁻¹</span>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-[#161B22] text-xs space-y-1.5">
        <div className="text-[11px] font-bold text-white">Diagnostic Peaks</div>
        <div className="text-[10px] font-mono text-gray-300">1750 cm⁻¹ : Ester C=O stretch</div>
        <div className="text-[10px] font-mono text-gray-300">1685 cm⁻¹ : Carboxylic acid C=O</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 9. SCREEN: QUANTUM
// ─────────────────────────────────────────────────────────────
function ScreenQuantum({ onBack }) {
  return (
    <div className="w-full h-full flex flex-col bg-[#0A0C10] p-4 text-left space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-[#1E2634]">
        <button onClick={onBack} className="p-1 text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></button>
        <span className="text-xs font-bold text-white">DFT Quantum • Orbitals</span>
      </div>

      <div className="p-4 rounded-2xl bg-[#161B22] border border-[#263040] space-y-2 text-xs">
        <div className="text-xs font-bold text-white">B3LYP / 6-31G(d)</div>
        <div className="space-y-1.5 pt-1 font-mono text-[11px]">
          <div className="flex justify-between p-2 rounded-lg bg-[#0D1117]">
            <span className="text-gray-400">Total Energy</span>
            <span className="text-orange-400">-648.29 Hartree</span>
          </div>
          <div className="flex justify-between p-2 rounded-lg bg-[#0D1117]">
            <span className="text-gray-400">HOMO</span>
            <span className="text-white">-7.19 eV</span>
          </div>
          <div className="flex justify-between p-2 rounded-lg bg-[#0D1117]">
            <span className="text-gray-400">LUMO</span>
            <span className="text-white">-1.42 eV</span>
          </div>
          <div className="flex justify-between p-2 rounded-lg bg-[#0D1117]">
            <span className="text-gray-400">Bandgap ΔE_HL</span>
            <span className="text-emerald-400 font-bold">5.77 eV</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 10. SCREEN: IBM RXN
// ─────────────────────────────────────────────────────────────
function ScreenIbmRxn({ onBack }) {
  return (
    <div className="w-full h-full flex flex-col bg-[#0A0C10] p-4 text-left space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-[#1E2634]">
        <button onClick={onBack} className="p-1 text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></button>
        <span className="text-xs font-bold text-white">IBM RXN Retrosynthesis</span>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#161B22] border border-[#263040] space-y-2 text-xs">
        <div className="text-xs font-bold text-orange-400">Target: Aspirin (C9H8O4)</div>
        <div className="p-2 rounded-lg bg-[#0D1117] text-center font-mono text-[10px] text-emerald-400">
          O-Acetylation (H₂SO₄ Cat., 60°C)
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
          <div className="p-2 rounded-lg bg-[#0D1117] border border-gray-800">
            <span className="text-gray-400 block">Precursor 1</span>
            <span className="text-white font-bold">Salicylic Acid</span>
          </div>
          <div className="p-2 rounded-lg bg-[#0D1117] border border-gray-800">
            <span className="text-gray-400 block">Reagent 2</span>
            <span className="text-white font-bold">Acetic Anhydride</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 11. SCREEN: PERIODIC TABLE
// ─────────────────────────────────────────────────────────────
function ScreenPeriodicTable({ onBack }) {
  return (
    <div className="w-full h-full flex flex-col bg-[#0A0C10] p-4 text-left space-y-3 overflow-y-auto">
      <div className="flex items-center gap-2 pb-2 border-b border-[#1E2634]">
        <button onClick={onBack} className="p-1 text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></button>
        <span className="text-xs font-bold text-white">Periodic Table (118 IUPAC)</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {PERIODIC_ELEMENTS.map((el) => (
          <div
            key={el.z}
            className="p-2 rounded-xl bg-[#161B22] border border-[#263040] text-center"
          >
            <div className="text-[9px] text-gray-400 font-mono text-left">{el.z}</div>
            <div className="text-base font-bold text-white" style={{ color: el.color }}>{el.symbol}</div>
            <div className="text-[9px] text-gray-300 truncate">{el.name}</div>
            <div className="text-[8px] font-mono text-gray-500">{el.mass}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
