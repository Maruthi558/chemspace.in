import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Maximize2,
  Minimize2,
  Download,
  Share2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RefreshCw,
  Sliders,
  Layers,
  ArrowLeft,
  Activity,
  Box,
  FileText,
  Clock,
  Sparkles,
  Zap,
  ShieldCheck,
  Check
} from 'lucide-react';

const SIMULATION_RUNS = [
  {
    id: 1,
    title: 'Run 1',
    status: 'Completed',
    time: '20 ns · 5.0M steps · Aug 18, 8:15 PM',
    duration: '42m 10s',
    simTime: '20 ns',
    steps: '5,000,000',
    type: 'MD',
    protein: 'nav18_binding_site.pdb',
    ligand: 'funnel_sel_8.sdf',
    forcefields: ['protein.ff14SB', 'tip3p_standard'],
    waterModel: 'tip3p',
    membrane: 'No'
  },
  {
    id: 2,
    title: 'Run 2',
    status: 'Completed',
    time: '20 ns · 5.0M steps · Aug 19, 2:41 AM',
    duration: '43m 15s',
    simTime: '20 ns',
    steps: '5,000,000',
    type: 'MD',
    protein: 'nav18_binding_site.pdb',
    ligand: 'funnel_sel_8.sdf',
    forcefields: ['protein.ff14SB', 'tip3p_standard'],
    waterModel: 'tip3p',
    membrane: 'No'
  },
  {
    id: 3,
    title: 'Run 3',
    status: 'Completed',
    time: '20 ns · 5.0M steps · Aug 19, 11:34 AM',
    duration: '44m 02s',
    simTime: '20 ns',
    steps: '5,000,000',
    type: 'MD',
    protein: 'nav18_binding_site.pdb',
    ligand: 'funnel_sel_8.sdf',
    forcefields: ['protein.ff14SB', 'tip3p_standard'],
    waterModel: 'tip3p',
    membrane: 'No'
  },
  {
    id: 4,
    title: 'Run 4',
    status: 'Completed',
    time: '20 ns · 5.0M steps · Aug 19, 12:36 PM',
    duration: '43m 50s',
    simTime: '20 ns',
    steps: '5,000,000',
    type: 'MD',
    protein: 'nav18_binding_site.pdb',
    ligand: 'funnel_sel_8.sdf',
    forcefields: ['protein.ff14SB', 'tip3p_standard'],
    waterModel: 'tip3p',
    membrane: 'No'
  },
  {
    id: 5,
    title: 'Run 5',
    status: 'Completed',
    time: '20 ns · 5.0M steps · Aug 19, 1:46 PM',
    duration: '43m 40s',
    simTime: '20 ns',
    steps: '5,000,000',
    type: 'MD',
    protein: 'nav18_binding_site.pdb',
    ligand: 'funnel_sel_8.sdf',
    forcefields: ['protein.ff14SB', 'tip3p_standard', 'tip3p_HFE_multivalent'],
    waterModel: 'tip3p',
    membrane: 'No',
    created: 'Aug 19, 1:46 PM',
    started: 'Aug 19, 1:46 PM',
    completed: 'Aug 19, 2:30 PM',
    wallTime: '43m 40s'
  }
];

const CONTACT_RESIDUES = [
  { id: 1, residue: 'ASN17', freq: 100 },
  { id: 2, residue: 'VAL40', freq: 100 },
  { id: 3, residue: 'ALA41', freq: 100 },
  { id: 4, residue: 'ILE15', freq: 100 },
  { id: 5, residue: 'GLN14', freq: 100 },
  { id: 6, residue: 'LEU38', freq: 100 },
  { id: 7, residue: 'ILE18', freq: 100 },
  { id: 8, residue: 'LEU35', freq: 100 },
  { id: 9, residue: 'GLU37', freq: 100 },
  { id: 10, residue: 'GLY39', freq: 100 },
  { id: 11, residue: 'ALA11', freq: 80 },
  { id: 12, residue: 'GLY16', freq: 70 },
  { id: 13, residue: 'LEU13', freq: 70 },
  { id: 14, residue: 'LEU36', freq: 70 },
  { id: 15, residue: 'SER34', freq: 30 },
  { id: 16, residue: 'LYS42', freq: 20 },
  { id: 17, residue: 'LYS43', freq: 10 },
  { id: 18, residue: 'MET5', freq: 10 },
  { id: 19, residue: 'GLU10', freq: 10 }
];

export default function DynamoSimulationStudio({ onBack = null }) {
  const [activeTab, setActiveTab] = useState('structure'); // 'structure' or 'analysis'
  const [selectedRunId, setSelectedRunId] = useState(5);
  const [expandedRunId, setExpandedRunId] = useState(5);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackFrame, setPlaybackFrame] = useState(1290);
  const [trajectoryDownloaded, setTrajectoryDownloaded] = useState(false);

  // 3D Canvas Mount
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const groupRef = useRef(null);
  const reqIdRef = useRef(null);

  // Frame scrubber simulation
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackFrame((f) => (f >= 100000 ? 0 : f + 140));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // 3D Helix & Bound Small Molecule Renderer
  useEffect(() => {
    const container = mountRef.current;
    if (!container || activeTab !== 'structure') return;

    const width = container.clientWidth || 650;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xfcfcfc); // Crisp light biological background from Image 1

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    cameraRef.current = camera;
    camera.position.set(0, 0, 24);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Subtle studio lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(15, 20, 15);
    scene.add(dir);

    const mainGroup = new THREE.Group();
    groupRef.current = mainGroup;
    scene.add(mainGroup);

    // 1. Helical Protein Ribbon (Silver/Cream ribbon matching Image 1)
    const helixPoints = [];
    for (let i = 0; i < 90; i++) {
      const t = (i / 90) * Math.PI * 6.5;
      const r = 3.6;
      const x = Math.cos(t) * r - 2.5;
      const y = (i - 45) * 0.22;
      const z = Math.sin(t) * r;
      helixPoints.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(helixPoints);
    const helixGeo = new THREE.TubeGeometry(curve, 120, 0.45, 12, false);
    const helixMat = new THREE.MeshStandardMaterial({
      color: 0xd6d3d1, // Clean warm silver/stone ribbon
      roughness: 0.35,
      metalness: 0.1
    });
    mainGroup.add(new THREE.Mesh(helixGeo, helixMat));

    // Secondary flanking helix loop
    const loopPoints = [];
    for (let i = 0; i < 40; i++) {
      const t = (i / 40) * Math.PI * 3;
      const x = Math.cos(t) * 2.8 + 2.2;
      const y = (i - 20) * 0.25 - 1.5;
      const z = Math.sin(t) * 2.8;
      loopPoints.push(new THREE.Vector3(x, y, z));
    }
    const loopCurve = new THREE.CatmullRomCurve3(loopPoints);
    const loopGeo = new THREE.TubeGeometry(loopCurve, 50, 0.4, 10, false);
    mainGroup.add(new THREE.Mesh(loopGeo, helixMat));

    // 2. Bound Ligand funnel_sel_8 in Ball-and-Stick (Image 1)
    const ligandGroup = new THREE.Group();
    const atomCoords = [
      { pos: [1.2, 1.8, 0.5], el: 'Cl', color: 0x22c55e, r: 0.45 },
      { pos: [0.8, 0.9, 0.3], el: 'C', color: 0x475569, r: 0.32 },
      { pos: [1.6, 0.2, 0.2], el: 'C', color: 0x475569, r: 0.32 },
      { pos: [1.2, -0.9, 0.0], el: 'C', color: 0x475569, r: 0.32 },
      { pos: [0.0, -1.2, -0.1], el: 'N', color: 0x3b82f6, r: 0.34 },
      { pos: [-0.8, -0.3, 0.1], el: 'C', color: 0x475569, r: 0.32 },
      { pos: [-0.4, 0.8, 0.2], el: 'C', color: 0x475569, r: 0.32 },
      { pos: [-1.4, 1.4, 0.3], el: 'O', color: 0xef4444, r: 0.34 },
      { pos: [0.2, -2.4, -0.4], el: 'C', color: 0x475569, r: 0.32 },
      { pos: [1.4, -3.0, -0.7], el: 'C', color: 0x475569, r: 0.32 },
      { pos: [1.6, -4.2, -1.0], el: 'C', color: 0x475569, r: 0.32 },
      { pos: [0.6, -4.8, -0.9], el: 'C', color: 0x475569, r: 0.32 },
      { pos: [0.8, -5.8, -1.2], el: 'N', color: 0x2563eb, r: 0.35 }
    ];

    atomCoords.forEach((atom) => {
      const geo = new THREE.SphereGeometry(atom.r, 16, 16);
      const mat = new THREE.MeshStandardMaterial({ color: atom.color, roughness: 0.2 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...atom.pos);
      ligandGroup.add(mesh);
    });

    // Sticks
    for (let k = 0; k < atomCoords.length - 1; k++) {
      const p1 = new THREE.Vector3(...atomCoords[k].pos);
      const p2 = new THREE.Vector3(...atomCoords[k + 1].pos);
      if (p1.distanceTo(p2) < 1.8) {
        const bondGeo = new THREE.CylinderGeometry(0.08, 0.08, p1.distanceTo(p2), 8);
        const bondMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
        const bond = new THREE.Mesh(bondGeo, bondMat);
        bond.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
        bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
        ligandGroup.add(bond);
      }
    }
    mainGroup.add(ligandGroup);

    // Mouse drag rotation
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
      mainGroup.rotation.y += dx * 0.008;
      mainGroup.rotation.x += dy * 0.008;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    let angle = 0;
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      if (isPlaying && !isDragging) {
        angle += 0.004;
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
  }, [activeTab, isPlaying]);

  const handleDownloadTrajectory = () => {
    setTrajectoryDownloaded(true);
    setTimeout(() => setTrajectoryDownloaded(false), 2400);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f8fafc] text-slate-800 font-sans select-none overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────────
          TOP BAR (LiteFold | < Back | binding_site_20ns Completed | Continue Simulation)
          ───────────────────────────────────────────────────────────────── */}
      <header className="h-13 px-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="font-mono font-bold text-sm text-slate-900">binding_site_20ns</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Completed</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Continue Simulation</span>
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────
          MAIN WORKSPACE LAYOUT (Left Runs Explorer / Right Structure or Analysis)
          ───────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* LEFT COLUMN: Simulation Runs Explorer (Image 1) */}
        <div className="w-[360px] shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">Simulation Runs</h3>
              <span className="text-xs font-mono text-slate-400">5 runs</span>
            </div>
            <button type="button" className="text-slate-400 hover:text-slate-600 p-1 rounded">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {SIMULATION_RUNS.map((run) => {
              const isExpanded = expandedRunId === run.id;
              return (
                <div
                  key={run.id}
                  className={`rounded-xl border transition-all ${
                    selectedRunId === run.id
                      ? 'border-emerald-300 bg-emerald-50/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    onClick={() => {
                      setSelectedRunId(run.id);
                      setExpandedRunId(isExpanded ? null : run.id);
                    }}
                    className="p-3 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-mono font-bold text-xs flex items-center justify-center">
                        {run.id}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900">{run.title}</span>
                          <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-emerald-100/70 text-emerald-700 font-semibold">
                            ✓ {run.status}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">MD</span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{run.time}</p>
                      </div>
                    </div>

                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>

                  {/* Expanded Parameters (Run 5 Image 1) */}
                  {isExpanded && (
                    <div className="p-3.5 pt-1 border-t border-slate-100 text-xs space-y-3 font-mono">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SIMULATION</span>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div>
                            <p className="text-[10px] text-slate-400">Duration</p>
                            <p className="font-bold text-slate-900">{run.duration}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400">Sim. time</p>
                            <p className="font-bold text-slate-900">{run.simTime}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400">Steps</p>
                            <p className="font-bold text-slate-900">{run.steps}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400">Type</p>
                            <p className="font-bold text-slate-900">{run.type}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">INPUT FILES</span>
                        <div className="space-y-1 mt-1 text-[11px]">
                          <p className="text-slate-600 truncate flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Protein: <strong>{run.protein}</strong>
                          </p>
                          <p className="text-slate-600 truncate flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            Ligand: <strong>{run.ligand}</strong>
                          </p>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">PARAMETERS</span>
                        <div className="mt-1 space-y-1.5">
                          <p className="text-[10px] text-slate-400">Forcefield</p>
                          <div className="flex flex-wrap gap-1">
                            {run.forcefields?.map((ff) => (
                              <span key={ff} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                                {ff}
                              </span>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                            <div>
                              <p className="text-[10px] text-slate-400">Water model</p>
                              <p className="font-bold text-slate-800">{run.waterModel}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400">Membrane</p>
                              <p className="font-bold text-slate-800">{run.membrane}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={handleDownloadTrajectory}
                          className="w-full py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{trajectoryDownloaded ? 'Trajectory Downloaded' : 'Download Trajectory'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT AREA: Tabs (Analysis vs Structure) */}
        <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
          {/* Top Tabs Switcher */}
          <div className="h-11 px-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
            <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('analysis')}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === 'analysis'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Analysis
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('structure')}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === 'structure'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Structure
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-bold text-slate-700">Run 5</span>
            </div>
          </div>

          {/* VIEW A: STRUCTURE 3D PREVIEW (Image 1) */}
          {activeTab === 'structure' && (
            <div className="flex-1 flex flex-col justify-between relative bg-white">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">System Preview <span className="text-slate-400 font-mono text-[11px]">945 atoms</span></span>
                <div className="flex items-center gap-2 text-slate-400">
                  <Download className="w-3.5 h-3.5 hover:text-slate-700 cursor-pointer" />
                  <RefreshCw className="w-3.5 h-3.5 hover:text-slate-700 cursor-pointer" />
                  <Maximize2 className="w-3.5 h-3.5 hover:text-slate-700 cursor-pointer" />
                </div>
              </div>

              {/* Three.js Canvas Mount */}
              <div className="flex-1 relative overflow-hidden">
                <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
                <div className="absolute bottom-2 right-4 text-xs font-mono text-slate-400 pointer-events-none">
                  Nav1.8 · 100 ns
                </div>
              </div>

              {/* Playback Scrubber (Image 1 Bottom) */}
              <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 transition"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlaybackFrame(0)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlaybackFrame((f) => Math.min(100000, f + 5000))}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-slate-600">1,290 ns</span>
                </div>

                <div className="flex-1 max-w-xl flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100000}
                    value={playbackFrame}
                    onChange={(e) => setPlaybackFrame(Number(e.target.value))}
                    className="flex-1 h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {playbackFrame} / 100000 (36%) 1×
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW B: 100 NS MOLECULAR DYNAMICS ANALYSIS DASHBOARD (Image 2) */}
          {activeTab === 'analysis' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
              {/* Header */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
                <div>
                  <h3 className="font-bold text-base tracking-tight">
                    Nav1.8 Binding Site | 100 ns Molecular Dynamics Simulation
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Protein-ligand complex · 5 x 20 ns continuation runs · OpenMM all-atom
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-mono">
                    RMSD Band: 2.0–3.0 Å
                  </span>
                </div>
              </div>

              {/* 2-Column Grid: Stacked Time Series vs Residue RMSF & Contacts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 7 Columns: Stacked 4-Panel Plots */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Plot 1: RMSD (Backbone vs Ligand) */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-900">RMSD (Å)</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-blue-600 font-semibold">
                          <span className="w-2.5 h-0.5 bg-blue-600 inline-block" /> Backbone
                        </span>
                        <span className="flex items-center gap-1 text-orange-500 font-semibold">
                          <span className="w-2.5 h-0.5 bg-orange-500 inline-block" /> Ligand
                        </span>
                      </div>
                    </div>
                    {/* SVG Simulation Curve */}
                    <div className="h-32 w-full relative">
                      <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                        {/* Shaded equilibration zone 0-40 ns */}
                        <rect x="0" y="0" width="200" height="120" fill="#fef2f2" opacity="0.6" />
                        <text x="10" y="15" fill="#f87171" fontSize="9" fontFamily="monospace">Equilibration</text>
                        {/* Grid lines */}
                        <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="60" x2="500" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                        {/* Backbone Curve (Peaks around 40-50ns then settles) */}
                        <path
                          d="M 0,90 Q 50,70 100,65 T 180,45 T 210,18 T 240,75 T 320,55 T 420,50 T 500,52"
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="2"
                        />
                        {/* Ligand Curve (Stays tight in 2-3A band) */}
                        <path
                          d="M 0,95 Q 60,88 120,85 T 190,88 T 230,105 T 270,78 T 350,82 T 430,76 T 500,80"
                          fill="none"
                          stroke="#f97316"
                          strokeWidth="2"
                        />
                      </svg>
                      <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
                        <span>0 ns</span>
                        <span>20 ns</span>
                        <span>40 ns</span>
                        <span>60 ns</span>
                        <span>80 ns</span>
                        <span>100 ns</span>
                      </div>
                    </div>
                  </div>

                  {/* Plot 2: Radius of Gyration */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-900">Radius of Gyration (Å)</span>
                      <span className="text-emerald-600 font-semibold">Settles ~11.75 Å</span>
                    </div>
                    <div className="h-24 w-full relative">
                      <svg className="w-full h-full" viewBox="0 0 500 90" preserveAspectRatio="none">
                        <path
                          d="M 0,65 Q 60,40 120,45 T 180,55 T 220,12 T 260,60 T 340,58 T 420,62 T 500,60"
                          fill="none"
                          stroke="#15803d"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Plot 3: Ligand-Protein Distance */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-900">Ligand–Protein Distance (Å)</span>
                      <span className="text-purple-600 font-semibold">Tightens from 4.8 Å → 2.5 Å</span>
                    </div>
                    <div className="h-24 w-full relative">
                      <svg className="w-full h-full" viewBox="0 0 500 90" preserveAspectRatio="none">
                        <path
                          d="M 0,35 Q 70,25 140,30 T 210,12 T 280,68 T 360,75 T 440,70 T 500,72"
                          fill="none"
                          stroke="#7e22ce"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Plot 4: Hydrogen Bonds */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-900">Hydrogen Bonds</span>
                      <span className="text-slate-500 text-[11px]">1 stable core H-bond remains</span>
                    </div>
                    <div className="h-20 w-full relative">
                      <svg className="w-full h-full" viewBox="0 0 500 70" preserveAspectRatio="none">
                        <path
                          d="M 0,35 L 40,25 L 80,45 L 120,20 L 160,35 L 200,15 L 240,40 L 280,30 L 320,45 L 360,25 L 400,35 L 450,25 L 500,40"
                          fill="none"
                          stroke="#0284c7"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M 0,25 L 190,25 L 230,55 L 280,55 L 320,45 L 500,45"
                          fill="none"
                          stroke="#ea580c"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Right 5 Columns: Per-Residue RMSF & Binding Site Contacts Table */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Top: Per-Residue RMSF (Image 2 Top Right) */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <span className="font-bold text-xs font-mono text-slate-900">Per-Residue RMSF (Å)</span>
                    <div className="h-32 flex items-end gap-1 pt-2">
                      {[6, 9, 8, 12, 14, 16, 12, 10, 8, 5, 7, 6, 8, 10, 11, 15, 18, 14, 12, 9, 7, 8, 9, 12, 11, 9, 7, 8, 11, 12].map((v, i) => (
                        <div
                          key={i}
                          style={{ height: `${(v / 18) * 100}%` }}
                          className="flex-1 bg-cyan-600 rounded-t-xs hover:bg-cyan-500 transition"
                          title={`Residue ${i + 1}: ${v} Å`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-400">
                      <span>1</span>
                      <span>9</span>
                      <span>17</span>
                      <span>25</span>
                      <span>33</span>
                      <span>41</span>
                      <span>49</span>
                    </div>
                  </div>

                  {/* Bottom: Binding Site Contact Residues (Image 2 Bottom Right) */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs font-mono text-slate-900">
                        Binding Site Contact Residues
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">100% Core Contacts</span>
                    </div>

                    <div className="overflow-y-auto max-h-[360px] border border-slate-100 rounded-lg">
                      <table className="w-full text-left font-mono text-xs">
                        <thead className="bg-[#183446] text-white text-[10px]">
                          <tr>
                            <th className="p-2">#</th>
                            <th className="p-2">Residue</th>
                            <th className="p-2">Freq.</th>
                            <th className="p-2">Occupancy</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px]">
                          {CONTACT_RESIDUES.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50 transition">
                              <td className="p-2 text-slate-400">{row.id}</td>
                              <td className="p-2 font-bold text-slate-900">{row.residue}</td>
                              <td className="p-2 text-emerald-600 font-bold">{row.freq}%</td>
                              <td className="p-2">
                                <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    style={{ width: `${row.freq}%` }}
                                    className="h-full bg-cyan-600 rounded-full"
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
