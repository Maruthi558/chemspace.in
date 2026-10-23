import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
  Sliders,
  CheckCircle2,
  Box,
  Layers,
  Activity,
  Zap,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Info,
  Download,
  Play,
  Pause,
  Check
} from 'lucide-react';

const LITEMOL_COMPLEXES = [
  {
    id: 'stapled-peptide',
    title: 'Stapled peptide',
    category: 'peptides',
    subtitle: 'MDM2 · P07 Bis-Triazolyl Staple (5AFG)',
    ipTM: 0.940,
    affinity: '-10.8 kcal/mol',
    sequence: 'GAALEAAFKAEYFEL',
    tag: 'Macrocyclic Staple',
    color: 0x2563eb,
    ligandColor: 0xf97316,
    description: 'Double strain-promoted macrocyclization locking the alpha-helix into the hydrophobic binding cleft.'
  },
  {
    id: 'ncaa-peptide',
    title: 'ncAA peptide',
    category: 'peptides',
    subtitle: 'MDM2 · Non-Canonical Residue Variant',
    ipTM: 0.926,
    affinity: '-10.1 kcal/mol',
    sequence: 'FFTXLLXTS',
    tag: 'Unnatural Amino Acids',
    color: 0x0284c7,
    ligandColor: 0xfbbf24,
    description: 'Unnatural residue insertions yielding 0.926 ipTM while preserving complete synthetic novelty.'
  },
  {
    id: 'p53-peptide',
    title: 'p53 peptide',
    category: 'peptides',
    subtitle: 'MDM2 · Native Transactivation Helix (1YCR)',
    ipTM: 0.915,
    affinity: '-9.8 kcal/mol',
    sequence: 'SQETFSDLWKLLPEN',
    tag: 'Crystallographic Reference',
    color: 0x3b82f6,
    ligandColor: 0xf97316,
    description: 'Crystallographic baseline recovering the three key hydrophobic residues F19, W23, and L26.'
  },
  {
    id: 'linear-peptide',
    title: 'Linear peptide',
    category: 'peptides',
    subtitle: 'MDM2 · De Novo Generated Co-Fold',
    ipTM: 0.935,
    affinity: '-10.2 kcal/mol',
    sequence: 'GADLEAAFKDEYFEL',
    tag: 'De Novo Candidate',
    color: 0x1d4ed8,
    ligandColor: 0xea580c,
    description: 'Blank protein-conditioned search beating native p53 with only 7% sequence similarity to known binders.'
  },
  {
    id: 'depsipeptide',
    title: 'Depsipeptide',
    category: 'macrocycles',
    subtitle: 'Candidate LFD-114 · Cyclic Ester-Peptide',
    ipTM: 0.928,
    affinity: '-9.4 kcal/mol',
    sequence: 'Cyclo(-Leu-Phe-Asp-Trp-Gly-Ser-Arg-Tyr-Pro-Lys-Ala-Val-Thr-Cys-Gln-Ile-Met-His-Asn-)',
    tag: 'Cyclic Ester Backbone',
    color: 0x0369a1,
    ligandColor: 0xf59e0b,
    description: 'Macrocyclic depsipeptide with balanced oral solubility (SA score 3.1) and high target selectivity.'
  },
  {
    id: 'mz1-protac',
    title: 'MZ1 PROTAC',
    category: 'protacs',
    subtitle: 'BRD4 BD2 · MZ1 · VHL Ternary Chimera (5T35)',
    ipTM: 0.655,
    affinity: '-9.74 kcal/mol',
    sequence: 'JQ1 Warhead — PEG2 Linker — VH032 E3 Recruiter',
    tag: 'Heterobifunctional Degrader',
    color: 0x1e40af,
    ligandColor: 0xf97316,
    description: 'Piecewise editing: keeping VHL recruiter fixed, sampling novel warhead chemotypes via LiteMol-1.'
  },
  {
    id: 'fxi-macrocycle',
    title: 'FXIa Macrocycle',
    category: 'macrocycles',
    subtitle: 'Factor XIa · 15-Membered Brominated Ring (7MBO)',
    ipTM: 0.983,
    affinity: '-6.37 kcal/mol',
    sequence: '15-membered synthetic ring with bromine coordinated to Asp189',
    tag: 'Synthetic Macrocycle',
    color: 0x0284c7,
    ligandColor: 0xef4444,
    description: 'De novo synthetic ring matching clinical Milvexian (0.989 ipTM) with 0.13 Tanimoto similarity.'
  },
  {
    id: 'nav18-analogue',
    title: 'Nav1.8 Analogue',
    category: 'small-molecules',
    subtitle: 'SCN10A VSD2 · Chloroindole Peripheral Blocker (9DBN)',
    ipTM: 0.865,
    affinity: '-6.68 kcal/mol',
    sequence: 'Chloroindole-5-carboxylate docking into KKGS motif',
    tag: 'Selective Non-Opioid',
    color: 0x2563eb,
    ligandColor: 0xfbbf24,
    description: 'Selective pain analgesic docking into extracellular VSD2 cleft without CNS or hERG toxicity.'
  }
];

const AGENT_LOOP_STEPS = [
  { num: '01', title: 'generate', desc: 'Masked diffusion denoises candidate sequences across modalities' },
  { num: '02', title: 'inspect', desc: 'Agent filters chemotypes, validates SMILES syntax, checks PAINS' },
  { num: '03', title: 'simulate', desc: 'Rapid surrogate scoring: pharmacophore, solubility, and affinity' },
  { num: '04', title: 'evaluate', desc: 'Pareto non-dominated sorting maintains competing objectives' },
  { num: '05', title: 'edit', desc: 'In-painting corruption masks unstable spans for focused refinement' },
  { num: '06', title: 'generate again', desc: 'MCTS guides reverse diffusion branches toward optimal properties' }
];

// AF3 12 Targets benchmark data (Image 3)
const AF3_BENCHMARK_TARGETS = [
  { name: 'PD-L1', litemol: 0.32, rfdiff: 0.30, boltz: 0.31, odesign: null },
  { name: 'IL-7Rα', litemol: 0.29, rfdiff: 0.50, boltz: 0.05, odesign: 0.05 },
  { name: 'MDM2', litemol: 0.74, rfdiff: 0.82, boltz: null, odesign: 0.81 },
  { name: 'MCL-1', litemol: 0.46, rfdiff: 0.60, boltz: 0.43, odesign: 0.47 },
  { name: 'BCL-xL', litemol: 0.24, rfdiff: 0.83, boltz: 0.37, odesign: 0.02 },
  { name: 'XIAP', litemol: 0.65, rfdiff: 0.63, boltz: 0.29, odesign: 0.05 },
  { name: 'CTLA-4', litemol: 0.34, rfdiff: 0.30, boltz: 0.15, odesign: 0.10 },
  { name: 'TrkA', litemol: 0.35, rfdiff: 0.37, boltz: 0.31, odesign: 0.40 },
  { name: 'KEAP1', litemol: 0.36, rfdiff: 0.83, boltz: 0.42, odesign: 0.11 },
  { name: '14-3-3ε', litemol: 0.58, rfdiff: 0.52, boltz: 0.32, odesign: 0.55 },
  { name: 'HSP70', litemol: 0.70, rfdiff: 0.64, boltz: 0.28, odesign: 0.37 },
  { name: 'αIIbβ3', litemol: 0.02, rfdiff: 0.03, boltz: 0.49, odesign: 0.01 }
];

// Single Complex 3D Canvas Tile (Image 2)
function ComplexTile3D({ complex, onSelect, isSelected }) {
  const mountRef = useRef(null);
  const groupRef = useRef(null);
  const reqIdRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 240;
    const height = container.clientHeight || 200;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f4f8);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 15, 10);
    scene.add(dirLight);

    const mainGroup = new THREE.Group();
    groupRef.current = mainGroup;
    scene.add(mainGroup);

    // 1. Protein Cartoon Backbone Ribbon (Blue)
    const points = [];
    for (let i = 0; i < 45; i++) {
      const u = (i / 45) * Math.PI * 3.5;
      const r = 4.5 + Math.sin(u * 2) * 1.5;
      const x = Math.cos(u) * r;
      const y = (i - 22) * 0.35;
      const z = Math.sin(u) * r;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 60, 0.28, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: complex.color,
      roughness: 0.35
    });
    mainGroup.add(new THREE.Mesh(tubeGeo, tubeMat));

    // 2. Bound Ligand / Peptide (Orange / Gold core)
    const ligandPoints = [];
    for (let j = 0; j < 8; j++) {
      const sphereGeo = new THREE.SphereGeometry(0.55, 12, 12);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: complex.ligandColor,
        roughness: 0.2,
        metalness: 0.2
      });
      const atom = new THREE.Mesh(sphereGeo, sphereMat);
      const lx = Math.cos(j * 0.9) * 2.0;
      const ly = Math.sin(j * 0.7) * 1.6;
      const lz = (j - 4) * 0.45;
      atom.position.set(lx, ly, lz);
      mainGroup.add(atom);
      ligandPoints.push(new THREE.Vector3(lx, ly, lz));
    }
    for (let k = 0; k < ligandPoints.length - 1; k++) {
      const p1 = ligandPoints[k];
      const p2 = ligandPoints[k + 1];
      const dist = p1.distanceTo(p2);
      const bondGeo = new THREE.CylinderGeometry(0.12, 0.12, dist, 6);
      const bondMat = new THREE.MeshStandardMaterial({ color: 0xfdba74 });
      const bond = new THREE.Mesh(bondGeo, bondMat);
      bond.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
      bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
      mainGroup.add(bond);
    }

    // 3. Translucent Molecular Surface Cloud (Cyan/Blue)
    const cloudGeo = new THREE.IcosahedronGeometry(5.2, 2);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.28,
      roughness: 0.1
    });
    mainGroup.add(new THREE.Mesh(cloudGeo, cloudMat));

    // Drag to Rotate
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    const dom = renderer.domElement;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      mainGroup.rotation.y += dx * 0.01;
      mainGroup.rotation.x += dy * 0.01;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    let angle = Math.random() * Math.PI;
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      if (!isDragging) {
        angle += 0.006;
        mainGroup.rotation.y = angle;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [complex]);

  return (
    <div
      onClick={() => onSelect(complex)}
      className={`rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'border-cyan-500 shadow-lg ring-2 ring-cyan-500/20 bg-white dark:bg-slate-900'
          : 'border-slate-200 dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-900/60 hover:border-cyan-400/80 shadow-xs'
      }`}
    >
      <div className="relative h-44 w-full overflow-hidden bg-[#eef2f6] dark:bg-slate-950/80">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-sm border border-slate-200 dark:border-white/10 text-[10px] font-mono font-bold text-slate-800 dark:text-cyan-300">
          ipTM {complex.ipTM}
        </div>
        <div className="absolute top-2.5 right-2.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
          Drag to rotate
        </div>
      </div>

      <div className="p-3.5 space-y-1 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{complex.title}</h4>
          <span className="text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
            {complex.affinity}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">
          {complex.subtitle}
        </p>
      </div>
    </div>
  );
}

export default function LiteMolShowcaseSection() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedComplex, setSelectedComplex] = useState(LITEMOL_COMPLEXES[0]);

  // MCTS Interactive State (Image 4)
  const [mctsStep, setMctsStep] = useState(4); // 1: Selection, 2: Expansion, 3: Rollout, 4: Backpropagation

  // AF3 Benchmark Metric Switcher (Image 3)
  const [benchmarkMetric, setBenchmarkMetric] = useState('ipSAE'); // 'ipSAE', 'ipTM', 'pLDDT'

  const filteredComplexes = activeCategory === 'all'
    ? LITEMOL_COMPLEXES
    : LITEMOL_COMPLEXES.filter(c => c.category === activeCategory);

  return (
    <section className="space-y-12 py-6">
      {/* ─────────────────────────────────────────────────────────────────
          HEADER & SCIENTIFIC MANIFESTO CALLOUT
          ───────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>LITEMOL-1 RESEARCH DISCLOSURE · AUGUST 2026</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--home-text-primary,#f8fafc)]">
              LiteMol-1: Multi-Molecule Foundation Diffusion Model for Agents
            </h2>
            <p className="text-sm sm:text-base text-[var(--home-text-secondary,#94a3b8)] leading-relaxed">
              A masked diffusion language model pre-trained on molecular sequence tokens. A single set of weights generates across small molecules, linear and stapled peptides, non-canonical macrocycles, and heterobifunctional PROTACs.
            </p>
            <p className="text-xs font-mono text-cyan-400 font-semibold">
              "Let the Agents dream, explore and optimize."
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/ai-workspace')}
              className="btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 rounded-xl shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition"
            >
              <span>Launch Rosalind Agent Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 1: 8-BIOMOLECULAR COMPLEX 3D GALLERY (Image 2)
          ───────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
              Multi-Modality Complex Gallery
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              LiteMol-1 generates across molecular classes — small molecules, peptides, macrocycles, and more. Drag a tile to rotate.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono overflow-x-auto">
            {['all', 'peptides', 'macrocycles', 'protacs', 'small-molecules'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-lg capitalize transition ${
                  activeCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                {cat.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredComplexes.map((complex) => (
            <ComplexTile3D
              key={complex.id}
              complex={complex}
              onSelect={setSelectedComplex}
              isSelected={selectedComplex.id === complex.id}
            />
          ))}
        </div>

        {selectedComplex && (
          <div className="p-4 sm:p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-slate-900/40 to-slate-900/60 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {selectedComplex.tag}
                </span>
                <span className="text-sm font-bold text-white">{selectedComplex.title}</span>
                <span className="text-xs font-mono text-emerald-400 font-bold">ipTM {selectedComplex.ipTM}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedComplex.description}
              </p>
              <p className="text-[11px] font-mono text-cyan-300/90 break-all">
                Sequence: {selectedComplex.sequence}
              </p>
            </div>

            <button
              onClick={() => navigate('/ai-workspace')}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition cursor-pointer"
            >
              <span>Analyze in Rosalind</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 2: MCTS OVER DISCRETE-DIFFUSION STATE SPACE (Image 4)
          ───────────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[var(--home-surface-card,#131622)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                MCTS over a discrete-diffusion state space
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                iter 24/24
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              The tree grows as search proceeds — each iteration adds a reverse-diffusion move
            </p>
          </div>

          {/* 4 Search Phase Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono">
            {[
              { num: 1, label: 'Selection' },
              { num: 2, label: 'Expansion' },
              { num: 3, label: 'Rollout' },
              { num: 4, label: 'Backpropagation' }
            ].map((p) => (
              <button
                key={p.num}
                type="button"
                onClick={() => setMctsStep(p.num)}
                className={`px-3 py-1 rounded-lg transition ${
                  mctsStep === p.num
                    ? 'bg-[#3b3a6d] text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                {p.num} {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tree Diagram Visualizer (Exact Image 4) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4 font-mono text-xs">
            {/* Level z_T */}
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-slate-400 w-8">z_T</span>
              <div className="w-12 h-12 rounded-full bg-[#3b3a6d] text-white flex flex-col items-center justify-center font-bold shadow-md">
                <span>24</span>
                <span className="text-[9px] text-slate-300">0.66</span>
              </div>
            </div>

            {/* Connecting lines */}
            <div className="w-48 h-4 border-t-2 border-r-2 border-l-2 border-slate-300 dark:border-slate-700" />

            {/* Level t2 */}
            <div className="flex items-center gap-8">
              <span className="text-[10px] text-slate-400 w-8">t2</span>
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex flex-col items-center justify-center text-[11px]">
                <span>8</span>
                <span className="text-[8px] text-slate-400">0.66</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#3b3a6d] text-white flex flex-col items-center justify-center text-[11px] font-bold shadow-sm ring-2 ring-purple-400">
                <span>8</span>
                <span className="text-[8px] text-slate-200">0.65</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex flex-col items-center justify-center text-[11px]">
                <span>8</span>
                <span className="text-[8px] text-slate-400">0.67</span>
              </div>
            </div>

            {/* Level t1 */}
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-slate-400 w-8">t1</span>
              {[
                { v: 4, q: 0.73 },
                { v: 3, q: 0.68 },
                { v: 3, q: 0.66 },
                { v: 4, q: 0.73, active: true },
                { v: 4, q: 0.73 },
                { v: 3, q: 0.68 }
              ].map((n, i) => (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-full flex flex-col items-center justify-center text-[10px] ${
                    n.active
                      ? 'bg-[#3b3a6d] text-white font-bold ring-2 ring-purple-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{n.v}</span>
                  <span className="text-[8px] text-slate-400">{n.q}</span>
                </div>
              ))}
            </div>

            {/* Level z_0 Terminal leaves */}
            <div className="flex items-center gap-2 overflow-x-auto w-full justify-center pt-2">
              <span className="text-[10px] text-slate-400 w-8">z_0</span>
              {[
                { v: 1, q: 0.72 },
                { v: 2, q: 0.85 },
                { v: 1, q: 0.66 },
                { v: 1, q: 0.81 },
                { v: 1, q: 0.71 },
                { v: 1, q: 0.79 },
                { v: 1, q: 0.66 },
                { v: 2, q: 0.79, active: true },
                { v: 1, q: 0.80 },
                { v: 2, q: 0.84 },
                { v: 1, q: 0.66 },
                { v: 1, q: 0.84 }
              ].map((l, idx) => (
                <div
                  key={idx}
                  className={`w-8 h-8 rounded-full flex flex-col items-center justify-center text-[9px] ${
                    l.active
                      ? 'bg-[#3b3a6d] text-white font-bold ring-2 ring-purple-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{l.v}</span>
                  <span className="text-[7px] text-slate-400">{l.q}</span>
                </div>
              ))}
            </div>

            {/* Terminal sequence card */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-bold">z_0</span>
              {['R', 'K', 'R', 'R', 'R', 'A', 'K', 'R'].map((res, i) => (
                <span
                  key={i}
                  className="w-6 h-6 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-900 dark:text-white"
                >
                  {res}
                </span>
              ))}
              <span className="font-bold text-emerald-600 dark:text-emerald-400 ml-2">0.823</span>
            </div>
          </div>

          {/* Two Columns: Backpropagation Math vs Multi-Objective Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* Left: Formula & Rollout objectives */}
            <div className="space-y-3">
              <h5 className="font-bold text-sm text-slate-900 dark:text-white">Backpropagation</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The reward travels back up the path, updating visit counts and value estimates.
              </p>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 font-mono text-sm font-bold text-purple-700 dark:text-purple-300">
                N += 1, &nbsp; W += r, &nbsp; Q = W / N
              </div>

              <div className="space-y-1.5 pt-1 text-xs font-mono">
                <span className="text-[11px] text-slate-400 font-bold uppercase">This Rollout</span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">objective α</span>
                  <div className="w-36 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full w-[91%]" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">0.91 ×0.5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">objective β</span>
                  <div className="w-36 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[80%]" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">0.80 ×0.3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">objective γ</span>
                  <div className="w-36 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[63%]" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">0.63 ×0.2</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Reward</span>
                  <span className="font-bold text-emerald-500">0.823</span>
                </div>
              </div>
            </div>

            {/* Right: Multi-Objective Predicted Property Scores Chart */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                  Predicted property scores over iterations
                </h5>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-indigo-500 font-bold">— α</span>
                  <span className="text-emerald-500 font-bold">— β</span>
                  <span className="text-amber-500 font-bold">— γ</span>
                </div>
              </div>

              <div className="h-44 w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-200 dark:border-slate-800 relative">
                <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                  {/* Grid */}
                  <line x1="0" y1="30" x2="300" y2="30" stroke="#94a3b8" strokeOpacity="0.2" />
                  <line x1="0" y1="60" x2="300" y2="60" stroke="#94a3b8" strokeOpacity="0.2" />
                  <line x1="0" y1="90" x2="300" y2="90" stroke="#94a3b8" strokeOpacity="0.2" />

                  {/* Objective Alpha curve */}
                  <path
                    d="M 0,95 Q 60,80 120,50 T 180,35 T 240,25 T 300,18"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                  />
                  {/* Objective Beta curve */}
                  <path
                    d="M 0,70 Q 70,65 140,45 T 210,38 T 260,30 T 300,20"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                  />
                  {/* Objective Gamma curve */}
                  <path
                    d="M 0,110 Q 50,90 100,75 T 160,55 T 220,50 T 300,45"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                  />
                </svg>
                <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
                  <span>0</span>
                  <span>MCTS Iterations</span>
                  <span>24</span>
                </div>
              </div>
              <p className="text-[10px] font-mono text-slate-400 text-center">
                solid · best found &nbsp;·&nbsp; dashed · mean ± σ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 3: AF3 CO-FOLD SWARM BENCHMARK ACROSS 12 TARGETS (Image 3)
          ───────────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[var(--home-surface-card,#131622)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              AF3 Co-Fold Benchmarks Across 12 Targets
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Top 20 unique sequences per model × target. Open markers are per-model means.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono">
            {['ipSAE', 'ipTM', 'pLDDT'].map((metric) => (
              <button
                key={metric}
                type="button"
                onClick={() => setBenchmarkMetric(metric)}
                className={`px-3 py-1 rounded-lg transition ${
                  benchmarkMetric === metric
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                {metric}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-bold">
            <span>◆</span>
            <span>LiteMol-1</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
            <span>▲</span>
            <span>RFdiffusion3</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
            <span>■</span>
            <span>BoltzGen</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold">
            <span>⬡</span>
            <span>O-Design</span>
          </div>
        </div>

        {/* Swarm Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {AF3_BENCHMARK_TARGETS.map((t) => (
            <div
              key={t.name}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
            >
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-slate-900 dark:text-white">{t.name}</span>
                <span className="text-[10px] text-cyan-400 font-semibold">{benchmarkMetric}</span>
              </div>

              {/* Dot swarm simulation */}
              <div className="h-28 flex items-end justify-between px-2 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800 py-1">
                {/* LiteMol-1 */}
                <div className="flex flex-col items-center">
                  <div
                    style={{ height: `${(t.litemol / 0.9) * 80}px` }}
                    className="w-2.5 rounded-full bg-teal-500 shadow-xs"
                    title={`LiteMol-1: ${t.litemol}`}
                  />
                  <span className="text-[9px] text-teal-500 font-bold mt-1">◆</span>
                </div>
                {/* RFdiffusion3 */}
                <div className="flex flex-col items-center">
                  <div
                    style={{ height: `${(t.rfdiff / 0.9) * 80}px` }}
                    className="w-2.5 rounded-full bg-amber-500 shadow-xs"
                    title={`RFdiffusion3: ${t.rfdiff}`}
                  />
                  <span className="text-[9px] text-amber-500 font-bold mt-1">▲</span>
                </div>
                {/* BoltzGen */}
                <div className="flex flex-col items-center">
                  <div
                    style={{ height: `${((t.boltz || 0.1) / 0.9) * 80}px` }}
                    className="w-2.5 rounded-full bg-slate-600 shadow-xs"
                    title={`BoltzGen: ${t.boltz || 'N/A'}`}
                  />
                  <span className="text-[9px] text-slate-400 font-bold mt-1">■</span>
                </div>
                {/* O-Design */}
                <div className="flex flex-col items-center">
                  <div
                    style={{ height: `${((t.odesign || 0.1) / 0.9) * 80}px` }}
                    className="w-2.5 rounded-full bg-purple-500 shadow-xs"
                    title={`O-Design: ${t.odesign || 'N/A'}`}
                  />
                  <span className="text-[9px] text-purple-400 font-bold mt-1">⬡</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          SECTION 4: SEARCH PROGRESS ON LINEAR PEPTIDES 4-PANEL (Image 5)
          ───────────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[var(--home-surface-card,#131622)] space-y-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Search progress on linear peptides
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Search over successive rounds. Each round scores 32 new peptides. Fast scoring functions steer sampling while co-folding stays outside the inner search loop.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Panel 1 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <span className="font-bold text-xs font-mono text-slate-900 dark:text-white">Combined search score</span>
            <div className="h-28 w-full">
              <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                <path
                  d="M 0,80 L 15,65 L 30,75 L 45,50 L 60,70 L 75,55 L 90,60 L 105,45 L 120,50 L 135,35 L 150,45 L 165,30 L 180,40 L 200,25"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />
              </svg>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-400">
              <span>0 rounds</span>
              <span>60 rounds</span>
            </div>
          </div>

          {/* Panel 2 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <span className="font-bold text-xs font-mono text-slate-900 dark:text-white">Pocket-motif score</span>
            <div className="h-28 w-full">
              <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                <path
                  d="M 0,60 L 20,45 L 40,55 L 60,35 L 80,48 L 100,30 L 120,40 L 140,25 L 160,35 L 180,18 L 200,22"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />
              </svg>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-400">
              <span>0 rounds</span>
              <span>60 rounds</span>
            </div>
          </div>

          {/* Panel 3 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <span className="font-bold text-xs font-mono text-slate-900 dark:text-white">Filter pass rate</span>
            <div className="h-28 w-full">
              <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                <path
                  d="M 0,75 L 15,85 L 30,55 L 45,70 L 60,40 L 75,65 L 90,45 L 105,60 L 120,35 L 135,50 L 150,30 L 165,40 L 180,20 L 200,30"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />
              </svg>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-400">
              <span>0 rounds</span>
              <span>60 rounds</span>
            </div>
          </div>

          {/* Panel 4 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <span className="font-bold text-xs font-mono text-slate-900 dark:text-white">Valid peptides</span>
            <div className="h-28 w-full">
              <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                <path
                  d="M 0,40 L 20,25 L 40,30 L 60,15 L 80,25 L 100,10 L 120,20 L 140,12 L 160,15 L 180,8 L 200,5"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />
              </svg>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-400">
              <span>0 rounds</span>
              <span>60 rounds</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
