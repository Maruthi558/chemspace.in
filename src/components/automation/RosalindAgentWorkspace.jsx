import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  Play,
  Square,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Layers,
  ArrowRight,
  Maximize2,
  Minimize2,
  Box,
  Terminal,
  Activity,
  Share2,
  Sliders,
  RotateCcw,
  Eye,
  CheckSquare,
  Clock,
  Compass,
  Zap,
  FlaskConical,
  Award,
  Circle
} from 'lucide-react';
import UnifiedPoseViewer from './UnifiedPoseViewer';

// 8 Co-Fold Modalities from LiteMol-1 Research (LiteFold Foundation Diffusion Language Model)
export const LITEMOL_MODALITY_GALLERY = [
  {
    id: 'stapled-peptide',
    title: 'Stapled peptide',
    subtitle: '5AFG / P07 staple',
    modality: 'Constrained Helix',
    sequence: 'GAALEAAFKAEYFEL',
    affinity: 'ipTM 0.940 · Rank 0',
    pdbId: '5AFG',
    color: '#06b6d4',
    accent: 'cyan',
    description: 'P07 bis-triazolyl staple locking solvent-facing alanines 7 residues apart.',
    conformer: {
      atoms: ['C', 'C', 'O', 'N', 'C', 'C', 'O', 'N', 'C', 'N', 'N', 'N', 'C', 'C'],
      coordinates: [
        [-1.2, 1.4, 0.3], [-0.5, 2.6, 0.1], [0.8, 2.4, -0.2], [1.4, 1.2, -0.3],
        [0.7, 0.1, -0.1], [-0.6, 0.2, 0.2], [-1.8, -0.8, 0.4], [-2.8, -0.1, 0.7],
        [2.8, 1.0, -0.6], [3.5, -0.1, -0.8], [4.6, 0.4, -1.1], [3.8, 1.6, -0.9],
        [-0.8, 3.8, 0.3], [0.2, 4.7, 0.1]
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 2 }, { from: 1, to: 3, order: 1 },
        { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 1 }, { from: 5, to: 0, order: 1 },
        { from: 5, to: 6, order: 1 }, { from: 6, to: 7, order: 1 }, { from: 3, to: 8, order: 1 },
        { from: 8, to: 9, order: 2 }, { from: 9, to: 10, order: 1 }, { from: 10, to: 11, order: 2 },
        { from: 11, to: 8, order: 1 }, { from: 1, to: 12, order: 1 }, { from: 12, to: 13, order: 1 }
      ]
    },
    metrics: {
      mean_plddt: 0.92,
      ptm: 0.912,
      iptm: 0.940,
      clash_score: 1.82,
      confidence: 0.936,
      affinity_pk: '9.2 nM',
      ligand_iptm: 0.940,
      protein_iptm: 0.915,
      complex_plddt: 0.92,
      complex_pde: 0.910,
      complex_ipde: 0.892
    }
  },
  {
    id: 'ncaa-peptide',
    title: 'ncAA peptide',
    subtitle: 'FFTXLLXTS (Non-canonical)',
    modality: 'Non-canonical AA',
    sequence: 'FFTXLLXTS',
    affinity: 'ipTM 0.926 · Rank 1',
    pdbId: '1YCR-ncAA',
    color: '#8b5cf6',
    accent: 'purple',
    description: 'De novo peptide with non-canonical amino acid substitutions occupying F19/W23/L26 cleft.',
    conformer: {
      atoms: ['C', 'C', 'N', 'C', 'O', 'C', 'C', 'C', 'C', 'C', 'C', 'N', 'O'],
      coordinates: [
        [-1.0, 0.8, 0.2], [0.2, 1.5, 0.0], [1.3, 0.7, -0.3], [1.1, -0.7, -0.4],
        [2.1, -1.4, -0.7], [-0.1, -1.3, -0.2], [-1.2, -0.5, 0.1], [-2.5, -1.1, 0.3],
        [-3.6, -0.4, 0.5], [-3.4, 0.9, 0.6], [-2.2, 1.5, 0.4], [0.4, 2.9, -0.1], [1.5, 3.4, -0.3]
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 1 },
        { from: 3, to: 4, order: 2 }, { from: 3, to: 5, order: 1 }, { from: 5, to: 6, order: 1 },
        { from: 6, to: 0, order: 1 }, { from: 6, to: 7, order: 2 }, { from: 7, to: 8, order: 1 },
        { from: 8, to: 9, order: 2 }, { from: 9, to: 10, order: 1 }, { from: 10, to: 0, order: 1 },
        { from: 1, to: 11, order: 1 }, { from: 11, to: 12, order: 2 }
      ]
    },
    metrics: {
      mean_plddt: 0.89,
      ptm: 0.917,
      iptm: 0.926,
      clash_score: 2.15,
      confidence: 0.924,
      affinity_pk: '14 nM',
      ligand_iptm: 0.926,
      protein_iptm: 0.895,
      complex_plddt: 0.89,
      complex_pde: 0.884,
      complex_ipde: 0.865
    }
  },
  {
    id: 'p53-peptide',
    title: 'p53 peptide',
    subtitle: '1YCR Native Transactivation',
    modality: 'Crystal Reference',
    sequence: 'SQETFSDLWKLLPEN',
    affinity: 'ipTM 0.915 · Crystal Ref',
    pdbId: '1YCR',
    color: '#10b981',
    accent: 'emerald',
    description: '15-residue native transactivation helix anchoring into MDM2 deep hydrophobic pocket.',
    conformer: {
      atoms: ['C', 'C', 'C', 'O', 'N', 'C', 'C', 'C', 'N', 'C', 'C', 'O'],
      coordinates: [
        [-0.8, 0.4, 0.1], [0.5, -0.2, 0.2], [1.7, 0.6, -0.1], [1.5, 1.8, -0.3],
        [0.4, 2.4, -0.1], [-0.8, 1.7, 0.1], [2.9, -0.1, -0.2], [4.1, 0.6, -0.5],
        [4.0, 1.9, -0.7], [2.8, 2.5, -0.5], [-2.0, -0.4, 0.3], [-2.1, -1.6, 0.5]
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 1 },
        { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 1 }, { from: 5, to: 0, order: 1 },
        { from: 2, to: 6, order: 2 }, { from: 6, to: 7, order: 1 }, { from: 7, to: 8, order: 2 },
        { from: 8, to: 9, order: 1 }, { from: 9, to: 3, order: 1 }, { from: 0, to: 10, order: 1 },
        { from: 10, to: 11, order: 2 }
      ]
    },
    metrics: {
      mean_plddt: 0.91,
      ptm: 0.893,
      iptm: 0.915,
      clash_score: 2.05,
      confidence: 0.910,
      affinity_pk: '28 nM',
      ligand_iptm: 0.915,
      protein_iptm: 0.890,
      complex_plddt: 0.91,
      complex_pde: 0.875,
      complex_ipde: 0.852
    }
  },
  {
    id: 'linear-peptide',
    title: 'Linear peptide',
    subtitle: 'GADLEAAFKDEYFEL (De Novo)',
    modality: 'De Novo Peptide',
    sequence: 'GADLEAAFKDEYFEL',
    affinity: 'ipTM 0.935 · Beats Native',
    pdbId: '1YCR-LFD',
    color: '#38bdf8',
    accent: 'sky',
    description: 'Beats native p53 by +0.020 ipTM with only 7% sequence similarity to known binders.',
    conformer: {
      atoms: ['C', 'C', 'O', 'N', 'C', 'C', 'C', 'C', 'O', 'N', 'C', 'C', 'O'],
      coordinates: [
        [-1.5, 0.5, 0.2], [-0.3, 1.2, 0.0], [0.9, 0.6, -0.2], [1.0, -0.7, -0.3],
        [-0.1, -1.4, -0.1], [-1.3, -0.8, 0.1], [2.2, 1.3, -0.5], [3.3, 0.5, -0.7],
        [4.4, 1.1, -1.0], [3.2, -0.8, -0.5], [2.0, -1.4, -0.4], [-2.7, 1.2, 0.4], [-3.8, 0.6, 0.6]
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 1 },
        { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 1 }, { from: 5, to: 0, order: 1 },
        { from: 2, to: 6, order: 1 }, { from: 6, to: 7, order: 1 }, { from: 7, to: 8, order: 2 },
        { from: 7, to: 9, order: 1 }, { from: 9, to: 10, order: 1 }, { from: 10, to: 3, order: 1 },
        { from: 0, to: 11, order: 1 }, { from: 11, to: 12, order: 2 }
      ]
    },
    metrics: {
      mean_plddt: 0.90,
      ptm: 0.898,
      iptm: 0.935,
      clash_score: 1.94,
      confidence: 0.928,
      affinity_pk: '11 nM',
      ligand_iptm: 0.935,
      protein_iptm: 0.902,
      complex_plddt: 0.90,
      complex_pde: 0.895,
      complex_ipde: 0.878
    }
  },
  {
    id: 'depsipeptide',
    title: 'Depsipeptide',
    subtitle: 'Cyclic Ester-Amide Ring',
    modality: 'Depsipeptide',
    sequence: 'Cyclo(-Val-D-Hiv-D-Val-Lac-)3',
    affinity: 'ipTM 0.892 · Ionophoric',
    pdbId: 'VAL-DEP',
    color: '#eab308',
    accent: 'amber',
    description: 'Alternating alpha-amino and alpha-hydroxy carboxylic acid macrocycle with high membrane permeability.',
    conformer: {
      atoms: ['C', 'O', 'C', 'C', 'N', 'C', 'O', 'C', 'C', 'N', 'C', 'O'],
      coordinates: [
        [-1.8, 0.0, 0.2], [-1.2, 1.2, 0.1], [0.1, 1.4, -0.1], [1.1, 0.4, -0.3],
        [0.8, -0.9, -0.2], [-0.5, -1.3, 0.0], [-1.6, -2.4, 0.2], [-2.8, -1.8, 0.4],
        [2.3, 0.9, -0.6], [3.2, -0.1, -0.8], [2.7, -1.3, -0.6], [1.5, -2.0, -0.4]
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 1 },
        { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 1 }, { from: 5, to: 0, order: 1 },
        { from: 5, to: 6, order: 1 }, { from: 6, to: 7, order: 1 }, { from: 3, to: 8, order: 1 },
        { from: 8, to: 9, order: 1 }, { from: 9, to: 10, order: 1 }, { from: 10, to: 11, order: 2 }
      ]
    },
    metrics: {
      mean_plddt: 0.87,
      ptm: 0.854,
      iptm: 0.892,
      clash_score: 2.80,
      confidence: 0.865,
      affinity_pk: '34 nM',
      ligand_iptm: 0.892,
      protein_iptm: 0.840,
      complex_plddt: 0.87,
      complex_pde: 0.820,
      complex_ipde: 0.795
    }
  },
  {
    id: 'mz1-protac',
    title: 'MZ1 PROTAC',
    subtitle: 'BRD4 BD2 - VHL Ternary',
    modality: 'Bifunctional Degrader',
    sequence: 'JQ1-PEG3-VH032',
    affinity: 'Ternary ipTM 0.655',
    pdbId: '5T35',
    color: '#f97316',
    accent: 'orange',
    description: 'Crystal ternary degrader bridging BET bromodomain BD2 and Cullin-2 E3 ligase VHL.',
    conformer: {
      atoms: ['C', 'C', 'S', 'C', 'N', 'C', 'C', 'O', 'C', 'C', 'O', 'C', 'N', 'C', 'O'],
      coordinates: [
        [-3.2, 0.4, 0.3], [-2.1, 1.2, 0.1], [-0.8, 0.3, -0.1], [-1.4, -1.2, 0.0],
        [-2.7, -1.0, 0.2], [0.6, 0.8, -0.3], [1.8, 0.0, -0.4], [1.7, -1.2, -0.2],
        [3.0, 0.7, -0.6], [4.2, -0.1, -0.7], [5.3, 0.6, -0.9], [6.4, -0.2, -1.0],
        [7.5, 0.5, -1.2], [8.6, -0.3, -1.3], [8.5, -1.5, -1.1]
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 1 },
        { from: 3, to: 4, order: 2 }, { from: 4, to: 0, order: 1 }, { from: 2, to: 5, order: 1 },
        { from: 5, to: 6, order: 1 }, { from: 6, to: 7, order: 2 }, { from: 6, to: 8, order: 1 },
        { from: 8, to: 9, order: 1 }, { from: 9, to: 10, order: 1 }, { from: 10, to: 11, order: 1 },
        { from: 11, to: 12, order: 1 }, { from: 12, to: 13, order: 1 }, { from: 13, to: 14, order: 2 }
      ]
    },
    metrics: {
      mean_plddt: 0.81,
      ptm: 0.720,
      iptm: 0.655,
      clash_score: 3.85,
      confidence: 0.710,
      affinity_pk: '2.4 nM',
      ligand_iptm: 0.655,
      protein_iptm: 0.780,
      complex_plddt: 0.81,
      complex_pde: 0.750,
      complex_ipde: 0.710
    }
  },
  {
    id: 'cmet-analogue',
    title: 'c-MET analogue',
    subtitle: 'poi_07 Hinge Binder',
    modality: 'Kinase Inhibitor',
    sequence: 'SMILES-guided Hinge Scaffold',
    affinity: '-10.8 kcal/mol · Vina',
    pdbId: '3DKC',
    color: '#ec4899',
    accent: 'pink',
    description: 'Type Ib kinase inhibitor targeting deep hydrophobic back-pocket behind Asp1222.',
    conformer: {
      atoms: ['C', 'C', 'N', 'C', 'N', 'C', 'C', 'C', 'F', 'O', 'C', 'C'],
      coordinates: [
        [-0.5, 0.2, 0.1], [0.6, 1.0, -0.1], [1.8, 0.3, -0.3], [1.7, -1.0, -0.3],
        [0.6, -1.7, -0.1], [-0.5, -1.1, 0.1], [3.0, 0.9, -0.5], [4.1, 0.1, -0.7],
        [5.3, 0.7, -0.9], [-1.7, 0.8, 0.3], [-2.8, 0.1, 0.4], [-3.9, 0.8, 0.6]
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 2 }, { from: 2, to: 3, order: 1 },
        { from: 3, to: 4, order: 2 }, { from: 4, to: 5, order: 1 }, { from: 5, to: 0, order: 1 },
        { from: 2, to: 6, order: 1 }, { from: 6, to: 7, order: 2 }, { from: 7, to: 8, order: 1 },
        { from: 0, to: 9, order: 1 }, { from: 9, to: 10, order: 1 }, { from: 10, to: 11, order: 1 }
      ]
    },
    metrics: {
      mean_plddt: 0.86,
      ptm: 0.795,
      iptm: 0.880,
      clash_score: 2.45,
      confidence: 0.840,
      affinity_pk: '1.8 nM',
      ligand_iptm: 0.880,
      protein_iptm: 0.860,
      complex_plddt: 0.86,
      complex_pde: 0.830,
      complex_ipde: 0.812
    }
  },
  {
    id: 'ox1r-analogue',
    title: 'OX1R analogue',
    subtitle: 'Orexin-1 GPCR Antagonist',
    modality: 'GPCR Ligand',
    sequence: 'Dual Orexin Subtype Antagonist',
    affinity: '-9.6 kcal/mol · Subtype selective',
    pdbId: '4S0V',
    color: '#14b8a6',
    accent: 'teal',
    description: 'Subtype-selective antagonist engaging transmembrane bundle TM3/TM5/TM7.',
    conformer: {
      atoms: ['C', 'C', 'C', 'N', 'C', 'C', 'C', 'O', 'C', 'N', 'C', 'C'],
      coordinates: [
        [0.0, 0.0, 0.0], [1.2, 0.5, -0.2], [2.3, -0.3, -0.3], [2.2, -1.6, -0.2],
        [1.0, -2.1, 0.0], [-0.1, -1.3, 0.1], [3.5, 0.4, -0.5], [4.6, -0.2, -0.6],
        [4.5, -1.5, -0.5], [3.3, -2.2, -0.3], [-1.3, 0.8, 0.2], [-2.5, 0.1, 0.3]
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 2 }, { from: 2, to: 3, order: 1 },
        { from: 3, to: 4, order: 2 }, { from: 4, to: 5, order: 1 }, { from: 5, to: 0, order: 1 },
        { from: 2, to: 6, order: 1 }, { from: 6, to: 7, order: 1 }, { from: 7, to: 8, order: 1 },
        { from: 8, to: 9, order: 2 }, { from: 9, to: 3, order: 1 }, { from: 0, to: 10, order: 1 },
        { from: 10, to: 11, order: 1 }
      ]
    },
    metrics: {
      mean_plddt: 0.84,
      ptm: 0.770,
      iptm: 0.865,
      clash_score: 2.70,
      confidence: 0.815,
      affinity_pk: '7.5 nM',
      ligand_iptm: 0.865,
      protein_iptm: 0.835,
      complex_plddt: 0.84,
      complex_pde: 0.805,
      complex_ipde: 0.780
    }
  }
];

export default function RosalindAgentWorkspace({
  activeComplex,
  onSelectComplex = null,
  onExportPose = null,
  reducedMotion = false
}) {
  // Navigation & Interactive Tabs
  const [selectedGalleryItem, setSelectedGalleryItem] = useState(LITEMOL_MODALITY_GALLERY[3]); // Default: Linear peptide
  const [taskPlanOpen, setTaskPlanOpen] = useState(true);
  const [thinkingOpen, setThinkingOpen] = useState(true);
  const [activeStepIndex, setActiveStepIndex] = useState(5); // Completed through step 5 or drafting
  const [isSimulatingAgent, setIsSimulatingAgent] = useState(false);
  const [agentStepStatus, setAgentStepStatus] = useState('Drafting on Atomic');
  const [approvedCandidate, setApprovedCandidate] = useState(false);
  const [sharedCandidate, setSharedCandidate] = useState(false);
  const [galleryAutoSpin, setGalleryAutoSpin] = useState(false);

  // 6 Stepper items from Rosalind / LiteFold Screenshots (Image 1 & 4)
  const STEPS = [
    { id: 1, label: 'Thinking', detail: 'Considering macrocyclization strategies for ring stability' },
    { id: 2, label: 'Gathering context from the internet', detail: 'Cross-referencing PubMed & BioNeMo NIM benchmarks' },
    { id: 3, label: 'Gathering context from public data sources', detail: 'Querying RCSB PDB, ChEMBL, and UniProt sequences' },
    { id: 4, label: 'Reasoning', detail: 'Analyzing Pareto frontier across QED, SA score, and binding ΔG' },
    { id: 5, label: 'Performing tasks', detail: 'Running Boltz2 co-fold & Meeko flexible-docking minimization' },
    { id: 6, label: 'Drafting on Atomic', detail: 'Synthesizing final macrocyclic candidate specification' }
  ];

  // Automated Task Simulation
  const handleTriggerSimulatedRun = () => {
    setIsSimulatingAgent(true);
    setActiveStepIndex(0);
    setApprovedCandidate(false);

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current < STEPS.length) {
        setActiveStepIndex(current);
        setAgentStepStatus(STEPS[current].label);
      } else {
        clearInterval(interval);
        setIsSimulatingAgent(false);
        setAgentStepStatus('Completed');
      }
    }, 1200);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(
      `Candidate LFD-114 | Cyclo(-Leu-Phe-Asp-Trp-Gly-Ser-Arg-Tyr-Pro-Lys-Ala-Val-Thr-Cys-Gln-Ile-Met-His-Asn-) | MW 1,612.8 g/mol | Affinity: -9.4 kcal/mol`
    );
    setSharedCandidate(true);
    setTimeout(() => setSharedCandidate(false), 2000);
  };

  const handleApprove = () => {
    setApprovedCandidate(true);
  };

  // Selected complex metrics (defaults to selectedGalleryItem or pertuzumab from Boltz)
  const currentMetrics = selectedGalleryItem?.metrics || {
    mean_plddt: 0.88,
    ptm: 0.509,
    iptm: 0.000,
    clash_score: 3.55,
    confidence: 0.802,
    affinity_pk: '—',
    ligand_iptm: 0.000,
    protein_iptm: 0.000,
    complex_plddt: 0.88,
    complex_pde: 0.831,
    complex_ipde: 0.000
  };

  // Mock Docking Results for Viewer
  const viewerDockingResults = {
    binding_pocket_center: [0.0, 0.0, 0.0],
    protein_ca_backbone: [
      [-5.5, 3.2, -1.8], [-4.2, 4.0, -0.9], [-2.8, 3.5, 0.4], [-1.5, 2.3, 1.1],
      [-0.2, 1.1, 0.9], [1.0, 0.0, 1.4], [2.4, -0.9, 0.8], [3.8, -1.8, 1.9],
      [5.0, -1.3, 2.6], [6.2, -0.1, 2.0], [6.6, 1.4, 1.2], [5.7, 2.9, 0.1],
      [4.2, 3.8, -0.7], [2.7, 4.1, -1.2], [1.2, 3.6, -1.0], [-0.1, 2.5, -0.6]
    ],
    poses: [
      {
        rank: 1,
        binding_affinity: -9.4,
        coordinates: selectedGalleryItem.conformer.coordinates
      }
    ],
    interactions: [
      { residue: 'ASP189', type: 'Hydrogen Bond (Acceptor)', distance: 2.82, energy: -2.8, atom: 'O4' },
      { residue: 'HIS57', type: 'Catalytic Dyad Contact', distance: 3.12, energy: -2.1, atom: 'N2' },
      { residue: 'TRP215', type: 'Pi-Pi Stacking', distance: 3.65, energy: -1.6, atom: 'C8' },
      { residue: 'SER195', type: 'Hydrogen Bond', distance: 2.94, energy: -1.9, atom: 'O6' }
    ]
  };

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto bg-slate-950 text-slate-100 select-none">
      {/* ─────────────────────────────────────────────────────────────────
          HEADER BAR: Rosalind / LiteMol-1 Operational Status
          ───────────────────────────────────────────────────────────────── */}
      <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between text-xs shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-100 tracking-wide text-xs">Rosalind</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  lambda-cro
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Autonomous Biologist Agent · LiteMol-1</span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Credits / Operational Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/60 text-[11px] font-mono">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300">270.2 credits</span>
          </div>
        </div>

        {/* Action Controls & Top Navigation Buttons */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-slate-800/60 p-0.5 rounded-lg border border-slate-700/60 text-[11px]">
            <span className="px-2 py-0.5 rounded text-slate-300 font-medium">Outputs <strong className="text-cyan-400">1</strong></span>
            <span className="px-2 py-0.5 rounded text-slate-400 hover:text-slate-200 cursor-pointer">Workspace</span>
            <span className="px-2 py-0.5 rounded text-slate-400 hover:text-slate-200 cursor-pointer">Jobs</span>
            <span className="px-2 py-0.5 rounded text-slate-400 hover:text-slate-200 cursor-pointer font-mono">&gt;_ Bash</span>
          </div>

          <button
            type="button"
            onClick={handleTriggerSimulatedRun}
            disabled={isSimulatingAgent}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition ${
              isSimulatingAgent
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-wait'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md font-bold'
            }`}
          >
            {isSimulatingAgent ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Re-run Agent Cycle</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          TOP PERFORMANCE BANNER: High-Impact Performance Metrics Badges (Image 3)
          ───────────────────────────────────────────────────────────────── */}
      <div className="px-4 py-2 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/30 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300 text-xs">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-medium">LiteMol-1 Foundation Diffusion Architecture:</span>
          <span className="text-slate-400">Sequence-first masked diffusion language model for multi-objective agent loops.</span>
        </div>

        {/* 3 Floating Badges from Screenshot (Image 3) */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold shadow-xs flex items-center gap-1.5">
            <span className="text-cyan-400 text-xs font-black">60%</span> Less GPU overhead
          </div>
          <div className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold shadow-xs flex items-center gap-1.5">
            <span className="text-emerald-400 text-xs font-black">&lt;1 day</span> Hypothesis to model
          </div>
          <div className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-300 font-mono text-[11px] font-bold shadow-xs flex items-center gap-1.5">
            <span className="text-indigo-400 text-xs font-black">10×</span> Faster biomolecular workflows
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          MAIN SPLIT WORKSPACE: Left Agent Trace + Right Structure Viewport
          ───────────────────────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* ── LEFT PANE: Task Plan, Thinking Trace, and 6-Step Stepper (5 Cols) ── */}
        <div className="lg:col-span-5 border-r border-slate-800/80 bg-slate-900/40 flex flex-col h-full overflow-y-auto p-4 space-y-4">
          {/* 1. SLIDING / COLLAPSIBLE TASK PLAN (Image 3) */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm overflow-hidden transition-all duration-300">
            <div
              onClick={() => setTaskPlanOpen(!taskPlanOpen)}
              className="px-3.5 py-2.5 bg-slate-850/80 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition select-none"
            >
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs text-slate-200">Task Plan</span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">3/3</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-400 h-1.5 rounded-full w-full transition-all duration-500" />
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">100%</span>
                {taskPlanOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </div>
            </div>

            {taskPlanOpen && (
              <div className="p-3 space-y-2 text-xs border-t border-slate-800/60 bg-slate-950/40">
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Write the comprehensive filtering pipeline script</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Execute the script and verify outputs</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Report results summary to user</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. COLLAPSIBLE STREAMING "THINKING" REASONING PANEL (Image 3) */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm overflow-hidden">
            <div
              onClick={() => setThinkingOpen(!thinkingOpen)}
              className="px-3.5 py-2.5 bg-slate-850/80 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition select-none"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold text-xs text-slate-200">Thinking</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                {thinkingOpen ? 'Hide reasoning' : 'Show reasoning'}
                {thinkingOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </div>

            {thinkingOpen && (
              <div className="p-3 text-xs text-slate-300 leading-relaxed font-sans border-t border-slate-800/60 bg-slate-950/60 space-y-2">
                <p>
                  Phase 4 filtering is complete. <strong>76 of 100 molecules passed all filters</strong>, with excellent novelty
                  (max Tanimoto ~0.13 vs references — genuinely novel chemotypes). The primary attrition was from validity (16 lost)
                  and PAINS (9 lost).
                </p>
                <p className="text-slate-400">
                  Now I need to proceed with <strong>Phase 5 (Docking)</strong> and prepare for <strong>Phase 6 (ADMET)</strong>. Let me first review
                  the filtered results, then set up the docking jobs.
                </p>
              </div>
            )}
          </div>

          {/* 3. THE 6-STEP AGENT PROGRESS STEPPER (Image 1 & 4) */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Rosalind Agent Stepper</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400">{agentStepStatus}</span>
            </div>

            <div className="relative pl-6 space-y-3.5 border-l-2 border-slate-800">
              {STEPS.map((step, idx) => {
                const isPassed = activeStepIndex > idx;
                const isCurrent = activeStepIndex === idx;

                return (
                  <div key={step.id} className="relative group">
                    {/* Step Icon Badge */}
                    <div
                      className={`absolute -left-[31px] top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all duration-300 ${
                        isPassed
                          ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                          : isCurrent
                          ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/20 font-bold'
                          : 'bg-slate-900 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {isPassed ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-3 h-3 animate-spin stroke-[2.5]" />
                      ) : (
                        <Circle className="w-2 h-2 fill-current" />
                      )}
                    </div>

                    {/* Step Content */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold ${
                            isCurrent
                              ? 'text-cyan-300'
                              : isPassed
                              ? 'text-slate-200'
                              : 'text-slate-500'
                          }`}
                        >
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 animate-pulse">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{step.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. DRAFT CANDIDATE WINDOW (Candidate LFD-114 - Image 1) */}
          <div className="rounded-xl bg-slate-900 border border-slate-700/80 p-3.5 shadow-lg space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs text-slate-100">Candidate LFD-114</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleShare}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono tracking-wider font-semibold border border-slate-700 transition flex items-center gap-1"
                >
                  {sharedCandidate ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                  <span>{sharedCandidate ? 'COPIED' : 'SHARE'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className={`px-3 py-1 rounded text-[10px] font-mono tracking-wider font-bold transition flex items-center gap-1 ${
                    approvedCandidate
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  {approvedCandidate ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                  <span>{approvedCandidate ? 'APPROVED' : 'APPROVE'}</span>
                </button>
              </div>
            </div>

            {/* Candidate Sequence Block */}
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-cyan-300 break-all leading-relaxed">
              Cyclo(-Leu-Phe-Asp-Trp-Gly-Ser-Arg-Tyr-Pro-Lys-Ala-Val-Thr-Cys-Gln-Ile-Met-His-Asn-)
            </div>

            {/* Candidate Molecular Properties */}
            <div className="space-y-1 text-xs font-sans">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Molecular Weight</span>
                <span className="font-mono font-bold text-slate-100">1,612.8 g/mol</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Predicted Affinity</span>
                <span className="font-mono font-bold text-emerald-400">-9.4 kcal/mol</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Solubility Profile</span>
                <span className="font-mono text-slate-200">moderate · SA score 3.1</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 italic">
              The draft opens in its own window. Verified by Boltz2 &amp; Uni-Dock reverse diffusion.
            </div>
          </div>
        </div>

        {/* ── RIGHT PANE: 3D Co-Fold Viewport, Metrics Table & 8-Modality Gallery (7 Cols) ── */}
        <div className="lg:col-span-7 flex flex-col h-full overflow-y-auto p-4 space-y-4">
          {/* Breadcrumb Header matching Screenshot (Image 3) */}
          <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
            <div className="flex items-center gap-2 truncate">
              <span className="text-slate-400 hover:text-slate-200 cursor-pointer font-mono">&larr;</span>
              <span className="font-mono font-bold text-slate-200 truncate">
                pertuzumab_V2_2_L234S_L235T_G236R
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                boltz
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 flex items-center gap-1 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Analyze with Rosalind
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" />
                Completed
              </span>
            </div>
          </div>

          {/* 3D STRUCTURE VIEWPORT (Ribbon & Translucent Surface) */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg flex flex-col h-80 relative">
            <div className="px-3 py-1.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between text-xs z-10">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-cyan-400" />
                <span>3D STRUCTURE ({selectedGalleryItem.title})</span>
              </span>
              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                <span>{selectedGalleryItem.pdbId}</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">{selectedGalleryItem.affinity}</span>
              </div>
            </div>

            <div className="flex-1 w-full relative">
              <UnifiedPoseViewer
                conformers={selectedGalleryItem.conformer}
                dockingResults={viewerDockingResults}
                selectedResidue="ASP189"
                activePoseIndex={0}
                complexName={selectedGalleryItem.title}
                reducedMotion={reducedMotion}
              />
            </div>
          </div>

          {/* STRUCTURE METRICS GRID (Exact Table from Image 3) */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-2.5">
            <span className="font-bold text-xs text-slate-200 block uppercase tracking-wider text-[11px]">
              Structure Metrics
            </span>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Mean pLDDT</span>
                <span className="text-slate-100 font-bold text-xs">{currentMetrics.mean_plddt.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">pTM</span>
                <span className="text-slate-100 font-bold text-xs">{currentMetrics.ptm.toFixed(3)}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">ipTM</span>
                <span className="text-cyan-400 font-bold text-xs">{currentMetrics.iptm.toFixed(3)}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Clash Score</span>
                <span className="text-slate-100 font-bold text-xs">{currentMetrics.clash_score.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Confidence</span>
                <span className="text-emerald-400 font-bold text-xs">{currentMetrics.confidence.toFixed(3)}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Affinity (pK)</span>
                <span className="text-slate-300 font-bold text-xs">{currentMetrics.affinity_pk}</span>
              </div>

              <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Ligand ipTM</span>
                <span className="text-slate-200 font-bold text-xs">{currentMetrics.ligand_iptm.toFixed(3)}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Protein ipTM</span>
                <span className="text-slate-200 font-bold text-xs">{currentMetrics.protein_iptm.toFixed(3)}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Complex pLDDT</span>
                <span className="text-slate-100 font-bold text-xs">{currentMetrics.complex_plddt.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Complex PDE</span>
                <span className="text-slate-200 font-bold text-xs">{currentMetrics.complex_pde.toFixed(3)}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 col-span-2">
                <span className="text-[10px] text-slate-400 block">Complex iPDE</span>
                <span className="text-slate-300 font-bold text-xs">{currentMetrics.complex_ipde.toFixed(3)}</span>
              </div>
            </div>
          </div>

          {/* 8-TILE CO-FOLD INTERACTIVE GALLERY (Image 2) */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-100 block">
                  LiteMol-1 Multi-Modality Gallery (8 Co-Fold Classes)
                </span>
                <span className="text-[11px] text-slate-400">
                  Select any tile to inspect sequence, 3D ribbon &amp; multi-objective Pareto metrics.
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">
                Drag tile to rotate
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {LITEMOL_MODALITY_GALLERY.map((item) => {
                const isSelected = selectedGalleryItem.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedGalleryItem(item)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-200 relative group overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-cyan-400 shadow-md ring-1 ring-cyan-400/40'
                        : 'bg-slate-950/70 hover:bg-slate-850/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Visual 3D-Like Preview Thumbnail with Glow */}
                    <div className="h-16 w-full rounded-lg bg-slate-900/90 border border-slate-800/80 mb-2 flex items-center justify-center relative overflow-hidden">
                      <div
                        className="w-10 h-10 rounded-full opacity-30 filter blur-md transition-all duration-300 group-hover:scale-125"
                        style={{ backgroundColor: item.color }}
                      />
                      <Box className="w-5 h-5 text-slate-300 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
                      <span className="absolute bottom-1 right-1 font-mono text-[9px] text-slate-500">
                        {item.pdbId}
                      </span>
                    </div>

                    <div className="leading-tight">
                      <span className="font-bold text-xs text-slate-100 block truncate group-hover:text-cyan-300 transition">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate font-mono">
                        {item.subtitle}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold mt-1 block truncate">
                        {item.affinity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
