import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Activity,
  Play,
  ArrowRight,
  Layers,
  Cpu,
  PenTool,
  Atom,
  CheckCircle2,
  Send,
  AlertTriangle,
  Clock,
  Workflow,
  GitBranch,
  FileCode2,
  Download,
  Upload,
  Bot,
  RotateCcw,
  Boxes,
  Plus,
  Trash2,
  Maximize2,
  Check,
  Eye,
  Sliders,
  CornerDownRight,
  Microscope,
  FlaskConical,
  Sparkles,
  BookOpen,
  Search,
  ArrowUpDown,
  Filter,
  Flame,
  Zap,
  Info
} from 'lucide-react';
import {
  ORGANIC_REACTION_CLASSES,
  predictForwardReaction,
  generateRetrosynthesisTree,
  validateReactionSMILES,
  filterAndSortReactions
} from '../../services/chemicalReactionEngine';
import { recordDownload } from '../../services/downloadsManager';
import ReactionCanvasDrawer from './ReactionCanvasDrawer';
import RetrosynthesisTreeExplorer from './RetrosynthesisTreeExplorer';
import ReactionStepDetailModal from './ReactionStepDetailModal';
import ReagentSelectorModal from './ReagentSelectorModal';
import MechanismWorkspace from './MechanismWorkspace';
import ThreeMoleculeViewer from '../ThreeMoleculeViewer';
import { logActivity } from '../../services/activityStore';
import { useTheme } from '../../context/ThemeContext';
import ButtonSpinner from '../common/ButtonSpinner';
import { usePersistedWork, loadPersistedWork } from '../../services/workPersistence';

/**
 * High-performance Quick Reaction Presets
 */
const QUICK_REACTION_PRESETS = [
  {
    id: 'click_cuaac',
    label: 'Click Chemistry (CuAAC)',
    badge: 'Nobel 2022',
    reactants: [
      { id: 1, name: 'Benzyl Azide', smiles: 'c1ccccc1CN=[N+]=[N-]' },
      { id: 2, name: 'Phenylacetylene', smiles: 'C#Cc1ccccc1' }
    ],
    reagents: 'CuSO4 (5 mol%), Sodium Ascorbate (10 mol%)',
    catalysts: 'Cu(I) catalyst',
    solvent: 'H2O : tert-Butanol (1:1)',
    temperature: '25 °C (Ambient)'
  },
  {
    id: 'buchwald_hartwig',
    label: 'Buchwald-Hartwig Amination',
    badge: 'Modern C-N',
    reactants: [
      { id: 1, name: '4-Bromotoluene', smiles: 'Cc1ccc(Br)cc1' },
      { id: 2, name: 'Morpholine', smiles: 'C1COCCN1' }
    ],
    reagents: 'NaOtBu (1.5 eq)',
    catalysts: 'Pd2(dba)3 (2.5 mol%) + XantPhos (5 mol%)',
    solvent: '1,4-Dioxane',
    temperature: '100 °C Reflux'
  },
  {
    id: 'olefin_metathesis',
    label: 'Olefin Metathesis (Grubbs)',
    badge: 'Nobel 2005',
    reactants: [
      { id: 1, name: 'Styrene', smiles: 'C=Cc1ccccc1' },
      { id: 2, name: 'Methyl Acrylate', smiles: 'C=CC(=O)OC' }
    ],
    reagents: 'None (Direct catalytic exchange)',
    catalysts: 'Grubbs II Ru Catalyst (2.5 mol%)',
    solvent: 'DCM',
    temperature: '40 °C'
  },
  {
    id: 'wittig_olefination',
    label: 'Wittig Olefination',
    badge: 'Alkene Synthesis',
    reactants: [
      { id: 1, name: 'Benzaldehyde', smiles: 'O=Cc1ccccc1' },
      { id: 2, name: 'Methylenetriphenylphosphorane', smiles: 'C=[P](c1ccccc1)(c2ccccc2)c3ccccc3' }
    ],
    reagents: 'n-BuLi',
    catalysts: 'Phosphonium Ylide',
    solvent: 'Anhydrous THF',
    temperature: '0–25 °C'
  },
  {
    id: 'aspirin',
    label: 'Aspirin Synthesis',
    badge: 'Classical Ester',
    reactants: [
      { id: 1, name: 'Salicylic Acid', smiles: 'O=C(O)c1ccccc1O' },
      { id: 2, name: 'Acetic Anhydride', smiles: 'CC(=O)OC(=O)C' }
    ],
    reagents: 'H2SO4 (conc., 3 drops)',
    catalysts: 'Sulfuric Acid',
    solvent: 'Acetic Anhydride / EtOAc',
    temperature: '85 °C'
  },
  {
    id: 'paracetamol',
    label: 'Paracetamol Synthesis',
    badge: 'Pharma Amide',
    reactants: [
      { id: 1, name: '4-Aminophenol', smiles: 'Nc1ccc(O)cc1' },
      { id: 2, name: 'Acetic Anhydride', smiles: 'CC(=O)OC(=O)C' }
    ],
    reagents: 'Sodium Acetate Buffer',
    catalysts: 'None',
    solvent: 'Aqueous Isopropanol',
    temperature: '45 °C'
  },
  {
    id: 'suzuki',
    label: 'Suzuki-Miyaura Biaryl',
    badge: 'Nobel 2010',
    reactants: [
      { id: 1, name: 'Bromobenzene', smiles: 'Brc1ccccc1' },
      { id: 2, name: 'Phenylboronic Acid', smiles: 'OB(O)c1ccccc1' }
    ],
    reagents: 'K2CO3 (2.0 eq)',
    catalysts: 'Pd(PPh3)4 (5 mol%)',
    solvent: '1,4-Dioxane : H2O (4:1)',
    temperature: '90 °C'
  }
];

/**
 * Custom Website-Themed ARXN Reaction Synthesis Loader
 */
function ArxnReactionLoader({ isPredicting, isRetrosynthesizing }) {
  const [telemetryIndex, setTelemetryIndex] = useState(0);
  const steps = [
    'Initializing ARXN Neural Reaction Matrix...',
    'Parsing reactant SMILES & calculating Lewis formal charges...',
    'Mapping Frontier Molecular Orbitals (HOMO-LUMO Overlap)...',
    'Simulating Transition State [‡] Activation Energy (Ea)...',
    'Estimating Thermodynamic Equilibrium & Stereochemical Yield...'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryIndex((prev) => (prev + 1) % steps.length);
    }, 600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-8 rounded-3xl glass-panel border border-cyan-500/40 bg-gradient-to-br from-cyan-950/20 via-slate-900/60 to-violet-950/20 flex flex-col items-center justify-center space-y-4 text-center shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-radial from-cyan-500/10 via-emerald-500/5 to-transparent pointer-events-none" />

      {/* Orbital Atom & Electron Synthesizer Rings */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/40 animate-spin" style={{ animationDuration: '6s' }} />
        <div className="absolute inset-2 rounded-full border-2 border-dotted border-emerald-400/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '4s' }} />
        <div className="absolute inset-4 rounded-full border border-violet-400/60 animate-ping opacity-30" />
        
        <div className="relative z-10 w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-emerald-500 to-amber-500 p-0.5 shadow-lg shadow-cyan-500/30 animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-300 font-black text-xs font-mono">
            ARXN
          </div>
        </div>

        <div className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-md shadow-cyan-400 animate-bounce" style={{ top: '2px', left: '46%' }} />
        <div className="absolute w-2 h-2 rounded-full bg-emerald-400 shadow-md shadow-emerald-400 animate-pulse" style={{ bottom: '4px', right: '18%' }} />
      </div>

      <div className="space-y-1 z-10">
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <h3 className="text-xs font-black tracking-wider uppercase text-cyan-300">
            {isRetrosynthesizing ? 'ARXN Retrosynthesis Disconnection Search' : 'ARXN Reaction Synthesis Prediction'}
          </h3>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            KERNEL v5.0
          </span>
        </div>
        <p className="text-[11px] font-mono text-slate-300 transition-all duration-300 h-5">
          {steps[telemetryIndex]}
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="w-64 h-1.5 rounded-full bg-white/10 overflow-hidden relative">
        <div className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 rounded-full animate-pulse" style={{ width: '100%' }} />
      </div>
    </div>
  );
}

export default function IbmRxnUnifiedStudio() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [searchParams] = useSearchParams();
  const initialTarget = searchParams.get('target') || searchParams.get('smiles');

  // 1. Studio Workspace Mode ('forward' | 'retrosynthesis' | 'library' | 'drawer' | 'planner' | 'mechanism')
  const [studioMode, setStudioMode] = usePersistedWork('chemspace_ibmrxn_mode', initialTarget ? 'retrosynthesis' : 'forward');

  // Mechanism Workspace context — carries reaction data from other modes
  const [mechanismReactionContext, setMechanismReactionContext] = useState(null);

  // 2. Forward Prediction State with persistent memory
  const DEFAULT_REACTANTS = [
    { id: 1, name: 'Salicylic Acid', smiles: 'O=C(O)c1ccccc1O' },
    { id: 2, name: 'Acetic Anhydride', smiles: 'CC(=O)OC(=O)C' }
  ];
  const [reactantsList, setReactantsList] = usePersistedWork('chemspace_ibmrxn_reactants', DEFAULT_REACTANTS);
  const [reagentsInput, setReagentsInput] = usePersistedWork('chemspace_ibmrxn_reagents', 'H2SO4 (conc.)');
  const [catalystsInput, setCatalystsInput] = usePersistedWork('chemspace_ibmrxn_catalysts', 'Sulfuric Acid');
  const [solventInput, setSolventInput] = usePersistedWork('chemspace_ibmrxn_solvent', 'Ethyl Acetate');
  const [temperatureInput, setTemperatureInput] = usePersistedWork('chemspace_ibmrxn_temperature', '85 °C');
  const [isPredicting, setIsPredicting] = useState(false);
  const [forwardPredictionResult, setForwardPredictionResult] = useState(null);
  const [predictionError, setPredictionError] = useState(null);
  const [isReagentModalOpen, setIsReagentModalOpen] = useState(false);
  const [canvasInitialSmiles, setCanvasInitialSmiles] = useState('O=C(O)c1ccccc1O');

  // 3. Retrosynthesis State with persistent memory
  const [targetSmilesInput, setTargetSmilesInput] = usePersistedWork(
    'chemspace_ibmrxn_target_smiles',
    initialTarget || 'CC(=O)Oc1ccccc1C(=O)O'
  );
  useEffect(() => {
    if (initialTarget && initialTarget !== targetSmilesInput) {
      setTargetSmilesInput(initialTarget);
      setStudioMode('retrosynthesis');
    }
  }, [initialTarget]);
  const [isRetrosynthesizing, setIsRetrosynthesizing] = useState(false);
  const [retrosynthesisResult, setRetrosynthesisResult] = useState(null);
  const [selectedStepModal, setSelectedStepModal] = useState(null);

  // 4. Automated Synthesis Stages
  const [synthesisStages, setSynthesisStages] = useState([
    { id: 1, name: 'Reagent Preparation & Stoichiometry Weighing', status: 'completed', duration: '15 min', notes: 'Measured 1.0 eq salicylic acid and 1.5 eq acetic anhydride.' },
    { id: 2, name: 'Acid-Catalyzed Reflux & Heating', status: 'active', duration: '45 min', notes: 'Heating to 85 °C with constant stirring.' },
    { id: 3, name: 'Ice-Water Quench & Phase Separation', status: 'pending', duration: '20 min', notes: 'Induce crystallization by pouring into ice water.' },
    { id: 4, name: 'Recrystallization from Hot Ethanol', status: 'pending', duration: '60 min', notes: 'Yields pure white acetylsalicylic acid needles.' },
    { id: 5, name: 'Spectroscopic QC (FTIR / 1H-NMR)', status: 'pending', duration: '10 min', notes: 'Verify absence of phenolic O-H stretch and presence of dual carbonyl peaks.' }
  ]);

  // 5. Reaction Library Filter & Sort State
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryCategory, setLibraryCategory] = useState('all');
  const [libraryEra, setLibraryEra] = useState('all');
  const [librarySortBy, setLibrarySortBy] = useState('name');
  const [librarySortOrder, setLibrarySortOrder] = useState('asc');
  const [show3DPreview, setShow3DPreview] = useState(false);

  const filteredLibraryReactions = useMemo(() => {
    return filterAndSortReactions(ORGANIC_REACTION_CLASSES, {
      search: librarySearch,
      category: libraryCategory,
      era: libraryEra,
      sortBy: librarySortBy,
      sortOrder: librarySortOrder
    });
  }, [librarySearch, libraryCategory, libraryEra, librarySortBy, librarySortOrder]);

  const handleLoadPreset = (preset) => {
    setReactantsList(preset.reactants);
    setReagentsInput(preset.reagents || '');
    setCatalystsInput(preset.catalysts || '');
    setSolventInput(preset.solvent || '');
    setTemperatureInput(preset.temperature || '');
    setTimeout(() => {
      handleRunForwardPrediction();
    }, 150);
  };

  const handleLoadReactionFromLibrary = (rxn) => {
    if (rxn.exampleReactants && rxn.exampleReactants.length > 0) {
      setReactantsList(rxn.exampleReactants.map((r, i) => ({ id: Date.now() + i, name: r.name, smiles: r.smiles })));
    }
    if (rxn.reagentRequired) setReagentsInput(rxn.reagentRequired);
    if (rxn.typicalSolvent) setSolventInput(rxn.typicalSolvent);
    if (rxn.typicalTemp) setTemperatureInput(rxn.typicalTemp);
    setStudioMode('forward');
    setTimeout(() => {
      handleRunForwardPrediction();
    }, 150);
  };

  // Run initial prediction on load
  useEffect(() => {
    handleRunForwardPrediction();
    handleRunRetrosynthesis();
  }, []);

  const handleRunForwardPrediction = () => {
    setIsPredicting(true);
    setPredictionError(null);

    setTimeout(() => {
      try {
        const result = predictForwardReaction({
          reactants: reactantsList,
          reagents: reagentsInput,
          catalysts: catalystsInput,
          solvent: solventInput,
          temperature: temperatureInput
        });

        if (result.error) {
          setPredictionError(result.error);
          setForwardPredictionResult(null);
        } else {
          setForwardPredictionResult(result);
          logActivity('ARXN', 'Predicted Reaction Outcome', `Product: ${result.product.name} (${result.estimatedYield})`, 'reaction');
        }
      } catch (err) {
        setPredictionError('Error processing reaction prediction: ' + err.message);
      } finally {
        setIsPredicting(false);
      }
    }, 450);
  };

  const handleRunRetrosynthesis = () => {
    if (!targetSmilesInput.trim()) return;
    setIsRetrosynthesizing(true);

    setTimeout(() => {
      try {
        const result = generateRetrosynthesisTree(targetSmilesInput);
        if (result.error) {
          setRetrosynthesisResult(null);
        } else {
          setRetrosynthesisResult(result);
          logActivity('ARXN', 'Generated Retrosynthesis Plan', `Target: ${result.targetName}`, 'reaction');
        }
      } catch (err) {
        console.warn('Retrosynthesis error:', err);
      } finally {
        setIsRetrosynthesizing(false);
      }
    }, 450);
  };

  const handleAddReactant = () => {
    const count = reactantsList.length + 1;
    setReactantsList([
      ...reactantsList,
      { id: Date.now(), name: `Reactant ${count}`, smiles: 'CCO' }
    ]);
  };

  const handleRemoveReactant = (id) => {
    setReactantsList(reactantsList.filter((r) => r.id !== id));
  };

  const handleUpdateReactantSmiles = (id, smiles) => {
    setReactantsList(reactantsList.map((r) => (r.id === id ? { ...r, smiles } : r)));
  };

  const handleApplyCanvasReactant = (smiles) => {
    if (!smiles) return;
    setReactantsList([
      ...reactantsList,
      { id: Date.now(), name: 'Canvas Sketched Molecule', smiles }
    ]);
    setStudioMode('forward');
  };

  const handleApplyCanvasTarget = (smiles) => {
    if (!smiles) return;
    setTargetSmilesInput(smiles);
    setStudioMode('retrosynthesis');
    setTimeout(() => {
      handleRunRetrosynthesis();
    }, 100);
  };

  const handleExportReactionSMILES = () => {
    const rSmi = forwardPredictionResult?.reactionSmiles || `${reactantsList.map((r) => r.smiles).join('.')}>${reagentsInput}>${forwardPredictionResult?.product?.smiles || ''}`;
    const filename = `reaction_${Date.now()}.smi`;
    const blob = new Blob([rSmi], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    recordDownload({
      filename,
      fileType: 'smi',
      sourceModule: 'ARXN',
      contentBlob: rSmi,
      fileSize: blob.size
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      if (typeof content === 'string') {
        const valRes = validateReactionSMILES(content.trim());
        if (valRes.valid) {
          if (valRes.isReactionSmiles) {
            setReactantsList(valRes.reactants.map((s, i) => ({ id: Date.now() + i, name: `Imported Reactant ${i + 1}`, smiles: s })));
            if (valRes.reagents.length > 0) setReagentsInput(valRes.reagents.join(', '));
            setStudioMode('forward');
          } else {
            setTargetSmilesInput(content.trim());
            setStudioMode('retrosynthesis');
          }
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="workspace-container font-mono select-none space-y-6">
      {/* 1. TOP WORKSPACE HEADER & MODE CONTROLS */}
      <div className="workspace-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Workflow className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-wider text-[var(--text-primary)]">
                ARXN AI REACTION PLANNING &amp; SYNTHESIS STUDIO
              </h1>
              <span className="telemetry-pill text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                ARXN KERNEL v5.0
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] font-sans mt-0.5">
              Forward organic transformation prediction, multi-step retrosynthesis planning, rare reactions catalog, 2D reaction drawing &amp; automated synthesis workflows.
            </p>
          </div>
        </div>

        {/* Studio Mode Tabs */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-[var(--border-subtle)] overflow-x-auto custom-scrollbar">
          {[
            { id: 'forward', label: 'Forward Prediction', icon: Activity },
            { id: 'retrosynthesis', label: 'Retrosynthesis', icon: GitBranch },
            { id: 'library', label: 'Reaction Library', icon: BookOpen },
            { id: 'drawer', label: 'Reaction CAD', icon: PenTool },
            { id: 'mechanism', label: 'Mechanism Workspace', icon: CornerDownRight },
            { id: 'planner', label: 'Synthesis Stages', icon: Clock }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setStudioMode(id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                studioMode === id
                  ? id === 'mechanism'
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md font-bold shadow-violet-500/25'
                    : id === 'library'
                    ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white shadow-md font-bold shadow-cyan-500/25'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md font-bold shadow-orange-500/25'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODE 1: FORWARD REACTION PREDICTION
      ══════════════════════════════════════════════════════════════════════ */}
      {studioMode === 'forward' && (
        <div className="space-y-6">
          {/* Reaction Equation Flow Banner (Reactants + Reagents -> Product) */}
          <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-5 shadow-2xl bg-gradient-to-r from-cyan-500/5 via-violet-500/5 to-transparent">
            <div className="flex items-center justify-between border-b border-inherit pb-3 flex-wrap gap-2">
              <span className="text-xs font-black uppercase text-[var(--text-primary)] flex items-center gap-1.5">
                <Workflow className="w-4 h-4 text-cyan-400" />
                Reaction Definition (Reactants + Reagents → Product)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportReactionSMILES}
                  className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 text-xs font-bold transition flex items-center gap-1 border border-white/5 cursor-pointer"
                  title="Export Reaction SMILES"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export .SMI</span>
                </button>

                <label className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-white text-xs font-bold transition flex items-center gap-1 border border-white/5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import File</span>
                  <input type="file" accept=".smi,.mol,.sdf,.txt" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Quick Presets Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              <span className="text-[10px] text-cyan-400 font-bold uppercase whitespace-nowrap flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Quick Reactions:
              </span>
              {QUICK_REACTION_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleLoadPreset(p)}
                  className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-cyan-500/15 border border-white/5 hover:border-cyan-500/30 text-[10px] text-slate-300 hover:text-cyan-200 font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
                >
                  <span>{p.label}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-normal">
                    {p.badge}
                  </span>
                </button>
              ))}
            </div>

            {/* Visual Reactants + Reagents Input Blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Reactants Column (5 cols) */}
              <div className="lg:col-span-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase">Reactant Molecules:</span>
                  <button
                    onClick={handleAddReactant}
                    className="text-[10px] text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Reactant
                  </button>
                </div>

                <div className="space-y-2">
                  {reactantsList.map((r, idx) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-2xl inner-box border border-[var(--border-subtle)] space-y-1 relative group"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <strong className="text-cyan-300">{r.name}</strong>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setCanvasInitialSmiles(r.smiles);
                              setStudioMode('drawer');
                            }}
                            className="px-2 py-0.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Draw/Edit this molecule in Reaction Canvas"
                          >
                            <PenTool className="w-2.5 h-2.5" /> Draw
                          </button>
                          {reactantsList.length > 1 && (
                            <button
                              onClick={() => handleRemoveReactant(r.id)}
                              className="text-slate-400 hover:text-rose-400 transition cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={r.smiles}
                        onChange={(e) => handleUpdateReactantSmiles(r.id, e.target.value)}
                        placeholder="Enter SMILES (e.g. O=C(O)c1ccccc1O)"
                        className="input-control px-2.5 py-1 text-xs rounded-xl w-full font-mono font-bold text-[var(--text-primary)]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Reaction Arrow + Conditions (3 cols) */}
              <div className="lg:col-span-3 p-4 rounded-2xl inner-box border border-cyan-500/20 text-center space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-400 font-bold uppercase block">Conditions &amp; Reagents:</span>
                  <button
                    onClick={() => setIsReagentModalOpen(true)}
                    className="px-2 py-0.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Open Categorized Reagent Library"
                  >
                    <Sliders className="w-3 h-3" /> Palette
                  </button>
                </div>

                <input
                  type="text"
                  value={reagentsInput}
                  onChange={(e) => setReagentsInput(e.target.value)}
                  placeholder="Reagents (e.g. H2SO4, AlCl3, NaBH4)"
                  className="input-control px-2 py-1 text-xs rounded-lg w-full text-center font-bold text-amber-300"
                />
                <input
                  type="text"
                  value={solventInput}
                  onChange={(e) => setSolventInput(e.target.value)}
                  placeholder="Solvent (e.g. DCM, THF, DMF)"
                  className="input-control px-2 py-1 text-xs rounded-lg w-full text-center text-[10px]"
                />
                <input
                  type="text"
                  value={temperatureInput}
                  onChange={(e) => setTemperatureInput(e.target.value)}
                  placeholder="Temperature / Time (e.g. 85 °C, Reflux)"
                  className="input-control px-2 py-1 text-xs rounded-lg w-full text-center text-[10px]"
                />

                <button
                  onClick={handleRunForwardPrediction}
                  disabled={isPredicting}
                  className="w-full btn-horizontal btn-orange text-xs font-mono font-bold transition flex items-center justify-center gap-2 mt-2 shadow-lg group cursor-pointer"
                >
                  {isPredicting ? <ButtonSpinner className="text-white" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPredicting ? 'Synthesizing...' : 'Run ARXN Synthesis'}</span>
                  {!isPredicting && <ArrowRight className="w-3.5 h-3.5 arrow-micro text-white/80" />}
                </button>
              </div>

              {/* Predicted Product (4 cols) */}
              <div className="lg:col-span-4 p-4 rounded-2xl inner-box border border-emerald-500/30 space-y-2 bg-gradient-to-br from-emerald-500/5 to-transparent">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">Predicted Major Product:</span>
                  {forwardPredictionResult && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                      {forwardPredictionResult.estimatedYield} Yield
                    </span>
                  )}
                </div>

                {isPredicting ? (
                  <ArxnReactionLoader isPredicting={true} />
                ) : forwardPredictionResult?.product ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {forwardPredictionResult.product.smiles && (
                        <img
                          src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(forwardPredictionResult.product.smiles)}/PNG`}
                          alt={forwardPredictionResult.product.name}
                          className="w-24 h-24 object-contain bg-white rounded-xl p-1 border border-white/10 shrink-0 shadow-sm"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                      <div className="space-y-1 flex-1">
                        <strong className="text-sm text-emerald-300 font-bold block">
                          {forwardPredictionResult.product.name}
                        </strong>
                        <div className="p-1.5 rounded-xl bg-black/40 border border-white/5 text-[10px] text-slate-300 break-all font-mono">
                          {forwardPredictionResult.product.smiles}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-0.5">
                          <span>Formula: <strong>{forwardPredictionResult.product.formula}</strong></span>
                          <span>MW: <strong>{forwardPredictionResult.product.molWeight} g/mol</strong></span>
                        </div>
                      </div>
                    </div>

                    {show3DPreview && (
                      <div className="h-44 w-full rounded-2xl overflow-hidden border border-emerald-500/30">
                        <ThreeMoleculeViewer smiles={forwardPredictionResult.product.smiles} height="100%" />
                      </div>
                    )}

                    {/* Cross-Module Quick Dispatch */}
                    <div className="flex items-center gap-1.5 pt-2 flex-wrap">
                      <button
                        onClick={() => setShow3DPreview(!show3DPreview)}
                        className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Toggle 3D Molecular Conformer"
                      >
                        <Atom className="w-3 h-3" /> {show3DPreview ? 'Hide 3D' : '3D Stage'}
                      </button>
                      <button
                        onClick={() => {
                          setMechanismReactionContext({
                            reactionSmiles: forwardPredictionResult?.reactionSmiles || reactantsList.map(r => r.smiles).join('.') + '>>' + forwardPredictionResult?.product?.smiles,
                            reactionClass: forwardPredictionResult?.reactionClass || 'Organic Reaction',
                            reactionType: forwardPredictionResult?.reactionType || 'Unknown',
                            reagents: reagentsInput,
                            solvent: solventInput,
                            temperature: temperatureInput,
                            productSmiles: forwardPredictionResult?.product?.smiles,
                            productName: forwardPredictionResult?.product?.name,
                            mechanismSteps: forwardPredictionResult?.mechanismSteps || []
                          });
                          setStudioMode('mechanism');
                        }}
                        className="px-2 py-1 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Open Reaction Mechanism Workspace"
                      >
                        <CornerDownRight className="w-3 h-3" /> Examine Mechanism
                      </button>
                      <button
                        onClick={() => {
                          if (forwardResult?.product?.smiles) {
                            try { localStorage.setItem('chemspace_active_mol', forwardResult.product.smiles); } catch {}
                          }
                          navigate('/chemdraw');
                        }}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Open predicted product in ChemDraw"
                      >
                        <PenTool className="w-3 h-3" /> ChemDraw
                      </button>
                      <button
                        onClick={() => {
                          if (forwardResult?.product?.smiles) {
                            try { localStorage.setItem('chemspace_active_mol', forwardResult.product.smiles); } catch {}
                          }
                          navigate('/spectroscopy');
                        }}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-violet-300 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Simulate Product Spectroscopy"
                      >
                        <Activity className="w-3 h-3" /> Spectroscopy
                      </button>
                      <button
                        onClick={() => {
                          const query = forwardResult?.product?.name
                            ? `Analyze and synthesize predicted product ${forwardResult.product.name} (SMILES: ${forwardResult.product.smiles})`
                            : 'Analyze and simulate reaction product';
                          navigate('/ai-workspace', { state: { prompt: query } });
                        }}
                        className="px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Analyze and model product in AI Workspace"
                      >
                        <Bot className="w-3 h-3 text-cyan-400" /> AI Workspace
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 italic">
                    Click "Run ARXN Synthesis" to predict the major organic product.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Forward Reaction Transformation & Mechanistic Breakdown */}
          {forwardPredictionResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-mono">
              <div className="glass-panel p-4 rounded-2xl space-y-2 border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase">Reaction Classification</span>
                  {forwardPredictionResult.era && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300">
                      {forwardPredictionResult.era}
                    </span>
                  )}
                </div>
                <div className="text-sm font-black text-[var(--text-primary)]">{forwardPredictionResult.reactionClass}</div>
                <div className="text-[10px] text-[var(--text-muted)]">{forwardPredictionResult.reactionType}</div>
                <div className="text-[10px] text-emerald-400 font-bold pt-1">Confidence Score: {forwardPredictionResult.confidenceScore}</div>
                <button
                  onClick={() => {
                    setMechanismReactionContext({
                      reactionClass: forwardPredictionResult.reactionClass,
                      reactionType: forwardPredictionResult.reactionType,
                      reagents: reagentsInput,
                      solvent: solventInput,
                      temperature: temperatureInput,
                      productSmiles: forwardPredictionResult?.product?.smiles,
                      productName: forwardPredictionResult?.product?.name,
                      mechanismSteps: forwardPredictionResult?.mechanismSteps || []
                    });
                    setStudioMode('mechanism');
                  }}
                  className="mt-2 w-full py-1.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 text-[10px] font-black transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <CornerDownRight className="w-3 h-3" /> Open Mechanism Workspace
                </button>
              </div>

              <div className="glass-panel p-4 rounded-2xl space-y-2 border border-[var(--border-subtle)] md:col-span-2">
                <span className="text-[10px] text-violet-400 font-bold uppercase">Step-by-Step Reaction Mechanism</span>
                <ol className="list-decimal pl-4 space-y-1.5 text-xs text-[var(--text-secondary)] font-sans">
                  {forwardPredictionResult.mechanismSteps?.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODE 2: RETROSYNTHESIS PLANNER
      ══════════════════════════════════════════════════════════════════════ */}
      {studioMode === 'retrosynthesis' && (
        <div className="space-y-6">
          {/* Retrosynthesis Target Input Banner */}
          <div className="glass-panel p-5 rounded-3xl border border-[var(--border-subtle)] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-inherit pb-2">
              <span className="text-xs font-black uppercase text-[var(--text-primary)] flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                Target Molecule Retrosynthetic Synthesis Planner
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 space-y-1">
                <span className="text-[10px] text-[var(--text-muted)]">Target Molecule SMILES:</span>
                <input
                  type="text"
                  value={targetSmilesInput}
                  onChange={(e) => setTargetSmilesInput(e.target.value)}
                  placeholder="Enter Target SMILES (e.g. CC(=O)Oc1ccccc1C(=O)O)"
                  className="input-control px-3 py-2 text-xs rounded-xl w-full font-bold text-cyan-300 font-mono"
                />
              </div>

              <button
                onClick={handleRunRetrosynthesis}
                disabled={isRetrosynthesizing}
                className="btn-horizontal btn-orange text-xs font-mono font-bold transition flex items-center justify-center gap-2 shadow-lg sm:mt-5 group cursor-pointer"
              >
                {isRetrosynthesizing ? <ButtonSpinner className="text-white" /> : <GitBranch className="w-4 h-4" />}
                <span>{isRetrosynthesizing ? 'Planning Disconnections...' : 'Plan Retrosynthesis'}</span>
                {!isRetrosynthesizing && <ArrowRight className="w-3.5 h-3.5 arrow-micro text-white/80" />}
              </button>
            </div>

            {/* Quick Target Candidates */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 custom-scrollbar">
              <span className="text-[10px] text-slate-400 font-bold uppercase whitespace-nowrap">
                Sample Targets:
              </span>
              {[
                { label: 'Aspirin', smiles: 'CC(=O)Oc1ccccc1C(=O)O' },
                { label: 'Paracetamol', smiles: 'CC(=O)Nc1ccc(O)cc1' },
                { label: 'Biphenyl', smiles: 'c1ccc(-c2ccccc2)cc1' },
                { label: '1,4-Triazole', smiles: 'c1ccccc1Cn1cc(-c2ccccc2)nn1' },
                { label: 'Tolylmorpholine', smiles: 'Cc1ccc(N2CCOCC2)cc1' }
              ].map((t) => (
                <button
                  key={t.label}
                  onClick={() => {
                    setTargetSmilesInput(t.smiles);
                    setTimeout(() => handleRunRetrosynthesis(), 100);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-cyan-500/15 border border-white/5 text-[10px] text-cyan-300 font-bold transition whitespace-nowrap cursor-pointer active:scale-95"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Retrosynthesis Loading Animation */}
          {isRetrosynthesizing && (
            <ArxnReactionLoader isRetrosynthesizing={true} />
          )}

          {/* Interactive Tree Explorer */}
          <RetrosynthesisTreeExplorer
            retrosynthesisData={retrosynthesisResult}
            onSelectStepDetail={setSelectedStepModal}
            onOpenMechanism={(stepData) => {
              setMechanismReactionContext({
                reactionClass: stepData?.reactionType || 'Retrosynthesis Step',
                reactionType: stepData?.disconnection || '',
                reagents: stepData?.reagents || '',
                solvent: stepData?.solvents || '',
                temperature: stepData?.temperature || '',
                mechanismNotes: stepData?.mechanismNotes || '',
                mechanismSteps: stepData?.mechanismNotes ? [stepData.mechanismNotes] : []
              });
              setStudioMode('mechanism');
            }}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODE: REACTION SYNTHESIS & PRECURSORS LIBRARY
      ══════════════════════════════════════════════════════════════════════ */}
      {studioMode === 'library' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-inherit pb-3 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <div>
                  <h2 className="text-sm font-black uppercase text-[var(--text-primary)] tracking-wide">
                    ARXN Organic Reaction Synthesis &amp; Transformation Catalog
                  </h2>
                  <p className="text-[10px] text-[var(--text-secondary)] font-sans">
                    Explore modern Nobel prize reactions, rare radical transformations, and classical named organic syntheses.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
                  {filteredLibraryReactions.length} Reactions Available
                </span>
              </div>
            </div>

            {/* Filter & Sort Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Search reactions (e.g. Click, Buchwald, Metathesis, Wittig, Radical, Suzuki)..."
                  className="input-control pl-9 pr-3 py-2 text-xs rounded-xl w-full font-mono"
                />
              </div>

              {/* Era Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
                {[
                  { id: 'all', label: 'All Eras' },
                  { id: 'Modern', label: 'Modern & Nobel' },
                  { id: 'Rare', label: 'Rare Syntheses' },
                  { id: 'Classic', label: 'Classic Core' }
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setLibraryEra(id)}
                    className={`px-2.5 py-1.5 rounded-xl font-bold text-[10px] whitespace-nowrap transition cursor-pointer active:scale-95 ${
                      libraryEra === id
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                        : 'bg-white/5 text-[var(--text-secondary)] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={librarySortBy}
                  onChange={(e) => setLibrarySortBy(e.target.value)}
                  className="input-control px-2.5 py-1.5 text-[10px] rounded-xl font-mono font-bold"
                >
                  <option value="name">Sort: Name (A-Z)</option>
                  <option value="year">Sort: Year (Newest)</option>
                  <option value="yield">Sort: Highest Yield</option>
                  <option value="complexity">Sort: Complexity</option>
                </select>
                <button
                  onClick={() => setLibrarySortOrder(librarySortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[10px] font-bold border border-white/5 cursor-pointer"
                  title="Toggle Ascending/Descending"
                >
                  {librarySortOrder === 'asc' ? '↑ ASC' : '↓ DESC'}
                </button>
              </div>
            </div>

            {/* Reaction Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredLibraryReactions.map((rxn) => (
                <div
                  key={rxn.id}
                  className="p-4 rounded-2xl inner-box border border-[var(--border-subtle)] hover:border-cyan-500/40 hover:bg-cyan-500/5 transition space-y-3 flex flex-col justify-between group shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <strong className="text-xs text-cyan-300 font-bold group-hover:text-cyan-200">
                        {rxn.name}
                      </strong>
                      <div className="flex items-center gap-1 shrink-0">
                        {rxn.era && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            rxn.era === 'Modern'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : rxn.era === 'Rare'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {rxn.era}
                          </span>
                        )}
                        {rxn.year && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-black/40">
                            {rxn.year}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 font-sans">
                      {rxn.class}
                    </div>

                    <p className="text-[11px] text-[var(--text-secondary)] font-sans line-clamp-2">
                      {rxn.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-white/5">
                      <div>
                        <span className="text-slate-400 block">Typical Yield:</span>
                        <strong className="text-emerald-400">{rxn.typicalYield || '85-95%'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Atom Economy:</span>
                        <strong className="text-cyan-300">{rxn.atomEconomy || 'High'}</strong>
                      </div>
                    </div>

                    {rxn.reagentRequired && (
                      <div className="text-[10px] p-2 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                        <span className="text-amber-400 font-bold block">Reagents:</span>
                        <span className="text-slate-300 line-clamp-1">{rxn.reagentRequired}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => handleLoadReactionFromLibrary(rxn)}
                      className="flex-1 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Play className="w-3 h-3 fill-current" /> Synthesize in ARXN
                    </button>
                    <button
                      onClick={() => {
                        setMechanismReactionContext({
                          reactionClass: rxn.name,
                          reactionType: rxn.class,
                          reagents: rxn.reagentRequired || '',
                          solvent: rxn.typicalSolvent || '',
                          temperature: rxn.typicalTemp || '',
                          mechanismSteps: rxn.mechanism || []
                        });
                        setStudioMode('mechanism');
                      }}
                      className="p-1.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 text-[10px] font-bold transition cursor-pointer"
                      title="Inspect mechanism in CAD"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODE 3b: REACTION MECHANISM WORKSPACE
      ══════════════════════════════════════════════════════════════════════ */}
      {studioMode === 'mechanism' && (
        <div className="space-y-6">
          {/* Context banner when launched from another mode */}
          {mechanismReactionContext && (
            <div className="glass-panel p-3 rounded-2xl border border-violet-500/30 bg-violet-500/5 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2.5">
                <CornerDownRight className="w-4 h-4 text-violet-400 shrink-0" />
                <div>
                  <span className="font-black text-violet-300">{mechanismReactionContext.reactionClass}</span>
                  {mechanismReactionContext.reagents && (
                    <span className="text-slate-400 ml-2">· Reagents: {mechanismReactionContext.reagents}</span>
                  )}
                  {mechanismReactionContext.temperature && (
                    <span className="text-slate-400 ml-2">· {mechanismReactionContext.temperature}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setMechanismReactionContext(null)}
                className="text-slate-500 hover:text-slate-300 text-[10px] font-bold transition"
              >
                Clear Context
              </button>
            </div>
          )}
          <MechanismWorkspace
            activeReactionContext={mechanismReactionContext}
            onNavigateToForward={() => setStudioMode('forward')}
            onNavigateToRetrosynthesis={() => setStudioMode('retrosynthesis')}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODE 3: REACTION CAD CANVAS DRAWER
      ══════════════════════════════════════════════════════════════════════ */}
      {studioMode === 'drawer' && (
        <div className="space-y-6">
          <ReactionCanvasDrawer
            initialSmiles="c1ccccc1O"
            onApplyToReaction={handleApplyCanvasReactant}
            onApplyAsTarget={handleApplyCanvasTarget}
            title="Interactive 2D Reaction Sketcher & CAD Canvas"
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODE 4: AUTOMATED SYNTHESIS STAGES
      ══════════════════════════════════════════════════════════════════════ */}
      {studioMode === 'planner' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-inherit pb-3">
              <span className="text-xs font-black uppercase text-[var(--text-primary)] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                Laboratory Synthesis Execution Stages
              </span>
              <span className="telemetry-pill text-[9px] font-bold text-emerald-400">
                STAGE 2 ACTIVE (45 MIN REFLUX)
              </span>
            </div>

            <div className="space-y-3">
              {synthesisStages.map((stage) => (
                <div
                  key={stage.id}
                  className={`p-4 rounded-2xl inner-box border flex items-start justify-between gap-4 transition ${
                    stage.status === 'active'
                      ? 'border-cyan-500/50 bg-cyan-500/5 shadow-md'
                      : stage.status === 'completed'
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-[var(--border-subtle)] opacity-75'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        stage.status === 'completed'
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : stage.status === 'active'
                          ? 'bg-cyan-500 text-slate-950 font-black animate-pulse'
                          : 'bg-white/10 text-slate-400'
                      }`}>
                        {stage.status === 'completed' ? '✓' : stage.id}
                      </span>
                      <strong className="text-xs text-[var(--text-primary)] font-bold">{stage.name}</strong>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] font-sans pl-7">{stage.notes}</p>
                    <div className="pl-7 pt-1">
                      <button
                        onClick={() => {
                          setMechanismReactionContext({
                            reactionClass: stage.name,
                            reactionType: 'Synthesis Stage',
                            reagents: reagentsInput,
                            temperature: temperatureInput,
                            mechanismSteps: [stage.notes]
                          });
                          setStudioMode('mechanism');
                        }}
                        className="px-2 py-0.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-300 text-[10px] font-bold transition flex items-center gap-1"
                      >
                        <CornerDownRight className="w-2.5 h-2.5" /> Inspect Mechanism
                      </button>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-cyan-400 font-bold shrink-0">
                    {stage.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step Detail Modal */}
      {selectedStepModal && (
        <ReactionStepDetailModal
          step={selectedStepModal}
          onClose={() => setSelectedStepModal(null)}
        />
      )}

      {/* Categorized Reagent / Condition Palette Modal */}
      <ReagentSelectorModal
        isOpen={isReagentModalOpen}
        onClose={() => setIsReagentModalOpen(false)}
        onSelectReagent={(reagent) => {
          setReagentsInput((prev) => (prev ? `${prev}, ${reagent.formula || reagent.name}` : (reagent.formula || reagent.name)));
          if (reagent.solvent) setSolventInput(reagent.solvent);
          if (reagent.temperature) setTemperatureInput(reagent.temperature);
        }}
        onSelectCondition={(cond) => {
          setTemperatureInput(cond);
        }}
      />
    </div>
  );
}
