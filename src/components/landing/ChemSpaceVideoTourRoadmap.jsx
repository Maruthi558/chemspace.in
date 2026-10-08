import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  Sparkles,
  ArrowRight,
  PenTool,
  Cpu,
  Radio,
  Zap,
  Activity,
  CheckCircle2,
  Layers,
  Compass,
  FileCode,
  Microscope,
  Atom,
  Clock,
  ExternalLink,
  BookOpen,
  Check,
  ChevronDown,
  Info,
  HelpCircle,
  FileText,
  Share2
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { recordDownload } from '../../services/downloadsManager';

const CHAPTERS = [
  {
    id: 'intro',
    title: '1. Overview & Architecture',
    time: '0:00 - 0:15',
    startSec: 0,
    endSec: 15,
    tag: 'Platform Core',
    icon: Compass,
    imageSrc: '/assets/lab_hero.jpg',
    color: 'text-orange-500',
    description: 'Welcome to ChemSpace: an all-in-one client-side scientific laboratory suite integrating 2D/3D molecular drafting, cheminformatics, DFT solvers, and retrosynthesis.',
    howToUse: 'Launch ChemSpace to access sandboxed laboratory computational tools directly inside your browser. No server roundtrips, zero telemetry leakage, ISO/IEC 17025 compliant.',
    highlights: [
      'Client-side sandboxed execution (Zero telemetry)',
      'Direct import/export of SMILES, MDL Molfile & PDB',
      'Real-time Three.js 3D acceleration and WebGL shaders'
    ]
  },
  {
    id: 'chemdraw',
    title: '2. ChemDraw 2D/3D CAD Studio',
    time: '0:15 - 0:30',
    startSec: 15,
    endSec: 30,
    tag: 'Molecular CAD',
    icon: PenTool,
    imageSrc: '/assets/analytical_workbench.jpg',
    color: 'text-amber-500',
    description: 'Precision vector chemical editor with real-time valence verification, ring fusion, functional groups, and instant 3D energy-minimized conformer generation (MMFF94).',
    howToUse: 'Step 1: Select atoms & bonds from the CAD toolbar. Step 2: Draw or paste SMILES strings. Step 3: Click "3D Conformer" to run MMFF94 force field geometry minimization.',
    highlights: [
      'Point-and-click bond drawing & ring templates',
      'Automatic SMILES, InChI & Molfile V2000 parser',
      'Interactive 3D ball-and-stick & space-filling spheres'
    ]
  },
  {
    id: 'rdkit',
    title: '3. RDKit Cheminformatics Lab',
    time: '0:30 - 0:45',
    startSec: 30,
    endSec: 45,
    tag: 'Descriptors & Ro5',
    icon: Cpu,
    imageSrc: '/assets/lab_hero.jpg',
    color: 'text-emerald-500',
    description: 'Compute Lipinski Rule-of-Five compliance, LogP partitioning, Topological Polar Surface Area (TPSA), and drug-likeness scoring in high throughput.',
    howToUse: 'Import any compound or load a benchmark specimen. Instantly view molecular weight, H-bond donors/acceptors, LogP, TPSA, and radar bioavailability charts.',
    highlights: [
      'Lipinski Rule-of-Five filter validation',
      'Topological fingerprint matrices & Morgan radii',
      'Batch CSV export of physicochemical properties'
    ]
  },
  {
    id: 'spectroscopy',
    title: '4. Multi-Modal Spectroscopy',
    time: '0:45 - 1:00',
    startSec: 45,
    endSec: 60,
    tag: 'FTIR • UV-Vis • NMR',
    icon: Radio,
    imageSrc: '/assets/spectroscopy_lab.jpg',
    color: 'text-sky-500',
    description: 'Simulate and deconvolve FTIR vibrational absorption bands, UV-Vis electronic transitions (Beer-Lambert), and 1H / 13C NMR chemical shifts.',
    howToUse: 'Select FTIR mode to inspect C=O, O-H, and aromatic stretching frequencies. Switch to NMR for chemical shifts (ppm) with automated peak assignment.',
    highlights: [
      'Automated functional group peak assignment',
      'Multi-layer Gaussian waveform deconvolution',
      'Print-ready high-resolution laboratory PDF reports'
    ]
  },
  {
    id: 'quantum',
    title: '5. DFT & Quantum Solvers',
    time: '1:00 - 1:15',
    startSec: 60,
    endSec: 75,
    tag: 'Ab-Initio Solvers',
    icon: Zap,
    imageSrc: '/assets/analytical_workbench.jpg',
    color: 'text-violet-500',
    description: 'Execute Hartree-Fock and Density Functional Theory (DFT) solvers to visualize molecular orbital density isosurfaces and calculate HOMO-LUMO bandgaps.',
    howToUse: 'Pick a basis set (STO-3G, 6-31G), initialize the SCF solver, and inspect the highest occupied (HOMO) and lowest unoccupied (LUMO) energy eigenvalue gap.',
    highlights: [
      'Slater-type basis orbital sets & Fock matrices',
      'HOMO-LUMO gap ΔE determination & reactivity index',
      'Interactive 3D electrostatic potential isosurfaces'
    ]
  },
  {
    id: 'rxn',
    title: '6. IBM RXN Retrosynthesis',
    time: '1:15 - 1:30',
    startSec: 75,
    endSec: 90,
    tag: 'Synthesis Planner',
    icon: Activity,
    imageSrc: '/assets/synthesis_lab.jpg',
    color: 'text-rose-500',
    description: 'Algorithmic forward and reverse synthetic route generation: break down target molecules into commercially available precursors with step-by-step mechanisms.',
    howToUse: 'Input a target organic molecule to generate multi-step retrosynthetic disconnection trees with matching commercial feedstock reagents and reaction conditions.',
    highlights: [
      'Multi-step disconnection trees & strategic bonds',
      'Thermodynamic reaction profiles & yield scoring',
      'Precursor feedstock catalog matching'
    ]
  }
];

export default function ChemSpaceVideoTourRoadmap() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'roadmap' | 'guide'
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isVoiceOverEnabled, setIsVoiceOverEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);

  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const totalDuration = 90; // 90 seconds tour

  // Preload laboratory photographic assets
  const loadedImagesRef = useRef({});

  useEffect(() => {
    CHAPTERS.forEach((chap) => {
      if (chap.imageSrc && !loadedImagesRef.current[chap.imageSrc]) {
        const img = new Image();
        img.src = chap.imageSrc;
        img.onload = () => {
          loadedImagesRef.current[chap.imageSrc] = img;
        };
      }
    });
  }, []);

  // Sync active chapter with current time
  useEffect(() => {
    const chapIndex = CHAPTERS.findIndex(
      (c) => currentTime >= c.startSec && currentTime < c.endSec
    );
    if (chapIndex !== -1 && chapIndex !== activeChapterIndex) {
      setActiveChapterIndex(chapIndex);
      if (isVoiceOverEnabled) {
        speakChapter(CHAPTERS[chapIndex]);
      }
    }
  }, [currentTime, isVoiceOverEnabled]);

  // Playback ticker
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Synthetic Voiceover
  const speakChapter = (chap) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const text = `${chap.title}. ${chap.description} Instructions: ${chap.howToUse}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.98;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleVoiceOver = () => {
    const next = !isVoiceOverEnabled;
    setIsVoiceOverEnabled(next);
    if (next) {
      speakChapter(CHAPTERS[activeChapterIndex]);
    } else {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  };

  // High-performance dynamic HTML5 Canvas animation generator with photos & CAD HUD
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;
    const renderFrame = () => {
      t += 0.035;
      const w = canvas.width;
      const h = canvas.height;

      const currentChapter = CHAPTERS[activeChapterIndex] || CHAPTERS[0];

      // Draw real laboratory photographic background if loaded
      const photo = loadedImagesRef.current[currentChapter.imageSrc];
      if (photo && photo.complete) {
        ctx.save();
        ctx.drawImage(photo, 0, 0, w, h);
        // Dark Obsidian / Cyan Lab Scrim
        ctx.fillStyle = isDark
          ? 'rgba(10, 12, 16, 0.82)'
          : 'rgba(248, 250, 252, 0.82)';
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      } else {
        ctx.fillStyle = isDark ? '#0a0c10' : '#f8fafc';
        ctx.fillRect(0, 0, w, h);
      }

      // Subtle CAD Blueprint grid
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 36;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Dynamic scene per chapter
      ctx.save();
      ctx.translate(w / 2, h / 2 - 15);

      if (currentChapter.id === 'intro') {
        // ChemSpace Logo Core with Pulsing Electron Shells & Golden Spiral
        ctx.beginPath();
        ctx.arc(0, 0, 75 + Math.sin(t * 2) * 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(0, 0, 130, 48, t * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? 'rgba(249, 115, 22, 0.5)' : 'rgba(234, 88, 12, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(0, 0, 130, 48, -t * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? 'rgba(16, 185, 129, 0.5)' : 'rgba(5, 150, 105, 0.5)';
        ctx.stroke();

        // Orbiting electrons
        const ex1 = Math.cos(t * 2) * 130;
        const ey1 = Math.sin(t * 2) * 48;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(ex1, ey1, 5, 0, Math.PI * 2);
        ctx.fill();

        // Center Nucleus
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

      } else if (currentChapter.id === 'chemdraw') {
        // Benzene Ring & Vector Geometry
        const r = 68;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 + t * 0.4;
          const px = r * Math.cos(angle);
          const py = r * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Inner aromatic circle
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.58, 0, Math.PI * 2);
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)';
        ctx.stroke();
        ctx.setLineDash([]);

        // Attached substituents (OH, CH3)
        const subAngle = t * 0.4;
        const subX = (r + 35) * Math.cos(subAngle);
        const subY = (r + 35) * Math.sin(subAngle);
        ctx.beginPath();
        ctx.moveTo(r * Math.cos(subAngle), r * Math.sin(subAngle));
        ctx.lineTo(subX, subY);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('-OH', subX + 4, subY + 4);

      } else if (currentChapter.id === 'rdkit') {
        // RDKit Graph Topology Matrix Simulation
        const nodes = 7;
        for (let i = 0; i < nodes; i++) {
          const angle = (i * 2 * Math.PI) / nodes + t * 0.4;
          const dist = 65 + Math.sin(t * 3 + i) * 12;
          const nx = dist * Math.cos(angle);
          const ny = dist * Math.sin(angle);

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(nx, ny);
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = i % 2 === 0 ? '#10b981' : '#f97316';
          ctx.beginPath();
          ctx.arc(nx, ny, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (currentChapter.id === 'spectroscopy') {
        // FT-IR Spectrum Waveform Oscilloscope & Peak Markers
        ctx.beginPath();
        ctx.moveTo(-160, 0);
        for (let x = -160; x <= 160; x += 3) {
          const wave1 = Math.sin(x * 0.05 + t * 3.5) * 30;
          const peak1 = Math.exp(-Math.pow((x - 20) / 20, 2)) * 65;
          const peak2 = Math.exp(-Math.pow((x + 70) / 18, 2)) * 45;
          const y = wave1 - peak1 - peak2;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Carbonyl peak label
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('1715 cm⁻¹ [C=O]', 10, -75);

      } else if (currentChapter.id === 'quantum') {
        // DFT Molecular Orbital Density Cloud
        for (let i = 0; i < 32; i++) {
          const rad = i * 3.8 + Math.sin(t * 2 + i) * 6;
          const a = i * 0.3 + t;
          const px = Math.cos(a) * rad * 1.5;
          const py = Math.sin(a) * rad;
          ctx.fillStyle = i % 2 === 0 ? 'rgba(139, 92, 246, 0.35)' : 'rgba(236, 72, 153, 0.25)';
          ctx.beginPath();
          ctx.arc(px, py, 11, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('HOMO-LUMO ΔE = 4.12 eV', -80, 75);

      } else if (currentChapter.id === 'rxn') {
        // IBM RXN Retrosynthesis Disconnection Tree
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 2.5;

        // Target Root Box
        ctx.strokeRect(-45, -70, 90, 26);
        ctx.fillStyle = isDark ? '#fff' : '#000';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('TARGET [A]', -30, -53);

        ctx.beginPath();
        ctx.moveTo(0, -44);
        ctx.lineTo(-70, 10);
        ctx.moveTo(0, -44);
        ctx.lineTo(70, 10);
        ctx.stroke();

        // Synthons
        ctx.strokeRect(-110, 10, 80, 26);
        ctx.fillText('SYNTHON 1', -100, 27);

        ctx.strokeRect(30, 10, 80, 26);
        ctx.fillText('SYNTHON 2', 40, 27);
      }

      ctx.restore();

      // Top video overlay HUD
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.95)' : '#0f172a';
      ctx.font = 'bold 15px Inter, sans-serif';
      ctx.fillText(`CHEMSPACE • ${currentChapter.title.toUpperCase()}`, 24, 38);

      ctx.fillStyle = '#f97316';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`[${currentChapter.tag.toUpperCase()}] • ${Math.floor(currentTime)}s / ${totalDuration}s`, 24, 58);

      // Render loop
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [activeChapterIndex, currentTime, isDark]);

  // Export / Download MP4/WebM Video
  const handleDownloadVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsRecording(true);
      setRecordProgress(10);
      const stream = canvas.captureStream(30); // 30 FPS

      // Check format support
      let mimeType = 'video/webm;codecs=vp9';
      let ext = 'webm';
      if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
        mimeType = 'video/mp4;codecs=avc1';
        ext = 'mp4';
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
        ext = 'mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
        ext = 'webm';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);

        const filename = `ChemSpace_AI_Video_Tour_2026.${ext}`;
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Record in personal research workspace downloads
        await recordDownload({
          filename,
          fileType: ext,
          sourceModule: 'ChemSpace AI Video Tour & Roadmap',
          contentBlob: blob,
          fileSize: blob.size
        });

        setIsRecording(false);
        setRecordProgress(100);
      };

      recorder.start();

      // Progress simulation during 6-second recording clip
      const timer = setInterval(() => {
        setRecordProgress((p) => Math.min(95, p + 15));
      }, 800);

      setTimeout(() => {
        clearInterval(timer);
        recorder.stop();
      }, 6000);
    } catch (err) {
      console.error('Video capture error:', err);
      setIsRecording(false);
    }
  };

  const jumpToChapter = (index) => {
    setActiveChapterIndex(index);
    setCurrentTime(CHAPTERS[index].startSec);
  };

  const progressPercentage = (currentTime / totalDuration) * 100;

  return (
    <section className="space-y-8 select-none font-sans">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-[var(--home-border)] pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-[var(--border-subtle)] bg-[var(--bg-inner)] text-orange-500 font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Video Tour &amp; Interactive Workflow Roadmap</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--home-text-primary)]">
            ChemSpace Video Tour &amp; User Manual
          </h2>
          <p className="text-xs sm:text-sm text-[var(--home-text-secondary)] max-w-2xl leading-relaxed">
            Watch the dynamic video tour, explore our step-by-step molecular engineering roadmap, and learn how to use each laboratory module with real photographic specimens.
          </p>
        </div>

        {/* Action Tabs & Download Button */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="p-1 rounded-xl bg-[var(--home-surface-subtle)] border border-[var(--home-border)] flex items-center gap-1">
            <button
              onClick={() => setActiveTab('video')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-[var(--bg-card)] text-orange-500 shadow-xs'
                  : 'text-[var(--home-text-secondary)] hover:text-[var(--home-text-primary)]'
              }`}
            >
              🎬 Video Tour
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'roadmap'
                  ? 'bg-[var(--bg-card)] text-orange-500 shadow-xs'
                  : 'text-[var(--home-text-secondary)] hover:text-[var(--home-text-primary)]'
              }`}
            >
              🗺️ Roadmap
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-[var(--bg-card)] text-orange-500 shadow-xs'
                  : 'text-[var(--home-text-secondary)] hover:text-[var(--home-text-primary)]'
              }`}
            >
              📘 How to Use
            </button>
          </div>

          <button
            onClick={handleDownloadVideo}
            disabled={isRecording}
            className="btn-orange py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition disabled:opacity-50"
            title="Export Generated Video (MP4 / WebM)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isRecording ? `Exporting (${recordProgress}%)...` : 'Download Video (MP4)'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: VIDEO TOUR */}
      {activeTab === 'video' && (
        <div className="rounded-3xl border border-[var(--home-border)] bg-[var(--home-surface-card)] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            
            {/* Left / Center: Interactive Canvas Video Player Screen */}
            <div className="lg:col-span-7 relative flex flex-col justify-between bg-black/95 min-h-[360px] sm:min-h-[440px] overflow-hidden">
              {/* HTML5 Canvas Stream */}
              <canvas
                ref={canvasRef}
                width={800}
                height={460}
                className="w-full h-full object-cover select-none"
              />

              {/* Bottom Floating Video Controls Bar */}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2.5 backdrop-blur-xs">
                {/* Progress Scrubber */}
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                    setCurrentTime(ratio * totalDuration);
                  }}
                  className="w-full h-2 bg-white/20 hover:h-2.5 rounded-full overflow-hidden cursor-pointer transition-all relative group"
                >
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-100"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center justify-between text-white text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-orange-500 text-white transition cursor-pointer active:scale-95"
                      title={isPlaying ? 'Pause' : 'Play Video'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTime(0);
                        setActiveChapterIndex(0);
                      }}
                      className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                      title="Restart Tour"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={toggleVoiceOver}
                      className={`p-2 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                        isVoiceOverEnabled
                          ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                          : 'border-transparent hover:bg-white/10 text-white/70 hover:text-white'
                      }`}
                      title="Toggle Synthetic Voiceover Guide"
                    >
                      {isVoiceOverEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      <span className="text-[10px] hidden sm:inline">{isVoiceOverEnabled ? 'Voice ON' : 'Voice OFF'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-white/80">
                    <span className="font-bold">
                      {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / 1:30
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 font-bold uppercase text-[9px]">
                      1080p HD
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Interactive Chapter & Roadmap Navigation Drawer */}
            <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between space-y-4 border-t lg:border-t-0 lg:border-l border-[var(--home-border)] bg-[var(--home-surface-subtle)]/30">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--home-text-muted)] font-bold">
                    Video Chapters ({CHAPTERS.length})
                  </span>
                  <span className="text-[10px] font-mono text-orange-500 font-semibold">
                    Click to jump
                  </span>
                </div>

                {/* Chapter Buttons List */}
                <div className="space-y-1.5 max-h-[290px] overflow-y-auto no-scrollbar">
                  {CHAPTERS.map((chap, idx) => {
                    const Icon = chap.icon;
                    const isActive = activeChapterIndex === idx;

                    return (
                      <button
                        key={chap.id}
                        onClick={() => jumpToChapter(idx)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                          isActive
                            ? 'bg-[var(--bg-card)] border-orange-500/50 shadow-md scale-[1.01]'
                            : 'border-transparent hover:bg-[var(--bg-hover)] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className={`p-2 rounded-xl ${isActive ? 'bg-orange-500 text-white shadow-xs' : 'bg-[var(--bg-inner)] text-[var(--text-secondary)]'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold truncate ${isActive ? 'text-orange-500' : 'text-[var(--home-text-primary)]'}`}>
                              {chap.title}
                            </span>
                            <span className="text-[10px] font-mono text-[var(--home-text-muted)] shrink-0">
                              {chap.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--home-text-secondary)] line-clamp-1 mt-0.5">
                            {chap.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Chapter Details & Deep Link Action */}
              <div className="pt-3 border-t border-[var(--home-border)] space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--home-text-muted)] block">
                    Active Module Guide:
                  </span>
                  <p className="text-xs text-[var(--home-text-secondary)] italic leading-relaxed">
                    "{CHAPTERS[activeChapterIndex].howToUse}"
                  </p>
                </div>

                <button
                  onClick={() => {
                    const targetId = CHAPTERS[activeChapterIndex].id;
                    if (targetId === 'chemdraw') navigate('/chemdraw');
                    else if (targetId === 'rdkit') navigate('/rdkit-lab');
                    else if (targetId === 'spectroscopy') navigate('/spectroscopy');
                    else if (targetId === 'quantum') navigate('/quantum-library');
                    else if (targetId === 'rxn') navigate('/ibm-rxn');
                    else navigate('/workspace');
                  }}
                  className="btn-primary w-full py-2.5 text-xs font-bold justify-between cursor-pointer active:scale-95 shadow-sm"
                >
                  <span>Launch {CHAPTERS[activeChapterIndex].tag} Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 arrow-micro" />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* TAB 2: STEP-BY-STEP WORKFLOW ROADMAP */}
      {activeTab === 'roadmap' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CHAPTERS.map((chap, idx) => {
            const Icon = chap.icon;
            return (
              <div
                key={chap.id}
                className="p-5 rounded-2xl border border-[var(--home-border)] bg-[var(--home-surface-card)] flex flex-col justify-between space-y-4 hover:border-orange-500/40 transition shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-orange-500">
                        PHASE 0{idx + 1}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--home-surface-subtle)] text-[var(--home-text-muted)]">
                      {chap.tag}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[var(--home-text-primary)]">
                    {chap.title}
                  </h3>

                  <p className="text-xs text-[var(--home-text-secondary)] leading-relaxed">
                    {chap.description}
                  </p>

                  <div className="pt-2 border-t border-[var(--home-border)] space-y-1.5">
                    <span className="text-[10px] font-mono text-[var(--home-text-muted)] uppercase tracking-wider block">
                      Core Protocol:
                    </span>
                    <ul className="space-y-1 text-[11px] text-[var(--home-text-secondary)]">
                      {chap.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (chap.id === 'chemdraw') navigate('/chemdraw');
                    else if (chap.id === 'rdkit') navigate('/rdkit-lab');
                    else if (chap.id === 'spectroscopy') navigate('/spectroscopy');
                    else if (chap.id === 'quantum') navigate('/quantum-library');
                    else if (chap.id === 'rxn') navigate('/ibm-rxn');
                    else navigate('/workspace');
                  }}
                  className="btn-secondary w-full py-2 text-xs font-bold justify-between cursor-pointer"
                >
                  <span>Open {chap.tag}</span>
                  <ArrowRight className="w-3.5 h-3.5 arrow-micro" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: HOW TO USE CHEMSPACE MANUAL */}
      {activeTab === 'guide' && (
        <div className="rounded-3xl border border-[var(--home-border)] bg-[var(--home-surface-card)] p-6 sm:p-8 space-y-6">
          <div className="space-y-2 border-b border-[var(--home-border)] pb-4">
            <h3 className="text-lg font-bold text-[var(--home-text-primary)]">
              ChemSpace Complete User Guide &amp; Workflow Manual
            </h3>
            <p className="text-xs text-[var(--home-text-secondary)] leading-relaxed">
              Step-by-step instructions on operating all computational engines, exporting datasets, and syncing research records to Cloud Firestore.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--home-surface-subtle)] border border-[var(--home-border)] space-y-2">
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                  <PenTool className="w-4 h-4" />
                  1. ChemDraw 2D/3D CAD Studio
                </span>
                <p className="text-xs text-[var(--home-text-secondary)] leading-relaxed">
                  Click and drag to place bonds (single, double, triple, wedge/dash). Select ring templates for instant benzene or cyclohexane structures. Click "Energy Minimize" to run the MMFF94 force field algorithm and convert into a 3D ball-and-stick model.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--home-surface-subtle)] border border-[var(--home-border)] space-y-2">
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  2. RDKit Cheminformatics Lab
                </span>
                <p className="text-xs text-[var(--home-text-secondary)] leading-relaxed">
                  Input canonical SMILES to compute Lipinski Rule-of-Five compliance (MW ≤ 500, LogP ≤ 5, HBD ≤ 5, HBA ≤ 10). Inspect topological polar surface area (TPSA) and rotatable bonds with interactive radar visualizers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--home-surface-subtle)] border border-[var(--home-border)] space-y-2">
                <span className="text-xs font-bold text-sky-500 flex items-center gap-1.5">
                  <Radio className="w-4 h-4" />
                  3. Spectroscopy Deconvolution
                </span>
                <p className="text-xs text-[var(--home-text-secondary)] leading-relaxed">
                  Simulate infrared vibrational modes across 4000 to 400 cm⁻¹. Switch between FTIR, UV-Vis Beer-Lambert absorbance, and 1H/13C NMR spectra with real-time chemical shift markers and multi-waveform Gaussian deconvolution.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--home-surface-subtle)] border border-[var(--home-border)] space-y-2">
                <span className="text-xs font-bold text-violet-500 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  4. DFT &amp; Quantum Solvers
                </span>
                <p className="text-xs text-[var(--home-text-secondary)] leading-relaxed">
                  Select atomic basis sets (STO-3G, 6-31G) to calculate electronic wavefunctions. Visualize HOMO (Highest Occupied Molecular Orbital) and LUMO (Lowest Unoccupied Molecular Orbital) isosurfaces and calculate the electronic excitation bandgap (ΔE).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--home-surface-subtle)] border border-[var(--home-border)] space-y-2">
                <span className="text-xs font-bold text-rose-500 flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  5. IBM RXN Retrosynthesis
                </span>
                <p className="text-xs text-[var(--home-text-secondary)] leading-relaxed">
                  Perform algorithmic forward reaction predictions and multi-step retrosynthetic disconnections. View full reaction pathways with temperature, solvents, and commercial precursor feedstock matches.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--home-surface-subtle)] border border-[var(--home-border)] space-y-2">
                <span className="text-xs font-bold text-orange-500 flex items-center gap-1.5">
                  <FolderLock className="w-4 h-4" />
                  6. Research Workspace &amp; Downloads
                </span>
                <p className="text-xs text-[var(--home-text-secondary)] leading-relaxed">
                  All exported files (Molfiles, CSVs, SVG figures, MP4 video tours, spectra reports) are automatically cataloged in your Personal Research Workspace with one-click re-download and Firestore cloud sync.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
