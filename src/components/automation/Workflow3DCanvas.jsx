import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Box,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  Database,
  Cpu,
  Zap,
  Activity,
  FileText,
  Bot,
  Compass,
  Sparkles
} from 'lucide-react';

const WORKSTATION_STAGES = [
  { id: 'stage_a', letter: 'A', name: 'Research Goal & Input', category: 'Input', x: -14, y: 0, z: 0, engine: 'Interpreter', icon: 'Bot' },
  { id: 'stage_b', letter: 'B', name: 'Planning & Data Prep', category: 'Orchestration', x: -8, y: 0, z: 0, engine: 'LangGraph StateGraph', icon: 'Sliders' },
  { id: 'stage_c', letter: 'C', name: 'De Novo Candidate Generation', category: 'Generative AI', x: -2, y: 4, z: 2, engine: 'GenMol / MolMIM', icon: 'Sparkles' },
  { id: 'stage_d', letter: 'D', name: 'Structure Prep & Properties', category: 'Cheminformatics', x: -2, y: -4, z: -2, engine: 'RDKit & PubChem 3D', icon: 'Box' },
  { id: 'stage_e', letter: 'E', name: 'Target Protein Analysis', category: 'Biology', x: 4, y: 4, z: 2, engine: 'RCSB PDB Resolver', icon: 'Database' },
  { id: 'stage_f', letter: 'F', name: 'Molecular Docking & Affinity', category: 'Biophysics', x: 4, y: -4, z: -2, engine: 'DiffDock / AutoDock Vina', icon: 'Zap' },
  { id: 'stage_g', letter: 'G', name: 'ADMET & Safety Prediction', category: 'ADMET', x: 10, y: 2, z: 1, engine: 'DeepChem ML Descriptors', icon: 'Activity' },
  { id: 'stage_h', letter: 'H', name: 'Biomolecular Branch (DNA/RNA)', category: 'Modularity', x: 10, y: -2, z: -1, engine: 'Boltz-2 Complex Engine', icon: 'Layers' },
  { id: 'stage_i', letter: 'I', name: 'Scientific Validation', category: 'Audit', x: 16, y: 0, z: 0, engine: 'Verification Evaluator', icon: 'ShieldCheck' },
  { id: 'stage_j', letter: 'J', name: 'Results & Research Report', category: 'Synthesis', x: 22, y: 0, z: 0, engine: 'Scientific Report Compiler', icon: 'FileText' }
];

export default function Workflow3DCanvas({
  stages = [],
  activeStageIndex = 0,
  isExecuting = false,
  playbackSpeed = 1.0,
  isPaused = false,
  enableParticles = true,
  onSelectStage = null
}) {
  const mountRef = useRef(null);
  const [canvasViewMode, setCanvasViewMode] = useState('3D'); // '3D' or '2D'
  const [hoveredStation, setHoveredStation] = useState(null);
  const [isRotating, setIsRotating] = useState(false);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const worldGroupRef = useRef(null);
  const platformsRef = useRef([]);
  const animFrameRef = useRef(null);
  const isDraggingRef = useRef(false);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseNormRef = useRef(new THREE.Vector2());

  // Initialize Three.js 3D canvas
  useEffect(() => {
    if (canvasViewMode !== '3D') return;

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(4, 8, 38);
    camera.lookAt(4, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Subtle atmospheric lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(10, 20, 20);
    scene.add(dirLight);

    const accentLight = new THREE.PointLight(0xf97316, 1.2, 50);
    accentLight.position.set(0, 5, 10);
    scene.add(accentLight);

    const worldGroup = new THREE.Group();
    worldGroupRef.current = worldGroup;
    scene.add(worldGroup);

    // Build 3D Workstation Platforms
    platformsRef.current = [];
    const cylinderGeo = new THREE.CylinderGeometry(1.8, 2.0, 0.4, 24);
    const ringGeo = new THREE.TorusGeometry(2.3, 0.06, 16, 48);

    WORKSTATION_STAGES.forEach((ws, idx) => {
      const stationGroup = new THREE.Group();
      stationGroup.position.set(ws.x, ws.y, ws.z);

      // Main platform disc
      const discMat = new THREE.MeshStandardMaterial({
        color: idx <= activeStageIndex ? 0x10b981 : (idx === activeStageIndex + 1 ? 0xf97316 : 0x1e293b),
        metalness: 0.4,
        roughness: 0.3,
        transparent: true,
        opacity: 0.85
      });
      const discMesh = new THREE.Mesh(cylinderGeo, discMat);
      discMesh.userData = { ...ws, stageIndex: idx };
      stationGroup.add(discMesh);
      platformsRef.current.push(discMesh);

      // Outer glowing ring
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx <= activeStageIndex ? 0x34d399 : (idx === activeStageIndex + 1 ? 0xfb923c : 0x475569)
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      stationGroup.add(ringMesh);

      worldGroup.add(stationGroup);
    });

    // Build connecting 3D Spline Beams between platforms
    const curvePoints = WORKSTATION_STAGES.map((ws) => new THREE.Vector3(ws.x, ws.y, ws.z));
    const splineCurve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeo = new THREE.TubeGeometry(splineCurve, 64, 0.08, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.4
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    worldGroup.add(tubeMesh);

    // Mouse drag rotation & raycasting
    const onMouseDown = (e) => {
      isDraggingRef.current = true;
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseNormRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNormRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycast platforms
      if (cameraRef.current && platformsRef.current.length > 0) {
        raycasterRef.current.setFromCamera(mouseNormRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(platformsRef.current);
        if (intersects.length > 0) {
          setHoveredStation(intersects[0].object.userData);
        } else {
          setHoveredStation(null);
        }
      }

      if (!isDraggingRef.current || !worldGroupRef.current) return;
      const dx = e.clientX - mousePosRef.current.x;
      const dy = e.clientY - mousePosRef.current.y;
      worldGroupRef.current.rotation.y += dx * 0.005;
      worldGroupRef.current.rotation.x += dy * 0.005;
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      cameraRef.current.position.z = Math.max(12, Math.min(65, cameraRef.current.position.z + e.deltaY * 0.03));
    };

    const onClick = () => {
      if (hoveredStation && onSelectStage) {
        onSelectStage(hoveredStation);
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('click', onClick);

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
    };
  }, [canvasViewMode, activeStageIndex]);

  // Main 3D render loop
  useEffect(() => {
    if (canvasViewMode !== '3D') return;

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (!isPaused && isRotating && worldGroupRef.current && !isDraggingRef.current) {
        worldGroupRef.current.rotation.y += 0.003 * playbackSpeed;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [canvasViewMode, isPaused, isRotating, playbackSpeed]);

  const handleResetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(4, 8, 38);
      cameraRef.current.lookAt(4, 0, 0);
    }
    if (worldGroupRef.current) {
      worldGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  const handleFitWorkspace = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(4, 5, 46);
      cameraRef.current.lookAt(4, 0, 0);
    }
  };

  return (
    <div className="relative w-full h-[420px] lg:h-[480px] rounded-2xl border border-[var(--border-subtle)] bg-slate-950/90 overflow-hidden shadow-2xl flex flex-col select-none">
      {/* Top Bar: View Mode Switch & Fit-To-Workspace */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-xs font-mono text-orange-400 font-bold flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span>Drug Discovery Workflow Canvas</span>
          </div>

          <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400 bg-black/60 px-2 py-1 rounded-md border border-white/10">
            Interactive Multi-Branch DAG
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* 3D / 2D Canvas Switch */}
          <div className="flex items-center bg-black/60 backdrop-blur-md rounded-lg border border-white/10 p-0.5 text-xs font-mono">
            <button
              onClick={() => setCanvasViewMode('3D')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                canvasViewMode === '3D' ? 'bg-orange-500/25 text-orange-400 font-bold border border-orange-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3 h-3" />
              <span>3D Spatial Canvas</span>
            </button>
            <button
              onClick={() => setCanvasViewMode('2D')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                canvasViewMode === '2D' ? 'bg-orange-500/25 text-orange-400 font-bold border border-orange-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>2D Node Graph</span>
            </button>
          </div>

          {canvasViewMode === '3D' && (
            <button
              onClick={handleFitWorkspace}
              className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 hover:border-orange-500/40 text-xs font-mono text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1"
              title="Fit entire 3D workflow into viewport"
            >
              <Maximize2 className="w-3 h-3" />
              <span className="hidden sm:inline">Fit Canvas</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          VIEWPORT: 3D THREE.JS CANVAS OR 2D LAYERED NODE GRAPH
         ───────────────────────────────────────────────────────────────── */}
      {canvasViewMode === '3D' ? (
        <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing relative" />
      ) : (
        /* 2D Layered DAG Graph View */
        <div className="w-full flex-1 overflow-x-auto overflow-y-auto p-6 pt-16 font-mono text-xs no-scrollbar flex items-center justify-start sm:justify-center">
          <div className="flex items-center gap-3">
            {WORKSTATION_STAGES.map((ws, i) => {
              const isDone = i <= activeStageIndex;
              const isRunning = i === activeStageIndex && isExecuting;

              return (
                <React.Fragment key={ws.id}>
                  <div
                    onClick={() => onSelectStage && onSelectStage(ws)}
                    className={`w-36 p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 shrink-0 ${
                      isRunning
                        ? 'border-orange-500/60 bg-orange-500/15 shadow-lg ring-1 ring-orange-500/30'
                        : isDone
                        ? 'border-emerald-500/40 bg-emerald-500/10 hover:border-emerald-500'
                        : 'border-slate-800 bg-slate-900/60 opacity-65 hover:opacity-100 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-full bg-black/40 border border-white/10 flex items-center justify-center font-bold text-[10px] text-orange-400">
                        {ws.letter}
                      </span>
                      <span className="text-[9px] uppercase text-slate-400">{ws.category}</span>
                    </div>
                    <div className="font-bold text-[11px] text-white truncate">{ws.name}</div>
                    <div className="text-[9.5px] text-slate-400 truncate">{ws.engine}</div>
                  </div>

                  {i < WORKSTATION_STAGES.length - 1 && (
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isDone ? 'text-emerald-400' : 'text-slate-700'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Hovered Station Card in 3D Canvas */}
      {hoveredStation && canvasViewMode === '3D' && (
        <div className="absolute bottom-12 left-4 z-20 p-3 rounded-xl bg-black/85 backdrop-blur-md border border-orange-500/40 text-[11px] font-mono text-slate-200 shadow-2xl pointer-events-none space-y-1 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold">
              Station {hoveredStation.letter}
            </span>
            <strong className="text-white text-xs">{hoveredStation.name}</strong>
          </div>
          <div className="text-[10px] text-slate-400">
            Engine: <strong className="text-slate-200">{hoveredStation.engine}</strong>
          </div>
          <div className="text-[9.5px] text-orange-400/90 pt-0.5">
            Click platform to inspect stage parameters & outputs
          </div>
        </div>
      )}

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-xs pointer-events-none">
        <span className="text-[10px] font-mono text-slate-400 bg-black/70 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-md pointer-events-auto">
          10 Connected Stations • Auto-Routing Active
        </span>

        {canvasViewMode === '3D' && (
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={() => setIsRotating((prev) => !prev)}
              className={`w-8 h-8 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-center transition cursor-pointer ${
                isRotating ? 'text-orange-400 border-orange-500/30' : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle 3D Canvas Orbit Spin"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleResetCamera}
              className="w-8 h-8 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 hover:border-orange-500/40 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Reset 3D Canvas View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
