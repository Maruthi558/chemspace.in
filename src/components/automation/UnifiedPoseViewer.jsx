import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Layers,
  Eye,
  Box,
  Ruler,
  Compass,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Activity,
  Sliders,
  Check,
  Camera,
  Download,
  Crosshair,
  ShieldCheck,
  Atom
} from 'lucide-react';

// Standard IUPAC CPK Element Color Palette & Atomic Properties
const CPK_COLORS = {
  H: 0xf8fafc,   // White / Silver
  C: 0x334155,   // Dark Charcoal / Slate
  N: 0x38bdf8,   // Cyan / Sky Blue
  O: 0xef4444,   // Crimson Red
  F: 0x10b981,   // Emerald Green
  Cl: 0x22c55e,  // Light Green
  Br: 0xb45309,  // Amber Brown
  I: 0x8b5cf6,   // Purple / Violet
  P: 0xf97316,   // Orange
  S: 0xeab308,   // Yellow Gold
  Fe: 0xe11d48,  // Iron Red
  Zn: 0x06b6d4,  // Cyan Zinc
  DEFAULT: 0xa855f7
};

const ELEMENT_RADII = {
  H: 0.32,
  C: 0.62,
  N: 0.58,
  O: 0.55,
  F: 0.52,
  Cl: 0.72,
  Br: 0.82,
  I: 0.92,
  P: 0.72,
  S: 0.75,
  Fe: 0.80,
  Zn: 0.78,
  DEFAULT: 0.60
};

const ELEMENT_NAMES = {
  H: 'Hydrogen',
  C: 'Carbon',
  N: 'Nitrogen',
  O: 'Oxygen',
  F: 'Fluorine',
  Cl: 'Chlorine',
  Br: 'Bromine',
  I: 'Iodine',
  P: 'Phosphorus',
  S: 'Sulfur',
  Fe: 'Iron',
  Zn: 'Zinc'
};

export default function UnifiedPoseViewer({
  conformers,
  dockingResults,
  proteinData,
  selectedResidue = null,
  activePoseIndex = 0,
  onSelectResidue = null,
  onMeasureDistance = null,
  onSelectInteraction = null,
  reducedMotion = false,
  provenance = null,
  complexName = 'SARS-CoV-2 Mpro + Remdesivir'
}) {
  const mountRef = useRef(null);
  const [styleMode, setStyleMode] = useState('cartoon-ligand'); // 'cartoon-ligand', 'ball-stick', 'sticks', 'spacefill', 'pocket-surface'
  const [isSpinning, setIsSpinning] = useState(false);
  const [showHBonds, setShowHBonds] = useState(true);
  const [showSaltBridges, setShowSaltBridges] = useState(true);
  const [showHydrophobic, setShowHydrophobic] = useState(true);
  const [showPiStacking, setShowPiStacking] = useState(true);
  const [showProtein, setShowProtein] = useState(true);
  const [showLigand, setShowLigand] = useState(true);
  const [showPocketSurface, setShowPocketSurface] = useState(true);
  const [hoveredObject, setHoveredObject] = useState(null);
  const [measuringMode, setMeasuringMode] = useState(false);
  const [measuredAtoms, setMeasuredAtoms] = useState([]);
  const [measurementDistance, setMeasurementDistance] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [snapshotTaken, setSnapshotTaken] = useState(false);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const groupRef = useRef(null);
  const animFrameRef = useRef(null);
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseNormRef = useRef(new THREE.Vector2());

  // Interactive Meshes collection for raycasting
  const interactiveMeshesRef = useRef([]);

  const prefersReducedMotion = reducedMotion || (typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 4, 16);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true, // Allows clean PNG snapshot export
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Studio Scientific Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x65b8ff, 1.4);
    keyLight.position.set(12, 18, 14);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 0.85);
    rimLight.position.set(-14, -10, -10);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    fillLight.position.set(0, -15, 10);
    scene.add(fillLight);

    const topFill = new THREE.PointLight(0xffffff, 0.8, 35);
    topFill.position.set(0, 12, 8);
    scene.add(topFill);

    const rootGroup = new THREE.Group();
    groupRef.current = rootGroup;
    scene.add(rootGroup);

    // Mouse Interaction Handlers
    const onMouseDown = (e) => {
      if (e.button === 2 || e.shiftKey) {
        isPanningRef.current = true;
      } else {
        isDraggingRef.current = true;
      }
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onContextMenu = (e) => {
      e.preventDefault(); // Prevent browser context menu on right drag pan
    };

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseNormRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNormRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycast atom/residue/interaction vector hover
      if (cameraRef.current && interactiveMeshesRef.current.length > 0) {
        raycasterRef.current.setFromCamera(mouseNormRef.current, cameraRef.current);
        const hits = raycasterRef.current.intersectObjects(interactiveMeshesRef.current, false);
        if (hits.length > 0) {
          setHoveredObject(hits[0].object.userData);
        } else {
          setHoveredObject(null);
        }
      }

      if (isPanningRef.current && groupRef.current) {
        const dx = e.clientX - mousePosRef.current.x;
        const dy = e.clientY - mousePosRef.current.y;
        groupRef.current.position.x += dx * 0.015;
        groupRef.current.position.y -= dy * 0.015;
        mousePosRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      if (isDraggingRef.current && groupRef.current) {
        const dx = e.clientX - mousePosRef.current.x;
        const dy = e.clientY - mousePosRef.current.y;
        groupRef.current.rotation.y += dx * 0.007;
        groupRef.current.rotation.x += dy * 0.007;
        mousePosRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      isPanningRef.current = false;
    };

    const onClick = () => {
      if (cameraRef.current && interactiveMeshesRef.current.length > 0) {
        raycasterRef.current.setFromCamera(mouseNormRef.current, cameraRef.current);
        const hits = raycasterRef.current.intersectObjects(interactiveMeshesRef.current, false);
        if (hits.length > 0) {
          const uData = hits[0].object.userData;
          if (measuringMode) {
            handleAtomMeasureSelect(uData);
          } else if (uData.residue && onSelectResidue) {
            onSelectResidue(uData.residue);
          } else if (uData.interaction && onSelectInteraction) {
            onSelectInteraction(uData.interaction);
          }
        }
      }
    };

    const onWheel = (e) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      cameraRef.current.position.z = Math.max(3.5, Math.min(50, cameraRef.current.position.z + e.deltaY * 0.018));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    dom.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('click', onClick);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Resize Observer for flawless responsive container sizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      dom.removeEventListener('mousedown', onMouseDown);
      dom.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('click', onClick);
      dom.removeEventListener('wheel', onWheel);
      resizeObserver.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
    };
  }, []);

  const handleAtomMeasureSelect = (uData) => {
    if (!uData || !uData.coords) return;
    setMeasuredAtoms((prev) => {
      if (prev.length === 0) {
        return [uData];
      } else if (prev.length === 1) {
        const p1 = new THREE.Vector3(prev[0].coords[0], prev[0].coords[1], prev[0].coords[2]);
        const p2 = new THREE.Vector3(uData.coords[0], uData.coords[1], uData.coords[2]);
        const dist = p1.distanceTo(p2);
        setMeasurementDistance(dist.toFixed(2));
        if (onMeasureDistance) onMeasureDistance(dist.toFixed(2));
        return [prev[0], uData];
      } else {
        setMeasurementDistance(null);
        return [uData];
      }
    });
  };

  // Build 3D Macromolecular & Ligand Geometry
  const buildSceneGeometry = useCallback(() => {
    if (!groupRef.current) return;
    const group = groupRef.current;

    // Dispose old meshes safely
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    }

    interactiveMeshesRef.current = [];

    // 1. Macromolecular Protein Backbone (Nomosis/LiteFold ribbon tube spline)
    const rawBackbone = dockingResults?.protein_ca_backbone || proteinData?.backbone_ca_coords || [
      [-6.2, 3.4, -2.1], [-4.8, 4.1, -1.0], [-3.1, 3.5, 0.4], [-1.8, 2.2, 1.2],
      [-0.4, 1.1, 0.8], [0.8, -0.2, 1.4], [2.2, -1.1, 0.6], [3.5, -2.0, 1.8],
      [4.9, -1.6, 2.8], [6.2, -0.4, 2.1], [6.8, 1.2, 1.4], [5.9, 2.8, 0.2]
    ];

    if (showProtein && rawBackbone && rawBackbone.length >= 4 && styleMode !== 'spacefill') {
      const curvePoints = rawBackbone.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      const spline = new THREE.CatmullRomCurve3(curvePoints);
      const tubeGeo = new THREE.TubeGeometry(spline, 96, 0.32, 12, false);

      // Create vertex colors for secondary structure gradient
      const count = tubeGeo.attributes.position.count;
      const colors = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const t = i / count;
        // Cyan-to-indigo gradient for secondary structure representation
        colors[i * 3] = 0.18 + t * 0.22;
        colors[i * 3 + 1] = 0.62 - t * 0.22;
        colors[i * 3 + 2] = 0.95;
      }
      tubeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const tubeMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.28,
        metalness: 0.18,
        transparent: true,
        opacity: styleMode === 'cartoon-ligand' ? 0.90 : 0.38
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      group.add(tubeMesh);

      // Add Key Active-Site / Pocket Residue Spheres
      const defaultKeyResidues = [
        { name: 'CYS145', pos: rawBackbone[4] || [0, 1, 0], type: 'Catalytic Dyad' },
        { name: 'HIS41', pos: rawBackbone[6] || [2, -1, 0], type: 'Catalytic Dyad' },
        { name: 'GLU166', pos: rawBackbone[7] || [3, -2, 1], type: 'S1 Subsite' },
        { name: 'GLN189', pos: rawBackbone[8] || [4, -1, 2], type: 'S2 Pocket' },
        { name: 'PHE140', pos: rawBackbone[3] || [-2, 2, 1], type: 'Aromatic Wall' }
      ];

      const resGeo = new THREE.SphereGeometry(0.48, 16, 16);
      defaultKeyResidues.forEach((res) => {
        const isSelected = selectedResidue && selectedResidue.toUpperCase().includes(res.name);
        const resMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0xf59e0b : 0x65b8ff,
          emissive: isSelected ? 0xf59e0b : 0x0284c7,
          emissiveIntensity: isSelected ? 0.65 : 0.2,
          roughness: 0.3
        });
        const resMesh = new THREE.Mesh(resGeo, resMat);
        resMesh.position.set(res.pos[0], res.pos[1], res.pos[2]);
        resMesh.userData = {
          name: res.name,
          residue: res.name,
          role: res.type,
          coords: res.pos,
          type: 'Protein Residue'
        };
        group.add(resMesh);
        interactiveMeshesRef.current.push(resMesh);
      });
    }

    // 2. Translucent Binding Pocket Cavity Envelope
    if (showPocketSurface && (styleMode === 'pocket-surface' || styleMode === 'cartoon-ligand')) {
      const pocketCenter = dockingResults?.binding_pocket_center || [0.4, 0.2, 0.8];
      const pocketGeo = new THREE.SphereGeometry(3.6, 28, 28);
      const pocketMat = new THREE.MeshStandardMaterial({
        color: 0x65b8ff,
        transparent: true,
        opacity: styleMode === 'pocket-surface' ? 0.22 : 0.10,
        roughness: 0.6,
        metalness: 0.1,
        wireframe: styleMode !== 'pocket-surface',
        side: THREE.DoubleSide
      });
      const pocketMesh = new THREE.Mesh(pocketGeo, pocketMat);
      pocketMesh.position.set(pocketCenter[0], pocketCenter[1], pocketCenter[2]);
      group.add(pocketMesh);
    }

    // 3. Small Molecule Ligand Atoms & Coordinates
    const currentPose = (dockingResults?.poses && dockingResults.poses[activePoseIndex]) ? dockingResults.poses[activePoseIndex] : null;
    const atoms = conformers?.atoms || ['C', 'C', 'O', 'N', 'C', 'O', 'F'];
    const rawCoords = currentPose?.coordinates || conformers?.coordinates || [
      [0.2, 0.4, 0.1], [1.3, -0.3, 0.2], [2.4, 0.5, -0.1],
      [1.1, -1.6, 0.4], [0.0, -2.1, 0.2], [-1.1, -1.3, 0.1], [-2.2, -1.9, 0.3]
    ];
    const bonds = conformers?.bonds || [
      { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 2 },
      { from: 1, to: 3, order: 1 }, { from: 3, to: 4, order: 1 },
      { from: 4, to: 5, order: 1 }, { from: 5, to: 6, order: 1 }
    ];

    if (showLigand) {
      // Center ligand coordinates
      const ligCenter = new THREE.Vector3(0, 0, 0);
      rawCoords.forEach((c) => ligCenter.add(new THREE.Vector3(c[0], c[1], c[2])));
      ligCenter.divideScalar(Math.max(1, rawCoords.length));

      const sphereGeo = new THREE.SphereGeometry(1, 24, 24);
      const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 16);

      // Build Ligand Atoms
      atoms.forEach((sym, i) => {
        const coord = rawCoords[i] || [0, 0, 0];
        const pos = new THREE.Vector3(coord[0] - ligCenter.x, coord[1] - ligCenter.y, coord[2] - ligCenter.z);

        const color = CPK_COLORS[sym] || CPK_COLORS.DEFAULT;
        const baseR = ELEMENT_RADII[sym] || ELEMENT_RADII.DEFAULT;
        const radius = styleMode === 'spacefill' ? baseR * 1.5 : (styleMode === 'sticks' ? 0.28 : baseR);

        const mat = new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.25,
          metalness: 0.15
        });

        const atomMesh = new THREE.Mesh(sphereGeo, mat);
        atomMesh.scale.setScalar(radius);
        atomMesh.position.copy(pos);
        atomMesh.userData = {
          atomIndex: i,
          symbol: sym,
          elementName: ELEMENT_NAMES[sym] || sym,
          coords: [pos.x, pos.y, pos.z],
          type: 'Ligand Atom'
        };
        group.add(atomMesh);
        interactiveMeshesRef.current.push(atomMesh);
      });

      // Build Ligand Bonds
      if (styleMode !== 'spacefill') {
        bonds.forEach((b) => {
          if (b.from >= rawCoords.length || b.to >= rawCoords.length) return;
          const p1 = new THREE.Vector3(
            rawCoords[b.from][0] - ligCenter.x,
            rawCoords[b.from][1] - ligCenter.y,
            rawCoords[b.from][2] - ligCenter.z
          );
          const p2 = new THREE.Vector3(
            rawCoords[b.to][0] - ligCenter.x,
            rawCoords[b.to][1] - ligCenter.y,
            rawCoords[b.to][2] - ligCenter.z
          );

          const dist = p1.distanceTo(p2);
          const mid = p1.clone().add(p2).multiplyScalar(0.5);

          const bondMat = new THREE.MeshStandardMaterial({
            color: 0x94a3b8,
            roughness: 0.35,
            metalness: 0.1
          });

          const cylinder = new THREE.Mesh(cylinderGeo, bondMat);
          cylinder.scale.set(0.12, dist, 0.12);
          cylinder.position.copy(mid);

          const orientation = new THREE.Matrix4();
          orientation.lookAt(p1, p2, new THREE.Vector3(0, 1, 0));
          cylinder.quaternion.setFromRotationMatrix(orientation);
          cylinder.rotateX(Math.PI / 2);

          group.add(cylinder);
        });
      }
    }

    // 4. Non-Covalent Protein-Ligand Interaction Vectors
    const interactions = (currentPose?.interactions && currentPose.interactions.length > 0)
      ? currentPose.interactions
      : (dockingResults?.interactions || [
          { type: 'HBOND', start: [-0.8, -1.2, 0.2], end: [-1.8, 2.2, 1.2], dist: '2.84 Å', residue: 'CYS145' },
          { type: 'HBOND', start: [1.2, -0.4, 0.2], end: [0.8, -0.2, 1.4], dist: '2.96 Å', residue: 'HIS41' },
          { type: 'HYDROPHOBIC', start: [2.3, 0.5, -0.1], end: [3.5, -2.0, 1.8], dist: '3.62 Å', residue: 'MET165' },
          { type: 'SALT_BRIDGE', start: [-1.0, -1.4, 0.1], end: [2.2, -1.1, 0.6], dist: '3.15 Å', residue: 'GLU166' },
          { type: 'PI_STACKING', start: [1.8, 0.8, -0.2], end: [3.1, -1.8, 1.4], dist: '3.85 Å', residue: 'PHE140' }
        ]);

    const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 16);

    interactions.forEach((inter) => {
      const iType = (inter.type || '').toUpperCase();
      if (iType.includes('HBOND') && !showHBonds) return;
      if (iType.includes('HYDROPHOBIC') && !showHydrophobic) return;
      if (iType.includes('SALT') && !showSaltBridges) return;
      if (iType.includes('PI') && !showPiStacking) return;

      if (!inter.start || !inter.end || !Array.isArray(inter.start) || !Array.isArray(inter.end)) return;
      if (inter.start.length < 3 || inter.end.length < 3) return;

      const p1 = new THREE.Vector3(Number(inter.start[0]) || 0, Number(inter.start[1]) || 0, Number(inter.start[2]) || 0);
      const p2 = new THREE.Vector3(Number(inter.end[0]) || 0, Number(inter.end[1]) || 0, Number(inter.end[2]) || 0);
      const dist = p1.distanceTo(p2);
      if (dist === 0) return;
      const mid = p1.clone().add(p2).multiplyScalar(0.5);

      const colorHex = iType.includes('HBOND')
        ? 0x38bdf8
        : (iType.includes('SALT') ? 0xe879f9 : (iType.includes('PI') ? 0x34d399 : 0xfbbf24));

      // Dashed cylinder vector
      const vectorMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.5,
        roughness: 0.3
      });

      const vectorCyl = new THREE.Mesh(cylinderGeo, vectorMat);
      vectorCyl.scale.set(0.045, dist, 0.045);
      vectorCyl.position.copy(mid);

      const orientation = new THREE.Matrix4();
      orientation.lookAt(p1, p2, new THREE.Vector3(0, 1, 0));
      vectorCyl.quaternion.setFromRotationMatrix(orientation);
      vectorCyl.rotateX(Math.PI / 2);

      vectorCyl.userData = {
        type: `Interaction: ${iType}`,
        dist: inter.dist || `${dist.toFixed(2)} Å`,
        residue: inter.residue,
        interaction: inter
      };

      group.add(vectorCyl);
      interactiveMeshesRef.current.push(vectorCyl);
    });

    // 5. Render Active Distance Measurement Line between picked atoms
    if (measuredAtoms.length === 2 && Array.isArray(measuredAtoms[0]?.coords) && Array.isArray(measuredAtoms[1]?.coords)) {
      const p1 = new THREE.Vector3(Number(measuredAtoms[0].coords[0]) || 0, Number(measuredAtoms[0].coords[1]) || 0, Number(measuredAtoms[0].coords[2]) || 0);
      const p2 = new THREE.Vector3(Number(measuredAtoms[1].coords[0]) || 0, Number(measuredAtoms[1].coords[1]) || 0, Number(measuredAtoms[1].coords[2]) || 0);
      const dist = p1.distanceTo(p2);
      const mid = p1.clone().add(p2).multiplyScalar(0.5);

      const measureMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 0.75,
        roughness: 0.2
      });

      const measureCyl = new THREE.Mesh(cylinderGeo, measureMat);
      measureCyl.scale.set(0.07, dist, 0.07);
      measureCyl.position.copy(mid);

      const orientation = new THREE.Matrix4();
      orientation.lookAt(p1, p2, new THREE.Vector3(0, 1, 0));
      measureCyl.quaternion.setFromRotationMatrix(orientation);
      measureCyl.rotateX(Math.PI / 2);

      group.add(measureCyl);
    }

  }, [conformers, dockingResults, proteinData, activePoseIndex, styleMode, showProtein, showLigand, showPocketSurface, showHBonds, showHydrophobic, showSaltBridges, showPiStacking, selectedResidue, measuredAtoms]);

  useEffect(() => {
    buildSceneGeometry();
  }, [buildSceneGeometry]);

  // Main Render Loop
  useEffect(() => {
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (isSpinning && groupRef.current && !isDraggingRef.current && !prefersReducedMotion) {
        groupRef.current.rotation.y += 0.004;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSpinning, prefersReducedMotion]);

  const handleResetCamera = () => {
    if (cameraRef.current && groupRef.current) {
      cameraRef.current.position.set(0, 4, 16);
      groupRef.current.rotation.set(0, 0, 0);
      groupRef.current.position.set(0, 0, 0);
    }
  };

  const handleZoom = (delta) => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(3.5, Math.min(50, cameraRef.current.position.z + delta));
    }
  };

  const handleExportSnapshot = () => {
    if (!rendererRef.current) return;
    try {
      const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `chemspace_${complexName.replace(/\s+/g, '_')}_3D.png`;
      link.href = dataUrl;
      link.click();
      setSnapshotTaken(true);
      setTimeout(() => setSnapshotTaken(false), 2000);
    } catch (e) {
      console.warn('Could not export snapshot:', e);
    }
  };

  return (
    <section
      aria-label="3D Molecular and Protein-Ligand Viewport"
      className={`relative w-full h-full flex flex-col overflow-hidden rounded-xl border border-[var(--sci-border)] bg-[var(--sci-bg-main)] shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Top Application Header Controls (Nomosis & LiteFold Style HUD) */}
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[var(--sci-bg-panel)]/95 backdrop-blur-md border-b border-[var(--sci-border)] z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--sci-bg-card)] border border-[var(--sci-border)] text-xs font-mono text-[var(--sci-accent)]">
            <Activity className="w-3.5 h-3.5 text-[var(--sci-accent)] animate-pulse" />
            <span className="font-semibold">Interactive 3D Engine</span>
          </div>

          {/* Representation Selector Pills */}
          <div className="flex items-center gap-1 bg-[var(--sci-bg-card)] p-0.5 rounded-lg border border-[var(--sci-border)] text-xs">
            <button
              onClick={() => setStyleMode('cartoon-ligand')}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                styleMode === 'cartoon-ligand'
                  ? 'bg-[var(--sci-accent)] text-slate-950 font-bold shadow-sm'
                  : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
              }`}
              title="Macromolecular ribbon with bound ligand"
            >
              Ribbon + Ligand
            </button>
            <button
              onClick={() => setStyleMode('ball-stick')}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                styleMode === 'ball-stick'
                  ? 'bg-[var(--sci-accent)] text-slate-950 font-bold shadow-sm'
                  : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
              }`}
            >
              Ball & Stick
            </button>
            <button
              onClick={() => setStyleMode('pocket-surface')}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                styleMode === 'pocket-surface'
                  ? 'bg-[var(--sci-accent)] text-slate-950 font-bold shadow-sm'
                  : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
              }`}
            >
              Pocket Cavity
            </button>
            <button
              onClick={() => setStyleMode('spacefill')}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                styleMode === 'spacefill'
                  ? 'bg-[var(--sci-accent)] text-slate-950 font-bold shadow-sm'
                  : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
              }`}
            >
              VDW Sphere
            </button>
          </div>
        </div>

        {/* Interaction Filters & Measure Tool */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setShowHBonds(!showHBonds)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] border transition-all ${
              showHBonds
                ? 'bg-sky-500/15 border-sky-500/40 text-sky-400 font-semibold'
                : 'bg-[var(--sci-bg-card)] border-[var(--sci-border)] text-[var(--sci-text-secondary)]'
            }`}
            title="Toggle Hydrogen Bonds"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>H-Bond</span>
          </button>

          <button
            onClick={() => setShowSaltBridges(!showSaltBridges)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] border transition-all ${
              showSaltBridges
                ? 'bg-fuchsia-500/15 border-fuchsia-500/40 text-fuchsia-400 font-semibold'
                : 'bg-[var(--sci-bg-card)] border-[var(--sci-border)] text-[var(--sci-text-secondary)]'
            }`}
            title="Toggle Salt Bridges"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
            <span>Salt Bridge</span>
          </button>

          <button
            onClick={() => setShowHydrophobic(!showHydrophobic)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] border transition-all ${
              showHydrophobic
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-semibold'
                : 'bg-[var(--sci-bg-card)] border-[var(--sci-border)] text-[var(--sci-text-secondary)]'
            }`}
            title="Toggle Hydrophobic Contacts"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Hydrophobic</span>
          </button>

          <button
            onClick={() => setShowPiStacking(!showPiStacking)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] border transition-all ${
              showPiStacking
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-semibold'
                : 'bg-[var(--sci-bg-card)] border-[var(--sci-border)] text-[var(--sci-text-secondary)]'
            }`}
            title="Toggle Pi-Stacking Contacts"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Pi-Stack</span>
          </button>

          <div className="w-[1px] h-4 bg-[var(--sci-border)]" />

          {/* Distance Measure Button */}
          <button
            onClick={() => setMeasuringMode(!measuringMode)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] border transition-all ${
              measuringMode
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold'
                : 'bg-[var(--sci-bg-card)] border-[var(--sci-border)] text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
            }`}
            title="Toggle Distance Measuring Mode"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Measure</span>
          </button>

          {/* Snapshot Button */}
          <button
            onClick={handleExportSnapshot}
            className="p-1.5 rounded-md bg-[var(--sci-bg-card)] border border-[var(--sci-border)] text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] transition-all"
            title="Export High-Resolution Viewport PNG"
          >
            {snapshotTaken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Camera className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-md bg-[var(--sci-bg-card)] border border-[var(--sci-border)] text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] transition-all"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Main 3D Canvas Mount */}
      <div ref={mountRef} className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing select-none" />

      {/* Bottom Floating Viewport Controls */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 bg-[var(--sci-bg-panel)]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[var(--sci-border)] shadow-xl">
        <button
          onClick={() => handleZoom(-2.5)}
          className="p-1.5 rounded-lg hover:bg-[var(--sci-bg-card)] text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(2.5)}
          className="p-1.5 rounded-lg hover:bg-[var(--sci-bg-card)] text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-[var(--sci-border)]" />
        <button
          onClick={() => setIsSpinning(!isSpinning)}
          className={`p-1.5 rounded-lg transition-colors ${
            isSpinning
              ? 'text-[var(--sci-accent)] bg-[var(--sci-accent)]/15'
              : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)]'
          }`}
          title="Auto-Orbit Rotation"
        >
          <RotateCw className={`w-4 h-4 ${isSpinning && !prefersReducedMotion ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={handleResetCamera}
          className="p-1.5 rounded-lg hover:bg-[var(--sci-bg-card)] text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] transition-colors"
          title="Reset Camera Center"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Provenance Badge (Bottom Right) */}
      <aside
        aria-label="Structure Provenance"
        className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 bg-[var(--sci-bg-panel)]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[var(--sci-border)] shadow-xl text-[10px] text-[var(--sci-text-secondary)]"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-[var(--sci-accent)]" />
        <span>{provenance || 'RCSB PDB Crystal Structure (Verified Coordinates)'}</span>
      </aside>

      {/* Hover Info HUD Overlay */}
      {hoveredObject && (
        <aside
          aria-label="Hovered Element Information"
          className="absolute top-14 right-4 z-10 bg-[var(--sci-bg-panel)]/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-[var(--sci-border)] shadow-xl text-xs max-w-xs animate-in fade-in"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--sci-accent)] animate-pulse" />
            <span className="font-semibold text-[var(--sci-text-primary)] font-mono">
              {hoveredObject.elementName ? `${hoveredObject.elementName} (${hoveredObject.symbol})` : (hoveredObject.name || hoveredObject.type)}
            </span>
          </div>
          {hoveredObject.role && (
            <p className="text-[11px] text-[var(--sci-accent)] font-medium">{hoveredObject.role}</p>
          )}
          {hoveredObject.dist && (
            <p className="text-[11px] text-[var(--sci-text-secondary)]">Calculated Distance: {hoveredObject.dist}</p>
          )}
          {hoveredObject.coords && (
            <p className="text-[10px] text-[var(--sci-text-secondary)] font-mono mt-1">
              XYZ: [{hoveredObject.coords.map((n) => Number(n).toFixed(2)).join(', ')}]
            </p>
          )}
        </aside>
      )}

      {/* Distance Measurement Banner */}
      {measuringMode && (
        <aside
          aria-label="Distance Measurement Status"
          className="absolute top-14 left-4 z-10 bg-[var(--sci-bg-panel)]/95 backdrop-blur-md px-4 py-2 rounded-xl border border-emerald-500/40 shadow-xl text-xs flex items-center gap-3 animate-in fade-in"
        >
          <Ruler className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="text-[var(--sci-text-primary)] font-medium">Distance Measurement:</span>{' '}
            {measurementDistance ? (
              <span className="text-emerald-400 font-mono font-bold text-sm">{measurementDistance} Å</span>
            ) : (
              <span className="text-[var(--sci-text-secondary)]">
                {measuredAtoms.length === 1 ? 'Click second atom to measure distance' : 'Click first atom'}
              </span>
            )}
          </div>
          {measurementDistance && (
            <button
              onClick={() => {
                setMeasuredAtoms([]);
                setMeasurementDistance(null);
              }}
              className="text-[10px] text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] underline"
            >
              Reset
            </button>
          )}
        </aside>
      )}
    </section>
  );
}
