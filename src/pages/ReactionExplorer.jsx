import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Save,
  ShieldAlert,
  Layers,
  Check,
  Atom,
  CheckCircle2,
  RotateCcw,
  Plus,
  Workflow,
  Sparkles,
  Info,
  PenTool
} from 'lucide-react';
import ThreeMoleculeViewer from '../components/ThreeMoleculeViewer';
import { MOLECULES } from '../data/moleculeData';
import { usePersistedWork } from '../services/workPersistence';

const DEFAULT_REACTION_STATE = {
  title: 'Custom Reaction Pathway',
  category: 'Organic Synthesis',
  reactants: [
    { name: 'Salicylic Acid', formula: 'C₇H₆O₃', molId: 'aspirin', smiles: 'O=C(O)c1ccccc1O' },
    { name: 'Acetic Anhydride', formula: 'C₄H₆O₃', molId: 'ethanol', smiles: 'CC(=O)OC(=O)C' }
  ],
  products: [
    { name: 'Acetylsalicylic Acid (Aspirin)', formula: 'C₉H₈O₄', molId: 'aspirin', smiles: 'CC(=O)Oc1ccccc1C(=O)O' },
    { name: 'Acetic Acid', formula: 'C₂H₄O₂', molId: 'ethanol', smiles: 'CC(=O)O' }
  ],
  conditions: 'H₂SO₄ (conc.) catalyst, 85°C reflux, 30 min',
  mechanism: 'Nucleophilic acyl substitution: Protonation of the anhydride carbonyl increases electrophilicity, followed by phenolic hydroxyl attack to form a tetrahedral intermediate, resolving with elimination of acetic acid.'
};

const OPTIONAL_TEMPLATES = [
  {
    id: 'esterification',
    label: 'Fischer Esterification (Aspirin)',
    data: DEFAULT_REACTION_STATE
  },
  {
    id: 'combustion',
    label: 'Benzene Oxidation Combustion',
    data: {
      title: 'Benzene Complete Oxidation Combustion',
      category: 'Thermochemistry',
      reactants: [
        { name: 'Benzene', formula: '2 C₆H₆', molId: 'benzene', smiles: 'c1ccccc1' },
        { name: 'Oxygen', formula: '15 O₂', molId: 'water', smiles: 'O=O' }
      ],
      products: [
        { name: 'Carbon Dioxide', formula: '12 CO₂', molId: 'water', smiles: 'O=C=O' },
        { name: 'Water', formula: '6 H₂O', molId: 'water', smiles: 'O' }
      ],
      conditions: 'High temperature ignition (Exothermic ΔH = -6542 kJ/mol)',
      mechanism: 'High-temperature radical chain oxidation breaking down the aromatic conjugated pi system into oxidized gaseous products.'
    }
  },
  {
    id: 'sn2',
    label: 'SN2 Nucleophilic Substitution',
    data: {
      title: 'Bimolecular Nucleophilic Substitution (SN2)',
      category: 'Reaction Kinetics',
      reactants: [
        { name: 'Bromomethane', formula: 'CH₃Br', molId: 'ethanol', smiles: 'CBr' },
        { name: 'Hydroxide Ion', formula: 'OH⁻', molId: 'water', smiles: '[OH-]' }
      ],
      products: [
        { name: 'Methanol', formula: 'CH₃OH', molId: 'ethanol', smiles: 'CO' },
        { name: 'Bromide Ion', formula: 'Br⁻', molId: 'water', smiles: '[Br-]' }
      ],
      conditions: 'Polar aprotic solvent (DMSO or Acetone), 25°C',
      mechanism: 'Concerted backside nucleophilic attack with pentacoordinated transition state causing 100% Walden inversion of stereochemistry.'
    }
  }
];

export default function ReactionExplorer() {
  const navigate = useNavigate();

  // 1. Persistent Real-Time Reaction State: Resumes right where the user stopped
  const [reactionState, setReactionState, resetReactionState] = usePersistedWork(
    'chemspace_reaction_explorer_state',
    DEFAULT_REACTION_STATE
  );

  const [saved, setSaved] = useState(false);
  const [selectedReactantMolId, setSelectedReactantMolId] = useState(() => reactionState.reactants[0]?.molId || 'aspirin');
  const [selectedProductMolId, setSelectedProductMolId] = useState(() => reactionState.products[0]?.molId || 'aspirin');

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleUpdateField(field, value) {
    setReactionState((prev) => ({
      ...prev,
      [field]: value
    }));
  }

  function handleUpdateReactant(index, key, value) {
    setReactionState((prev) => {
      const nextReactants = [...prev.reactants];
      nextReactants[index] = { ...nextReactants[index], [key]: value };
      return { ...prev, reactants: nextReactants };
    });
  }

  function handleUpdateProduct(index, key, value) {
    setReactionState((prev) => {
      const nextProducts = [...prev.products];
      nextProducts[index] = { ...nextProducts[index], [key]: value };
      return { ...prev, products: nextProducts };
    });
  }

  function handleLoadTemplate(templateId) {
    const t = OPTIONAL_TEMPLATES.find((item) => item.id === templateId);
    if (t) {
      setReactionState(t.data);
      if (t.data.reactants[0]?.molId) setSelectedReactantMolId(t.data.reactants[0].molId);
      if (t.data.products[0]?.molId) setSelectedProductMolId(t.data.products[0].molId);
    }
  }

  const reactantMol = MOLECULES.find((m) => m.id === selectedReactantMolId) || MOLECULES[0];
  const productMol = MOLECULES.find((m) => m.id === selectedProductMolId) || MOLECULES[1];

  return (
    <div className="workspace-container font-sans select-none space-y-6 max-w-6xl mx-auto">
      {/* 1. Workspace Header */}
      <div className="workspace-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider text-[var(--text-primary)]">
                REACTION EXPLORER & TRANSFORMATION STUDIO
              </h1>
              <span className="telemetry-pill text-[9px] font-bold">
                PERSISTENT WORKSPACE
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
              Configure chemical transformations, customize reactants & products in real-time, and preserve your working state automatically.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const smi = reactionState.products[0]?.smiles || reactionState.reactants[0]?.smiles;
              if (smi) navigate(`/ibm-rxn?target=${encodeURIComponent(smi)}`);
              else navigate('/ibm-rxn');
            }}
            className="px-3 py-2 rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Export to IBM RXN Retrosynthesis Planner"
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Plan in IBM RXN</span>
          </button>

          <button
            type="button"
            onClick={resetReactionState}
            className="p-2 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition cursor-pointer"
            title="Reset to New Reaction Workspace"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="btn-horizontal btn-orange text-xs font-bold shadow-lg px-4 py-2 flex items-center gap-2 cursor-pointer"
          >
            {saved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Saved in Memory' : 'Save Pathway'}</span>
          </button>
        </div>
      </div>

      {/* 2. Reaction Overview & Quick Template Selector */}
      <div className="glass-panel p-4 rounded-3xl border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex-1 w-full space-y-1">
          <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block">
            Pathway Title & Category
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={reactionState.title}
              onChange={(e) => handleUpdateField('title', e.target.value)}
              placeholder="e.g. Fischer Esterification (Aspirin Synthesis)"
              className="flex-1 p-2 text-xs font-bold rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
            />
            <input
              type="text"
              value={reactionState.category}
              onChange={(e) => handleUpdateField('category', e.target.value)}
              placeholder="Category (e.g. Organic Synthesis)"
              className="w-44 p-2 text-xs font-mono rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-secondary)] focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Clean, Non-Intrusive Template Selector */}
        <div className="shrink-0 space-y-1">
          <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block">
            Load Preset (Optional)
          </label>
          <select
            onChange={(e) => e.target.value && handleLoadTemplate(e.target.value)}
            defaultValue=""
            className="p-2 text-xs font-mono rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="" disabled>Choose a template...</option>
            {OPTIONAL_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. 3D Reaction Diagram & Editable Components */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-start">
        {/* Reactant 3D Box & Inputs */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-3xl border border-[var(--border-subtle)] space-y-3 shadow-xl">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-emerald-500 font-bold flex items-center gap-1.5">
              <Atom className="w-4 h-4" /> Reactant Structure
            </span>
            <select
              value={selectedReactantMolId}
              onChange={(e) => setSelectedReactantMolId(e.target.value)}
              className="text-[10px] font-mono p-1 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-primary)] cursor-pointer"
              title="Select 3D Conformational Model"
            >
              {MOLECULES.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.formula})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-[var(--text-muted)] block">Reactant 1 Name</label>
                <input
                  type="text"
                  value={reactionState.reactants[0]?.name || ''}
                  onChange={(e) => handleUpdateReactant(0, 'name', e.target.value)}
                  placeholder="e.g. Salicylic Acid"
                  className="w-full p-1.5 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--text-muted)] block">Formula / SMILES</label>
                <input
                  type="text"
                  value={reactionState.reactants[0]?.formula || ''}
                  onChange={(e) => handleUpdateReactant(0, 'formula', e.target.value)}
                  placeholder="e.g. C7H6O3"
                  className="w-full p-1.5 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono text-xs"
                />
              </div>
            </div>

            {reactionState.reactants[1] && (
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[var(--border-subtle)]">
                <div>
                  <label className="text-[10px] text-[var(--text-muted)] block">Reactant 2 Name</label>
                  <input
                    type="text"
                    value={reactionState.reactants[1]?.name || ''}
                    onChange={(e) => handleUpdateReactant(1, 'name', e.target.value)}
                    placeholder="e.g. Acetic Anhydride"
                    className="w-full p-1.5 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-muted)] block">Formula / SMILES</label>
                  <input
                    type="text"
                    value={reactionState.reactants[1]?.formula || ''}
                    onChange={(e) => handleUpdateReactant(1, 'formula', e.target.value)}
                    placeholder="e.g. C4H6O3"
                    className="w-full p-1.5 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="h-[260px] w-full rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-canvas)] shadow-inner">
            <ThreeMoleculeViewer molecule={reactantMol} styleMode="ball-stick" />
          </div>
        </div>

        {/* Reaction Arrow & Conditions */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center p-2 text-center space-y-2 self-center">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 shadow-md">
            <ArrowRight className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-[9px] font-mono font-bold text-orange-500 uppercase tracking-wider">
            Reagents
          </span>
        </div>

        {/* Product 3D Box & Inputs */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-3xl border border-[var(--border-subtle)] space-y-3 shadow-xl">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-orange-500 font-bold flex items-center gap-1.5">
              <Atom className="w-4 h-4" /> Product Structure
            </span>
            <select
              value={selectedProductMolId}
              onChange={(e) => setSelectedProductMolId(e.target.value)}
              className="text-[10px] font-mono p-1 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-primary)] cursor-pointer"
              title="Select 3D Conformational Model"
            >
              {MOLECULES.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.formula})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-[var(--text-muted)] block">Product 1 Name</label>
                <input
                  type="text"
                  value={reactionState.products[0]?.name || ''}
                  onChange={(e) => handleUpdateProduct(0, 'name', e.target.value)}
                  placeholder="e.g. Aspirin"
                  className="w-full p-1.5 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--text-muted)] block">Formula / SMILES</label>
                <input
                  type="text"
                  value={reactionState.products[0]?.formula || ''}
                  onChange={(e) => handleUpdateProduct(0, 'formula', e.target.value)}
                  placeholder="e.g. C9H8O4"
                  className="w-full p-1.5 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono text-xs"
                />
              </div>
            </div>

            {reactionState.products[1] && (
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[var(--border-subtle)]">
                <div>
                  <label className="text-[10px] text-[var(--text-muted)] block">Product 2 Name</label>
                  <input
                    type="text"
                    value={reactionState.products[1]?.name || ''}
                    onChange={(e) => handleUpdateProduct(1, 'name', e.target.value)}
                    placeholder="e.g. Acetic Acid"
                    className="w-full p-1.5 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-muted)] block">Formula / SMILES</label>
                  <input
                    type="text"
                    value={reactionState.products[1]?.formula || ''}
                    onChange={(e) => handleUpdateProduct(1, 'formula', e.target.value)}
                    placeholder="e.g. C2H4O2"
                    className="w-full p-1.5 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="h-[260px] w-full rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-canvas)] shadow-inner">
            <ThreeMoleculeViewer molecule={productMol} styleMode="ball-stick" />
          </div>
        </div>
      </div>

      {/* 4. Reaction Conditions & Mechanistic Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Conditions Card */}
        <div className="glass-panel p-5 rounded-3xl border border-[var(--border-subtle)] space-y-2 shadow-lg">
          <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-500" /> Reaction Conditions &amp; Solvents
          </label>
          <textarea
            value={reactionState.conditions}
            onChange={(e) => handleUpdateField('conditions', e.target.value)}
            rows={3}
            placeholder="Specify catalyst, temperature, solvent, pressure, or reflux duration..."
            className="w-full p-2.5 text-xs rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-orange-500 resize-none font-sans leading-relaxed"
          />
        </div>

        {/* Mechanism Card */}
        <div className="glass-panel p-5 rounded-3xl border border-[var(--border-subtle)] space-y-2 shadow-lg">
          <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-500" /> Mechanistic Pathway &amp; Transition State Notes
          </label>
          <textarea
            value={reactionState.mechanism}
            onChange={(e) => handleUpdateField('mechanism', e.target.value)}
            rows={3}
            placeholder="Describe electron arrow-pushing, intermediates, kinetics, and stereochemical outcomes..."
            className="w-full p-2.5 text-xs rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-orange-500 resize-none font-sans leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
