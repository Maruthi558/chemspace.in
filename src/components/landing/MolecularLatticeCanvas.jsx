import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

/**
 * MolecularLatticeCanvas
 * 
 * High-performance 3D InstancedMesh Crystal Lattice animation.
 * Features a 4x4x4 (64 voxel) molecular unit cell with staggered radial expansion/contraction,
 * continuous dual-axis rotation, dynamic point light pulse, and mouse tilt interaction.
 */
export default function MolecularLatticeCanvas({ className = '', gridSize = 4, scale = 1.0 }) {
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // 1. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(isDark ? 0x1e293b : 0xe2e8f0, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xf97316, 12, 25, 0.8);
    pointLight.position.set(0, 0, 3.5);
    scene.add(pointLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, isDark ? 2.5 : 1.8);
    dirLight.position.set(4, 5, 6);
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0x10b981, 1.2);
    dirLight2.position.set(-4, -3, -2);
    scene.add(dirLight2);

    // 4. Instanced Mesh (Grid of Cubes)
    const count = gridSize * gridSize * gridSize;
    const cellSize = (1.8 / gridSize) * scale;
    const spread = ((gridSize - 1) / 2) * cellSize;
    
    const geometry = new THREE.BoxGeometry(cellSize * 0.85, cellSize * 0.85, cellSize * 0.85);
    
    const material = new THREE.MeshStandardMaterial({
      color: isDark ? 0xf97316 : 0xea580c,
      roughness: 0.25,
      metalness: 0.85,
      emissive: isDark ? 0x431407 : 0x000000,
      emissiveIntensity: 0.4
    });

    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Compute base positions and distances from center for each instance
    const basePositions = [];
    const dummy = new THREE.Object3D();
    let idx = 0;

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const bx = -spread + x * cellSize;
          const by = -spread + y * cellSize;
          const bz = -spread + z * cellSize;
          const dist = Math.hypot(bx, by, bz);
          basePositions.push({ x: bx, y: by, z: bz, dist });

          dummy.position.set(bx, by, bz);
          dummy.updateMatrix();
          mesh.setMatrixAt(idx++, dummy.matrix);
        }
      }
    }
    mesh.instanceMatrix.needsUpdate = true;

    // 5. Mouse Parallax Target
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 1.2;
      mouseY = y * 1.2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // 6. Responsive Resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w && h) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', onResize);

    // 7. Animation Loop with Easing Mathematics
    let animId;
    const startTime = performance.now();

    const animateLoop = () => {
      animId = requestAnimationFrame(animateLoop);

      const elapsed = (performance.now() - startTime) / 1000;

      // Continuous Dual-Axis Rotation
      mesh.rotation.y = elapsed * 0.7 + mouseX * 0.5;
      mesh.rotation.x = Math.sin(elapsed * 0.5) * 0.35 + mouseY * 0.5;
      mesh.rotation.z = Math.cos(elapsed * 0.3) * 0.15;

      // Pulsing Point Light Intensity
      const lightPulse = (Math.sin(elapsed * 2.5) + 1) / 2; // 0 to 1
      pointLight.intensity = 4 + lightPulse * 14;

      // Staggered Radial Expansion & Contraction
      // Using smooth periodic expansion wave from center outward
      const cycleDuration = 3.5;
      const progress = (elapsed % cycleDuration) / cycleDuration;
      // Ping-pong expansion wave: expands outward then contracts inward
      const wave = Math.sin(progress * Math.PI * 2);
      const expansionFactor = 1 + Math.max(0, wave) * 2.6;

      for (let i = 0; i < count; i++) {
        const bp = basePositions[i];
        // Radial stagger delay based on distance from center
        const staggerDelay = (1 - bp.dist / (spread * 1.8)) * 0.8;
        const localFactor = 1 + (Math.sin((elapsed + staggerDelay) * 2) * 0.5 + 0.5) * 1.8;

        dummy.position.set(
          bp.x * localFactor,
          bp.y * localFactor,
          bp.z * localFactor
        );

        // Subtle individual cube spin
        dummy.rotation.x = elapsed * 0.4;
        dummy.rotation.y = elapsed * 0.6;
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animateLoop();

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [isDark, gridSize, scale]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  );
}
