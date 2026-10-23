import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Maximize2,
  Minimize2,
  Share2,
  Check,
  Sparkles,
  Paperclip,
  Image as ImageIcon,
  Send,
  ThumbsUp,
  ThumbsDown,
  Play,
  Square,
  RefreshCw,
  Sliders,
  Eye,
  Layers,
  Terminal,
  Activity,
  Box,
  Compass,
  ArrowLeft,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { usePersistedWork } from '../../services/workPersistence';
import DynamoSimulationStudio from './DynamoSimulationStudio';

// Verified Biomolecular Complexes from LiteMol-1 Manifesto & Rosalind Benchmarks
const ROSALIND_TARGETS = {
  'pertuzumab': {
    id: 'pertuzumab',
    name: 'pertuzumab_v2_2_L234S_L235T_G236R',
    system: 'HER2 ECD · Boltz-1 Monomer Complex',
    model: 'boltz',
    pdbId: '1S78',
    status: 'Completed',
    sequence: 'DIQMTQSPSSLSASVGDRVTITCKASQDVSIGVAWYQQKPGKAPKLLIYSASYRYTGVPSRFSGSGSGTDFTLTISSLQPEDFATYYCQQYYIYPYTFGQGTKVEIK',
    mw: 24312.4,
    metrics: {
      meanPlddt: 0.88,
      ptm: 0.509,
      iptm: 0.935,
      clashScore: 3.55,
      confidence: 0.802,
      affinityPk: '-9.4 kcal/mol',
      ligandIptm: 0.940,
      proteinIptm: 0.898,
      complexPlddt: 0.88,
      complexIplddt: 0.88,
      complexPde: 0.931,
      complexIpde: 0.000
    },
    thinkingLog: [
      'Phase 4 filtering is complete. 76 of 100 molecules passed all filters, with excellent novelty (max Tanimoto ~0.13 vs references — genuinely novel chemotypes). The primary attrition was from validity (16 lost) and PAINS (9 lost).',
      'Now I need to proceed with Phase 5 (Docking) and prepare for Phase 6 (ADMET). Let me first review the filtered results, then set up the docking jobs.'
    ],
    thinkingSnippet: '...d data is clear and the top 20 SDFs are ready. Now I need to ...ase 5 (Docking) and Phase 6 (ADMET) in parallel. Let me load the ...hemas.'
  },
  'mdm2-p53': {
    id: 'mdm2-p53',
    name: 'MDM2_deNovo_GADLEAAFKDEYFEL',
    system: 'MDM2 RING Ligase · Native & De Novo Peptides',
    model: 'protenix',
    pdbId: '1YCR',
    status: 'Completed',
    sequence: 'GADLEAAFKDEYFEL',
    mw: 1684.8,
    metrics: {
      meanPlddt: 0.92,
      ptm: 0.898,
      iptm: 0.935,
      clashScore: 2.18,
      confidence: 0.928,
      affinityPk: '-10.2 kcal/mol',
      ligandIptm: 0.935,
      proteinIptm: 0.915,
      complexPlddt: 0.92,
      complexIplddt: 0.91,
      complexPde: 0.945,
      complexIpde: 0.012
    },
    thinkingLog: [
      'De novo peptide exploration recovered MDM2 hydrophobic triad F19/W23/L26 cleft without copying p53 sequence.',
      'Selected candidate GADLEAAFKDEYFEL exhibits ipTM 0.935 vs native p53 (0.915) with only 7% sequence similarity.'
    ],
    thinkingSnippet: '...binding energy converged at -10.2 kcal/mol. Validating staple variant GAALEAAFKAEYFEL (P07 bis-triazolyl) for 0.940 ipTM.'
  },
  'nav18-vsd2': {
    id: 'nav18-vsd2',
    name: 'Nav1.8_VSD2_Chloroindole_Select',
    system: 'SCN10A Voltage Sensor 2 · Peripheral Pain Target',
    model: 'vina-allatom',
    pdbId: '9DBN',
    status: 'Completed',
    sequence: 'Cl-c1ccc2[nH]c(cc2c1)C(=O)O...-motif-V746-K748-K749-G750-S751',
    mw: 428.6,
    metrics: {
      meanPlddt: 0.85,
      ptm: 0.742,
      iptm: 0.865,
      clashScore: 1.84,
      confidence: 0.884,
      affinityPk: '-6.68 kcal/mol',
      ligandIptm: 0.870,
      proteinIptm: 0.850,
      complexPlddt: 0.86,
      complexIplddt: 0.85,
      complexPde: 0.912,
      complexIpde: 0.005
    },
    thinkingLog: [
      'Targeting extracellular VSD2 cleft (residues 680–770) from cryo-EM structure 9DBN.',
      'Selected chloroindole with benzoic acid (-6.68 kcal/mol). Contacting selectivity motif KKGS. Predicted BBB (0.18) avoids CNS sedation, hERG 0.38.'
    ],
    thinkingSnippet: '...100ns all-atom OpenMM simulation confirms ligand RMSD holds in 2-3 Å band without pore occlusion.'
  },
  'fxia-macrocycle': {
    id: 'fxia-macrocycle',
    name: 'FXIa_15Membered_Brominated_Ring',
    system: 'Factor XIa Catalytic Protease · Antithrombotic Target',
    model: 'protenix-vina',
    pdbId: '7MBO',
    status: 'Completed',
    sequence: '15-membered brominated macrocycle (Br on Asp189 catalytic pocket)',
    mw: 582.4,
    metrics: {
      meanPlddt: 0.94,
      ptm: 0.890,
      iptm: 0.983,
      clashScore: 1.62,
      confidence: 0.983,
      affinityPk: '-6.37 kcal/mol',
      ligandIptm: 0.983,
      proteinIptm: 0.989,
      complexPlddt: 0.94,
      complexIplddt: 0.93,
      complexPde: 0.965,
      complexIpde: 0.001
    },
    thinkingLog: [
      'Unconditional LiteMol-1 length L=40 yielded 15-membered synthetic macrocycle.',
      'Bromine atom specifically nests on Asp189 specificity pocket at 3.82 Å distance across docking repeats. Co-fold ipTM 0.983 rivals clinical milvexian (0.989).'
    ],
    thinkingSnippet: '...Asp189 coordination verified. Pose RMSD holds at 0.15–0.22 Å with 0.13 Tanimoto similarity to milvexian.'
  },
  'brd4-mz1': {
    id: 'brd4-mz1',
    name: 'BRD4_BD2_Benzofuran_Chimera',
    system: 'BRD4 BD2 · VHL Ternary PROTAC Degradation Complex',
    model: 'boltz-vina',
    pdbId: '5T35',
    status: 'Completed',
    sequence: 'Benzofuran-imidazothiazole-pyrrole warhead coupled to PEG2-VH032 recruiter',
    mw: 1042.3,
    metrics: {
      meanPlddt: 0.86,
      ptm: 0.612,
      iptm: 0.644,
      clashScore: 2.95,
      confidence: 0.742,
      affinityPk: '-9.74 kcal/mol',
      ligandIptm: 0.644,
      proteinIptm: 0.655,
      complexPlddt: 0.85,
      complexIplddt: 0.84,
      complexPde: 0.892,
      complexIpde: 0.015
    },
    thinkingLog: [
      'Generated novel BRD4 BD2 small-molecule warhead (benzofuran-imidazothiazole-pyrrole) docking at -9.74 kcal/mol vs JQ1 at -8.34.',
      'Agent installed coupling handle and attached VHL recruiter VH032. Ternary co-fold ipTM reaches 0.644 (reference MZ1 0.655).'
    ],
    thinkingSnippet: '...assembled chimera preserves crystal geometry without copying JQ1 chemotype (Tanimoto 0.17).'
  },
  'lambda-cro': {
    id: 'lambda-cro',
    name: 'lambda-cro',
    system: 'Bacteriophage Lambda Cro Repressor Benchmark',
    model: 'boltz',
    pdbId: '1CRO',
    status: 'Completed',
    sequence: 'MEQRITLKDYAMRFGQTKTAKDLGVYQSAINKAIHAGRKIFLTINADGSVYAEEVKPFPSNKKTTA',
    mw: 7351.2,
    metrics: {
      meanPlddt: 0.89,
      ptm: 0.512,
      iptm: 0.910,
      clashScore: 3.20,
      confidence: 0.810,
      affinityPk: '-8.9 kcal/mol',
      ligandIptm: 0.910,
      proteinIptm: 0.895,
      complexPlddt: 0.89,
      complexIplddt: 0.88,
      complexPde: 0.925,
      complexIpde: 0.000
    },
    thinkingLog: [
      'Phase 4 filtering is complete. 76 of 100 molecules passed all filters, with excellent novelty.',
      'Now I need to proceed with Phase 5 (Docking) and prepare for Phase 6 (ADMET).'
    ],
    thinkingSnippet: '...d data is clear and the top 20 SDFs are ready. Preparing downstream docking batch.'
  }
};

const EXECUTION_STEPS = [
  { id: 'thinking', label: 'Thinking', subtext: 'Considering macrocyclization strategies for ring sta|' },
  { id: 'internet', label: 'Gathering context from the internet', subtext: 'Searching PubMed & bioRxiv for conformation-constrained staples' },
  { id: 'public-data', label: 'Gathering context from public data sources', subtext: 'Querying ChEMBL, PDB 1YCR & 9DBN binding pocket residues' },
  { id: 'reasoning', label: 'Reasoning', subtext: 'Formulating Monte Carlo Tree Search guidance objective weights' },
  { id: 'tasks', label: 'Performing tasks', subtext: 'Simulating reverse diffusion & discrete token denoising trajectories' },
  { id: 'drafting', label: 'Drafting on Atomic', subtext: 'Compiling Candidate LFD-114 specifications and safety profile' }
];

export default function RosalindWorkstation() {
  const [selectedTargetId, setSelectedTargetId] = usePersistedWork('chemspace_rosalind_target', 'pertuzumab');
  const [workstationMode, setWorkstationMode] = usePersistedWork('chemspace_rosalind_mode', 'agent'); // 'agent' or 'dynamo'
  const [isTaskPlanExpanded, setIsTaskPlanExpanded] = useState(true);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true);
  const [isDraftCardVisible, setIsDraftCardVisible] = useState(true);
  const [isReasoningDrawerOpen, setIsReasoningDrawerOpen] = useState(false);
  const [executionMode, setExecutionMode] = useState('completed'); // 'running' or 'completed'
  const [userPrompt, setUserPrompt] = useState('');
  const [thumbsFeedback, setThumbsFeedback] = useState(null);
  const [approvedCandidates, setApprovedCandidates] = useState([]);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Live Typewriter Effect for "Considering macrocyclization strategies for ring sta|"
  const [typewriterText, setTypewriterText] = useState('Considering macrocyclization strategies for ring sta');
  const [cursorVisible, setCursorVisible] = useState(true);

  // 3D Canvas
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const groupRef = useRef(null);
  const reqIdRef = useRef(null);
  const [isAutorotating, setIsAutorotating] = useState(true);
  const [surfaceView, setSurfaceView] = useState(true);

  const activeTarget = ROSALIND_TARGETS[selectedTargetId] || ROSALIND_TARGETS['pertuzumab'];

  // Typewriter animation simulation
  useEffect(() => {
    const fullPhrase = 'Considering macrocyclization strategies for ring stability and target cleft occupancy';
    let idx = 45;
    let forward = true;

    const interval = setInterval(() => {
      if (forward) {
        if (idx < fullPhrase.length) {
          idx++;
          setTypewriterText(fullPhrase.slice(0, idx));
        } else {
          forward = false;
        }
      } else {
        if (idx > 40) {
          idx--;
          setTypewriterText(fullPhrase.slice(0, idx));
        } else {
          forward = true;
        }
      }
    }, 120);

    const blink = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(blink);
    };
  }, []);

  // Three.js Interactive 3D Molecular Complex Visualization
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0e1217);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 0, 36);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x60a5fa, 1.4);
    dirLight1.position.set(20, 25, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf97316, 1.0);
    dirLight2.position.set(-20, -15, -20);
    scene.add(dirLight2);

    const mainGroup = new THREE.Group();
    groupRef.current = mainGroup;
    scene.add(mainGroup);

    // Construct Biomolecular Ribbon & Surface Envelope
    // 1. Antibody / Protein Ribbon (Backbone Curve with Spline)
    const points = [];
    const numPoints = 65;
    for (let i = 0; i < numPoints; i++) {
      const u = (i / numPoints) * Math.PI * 4;
      const r = 7 + Math.sin(u * 2.5) * 2.2;
      const x = Math.cos(u) * r;
      const y = (i - numPoints / 2) * 0.45;
      const z = Math.sin(u) * r + Math.cos(u * 1.5) * 1.5;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.35, 12, false);
    const tubeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.25,
      metalness: 0.15
    });
    const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
    mainGroup.add(tubeMesh);

    // 2. Secondary Structure Sheets/Helices
    for (let i = 0; i < 9; i++) {
      const strandGeo = new THREE.BoxGeometry(0.8, 4.5, 0.2);
      const strandMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x2563eb : 0x0284c7,
        roughness: 0.3
      });
      const strand = new THREE.Mesh(strandGeo, strandMat);
      const angle = (i / 9) * Math.PI * 2;
      strand.position.set(Math.cos(angle) * 6, Math.sin(angle * 2) * 3, Math.sin(angle) * 6);
      strand.rotation.set(angle * 0.5, angle, 0.4);
      mainGroup.add(strand);
    }

    // 3. Bound Ligand / Peptide in Deep Pocket (Orange / Gold core)
    const ligandGroup = new THREE.Group();
    const ligandPoints = [];
    for (let j = 0; j < 14; j++) {
      const sphereGeo = new THREE.SphereGeometry(0.65, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: j % 3 === 0 ? 0xf97316 : j % 3 === 1 ? 0xfbbf24 : 0xef4444,
        roughness: 0.15,
        metalness: 0.4
      });
      const atomMesh = new THREE.Mesh(sphereGeo, sphereMat);
      const lx = Math.cos(j * 0.7) * 2.8;
      const ly = Math.sin(j * 0.5) * 2.2;
      const lz = (j - 7) * 0.6;
      atomMesh.position.set(lx, ly, lz);
      ligandGroup.add(atomMesh);
      ligandPoints.push(new THREE.Vector3(lx, ly, lz));
    }
    // Ligand bonds
    for (let k = 0; k < ligandPoints.length - 1; k++) {
      const p1 = ligandPoints[k];
      const p2 = ligandPoints[k + 1];
      const dist = p1.distanceTo(p2);
      const bondGeo = new THREE.CylinderGeometry(0.18, 0.18, dist, 8);
      const bondMat = new THREE.MeshStandardMaterial({ color: 0xfdba74, roughness: 0.2 });
      const bond = new THREE.Mesh(bondGeo, bondMat);
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      bond.position.copy(mid);
      bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
      ligandGroup.add(bond);
    }
    mainGroup.add(ligandGroup);

    // 4. Translucent Pocket Surface Cloud
    const surfaceGeo = new THREE.IcosahedronGeometry(7.5, 2);
    const surfaceMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      wireframe: false,
      roughness: 0.1,
      metalness: 0.1
    });
    const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
    surfaceMesh.name = 'pocketSurface';
    mainGroup.add(surfaceMesh);

    // Mouse Drag Rotation
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      mainGroup.rotation.y += deltaX * 0.008;
      mainGroup.rotation.x += deltaY * 0.008;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let angle = 0;
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      if (isAutorotating && !isDragging) {
        angle += 0.005;
        mainGroup.rotation.y = angle;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [selectedTargetId, isAutorotating]);

  // Toggle pocket surface
  useEffect(() => {
    if (groupRef.current) {
      const surface = groupRef.current.getObjectByName('pocketSurface');
      if (surface) surface.visible = surfaceView;
    }
  }, [surfaceView]);

  const handleApproveCandidate = () => {
    if (!approvedCandidates.includes('Candidate LFD-114')) {
      setApprovedCandidates((prev) => [...prev, 'Candidate LFD-114']);
    }
  };

  const handleShare = () => {
    setShareSuccess(true);
    navigator.clipboard?.writeText(
      `Candidate LFD-114 | Cyclo(-Leu-Phe-Asp-Trp-Gly-Ser-Arg-Tyr-Pro-Lys-Ala-Val-Thr-Cys-Gln-Ile-Met-His-Asn-) | MW 1,612.8 g/mol | Affinity -9.4 kcal/mol | Generated via LiteMol-1 Rosalind Agent`
    );
    setTimeout(() => setShareSuccess(false), 2400);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--sci-bg-main,#0b0f14)] text-[var(--sci-text-primary,#f1f5f9)] overflow-hidden font-sans select-none">
      {/* ─────────────────────────────────────────────────────────────────
          TOP STATUS BAR (Rosalind Header + Target Dropdown + Credits)
          ───────────────────────────────────────────────────────────────── */}
      <header className="h-12 border-b border-[var(--sci-border,#263445)] bg-[var(--sci-bg-panel,#111821)] px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          {/* Logo / Agent Avatar */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-cyan-400 flex items-center justify-center p-0.5 shadow-sm">
              <div className="w-full h-full rounded-full bg-[var(--sci-bg-panel,#111821)] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              </div>
            </div>
            <span className="font-bold text-sm tracking-tight text-[var(--sci-text-primary,#f1f5f9)]">Rosalind</span>
          </div>

          <div className="h-4 w-px bg-[var(--sci-border,#263445)]" />

          {/* Model / Target Dropdown Selector */}
          <div className="relative">
            <select
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className="bg-[var(--sci-bg-card,#17212d)] border border-[var(--sci-border,#263445)] rounded-md px-2.5 py-1 text-xs font-mono font-medium text-[var(--sci-text-primary,#f1f5f9)] focus:outline-none focus:border-cyan-400 cursor-pointer pr-7 appearance-none"
              title="Select Biomolecular Target Complex"
            >
              <option value="pertuzumab">pertuzumab_v2_2_L234S_L235T_G236R (Boltz)</option>
              <option value="mdm2-p53">MDM2 (1YCR · p53 Native vs De Novo)</option>
              <option value="nav18-vsd2">Nav1.8 (9DBN · VSD2 Chloroindole)</option>
              <option value="fxia-macrocycle">FXIa (7MBO · 15-Membered Macrocycle)</option>
              <option value="brd4-mz1">BRD4 (5T35 · MZ1 PROTAC Warhead)</option>
              <option value="lambda-cro">lambda-cro (Benchmark Repressor)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--sci-text-secondary,#94a3b8)] absolute right-2 top-2 pointer-events-none" />
          </div>

          {/* Credits Counter Pill (Image 3) */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--sci-bg-card,#17212d)] border border-[var(--sci-border,#263445)] text-[11px] font-mono text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>270.2</span>
          </div>

          <div className="h-4 w-px bg-[var(--sci-border,#263445)]" />

          {/* Mode Switcher: Rosalind Agent vs Dynamo MD Lab */}
          <div className="flex items-center bg-[var(--sci-bg-card,#17212d)] p-0.5 rounded-lg border border-[var(--sci-border,#263445)] text-xs font-mono">
            <button
              type="button"
              onClick={() => setWorkstationMode('agent')}
              className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                workstationMode === 'agent'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                  : 'text-[var(--sci-text-secondary,#94a3b8)] hover:text-white'
              }`}
              title="Rosalind Agentic Diffusion Workstation"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rosalind</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkstationMode('dynamo')}
              className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                workstationMode === 'dynamo'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-[var(--sci-text-secondary,#94a3b8)] hover:text-white'
              }`}
              title="Dynamo 100ns Molecular Dynamics Lab"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Dynamo MD</span>
            </button>
          </div>
        </div>

        {/* Right Top Bar Tools & Action Tabs */}
        <div className="flex items-center gap-2">
          {/* Execution Toggle for Demonstration */}
          <button
            type="button"
            onClick={() => setExecutionMode((m) => (m === 'completed' ? 'running' : 'completed'))}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium border transition flex items-center gap-1.5 ${
              executionMode === 'running'
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 animate-pulse'
                : 'bg-[var(--sci-bg-card,#17212d)] border-[var(--sci-border,#263445)] text-[var(--sci-text-secondary,#94a3b8)] hover:text-white'
            }`}
            title="Toggle between live running stepper trace and completed artifact state"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{executionMode === 'running' ? 'Active Run' : 'Result State'}</span>
          </button>

          <div className="flex items-center bg-[var(--sci-bg-card,#17212d)] border border-[var(--sci-border,#263445)] rounded-md text-[11px] font-mono overflow-hidden">
            <span className="px-2.5 py-1 text-[var(--sci-text-primary,#f1f5f9)] font-semibold border-r border-[var(--sci-border,#263445)]">
              Outputs <strong className="text-cyan-400">1</strong>
            </span>
            <button
              type="button"
              onClick={() => setIsReasoningDrawerOpen(!isReasoningDrawerOpen)}
              className="px-2.5 py-1 text-[var(--sci-text-secondary,#94a3b8)] hover:text-white hover:bg-white/5 transition"
            >
              Workspace
            </button>
            <span className="px-2.5 py-1 text-[var(--sci-text-secondary,#94a3b8)] border-l border-[var(--sci-border,#263445)]">
              Jobs
            </span>
            <span className="px-2.5 py-1 text-[var(--sci-text-secondary,#94a3b8)] border-l border-[var(--sci-border,#263445)]">
              &gt;_ Bash
            </span>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────
          MAIN WORKSPACE SPLIT (Left Agentic Plan & Trace / Right 3D & Metrics)
          ───────────────────────────────────────────────────────────────── */}
      {workstationMode === 'dynamo' ? (
        <div className="flex-1 min-h-0 overflow-hidden">
          <DynamoSimulationStudio onBack={() => setWorkstationMode('agent')} />
        </div>
      ) : (
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          {/* LEFT PANE: Task Plan, Thinking Trace, and Candidate Draft */}
        <div className="w-[430px] shrink-0 border-r border-[var(--sci-border,#263445)] bg-[var(--sci-bg-panel,#111821)] flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Task Plan Card (Image 3) */}
            <div className="rounded-xl border border-[var(--sci-border,#263445)] bg-[var(--sci-bg-card,#17212d)] p-3.5 shadow-sm space-y-3">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsTaskPlanExpanded(!isTaskPlanExpanded)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-xs text-[var(--sci-text-primary,#f1f5f9)]">Task Plan</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-full" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-0.5">
                    3/3 100% {isTaskPlanExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </span>
                </div>
              </div>

              {isTaskPlanExpanded && (
                <div className="space-y-2 pt-1 border-t border-[var(--sci-border,#263445)]/60 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>Write the comprehensive filtering pipeline script</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>Execute the script and verify outputs</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>Report results summary to user</span>
                  </div>
                </div>
              )}
            </div>

            {/* Thinking & Chain of Thought Card (Image 3) */}
            <div className="rounded-xl border border-[var(--sci-border,#263445)] bg-[var(--sci-bg-card,#17212d)] p-3.5 space-y-2.5 shadow-sm">
              <div
                className="flex items-center justify-between text-xs font-semibold text-[var(--sci-text-secondary,#94a3b8)] cursor-pointer hover:text-white"
                onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
              >
                <div className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Thinking</span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${isThinkingExpanded ? 'rotate-90' : ''}`}
                  />
                </div>
                <span className="text-[10px] font-mono text-[var(--sci-text-secondary,#94a3b8)]">2 thoughts</span>
              </div>

              {isThinkingExpanded && (
                <div className="space-y-2 pt-1 text-xs text-slate-300 leading-relaxed font-sans">
                  {activeTarget.thinkingLog.map((log, idx) => (
                    <p key={idx} className="bg-[var(--sci-bg-panel,#111821)] p-2.5 rounded-lg border border-[var(--sci-border,#263445)]/40">
                      {log}
                    </p>
                  ))}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-[var(--sci-text-secondary,#94a3b8)]">
                      <button
                        type="button"
                        onClick={() => setThumbsFeedback('up')}
                        className={`p-1 rounded hover:bg-white/5 ${thumbsFeedback === 'up' ? 'text-emerald-400' : ''}`}
                        title="Good thinking path"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setThumbsFeedback('down')}
                        className={`p-1 rounded hover:bg-white/5 ${thumbsFeedback === 'down' ? 'text-rose-400' : ''}`}
                        title="Needs improvement"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-[11px] font-mono text-cyan-400 hover:underline"
                    >
                      Hide 7 steps
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Stepper & Execution Progress (Image 1 & Image 4) */}
            {executionMode === 'running' ? (
              /* ACTIVE RUNNING STATE (Image 4): Rosalind reasons about the request */
              <div className="p-4 rounded-xl border border-[var(--sci-border,#263445)] bg-[var(--sci-bg-card,#17212d)] space-y-4">
                <p className="text-xs font-semibold text-[var(--sci-text-secondary,#94a3b8)]">
                  Rosalind reasons about the request.
                </p>

                <div className="space-y-4 relative pl-3">
                  {/* Connecting line */}
                  <div className="absolute left-[18px] top-3 bottom-3 w-px bg-[var(--sci-border,#263445)]" />

                  {/* Step 1: Thinking with active spinner & typewriter text */}
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white">Thinking</p>
                      <p className="text-[11px] font-mono text-cyan-300">
                        {typewriterText}
                        <span className={cursorVisible ? 'opacity-100 font-bold' : 'opacity-0'}>|</span>
                      </p>
                    </div>
                  </div>

                  {/* Hollow inactive steps */}
                  {EXECUTION_STEPS.slice(1).map((s) => (
                    <div key={s.id} className="flex items-center gap-3 relative z-10 opacity-50">
                      <div className="w-5 h-5 rounded-full border-2 border-[var(--sci-border,#263445)] bg-[var(--sci-bg-card,#17212d)] shrink-0" />
                      <span className="text-xs text-[var(--sci-text-secondary,#94a3b8)]">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* COMPLETED ARTIFACT STATE (Image 1): Vertical checklist + Candidate card */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--sci-text-secondary,#94a3b8)]">
                    The draft opens in its own window.
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDraftCardVisible(!isDraftCardVisible)}
                    className="text-[10px] font-mono text-cyan-400 hover:underline"
                  >
                    {isDraftCardVisible ? 'Hide Draft' : 'Show Draft'}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {/* Vertical Checkmark Stepper (Image 1 Left) */}
                  <div className="p-3 rounded-xl border border-[var(--sci-border,#263445)] bg-[var(--sci-bg-card,#17212d)] space-y-2.5">
                    {EXECUTION_STEPS.map((step) => (
                      <div key={step.id} className="flex items-center gap-2.5 text-xs text-slate-300">
                        <div className="w-4 h-4 rounded-full bg-cyan-900/60 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>{step.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Candidate Approval Window (Image 1 Right) */}
                  {isDraftCardVisible && (
                    <div className="p-4 rounded-xl border border-[var(--sci-border,#263445)] bg-[var(--sci-bg-card,#17212d)] space-y-3 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">Candidate LFD-114</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleShare}
                            className="px-2.5 py-1 rounded text-[11px] font-mono border border-[var(--sci-border,#263445)] text-slate-300 hover:text-white hover:bg-white/5 transition flex items-center gap-1"
                          >
                            {shareSuccess ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                            <span>{shareSuccess ? 'COPIED' : 'SHARE'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleApproveCandidate}
                            className={`px-3 py-1 rounded text-[11px] font-bold font-mono transition shadow-sm ${
                              approvedCandidates.includes('Candidate LFD-114')
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#183446] hover:bg-[#1f435a] text-cyan-200 border border-cyan-500/30'
                            }`}
                          >
                            {approvedCandidates.includes('Candidate LFD-114') ? 'APPROVED ✓' : 'APPROVE'}
                          </button>
                        </div>
                      </div>

                      {/* Sequence */}
                      <div className="p-2.5 rounded-lg bg-[var(--sci-bg-main,#0b0f14)] border border-[var(--sci-border,#263445)] font-mono text-[11px] text-cyan-300 break-all leading-relaxed">
                        Cyclo(-Leu-Phe-Asp-Trp-Gly-Ser-Arg-Tyr-Pro-Lys-Ala-Val-Thr-Cys-Gln-Ile-Met-His-Asn-)
                      </div>

                      {/* Properties */}
                      <div className="space-y-1 text-xs text-slate-400 font-mono">
                        <p className="text-white font-medium">MW 1,612.8 g/mol</p>
                        <p>Predicted affinity <strong className="text-emerald-400">-9.4 kcal/mol</strong></p>
                        <p>Solubility moderate · SA score 3.1</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Prompt Input Box (Image 3 Bottom) */}
          <div className="p-3 border-t border-[var(--sci-border,#263445)] bg-[var(--sci-bg-panel,#111821)]">
            <div className="flex items-center gap-2 bg-[var(--sci-bg-card,#17212d)] border border-[var(--sci-border,#263445)] rounded-xl px-3 py-2 focus-within:border-cyan-400 transition">
              <input
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="How can I help you today?"
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                className="text-slate-400 hover:text-white p-1"
                title="Attach structure or assay file"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="text-slate-400 hover:text-white p-1"
                title="Attach molecular image or 2D sketch"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="w-6 h-6 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition"
                title="Send instruction to Rosalind"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: 3D Structure Viewer, Controls, and Structure Metrics Table */}
        <div className="flex-1 flex flex-col min-w-0 bg-[var(--sci-bg-main,#0b0f14)] overflow-hidden relative">
          {/* Top Breadcrumb & Target Banner (Image 3) */}
          <div className="h-11 px-4 border-b border-[var(--sci-border,#263445)] bg-[var(--sci-bg-panel,#111821)] flex items-center justify-between text-xs shrink-0 z-10">
            <div className="flex items-center gap-2.5 truncate">
              <button
                type="button"
                className="text-slate-400 hover:text-white transition"
                title="Back to targets list"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-white truncate">{activeTarget.name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                {activeTarget.model}
              </span>
              <button
                type="button"
                className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:underline"
              >
                <Sparkles className="w-3 h-3" />
                <span>Analyze with Rosalind</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                <Check className="w-3 h-3" />
                <span>Completed</span>
              </span>
            </div>
          </div>

          {/* 3D Structure Canvas & Coordinate Viewport */}
          <div className="flex-1 relative min-h-[300px] overflow-hidden">
            {/* Viewport Header Controls Overlay */}
            <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-300 tracking-wider flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-white/10 backdrop-blur-sm">
                <Box className="w-3.5 h-3.5 text-cyan-400" />
                <span>3D STRUCTURE</span>
              </span>
            </div>

            <div className="absolute top-3 right-4 z-10 flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-white/10 backdrop-blur-sm text-xs text-slate-300">
              <button
                type="button"
                onClick={() => setIsAutorotating(!isAutorotating)}
                className={`p-1.5 rounded transition ${isAutorotating ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-white/10'}`}
                title="Toggle Autorotation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setSurfaceView(!surfaceView)}
                className={`p-1.5 rounded transition ${surfaceView ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-white/10'}`}
                title="Toggle Pocket Surface Envelope"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Three.js Canvas Mount */}
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Bottom-left 3D Axis Widget (RGB Gizmo from Image 3) */}
            <div className="absolute bottom-3 left-4 z-10 pointer-events-none flex items-center gap-1 font-mono text-[10px] font-bold">
              <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded border border-white/10 backdrop-blur-sm">
                <span className="text-rose-400">X</span>
                <span className="text-emerald-400">Y</span>
                <span className="text-cyan-400">Z</span>
              </div>
            </div>

            {/* FLOATING BENEFIT BADGES (Image 3 Highlights) */}
            <div className="absolute left-6 bottom-4 z-20 space-y-2 pointer-events-auto">
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white shadow-lg backdrop-blur-md">
                <span className="text-lg font-bold font-mono text-cyan-400">60%</span>
                <span className="text-xs text-slate-300 font-medium">Less GPU overhead</span>
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white shadow-lg backdrop-blur-md">
                <span className="text-lg font-bold font-mono text-amber-400">&lt;1 day</span>
                <span className="text-xs text-slate-300 font-medium">Hypothesis to model</span>
              </div>
            </div>

            <div className="absolute right-6 top-14 z-20 pointer-events-auto">
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white shadow-lg backdrop-blur-md">
                <span className="text-lg font-bold font-mono text-emerald-400">10×</span>
                <span className="text-xs text-slate-300 font-medium">Faster biomolecular workflows</span>
              </div>
            </div>
          </div>

          {/* STRUCTURE METRICS GRID (Exact 12-item Grid from Image 3) */}
          <div className="border-t border-[var(--sci-border,#263445)] bg-[var(--sci-bg-panel,#111821)] p-4 shrink-0">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-400">
                STRUCTURE METRICS
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                PDB: {activeTarget.pdbId} · Protocol: Protenix/AF3
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-3 font-mono text-xs">
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400">Mean pLDDT</p>
                <p className="text-white font-bold">{activeTarget.metrics.meanPlddt.toFixed(2)}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400">pTM</p>
                <p className="text-white font-bold">{activeTarget.metrics.ptm.toFixed(3)}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400">ipTM</p>
                <p className="text-emerald-400 font-bold">{activeTarget.metrics.iptm.toFixed(3)}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400">Clash Score</p>
                <p className="text-white font-bold">{activeTarget.metrics.clashScore.toFixed(2)}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400">Confidence</p>
                <p className="text-cyan-300 font-bold">{activeTarget.metrics.confidence.toFixed(3)}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400">Affinity (pK)</p>
                <p className="text-amber-400 font-bold">{activeTarget.metrics.affinityPk}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400">Ligand ipTM</p>
                <p className="text-white font-bold">{activeTarget.metrics.ligandIptm.toFixed(3)}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400">Protein ipTM</p>
                <p className="text-white font-bold">{activeTarget.metrics.proteinIptm.toFixed(3)}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400">Complex pLDDT</p>
                <p className="text-white font-bold">{activeTarget.metrics.complexPlddt.toFixed(2)}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400">Complex ipLDDT</p>
                <p className="text-white font-bold">{activeTarget.metrics.complexIplddt.toFixed(2)}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400">Complex PDE</p>
                <p className="text-white font-bold">{activeTarget.metrics.complexPde.toFixed(3)}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400">Complex iPDE</p>
                <p className="text-white font-bold">{activeTarget.metrics.complexIpde.toFixed(3)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
