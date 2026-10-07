import React from 'react';
import { WorkExperience } from '../ui/WorkExperience';
import { Sparkles, Atom, Zap, Cpu, Radio, Activity, FlaskConical, Award } from 'lucide-react';

const RESEARCH_EXPERIENCES = [
  {
    id: 'chemspace-core',
    companyName: 'ChemSpace Quantum & Computational Chemistry Core',
    emoji: '⚛️',
    companyWebsite: 'https://chemspace.in',
    isCurrentEmployer: true,
    positions: [
      {
        id: 'pos-1',
        title: 'Lead Scientific AI Architect · Multimodal Gemini Chemistry Engine',
        employmentPeriod: {
          start: '01.2025',
        },
        employmentType: 'Full-time Research',
        icon: <Zap className="size-3.5 text-amber-500" />,
        description: `- Architected real-time SMILES string parsing and 2D/3D MMFF94 force field energy minimization directly inside WebAssembly sandboxes.
- Connected automated spectroscopic predictions with 800MHz 1H & 13C-NMR peak multiplet deconvolution and FTIR absorption bands.
- Built interactive hardware-accelerated WebGL DFT Slater orbital isosurface shaders with sub-15ms convergence.`,
        skills: [
          'Quantum DFT',
          'RDKit WASM',
          'MMFF94 Force Field',
          'Three.js WebGL',
          'Gemini 2.0 AI',
          'FTIR / NMR Deconvolution',
          'Cloud Firestore'
        ],
        isExpanded: true,
      },
      {
        id: 'pos-2',
        title: 'Cheminformatics Research Fellow · RDKit Topological Descriptors',
        employmentPeriod: {
          start: '06.2024',
          end: '12.2024',
        },
        employmentType: 'Collaborative Lab',
        icon: <Cpu className="size-3.5 text-emerald-500" />,
        description: `- Integrated Wildman-Crippen LogP, Topological Polar Surface Area (TPSA), and Lipinski Rule-of-Five drug-likeness scoring.
- Streamlined MDL Molfile V3000 Cartesian coordinate matrix export for Gaussian and ORCA input generation.`,
        skills: ['Lipinski Ro5', 'TPSA & LogP', 'SMILES InChIKey', 'Graph Descriptors'],
      }
    ],
  },
  {
    id: 'ibm-rxn-collab',
    companyName: 'IBM RXN Retrosynthesis & Reaction Intelligence Pipeline',
    emoji: '🧪',
    companyWebsite: 'https://rxn.res.ibm.com',
    positions: [
      {
        id: 'pos-3',
        title: 'Algorithmic Synthetic Pathway Specialist',
        employmentPeriod: {
          start: '03.2024',
          end: '06.2024',
        },
        employmentType: 'Partner Initiative',
        icon: <Activity className="size-3.5 text-rose-500" />,
        description: `- Developed multi-step tree search algorithms comparing forward yield estimates against commercial precursor building blocks.
- Formatted automated mechanism visualizers with transition state barrier thermodynamics.`,
        skills: ['IBM RXN', 'Retrosynthesis Trees', 'Reaction SMILES', 'Kinetic Barriers'],
      }
    ]
  }
];

export default function ChemicalIntelligenceMilestones() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--home-border)] pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-mono font-bold tracking-wider uppercase">
            <Award className="w-3.5 h-3.5" />
            <span>Research Pedigree &amp; Computational Milestones</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--home-text-primary)]">
            Scientific Exploration &amp; Architecture Roadmap
          </h2>
          <p className="text-xs sm:text-sm text-[var(--home-text-secondary)] max-w-2xl font-sans">
            Chronological engineering milestones driving high-performance molecular computing and AI-assisted laboratory workflows.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-[var(--home-border)] bg-[var(--home-surface-subtle)] text-xs font-mono text-[var(--home-text-muted)]">
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>Interactive Timeline</span>
        </div>
      </div>

      <WorkExperience experiences={RESEARCH_EXPERIENCES} />
    </section>
  );
}
