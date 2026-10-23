import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Layers,
  RefreshCw,
  Eye,
  Box,
  Compass,
  AlertCircle,
  HelpCircle,
  Square,
  Activity,
  Atom,
  Info,
  Shield
} from 'lucide-react';

// Standard IUPAC CPK Element Color Palette & Atomic Properties
const CPK_COLORS = {
  H: 0xf3f4f6,   // White / Light Grey
  C: 0x334155,   // Dark Charcoal / Slate
  N: 0x3b82f6,   // Blue
  O: 0xef4444,   // Red
  F: 0x10b981,   // Green
  Cl: 0x22c55e,  // Light Green
  Br: 0xb45309,  // Brown
  I: 0x7c3aed,   // Violet
  P: 0xf97316,   // Orange
  S: 0xeab308,   // Yellow
  DEFAULT: 0xa855f7
};

const ELEMENT_RADII = {
  H: 0.35,
  C: 0.65,
  N: 0.62,
  O: 0.60,
  F: 0.55,
  Cl: 0.75,
  Br: 0.85,
  I: 0.95,
  P: 0.75,
  S: 0.78,
  DEFAULT: 0.65
};

const ATOMIC_WEIGHTS = {
  H: 1.008,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  F: 18.998,
  Cl: 35.45,
  Br: 79.904,
  I: 126.90,
  P: 30.974,
  S: 32.06
};

// Context-aware computational operation descriptions
const SCIENTIFIC_PHASES = {
  'Structure Sanitization': {
    theory: 'Canonicalizing SMILES, standardizing aromatic kekule forms, and checking valence.',
    tag: 'RDKit Cheminformatics'
  },
  '3D Conformer Generation': {
    theory: 'Solving 3D Cartesian coordinates via distance-geometry minimization (ETKDG).',
    tag: 'PubChem PUG REST / ETKDG'
  },
  'Physicochemical & Lipinski': {
    theory: 'Calculating Molecular Weight, LogP, TPSA, HBD/HBA, and QED drug-likeness.',
    tag: 'DeepChem / RDKit Descriptors'
  },
  'Quantum DFT': {
    theory: 'Solving ab-initio B3LYP/6-31G electronic wavefunctions for HOMO, LUMO, and bandgap.',
    tag: 'PySCF Quantum Engine'
  },
  'Generative Candidate Screening': {
    theory: 'Running DiffDock blind docking poses and Boltz-2 binding affinity scoring.',
    tag: 'BioNeMo NIM Pipeline'
  },
  'Scientific Report': {
    theory: 'Compiling structured markdown research monograph with citations.',
    tag: 'Scientific Report Compiler'
  }
};

export default function MolecularAssemblyViewer({
  conformers,
  moleculeName = 'Target Molecule',
  isExecuting = false,
  activeStepName = '',
  elapsedSeconds = 0,
  onCancelJob = null,
  dockingResults = null,
  proteinData = null,
  playbackSpeed = 1.0,
  isPaused = false,
  enableParticles = true,
  enableSpin = true,
  autoCamera = false,
  reducedMotion = false
}) {
  const mountRef = useRef(null);
  const [viewDimension, setViewDimension] = useState('3D'); // '3D' or '2D'
  const [styleMode, setStyleMode] = useState('ball-stick'); // 'ball-stick', 'space-filling', 'wireframe', 'complex'
  const [isSpinning, setIsSpinning] = useState(true);
  const [hoveredAtom, setHoveredAtom] = useState(null);
  const [assemblyProgress, setAssemblyProgress] = useState(1.0);
  const [showLegend, setShowLegend] = useState(false);
  const [showProteinRibbon, setShowProteinRibbon] = useState(true);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const groupRef = useRef(null);
  const particlesRef = useRef(null);
  const animFrameRef = useRef(null);
  const isDraggingRef = useRef(false);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseNormRef = useRef(new THREE.Vector2());

  // Data references for progressive assembly
  const atomMeshesRef = useRef([]);
  const bondMeshesRef = useRef([]);
  const targetPositionsRef = useRef([]);
  const startPositionsRef = useRef([]);

  const prefersReducedMotion = reducedMotion || (typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Find active scientific phase details
  const matchedPhase = Object.entries(SCIENTIFIC_PHASES).find(([key]) =>
    activeStepName.toLowerCase().includes(key.toLowerCase())
  );
  const activePhaseInfo = matchedPhase ? matchedPhase[1] : {
    theory: 'Executing verified computational chemistry pipeline operation.',
    tag: 'Autonomous Engine'
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (viewDimension !== '3D') return;

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 10);
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    keyLight.position.set(8, 12, 10);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf97316, 0.8);
    fillLight.position.set(-10, -8, -6);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffffff, 1.0, 30);
    rimLight.position.set(0, 5, 8);
    scene.add(rimLight);

    // Background floating energy particles
    if (!prefersReducedMotion && enableParticles) {
      const partCount = 45;
      const partGeo = new THREE.BufferGeometry();
      const partPositions = new Float32Array(partCount * 3);
      for (let i = 0; i < partCount * 3; i += 3) {
        partPositions[i] = (Math.random() - 0.5) * 24;
        partPositions[i + 1] = (Math.random() - 0.5) * 20;
        partPositions[i + 2] = (Math.random() - 0.5) * 16 - 2;
      }
      partGeo.setAttribute('position', new THREE.BufferAttribute(partPositions, 3));
      const partMat = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.12,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      });
      const particleSystem = new THREE.Points(partGeo, partMat);
      particlesRef.current = particleSystem;
      scene.add(particleSystem);
    }

    const moleculeGroup = new THREE.Group();
    groupRef.current = moleculeGroup;
    scene.add(moleculeGroup);

    // Mouse drag rotation & raycasting
    const onMouseDown = (e) => {
      isDraggingRef.current = true;
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseNormRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNormRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycast atom mesh hover
      if (cameraRef.current && atomMeshesRef.current.length > 0) {
        raycasterRef.current.setFromCamera(mouseNormRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(atomMeshesRef.current);
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          setHoveredAtom(hit.userData);
        } else {
          setHoveredAtom(null);
        }
      }

      if (!isDraggingRef.current || !groupRef.current) return;
      const dx = e.clientX - mousePosRef.current.x;
      const dy = e.clientY - mousePosRef.current.y;
      groupRef.current.rotation.y += dx * 0.008;
      groupRef.current.rotation.x += dy * 0.008;
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      cameraRef.current.position.z = Math.max(3, Math.min(30, cameraRef.current.position.z + e.deltaY * 0.015));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

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
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
    };
  }, [viewDimension, prefersReducedMotion, enableParticles]);

  // Build / update 3D molecule geometry with progressive assembly & protein ribbon
  const rebuildGeometry = useCallback(() => {
    if (viewDimension !== '3D' || !groupRef.current || !conformers) return;
    const group = groupRef.current;

    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    }

    const atoms = conformers.atoms || [];
    const coordinates = conformers.coordinates || [];
    const bonds = conformers.bonds || [];

    atomMeshesRef.current = [];
    bondMeshesRef.current = [];
    targetPositionsRef.current = [];
    startPositionsRef.current = [];

    const center = new THREE.Vector3(0, 0, 0);
    if (coordinates.length > 0) {
      coordinates.forEach((c) => center.add(new THREE.Vector3(c[0], c[1], c[2])));
      center.divideScalar(coordinates.length);
    }

    const sphereGeo = new THREE.SphereGeometry(1, 24, 24);
    const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 16);

    // Build Atoms
    atoms.forEach((symbol, i) => {
      const targetPos = new THREE.Vector3(
        (coordinates[i]?.[0] || 0) - center.x,
        (coordinates[i]?.[1] || 0) - center.y,
        (coordinates[i]?.[2] || 0) - center.z
      );

      const angle = (i / Math.max(1, atoms.length)) * Math.PI * 2;
      const dispersed = new THREE.Vector3(
        targetPos.x * 2.8 + Math.cos(angle) * 4.0,
        targetPos.y * 2.8 + Math.sin(angle) * 3.5,
        targetPos.z * 2.8 + (i % 2 === 0 ? 3.0 : -3.0)
      );

      targetPositionsRef.current.push(targetPos);
      startPositionsRef.current.push(prefersReducedMotion ? targetPos : dispersed);

      const colorHex = CPK_COLORS[symbol] || CPK_COLORS.DEFAULT;
      const baseRadius = ELEMENT_RADII[symbol] || ELEMENT_RADII.DEFAULT;
      const radiusScale = styleMode === 'space-filling' ? baseRadius * 1.5 : (styleMode === 'wireframe' ? 0.25 : baseRadius);

      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.25,
        metalness: 0.15,
        wireframe: styleMode === 'wireframe'
      });

      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.scale.setScalar(radiusScale);
      mesh.position.copy(prefersReducedMotion ? targetPos : dispersed);
      mesh.userData = {
        atomIndex: i,
        symbol,
        radiusScale,
        coords: coordinates[i] || [0, 0, 0],
        atomicWeight: ATOMIC_WEIGHTS[symbol] || 12.0
      };

      group.add(mesh);
      atomMeshesRef.current.push(mesh);
    });

    // Build Bonds
    if (styleMode !== 'space-filling') {
      bonds.forEach((b) => {
        const i1 = b.from;
        const i2 = b.to;
        if (i1 >= atoms.length || i2 >= atoms.length) return;

        const bondRadius = styleMode === 'wireframe' ? 0.05 : 0.12;
        const bondMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.35,
          metalness: 0.1
        });

        const cylinder = new THREE.Mesh(cylinderGeo, bondMat);
        cylinder.userData = { from: i1, to: i2, bondRadius };
        cylinder.visible = prefersReducedMotion;
        group.add(cylinder);
        bondMeshesRef.current.push(cylinder);
      });
    }

    // ─────────────────────────────────────────────────────────────────
    // Build Macromolecular Protein Ribbon & Binding Pocket Complex
    // ─────────────────────────────────────────────────────────────────
    const proteinBackbone = dockingResults?.protein_ca_backbone || proteinData?.backbone_ca_coords;
    if (showProteinRibbon && proteinBackbone && proteinBackbone.length > 3) {
      const splinePoints = proteinBackbone.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      const splineCurve = new THREE.CatmullRomCurve3(splinePoints);
      const tubeGeo = new THREE.TubeGeometry(splineCurve, 72, 0.26, 12, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0x6366f1, // Indigo ribbon
        roughness: 0.35,
        metalness: 0.2,
        transparent: true,
        opacity: 0.8
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      group.add(tubeMesh);

      // Binding pocket highlight sphere
      const pocketCenter = new THREE.Vector3(
        dockingResults?.binding_pocket_center?.[0] || 0,
        dockingResults?.binding_pocket_center?.[1] || 0,
        dockingResults?.binding_pocket_center?.[2] || 0
      );
      const pocketGeo = new THREE.SphereGeometry(2.4, 24, 24);
      const pocketMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.08,
        wireframe: true
      });
      const pocketMesh = new THREE.Mesh(pocketGeo, pocketMat);
      pocketMesh.position.copy(pocketCenter);
      group.add(pocketMesh);
    }

    if (cameraRef.current && coordinates.length > 0) {
      let maxDist = 2.0;
      targetPositionsRef.current.forEach((p) => {
        maxDist = Math.max(maxDist, p.length());
      });
      cameraRef.current.position.z = Math.max(maxDist * 2.4, 8.5);
    }
  }, [conformers, styleMode, viewDimension, prefersReducedMotion, showProteinRibbon, dockingResults, proteinData]);

  useEffect(() => {
    rebuildGeometry();
  }, [rebuildGeometry]);

  // Main Render Loop with Assembly Easing, Speed Multiplier, and Auto-Camera
  useEffect(() => {
    if (viewDimension !== '3D') return;

    let currentT = prefersReducedMotion ? 1.0 : 0.0;
    let cameraTime = 0;

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (isPaused) {
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        return;
      }

      if (currentT < 1.0 && !prefersReducedMotion) {
        currentT = Math.min(1.0, currentT + 0.022 * playbackSpeed);
        setAssemblyProgress(currentT);

        const ease = 1 - Math.pow(1 - currentT, 3);

        atomMeshesRef.current.forEach((mesh, idx) => {
          const start = startPositionsRef.current[idx];
          const target = targetPositionsRef.current[idx];
          if (start && target) {
            mesh.position.lerpVectors(start, target, ease);
          }
        });

        bondMeshesRef.current.forEach((cylinder) => {
          const i1 = cylinder.userData.from;
          const i2 = cylinder.userData.to;
          const m1 = atomMeshesRef.current[i1];
          const m2 = atomMeshesRef.current[i2];
          if (!m1 || !m2) return;

          cylinder.visible = currentT > 0.45;
          const pos1 = m1.position;
          const pos2 = m2.position;

          const midpoint = new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5);
          const dist = pos1.distanceTo(pos2);

          cylinder.position.copy(midpoint);
          cylinder.scale.set(cylinder.userData.bondRadius, dist, cylinder.userData.bondRadius);
          cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(pos2, pos1).normalize());
        });
      } else {
        bondMeshesRef.current.forEach((cylinder) => {
          const i1 = cylinder.userData.from;
          const i2 = cylinder.userData.to;
          const m1 = atomMeshesRef.current[i1];
          const m2 = atomMeshesRef.current[i2];
          if (!m1 || !m2) return;

          cylinder.visible = true;
          const pos1 = m1.position;
          const pos2 = m2.position;
          const midpoint = new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5);
          const dist = pos1.distanceTo(pos2);
          cylinder.position.copy(midpoint);
          cylinder.scale.set(cylinder.userData.bondRadius, dist, cylinder.userData.bondRadius);
          cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(pos2, pos1).normalize());
        });
      }

      // Gentle continuous rotation when idle
      if (groupRef.current && isSpinning && enableSpin && !isDraggingRef.current) {
        groupRef.current.rotation.y += 0.0035 * playbackSpeed;
      }

      // Cinematic Auto-Camera Movement
      if (autoCamera && cameraRef.current && !isDraggingRef.current) {
        cameraTime += 0.008 * playbackSpeed;
        cameraRef.current.position.x = Math.sin(cameraTime) * 3.0;
        cameraRef.current.position.y = Math.cos(cameraTime * 0.7) * 1.5;
        cameraRef.current.lookAt(0, 0, 0);
      }

      // Background particle drift
      if (particlesRef.current && enableParticles) {
        particlesRef.current.rotation.y += 0.001 * playbackSpeed;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSpinning, prefersReducedMotion, viewDimension, isPaused, playbackSpeed, enableSpin, autoCamera, enableParticles]);

  // Camera Actions
  const handleResetCamera = () => {
    if (cameraRef.current) cameraRef.current.position.set(0, 0, 9);
    if (groupRef.current) groupRef.current.rotation.set(0, 0, 0);
  };

  const handleZoomIn = () => {
    if (cameraRef.current) cameraRef.current.position.z = Math.max(3, cameraRef.current.position.z - 1.2);
  };

  const handleZoomOut = () => {
    if (cameraRef.current) cameraRef.current.position.z = Math.min(26, cameraRef.current.position.z + 1.2);
  };

  const handleReplayAssembly = () => {
    setAssemblyProgress(0);
    rebuildGeometry();
  };

  const atomCounts = (conformers?.atoms || []).reduce((acc, sym) => {
    acc[sym] = (acc[sym] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="relative w-full h-[400px] lg:h-[480px] rounded-2xl border border-[var(--border-subtle)] bg-slate-950/85 overflow-hidden shadow-2xl flex flex-col select-none">
      {/* ───────────────────────────────────────────────────────────────────
          TOP CONTROL BAR & VIEW DIMENSION SWITCH
         ─────────────────────────────────────────────────────────────────── */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          {/* Molecule Name Pill */}
          <div className="px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{moleculeName}</span>
          </div>

          {/* Docking Target Indicator */}
          {dockingResults && (
            <div className="hidden sm:flex items-center px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-mono text-indigo-300">
              <span>Target: {dockingResults.target_name || dockingResults.pdb_id}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* 2D / 3D Mode Switcher */}
          <div className="flex items-center bg-black/60 backdrop-blur-md rounded-lg border border-white/10 p-0.5 text-xs font-mono">
            <button
              onClick={() => setViewDimension('3D')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                viewDimension === '3D' ? 'bg-orange-500/25 text-orange-400 font-bold border border-orange-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3 h-3" />
              <span>3D Spatial</span>
            </button>
            <button
              onClick={() => setViewDimension('2D')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                viewDimension === '2D' ? 'bg-orange-500/25 text-orange-400 font-bold border border-orange-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Atom className="w-3 h-3" />
              <span>2D Chemical</span>
            </button>
          </div>

          {/* 3D Geometry Style Switcher */}
          {viewDimension === '3D' && (
            <div className="hidden sm:flex items-center bg-black/60 backdrop-blur-md rounded-lg border border-white/10 p-0.5 text-xs font-mono">
              <button
                onClick={() => setStyleMode('ball-stick')}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  styleMode === 'ball-stick' ? 'bg-orange-500/20 text-orange-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Ball & Stick Mode"
              >
                Ball-Stick
              </button>
              <button
                onClick={() => setStyleMode('space-filling')}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  styleMode === 'space-filling' ? 'bg-orange-500/20 text-orange-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="CPK Space-Filling Spheres"
              >
                Space-Fill
              </button>
              <button
                onClick={() => setStyleMode('wireframe')}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  styleMode === 'wireframe' ? 'bg-orange-500/20 text-orange-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Wireframe Mesh"
              >
                Wireframe
              </button>
              {dockingResults && (
                <button
                  onClick={() => setShowProteinRibbon(!showProteinRibbon)}
                  className={`px-2 py-1 rounded-md transition cursor-pointer ${
                    showProteinRibbon ? 'bg-indigo-500/25 text-indigo-300 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Protein Ribbon Backbone"
                >
                  Ribbon
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────
          CENTER VIEWPORT: 3D THREE.JS CANVAS OR 2D STRUCTURAL DIAGRAM
         ─────────────────────────────────────────────────────────────────── */}
      {viewDimension === '3D' ? (
        <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing relative" />
      ) : (
        /* High-Definition 2D Structural View */
        <div className="w-full flex-1 flex flex-col justify-between p-6 pt-16 bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950 font-mono text-xs overflow-y-auto">
          <div className="flex flex-col items-center justify-center flex-1 space-y-4">
            <div className="p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md text-center max-w-md w-full space-y-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto">
                <Atom className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide">{moleculeName}</h4>
                <span className="text-[11px] text-slate-400 block mt-0.5">2D Topology & Stoichiometric Distribution</span>
              </div>

              {/* Elemental Distribution Matrix */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                {Object.entries(atomCounts).map(([elem, count]) => {
                  const colorHex = CPK_COLORS[elem] || CPK_COLORS.DEFAULT;
                  return (
                    <div key={elem} className="p-2 rounded-lg bg-black/50 border border-white/5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: `#${colorHex.toString(16).padStart(6, '0')}` }}
                        />
                        <span className="font-bold text-slate-200">{elem}</span>
                      </div>
                      <span className="text-xs text-orange-400 font-bold block mt-0.5">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Structural metrics */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-slate-400">
                <span>Total Atoms: <strong className="text-white">{conformers?.atoms?.length || 0}</strong></span>
                <span>Covalent Bonds: <strong className="text-white">{conformers?.bonds?.length || 0}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────
          HOVERED ATOM TELEMETRY TOOLTIP
         ─────────────────────────────────────────────────────────────────── */}
      {hoveredAtom && viewDimension === '3D' && (
        <div className="absolute top-14 left-4 z-20 p-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-orange-500/40 text-[11px] font-mono text-slate-200 shadow-xl pointer-events-none space-y-0.5 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: `#${(CPK_COLORS[hoveredAtom.symbol] || CPK_COLORS.DEFAULT).toString(16).padStart(6, '0')}` }}
            />
            <strong className="text-white">Atom #{hoveredAtom.atomIndex + 1}: {hoveredAtom.symbol}</strong>
          </div>
          <div className="text-[10px] text-slate-400">
            Coord: [{hoveredAtom.coords?.[0]?.toFixed(2)}, {hoveredAtom.coords?.[1]?.toFixed(2)}, {hoveredAtom.coords?.[2]?.toFixed(2)}] Å
          </div>
          <div className="text-[10px] text-slate-400">
            Atomic Mass: {hoveredAtom.atomicWeight} Da
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────
          SCIENTIFIC DISCLAIMER & ASSEMBLY BANNER
         ─────────────────────────────────────────────────────────────────── */}
      {assemblyProgress < 1.0 && !prefersReducedMotion && viewDimension === '3D' && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/40 backdrop-blur-md text-orange-300 text-[10.5px] font-mono font-semibold flex items-center gap-2 pointer-events-none shadow-lg">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>Illustrative 3D Fragment Assembly ({Math.round(assemblyProgress * 100)}%)</span>
        </div>
      )}

      {/* Non-mechanistic visual label */}
      <div className="absolute top-14 right-4 z-10 hidden md:block">
        <span className="text-[9px] font-mono text-slate-500 bg-black/40 px-2 py-0.5 rounded border border-white/5 backdrop-blur-xs">
          Illustrative spatial assembly — not an empirical reaction mechanism
        </span>
      </div>

      {/* ───────────────────────────────────────────────────────────────────
          REAL-TIME CONTEXT-AWARE SCIENTIFIC PROCESSING OVERLAY
         ─────────────────────────────────────────────────────────────────── */}
      {isExecuting && (
        <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fadeIn select-none">
          <div className="max-w-md w-full p-5 rounded-2xl bg-slate-900/90 border border-orange-500/40 shadow-2xl space-y-3 relative">
            <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/40 text-orange-400 flex items-center justify-center mx-auto">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 uppercase font-bold tracking-wider">
                {activePhaseInfo.tag}
              </span>
              <h3 className="text-sm font-bold text-white mt-1.5 flex items-center justify-center gap-2">
                <span>{activeStepName || 'Running Scientific Workflow'}</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {activePhaseInfo.theory}
              </p>
            </div>

            {/* Honest Indeterminate Pulse Animation */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
              <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 rounded-full animate-indeterminateBar" />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
              <span>Elapsed: <strong className="text-orange-400">{elapsedSeconds.toFixed(1)}s</strong></span>
              <span>Speed: {playbackSpeed}x</span>
            </div>

            {onCancelJob && (
              <button
                onClick={onCancelJob}
                className="w-full mt-2 py-2 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-mono font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Cancel Execution</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────
          BOTTOM FLOATING CONTROL BAR & CPK LEGEND
         ─────────────────────────────────────────────────────────────────── */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-xs pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="text-[10px] font-mono text-slate-400 bg-black/70 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-md">
            {conformers?.atoms?.length || 0} Atoms • {conformers?.bonds?.length || 0} Bonds
          </span>

          <button
            onClick={() => setShowLegend((prev) => !prev)}
            className="text-[10px] font-mono px-2 py-1 rounded-lg bg-black/70 border border-white/10 hover:border-orange-500/40 text-slate-300 hover:text-white backdrop-blur-md transition cursor-pointer flex items-center gap-1"
            title="Toggle CPK Chemical Legend"
          >
            <Info className="w-3 h-3 text-orange-400" />
            <span>CPK Legend</span>
          </button>
        </div>

        {/* 3D Camera Controls */}
        {viewDimension === '3D' && (
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 hover:border-orange-500/40 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 hover:border-orange-500/40 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReplayAssembly}
              className="w-8 h-8 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 hover:border-orange-500/40 text-slate-300 hover:text-orange-400 flex items-center justify-center transition cursor-pointer"
              title="Replay 3D Molecular Assembly"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsSpinning((prev) => !prev)}
              className={`w-8 h-8 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-center transition cursor-pointer ${
                isSpinning ? 'text-orange-400 border-orange-500/30' : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle Auto-Rotation"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleResetCamera}
              className="w-8 h-8 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 hover:border-orange-500/40 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Center 3D View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* CPK Chemical Color Legend Popover */}
      {showLegend && (
        <div className="absolute bottom-12 left-3 z-30 p-3 rounded-xl bg-black/90 backdrop-blur-md border border-white/15 text-[10px] font-mono text-slate-300 shadow-2xl space-y-2 animate-fadeIn max-w-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-1">
            <span className="font-bold text-white uppercase">CPK Element Legend</span>
            <button onClick={() => setShowLegend(false)} className="text-slate-500 hover:text-white cursor-pointer">✕</button>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300" /> Carbon (C)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Oxygen (O)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Nitrogen (N)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Sulfur (S)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" /> Phosphorus (P)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Halogens (Cl, F)</span>
          </div>
        </div>
      )}
    </div>
  );
}
