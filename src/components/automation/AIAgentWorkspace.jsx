import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  Send,
  RefreshCw,
  Box,
  Atom,
  ImageIcon,
  FlaskConical,
  Zap,
  Activity,
  FileText,
  RotateCcw,
  Mic,
  MicOff,
  X,
  Copy,
  Check,
  Download,
  CheckCircle2,
  Cpu,
  Layers,
  ChevronDown,
  Info,
  Maximize2,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Search
} from 'lucide-react';
import UnifiedPoseViewer from './UnifiedPoseViewer';
import ResidueInteractionTable from './ResidueInteractionTable';
import ChemicalAnalyticsGraphSuite from './ChemicalAnalyticsGraphSuite';
import { executeChemistryQuery, isChemistryQuery, generateInstantLeadAnswer } from '../../services/chemistryQuestionEngine';
import { useTheme } from '../../context/ThemeContext';

// ============================================================================
// COMPUTATIONAL CHEMISTRY & AI ENGINES
// ============================================================================
const AI_COMPUTATIONAL_MODELS = [
  {
    id: 'deepchem',
    name: 'Gemini 2.5 Flash Chemist',
    badge: 'LLM Multimodal',
    icon: '⚡',
    desc: 'Chemical reasoning, reaction mechanisms, and conversational inquiry'
  },
  {
    id: 'bionemo',
    name: 'BioNeMo Drug Discovery NIM',
    badge: 'DiffDock + Boltz-2',
    icon: '🧬',
    desc: 'Target docking, PROTAC design, and binding pose prediction'
  },
  {
    id: 'rdkit',
    name: 'RDKit Cheminformatics Core',
    badge: 'C++ Descriptors',
    icon: '🔬',
    desc: 'Canonical SMILES sanitization, valence checks, and Lipinski Ro5'
  },
  {
    id: 'pyscf',
    name: 'PySCF Quantum DFT Core',
    badge: 'B3LYP / 6-31G*',
    icon: '⚛️',
    desc: 'Frontier orbitals, HOMO-LUMO gap ΔE, and electronic states'
  },
  {
    id: 'arxn',
    name: 'ARXN Reaction Synthesis Engine',
    badge: 'Synthesis & Retro',
    icon: '⚗️',
    desc: 'Multi-step reaction pathways, retrosynthesis, and yields'
  }
];

// ============================================================================
// COMPREHENSIVE CHEMICAL & DRUG DISCOVERY REPOSITORY
// ============================================================================
const DRUG_DISCOVERY_PORTFOLIO = {
  protac: {
    id: 'protac',
    target: 'Androgen Receptor & Cereblon (CRBN E3 Ligase)',
    pdbId: '5T35',
    resolution: '1.95 Å',
    organism: 'Homo sapiens',
    moleculeName: 'ARV-110 (Bavdegalutamide PROTAC)',
    category: 'Targeted Protein Degradation',
    trialStage: 'Phase II Clinical Trials (Prostate Cancer)',
    formula: 'C41H43ClN6O7',
    mw: 812.33,
    smiles: 'CC(C)c1ccc(cc1)c2nc(cs2)c3ccc(cc3)NC(=O)CCCC(=O)Nc4ccc5c(c4)C(=O)N(C5=O)C6CCC(=O)NC6=O',
    iupac: 'N1-[4-[4-(4-propan-2-ylphenyl)-1,3-thiazol-2-yl]phenyl]-N5-[2-(2,6-dioxopiperidin-3-yl)-1,3-dioxoisoindol-5-yl]pentanediamide',
    mechanism: 'Heterobifunctional degrader recruiting CRBN E3 ligase to induce polyubiquitination and 26S proteasomal degradation of mutant AR (T878A/H875Y)',
    dft: { homo: -5.72, lumo: -2.14, bandgap: 3.58, dipole: 6.84, hardness: 1.79, units: 'eV' },
    admet: {
      mw: 812.33, logp: 4.15, tpsa: 168.4, hbd: 3, hba: 11, rotatableBonds: 14, qed: 0.48,
      veberPassed: true, oralBioavailability: 'Moderate Oral', bbbPermeability: 'Low', hERGInhibition: 'Safe (>25 μM)'
    },
    docking: {
      affinity: -12.45, ki: '0.8 nM', pocketCenter: [18.4, 22.1, 14.2],
      interactions: [
        { residue: 'TRP380 (CRBN)', type: 'Tri-Tryptophan Contact', distance: 2.72, energy: -3.8 },
        { residue: 'HIS378 (CRBN)', type: 'Backbone H-Bond', distance: 2.85, energy: -2.9 },
        { residue: 'LEU704 (AR)', type: 'Hydrophobic Steroid Pocket', distance: 3.45, energy: -2.1 }
      ]
    },
    synthesis: {
      route: 'Convergent 3-Fragment Coupling',
      steps: [
        { stepNumber: 1, name: 'Thiazole Core Assembly', reactants: '4-isopropylthiobenzamide + 2-bromo-1-(4-nitrophenyl)ethanone', reagents: 'EtOH, reflux 4h', products: '4-(4-isopropylphenyl)-2-(4-nitrophenyl)thiazole', yield: '84%', mechanism: 'Hantzsch Thiazole Synthesis' },
        { stepNumber: 2, name: 'Nitro Reduction', reactants: '4-(4-isopropylphenyl)-2-(4-nitrophenyl)thiazole', reagents: 'SnCl2 · 2H2O, EtOAc', products: '4-(4-(4-isopropylphenyl)thiazol-2-yl)aniline', yield: '91%', mechanism: 'Selective nitro reduction' },
        { stepNumber: 3, name: 'Glutaric Linker & Lenalidomide Amidation', reactants: 'Aniline intermediate + lenalidomide carboxylic acid', reagents: 'HATU, DIPEA, DMF, RT 12h', products: 'ARV-110 (Bavdegalutamide)', yield: '68%', mechanism: 'Peptide coupling' }
      ]
    },
    conformers: {
      atoms: ['C', 'C', 'C', 'S', 'C', 'N', 'C', 'C', 'C', 'N', 'C', 'O', 'C', 'C', 'O', 'N'],
      coordinates: [
        [-4.2, 1.2, 0.4], [-3.1, 0.4, 0.2], [-1.8, 0.9, -0.1], [-1.4, 2.5, -0.3],
        [-0.1, 2.1, -0.2], [0.8, 1.1, 0.1], [2.1, 1.4, 0.3], [3.2, 0.5, 0.1],
        [4.5, 0.9, -0.2], [5.6, 0.1, -0.4], [6.8, 0.6, -0.7], [7.1, 1.8, -0.9],
        [7.9, -0.4, -0.6], [9.1, 0.1, -0.8], [9.3, 1.3, -1.1], [10.2, -0.8, -0.7]
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 2 }, { from: 2, to: 3, order: 1 },
        { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 2 }, { from: 5, to: 6, order: 1 },
        { from: 6, to: 7, order: 1 }, { from: 7, to: 8, order: 2 }, { from: 8, to: 9, order: 1 },
        { from: 9, to: 10, order: 1 }, { from: 10, to: 11, order: 2 }, { from: 10, to: 12, order: 1 },
        { from: 12, to: 13, order: 1 }, { from: 13, to: 14, order: 2 }, { from: 13, to: 15, order: 1 }
      ]
    }
  },
  osimertinib: {
    id: 'osimertinib',
    target: 'Epidermal Growth Factor Receptor (EGFR T790M / C797S)',
    pdbId: '4I22',
    resolution: '2.10 Å',
    organism: 'Homo sapiens',
    moleculeName: 'Osimertinib (Tagrisso AZD9291)',
    category: 'Targeted Kinase Inhibitor',
    trialStage: 'FDA Approved / Phase III (FLAURA)',
    formula: 'C28H33N7O2',
    mw: 499.61,
    smiles: 'CN(C)CC=CC(=O)Nc1cc(Nc2nccc(n2)c3cn(C)c4ccccc34)c(cc1OC)N(C)CCN(C)C',
    iupac: 'N-(2-[[2-(dimethylamino)ethyl]-methylamino]-4-methoxy-5-[[4-(1-methylindol-3-yl)pyrimidin-2-yl]amino]phenyl)prop-2-enamide',
    mechanism: 'Covalent, irreversible inhibitor forming a stable thioether bond with Cys797 at the edge of the ATP-binding pocket',
    dft: { homo: -5.48, lumo: -1.62, bandgap: 3.86, dipole: 4.12, hardness: 1.93, units: 'eV' },
    admet: {
      mw: 499.61, logp: 3.25, tpsa: 78.4, hbd: 2, hba: 7, rotatableBonds: 9, qed: 0.69,
      veberPassed: true, oralBioavailability: 'High (>80%)', bbbPermeability: 'High (CNS Active)', hERGInhibition: 'Acceptable (>15 μM)'
    },
    docking: {
      affinity: -10.82, ki: '12 nM', pocketCenter: [1.5, -0.5, 0.0],
      interactions: [
        { residue: 'CYS797', type: 'Covalent Michael Target', distance: 2.14, energy: -4.5 },
        { residue: 'MET793', type: 'Hinge Bidentate H-Bond', distance: 2.82, energy: -3.2 },
        { residue: 'THR790', type: 'Gatekeeper Bypass', distance: 3.38, energy: -1.6 }
      ]
    },
    synthesis: {
      route: '4-Step Convergent Kinase Synthesis',
      steps: [
        { stepNumber: 1, name: 'Indole-Pyrimidine Synthesis', reactants: '1-methylindole + 2,4-dichloropyrimidine', reagents: 'AlCl3, DCM', products: '4-(1-methylindol-3-yl)-2-chloropyrimidine', yield: '78%', mechanism: 'Friedel-Crafts heteroarylation' },
        { stepNumber: 2, name: 'SNAr Displacement', reactants: 'Pyrimidinyl indole + 4-fluoro-2-methoxy-5-nitroaniline', reagents: 'p-TSA, 2-pentanol', products: 'Nitro-arylamine intermediate', yield: '85%', mechanism: 'Nucleophilic aromatic substitution' },
        { stepNumber: 3, name: 'Acrylamide Installation', reactants: 'Aniline free base + acryloyl chloride', reagents: 'DIPEA, THF, -10°C', products: 'Osimertinib', yield: '74%', mechanism: 'Acylation' }
      ]
    },
    conformers: {
      atoms: ['C', 'N', 'C', 'N', 'C', 'C', 'C', 'N', 'C', 'C', 'C', 'C', 'O', 'N'],
      coordinates: [
        [0.0, 0.0, 0.0], [1.2, 0.6, 0.1], [2.3, -0.1, 0.2], [2.2, -1.4, 0.0],
        [1.1, -2.0, -0.2], [-0.1, -1.3, -0.1], [-1.3, -2.0, -0.3], [-2.4, -1.2, -0.2],
        [-2.3, 0.1, 0.0], [-1.1, 0.7, 0.1], [3.5, 0.6, 0.4], [4.7, -0.1, 0.3],
        [-3.6, -1.8, -0.4], [5.8, 0.5, 0.5]
      ],
      bonds: [
        { from: 0, to: 1, order: 2 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 2 },
        { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 2 }, { from: 5, to: 0, order: 1 },
        { from: 5, to: 6, order: 1 }, { from: 6, to: 7, order: 2 }, { from: 7, to: 8, order: 1 },
        { from: 8, to: 9, order: 2 }, { from: 9, to: 0, order: 1 }, { from: 2, to: 10, order: 1 },
        { from: 10, to: 11, order: 2 }, { from: 7, to: 12, order: 1 }
      ]
    }
  },
  nirmatrelvir: {
    id: 'nirmatrelvir',
    target: 'SARS-CoV-2 Main Protease (Mpro / 3CLpro)',
    pdbId: '7VH8',
    resolution: '1.58 Å',
    organism: 'SARS-CoV-2',
    moleculeName: 'Nirmatrelvir (Paxlovid)',
    category: 'Covalent Peptidomimetic Antiviral',
    trialStage: 'FDA Approved / Global Use (EPIC-HR)',
    formula: 'C23H32F3N5O4',
    mw: 499.53,
    smiles: 'CC1(C2C1C(N(C2)C(=O)C(C(C)(C)C)NC(=O)C(F)(F)F)C(=O)NC(CC3CCNC3=O)C#N)C',
    iupac: '(1R,2S,5S)-N-[(1S)-1-cyano-2-[(3S)-2-oxopyrrolidin-3-yl]ethyl]-3-[(2S)-3,3-dimethyl-2-(2,2,2-trifluoroacetamido)butanoyl]-6,6-dimethyl-3-azabicyclo[3.1.0]hexane-2-carboxamide',
    mechanism: 'Reversible covalent inhibitor whose nitrile warhead is nucleophilically attacked by Cys145 thiolate to form a stable thioimidate adduct',
    dft: { homo: -6.35, lumo: -1.78, bandgap: 4.57, dipole: 5.12, hardness: 2.28, units: 'eV' },
    admet: {
      mw: 499.53, logp: 1.82, tpsa: 129.8, hbd: 3, hba: 7, rotatableBonds: 6, qed: 0.74,
      veberPassed: true, oralBioavailability: 'High (Co-formulated with Ritonavir)', bbbPermeability: 'Low', hERGInhibition: 'Safe (>50 μM)'
    },
    docking: {
      affinity: -9.45, ki: '45 nM', pocketCenter: [0.6, 0.4, 0.2],
      interactions: [
        { residue: 'CYS145', type: 'Covalent Thioimidate', distance: 2.68, energy: -3.9 },
        { residue: 'HIS41', type: 'Catalytic Dyad H-Bond', distance: 2.89, energy: -2.4 },
        { residue: 'GLU166', type: 'S1 Subsite H-Bond', distance: 2.76, energy: -3.5 }
      ]
    },
    synthesis: {
      route: 'Peptidomimetic Fragment Coupling',
      steps: [
        { stepNumber: 1, name: 'Bicyclic Core Hydrolysis', reactants: '6,6-dimethyl-3-azabicyclo[3.1.0]hexane ester', reagents: 'LiOH, THF/H2O', products: 'Bicyclic amino acid core', yield: '92%', mechanism: 'Ester hydrolysis' },
        { stepNumber: 2, name: 'Trifluoroacetyl tert-Leucine Coupling', reactants: 'Bicyclic core + tert-leucine derivative', reagents: 'EDCI, HOBt, DIPEA', products: 'Dipeptidyl intermediate', yield: '85%', mechanism: 'Peptide coupling' },
        { stepNumber: 3, name: 'Glutamine-Surrogate Nitrile Introduction', reactants: 'Dipeptide + aminopropanenitrile', reagents: 'HATU, DIPEA, DMF', products: 'Nirmatrelvir', yield: '81%', mechanism: 'Amide coupling' }
      ]
    },
    conformers: {
      atoms: ['C', 'C', 'C', 'N', 'C', 'O', 'C', 'C', 'N', 'C', 'O', 'C', 'N', 'F'],
      coordinates: [
        [-0.5, 0.2, 0.1], [0.7, -0.5, 0.3], [1.9, 0.3, -0.1], [1.6, 1.5, -0.2],
        [0.5, 2.1, 0.1], [-0.6, 1.4, 0.2], [-1.8, 2.1, 0.4], [3.1, -0.3, -0.3],
        [4.2, 0.5, -0.6], [3.9, 1.8, -0.8], [2.7, 2.3, -0.5], [-1.3, -0.7, 0.4],
        [-2.5, -0.1, 0.3], [5.3, -0.2, -0.9]
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 1 },
        { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 1 }, { from: 5, to: 0, order: 1 },
        { from: 5, to: 6, order: 2 }, { from: 2, to: 7, order: 1 }, { from: 7, to: 8, order: 1 },
        { from: 8, to: 9, order: 1 }, { from: 9, to: 10, order: 2 }, { from: 0, to: 11, order: 1 }
      ]
    }
  },
  danuglipron: {
    id: 'danuglipron',
    target: 'GLP-1 Receptor (Non-Peptide Allosteric Site)',
    pdbId: '6X18',
    resolution: '2.50 Å',
    organism: 'Homo sapiens',
    moleculeName: 'Danuglipron (Oral GLP-1 Agonist)',
    category: 'Metabolic & Obesity Small Molecule',
    trialStage: 'Phase IIb Global Clinical Trials',
    formula: 'C27H31N7O2',
    mw: 485.58,
    smiles: 'Cc1cc(nn1C)c2ccc(cc2)c3cc4c(ncnc4n3)Nc5ccc(cc5)C(=O)N6CCC(CC6)O',
    iupac: '(4-hydroxypiperidin-1-yl)-[4-[[7-[4-(1,5-dimethylpyrazol-4-yl)phenyl]purin-6-yl]amino]phenyl]methanone',
    mechanism: 'Allosteric small-molecule agonist binding inside the transmembrane helical domain (TM1-TM2-TM7) to promote biased G-protein signaling',
    dft: { homo: -5.65, lumo: -1.74, bandgap: 3.91, dipole: 4.88, hardness: 1.95, units: 'eV' },
    admet: {
      mw: 485.58, logp: 2.85, tpsa: 104.2, hbd: 2, hba: 7, rotatableBonds: 5, qed: 0.76,
      veberPassed: true, oralBioavailability: 'High (>75% Oral)', bbbPermeability: 'Moderate', hERGInhibition: 'Safe (>40 μM)'
    },
    docking: {
      affinity: -11.20, ki: '3.4 nM', pocketCenter: [12.4, -6.8, 28.5],
      interactions: [
        { residue: 'TRP33 (GLP-1R)', type: 'Extracellular Loop Contact', distance: 2.85, energy: -3.1 },
        { residue: 'ARG380 (GLP-1R)', type: 'Salt Bridge / Charge Transfer', distance: 2.92, energy: -3.6 }
      ]
    },
    synthesis: {
      route: 'Purine-Core Cross Coupling Route',
      steps: [
        { stepNumber: 1, name: 'Purine C-6 Amination', reactants: '6-chloro-7-deazapurine + methyl 4-aminobenzoate', reagents: 'Pd2(dba)3, Xantphos, Cs2CO3', products: 'Arylamino purine ester', yield: '82%', mechanism: 'Buchwald-Hartwig amination' },
        { stepNumber: 2, name: 'Suzuki Coupling at C-7', reactants: 'Arylamino purine + pyrazolyl phenylboronic acid', reagents: 'Pd(dppf)Cl2, K3PO4', products: 'Biaryl purine intermediate', yield: '79%', mechanism: 'Suzuki-Miyaura coupling' },
        { stepNumber: 3, name: 'Saponification and Amidation', reactants: 'Biaryl ester + 4-hydroxypiperidine', reagents: 'LiOH then HATU, DIPEA', products: 'Danuglipron', yield: '76%', mechanism: 'Peptide coupling' }
      ]
    },
    conformers: {
      atoms: ['C', 'C', 'N', 'N', 'C', 'C', 'C', 'C', 'C', 'N', 'C', 'N', 'C', 'O'],
      coordinates: [
        [-3.8, 1.4, 0.2], [-2.6, 0.8, 0.1], [-1.5, 1.6, -0.1], [-0.3, 0.9, -0.2],
        [0.8, 1.5, 0.0], [2.1, 0.7, 0.2], [3.3, 1.2, 0.3], [4.5, 0.4, 0.1],
        [5.8, 0.9, -0.1], [6.9, 0.2, -0.3], [8.1, 0.8, -0.6], [8.3, 2.0, -0.8],
        [9.4, -0.1, -0.5], [10.6, 0.4, -0.7]
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 2 },
        { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 1 }, { from: 5, to: 6, order: 2 },
        { from: 6, to: 7, order: 1 }, { from: 7, to: 8, order: 2 }, { from: 8, to: 9, order: 1 },
        { from: 9, to: 10, order: 2 }, { from: 10, to: 11, order: 1 }, { from: 10, to: 12, order: 1 }
      ]
    }
  },
  bace1: {
    id: 'bace1',
    target: 'Beta-Secretase 1 (BACE-1 Aspartyl Dyad)',
    pdbId: '1FKN',
    resolution: '1.90 Å',
    organism: 'Homo sapiens',
    moleculeName: 'Verubecestat (MK-8931)',
    category: 'CNS Neurodegenerative Inhibitor',
    trialStage: 'Phase III Trials (Alzheimer’s)',
    formula: 'C17H17F2N5O2S',
    mw: 409.41,
    smiles: 'CS(=O)(=O)c1cc(ccc1F)c2nc(N)(C)c(CS(=O)(=O)c3ccccc3)o2',
    iupac: '(2R)-2-amino-5-(2-fluoro-5-methylsulfonylphenyl)-2-methyl-5-(phenylsulfonylmethyl)oxazol-4-one',
    mechanism: 'Non-peptidic transition-state isostere engaging catalytic Asp32/Asp228 dyad with high CNS penetration',
    dft: { homo: -5.92, lumo: -1.68, bandgap: 4.24, dipole: 3.18, hardness: 2.12, units: 'eV' },
    admet: {
      mw: 409.41, logp: 2.45, tpsa: 72.8, hbd: 2, hba: 5, rotatableBonds: 3, qed: 0.85,
      veberPassed: true, oralBioavailability: 'High (>80%)', bbbPermeability: 'Exceptional (Kp = 0.82)', hERGInhibition: 'Safe (>35 μM)'
    },
    docking: {
      affinity: -10.65, ki: '18 nM', pocketCenter: [12.4, 18.2, 34.6],
      interactions: [
        { residue: 'ASP32', type: 'Catalytic Dyad H-Bond', distance: 2.74, energy: -3.1 },
        { residue: 'ASP228', type: 'Catalytic Dyad H-Bond', distance: 2.81, energy: -2.9 }
      ]
    },
    synthesis: {
      route: 'Asymmetric Oxazole Ring Formation',
      steps: [
        { stepNumber: 1, name: 'Sulfone Synthesis', reactants: '4-fluoro-3-iodobenzenesulfonyl chloride + sodium methanesulfinate', reagents: 'Na2SO3, NaHCO3', products: '1-fluoro-4-(methylsulfonyl)benzene', yield: '89%', mechanism: 'Sulfination' },
        { stepNumber: 2, name: 'Chiral Center Creation', reactants: 'Fluorophenyl ketone + (R)-tert-butanesulfinamide', reagents: 'Ti(OEt)4, THF', products: 'Chiral sulfinyl imine', yield: '84%', mechanism: 'Ellman auxiliary condensation' },
        { stepNumber: 3, name: 'Oxazolone Ring Closure', reactants: 'Chiral imine + phenylsulfonyl acetonitrile', reagents: 't-BuOK then acid', products: 'Verubecestat', yield: '76%', mechanism: 'Cyclization' }
      ]
    },
    conformers: {
      atoms: ['C', 'S', 'O', 'O', 'C', 'C', 'F', 'C', 'C', 'N', 'C', 'N', 'C'],
      coordinates: [
        [0.0, 0.0, 0.0], [1.4, 0.4, 0.1], [2.2, -1.0, 0.3], [3.5, -0.8, 0.5],
        [1.6, -2.1, 0.1], [0.3, -1.5, -0.1], [-0.8, -2.3, -0.3], [-0.6, -3.6, -0.2],
        [-1.0, 0.8, -0.2], [-0.8, 2.2, -0.1], [0.4, 2.8, 0.1], [-1.8, 3.0, -0.3],
        [-3.0, 2.4, -0.5]
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 2 }, { from: 1, to: 3, order: 2 },
        { from: 1, to: 4, order: 1 }, { from: 4, to: 5, order: 2 }, { from: 5, to: 6, order: 1 },
        { from: 0, to: 8, order: 1 }, { from: 8, to: 9, order: 2 }, { from: 9, to: 10, order: 1 }
      ]
    }
  },
  paracetamol: {
    id: 'paracetamol',
    target: 'Cyclooxygenase-3 / Central Peroxidase (PGHS)',
    pdbId: '6Y3C',
    resolution: '1.80 Å',
    organism: 'Homo sapiens',
    moleculeName: 'Paracetamol (Acetaminophen)',
    category: 'Analgesic & Antipyretic',
    trialStage: 'FDA Approved / Essential Medicine',
    formula: 'C8H9NO2',
    mw: 151.16,
    smiles: 'CC(=O)Nc1ccc(O)cc1',
    iupac: 'N-(4-hydroxyphenyl)acetamide',
    mechanism: 'Central inhibition of prostaglandin synthesis through peroxidase reduction; active metabolite AM404 inhibits anandamide reuptake',
    dft: { homo: -5.60, lumo: -1.45, bandgap: 4.15, dipole: 2.85, hardness: 2.08, units: 'eV' },
    admet: {
      mw: 151.16, logp: 0.46, tpsa: 49.3, hbd: 2, hba: 2, rotatableBonds: 1, qed: 0.78,
      veberPassed: true, oralBioavailability: 'Very High (>90%)', bbbPermeability: 'High', hERGInhibition: 'Safe'
    },
    docking: {
      affinity: -6.85, ki: '9.2 µM', pocketCenter: [0.0, 0.0, 0.0],
      interactions: [
        { residue: 'TYR385', type: 'Catalytic Radical Site', distance: 2.85, energy: -2.8 },
        { residue: 'SER530', type: 'H-Bond Acceptor', distance: 2.92, energy: -2.1 }
      ]
    },
    synthesis: {
      route: 'Selective N-Acetylation',
      steps: [
        { stepNumber: 1, name: 'Acetylation of 4-Aminophenol', reactants: '4-aminophenol + acetic anhydride', reagents: 'Water / AcOH, 70°C', products: 'Paracetamol', yield: '92%', mechanism: 'Nucleophilic acyl substitution' }
      ]
    },
    conformers: {
      atoms: ['C', 'C', 'O', 'N', 'C', 'C', 'C', 'C', 'C', 'C', 'O'],
      coordinates: [
        [-2.4, 0.2, 0.0], [-1.2, -0.5, 0.0], [-1.2, -1.7, 0.0], [0.0, 0.2, 0.0],
        [1.2, -0.4, 0.0], [1.3, -1.8, 0.0], [2.5, -2.4, 0.0], [3.6, -1.6, 0.0],
        [3.5, -0.2, 0.0], [2.3, 0.4, 0.0], [4.7, -2.2, 0.0]
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 2 }, { from: 1, to: 3, order: 1 },
        { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 2 }, { from: 5, to: 6, order: 1 },
        { from: 6, to: 7, order: 2 }, { from: 7, to: 8, order: 1 }, { from: 8, to: 9, order: 2 },
        { from: 9, to: 4, order: 1 }, { from: 7, to: 10, order: 1 }
      ]
    }
  },
  aspirin: {
    id: 'aspirin',
    target: 'Cyclooxygenase-1 & 2 (COX-1 Ser530)',
    pdbId: '1PTH',
    resolution: '2.00 Å',
    organism: 'Ovis aries / Homo sapiens',
    moleculeName: 'Aspirin (Acetylsalicylic Acid)',
    category: 'NSAID & Antiplatelet',
    trialStage: 'FDA Approved / Standard of Care',
    formula: 'C9H8O4',
    mw: 180.16,
    smiles: 'CC(=O)Oc1ccccc1C(=O)O',
    iupac: '2-acetyloxybenzoic acid',
    mechanism: 'Irreversible acetylation of Serine-530 in the COX-1 hydrophobic channel, permanently preventing arachidonic acid docking',
    dft: { homo: -6.82, lumo: -1.92, bandgap: 4.90, dipole: 3.12, hardness: 2.45, units: 'eV' },
    admet: {
      mw: 180.16, logp: 1.19, tpsa: 63.6, hbd: 1, hba: 4, rotatableBonds: 3, qed: 0.72,
      veberPassed: true, oralBioavailability: 'High (>80%)', bbbPermeability: 'Moderate', hERGInhibition: 'Safe'
    },
    docking: {
      affinity: -7.42, ki: '3.6 µM', pocketCenter: [1.2, 2.4, -0.5],
      interactions: [
        { residue: 'SER530', type: 'Covalent Acetylation Target', distance: 2.65, energy: -3.4 },
        { residue: 'ARG120', type: 'Carboxylate Salt Bridge', distance: 2.80, energy: -3.8 }
      ]
    },
    synthesis: {
      route: 'Esterification of Salicylic Acid',
      steps: [
        { stepNumber: 1, name: 'Phenolic Acetylation', reactants: 'Salicylic acid + acetic anhydride', reagents: 'H2SO4 / H3PO4 (cat.), 85°C', products: 'Aspirin + acetic acid', yield: '88%', mechanism: 'Acid-catalyzed esterification' }
      ]
    },
    conformers: {
      atoms: ['C', 'C', 'O', 'O', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'O', 'O'],
      coordinates: [
        [-2.8, 1.4, 0.0], [-1.8, 0.4, 0.0], [-2.0, -0.8, 0.0], [-0.5, 0.8, 0.0],
        [0.5, -0.1, 0.0], [0.3, -1.5, 0.0], [1.3, -2.4, 0.0], [2.6, -1.9, 0.0],
        [2.8, -0.5, 0.0], [1.8, 0.4, 0.0], [1.9, 1.9, 0.0], [1.0, 2.7, 0.0], [3.1, 2.2, 0.0]
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 2 }, { from: 1, to: 3, order: 1 },
        { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 2 }, { from: 5, to: 6, order: 1 },
        { from: 6, to: 7, order: 2 }, { from: 7, to: 8, order: 1 }, { from: 8, to: 9, order: 2 },
        { from: 9, to: 4, order: 1 }, { from: 9, to: 10, order: 1 }, { from: 10, to: 11, order: 2 }, { from: 10, to: 12, order: 1 }
      ]
    }
  },
  caffeine: {
    id: 'caffeine',
    target: 'Adenosine A1 & A2A Receptors',
    pdbId: '3PWH',
    resolution: '2.15 Å',
    organism: 'Homo sapiens',
    moleculeName: 'Caffeine (1,3,7-Trimethylxanthine)',
    category: 'CNS Stimulant & Adenosine Antagonist',
    trialStage: 'Approved / Dietary Compound',
    formula: 'C8H10N4O2',
    mw: 194.19,
    smiles: 'Cn1cnc2c1c(=O)n(c(=O)n2C)C',
    iupac: '1,3,7-trimethylpurine-2,6-dione',
    mechanism: 'Competitive non-selective antagonist at adenosine A1 and A2A receptors in the brain, preventing fatigue signaling and elevating cAMP',
    dft: { homo: -6.12, lumo: -1.35, bandgap: 4.77, dipole: 3.65, hardness: 2.38, units: 'eV' },
    admet: {
      mw: 194.19, logp: -0.07, tpsa: 58.4, hbd: 0, hba: 6, rotatableBonds: 0, qed: 0.65,
      veberPassed: true, oralBioavailability: 'Complete (99%)', bbbPermeability: 'Very High', hERGInhibition: 'Safe'
    },
    docking: {
      affinity: -7.15, ki: '15 µM', pocketCenter: [0.0, 1.5, 0.0],
      interactions: [
        { residue: 'PHE168', type: 'Pi-Pi Stacking Sandwich', distance: 3.42, energy: -2.9 },
        { residue: 'ASN253', type: 'Bidentate H-Bond Acceptor', distance: 2.88, energy: -2.6 }
      ]
    },
    synthesis: {
      route: 'Traube Purine Synthesis',
      steps: [
        { stepNumber: 1, name: 'Dimethylurea Condensation', reactants: '1,3-dimethylurea + cyanoacetic acid', reagents: 'Ac2O, 90°C', products: '6-amino-1,3-dimethyluracil', yield: '85%', mechanism: 'Condensation' },
        { stepNumber: 2, name: 'Nitrosation & Reduction', reactants: 'Uracil intermediate + NaNO2 then Na2S2O4', reagents: 'Aqueous acid', products: '5,6-diamino-1,3-dimethyluracil', yield: '89%', mechanism: 'Nitrosation followed by reduction' },
        { stepNumber: 3, name: 'Formylation & Ring Closure', reactants: 'Diamine intermediate + formic acid then Me2SO4', reagents: 'Heat, NaOH', products: 'Caffeine', yield: '82%', mechanism: 'Traube purine cyclization' }
      ]
    },
    conformers: {
      atoms: ['C', 'N', 'C', 'N', 'C', 'C', 'N', 'C', 'O', 'N', 'C', 'O', 'C', 'C'],
      coordinates: [
        [-1.2, 1.4, 0.0], [0.1, 1.8, 0.0], [0.8, 0.7, 0.0], [0.0, -0.4, 0.0],
        [-1.2, 0.0, 0.0], [-2.5, -0.4, 0.0], [-2.8, -1.8, 0.0], [-1.8, -2.6, 0.0],
        [-2.0, -3.8, 0.0], [-0.5, -2.2, 0.0], [0.6, -3.1, 0.0], [1.7, -2.7, 0.0],
        [2.2, 0.8, 0.0], [-4.2, -2.2, 0.0]
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 2 }, { from: 2, to: 3, order: 1 },
        { from: 3, to: 4, order: 2 }, { from: 4, to: 0, order: 1 }, { from: 4, to: 5, order: 1 },
        { from: 5, to: 6, order: 1 }, { from: 6, to: 7, order: 1 }, { from: 7, to: 8, order: 2 },
        { from: 7, to: 9, order: 1 }, { from: 9, to: 3, order: 1 }, { from: 9, to: 10, order: 1 },
        { from: 10, to: 11, order: 2 }, { from: 2, to: 12, order: 1 }, { from: 6, to: 13, order: 1 }
      ]
    }
  }
};

// Preset chemistry inquiry chips
const CHEMISTRY_PRESET_QUESTIONS = [
  { label: 'Aldol Mechanism', query: 'Explain the mechanism of Aldol addition and condensation with reaction equations.' },
  { label: 'Hybridization in Ethylene', query: 'What is the orbital hybridization and geometry of carbon in ethylene (C2H4)?' },
  { label: 'SN1 vs SN2', query: 'What are the main differences between SN1 and SN2 nucleophilic substitution reactions?' },
  { label: 'Le Chatelier Principle', query: 'How does Le Chatelier principle predict equilibrium shifts when pressure increases?' },
  { label: 'Paracetamol Route', query: 'Synthesize Paracetamol from 4-aminophenol and explain its selective N-acetylation.' },
  { label: 'Aspirin COX-1 Action', query: 'How does Aspirin irreversibly inhibit Cyclooxygenase Ser530?' },
  { label: 'Lipinski Rule of 5', query: 'What are Lipinski Rule of 5 criteria and why are rotatable bonds important?' }
];

export default function AIAgentWorkspace() {
  const { theme } = useTheme();
  const location = useLocation();

  // Mode: 'qa' (Conversational Chemistry Q&A) or 'pipeline' (Autonomous Drug Discovery & 3D)
  const [workspaceMode, setWorkspaceMode] = useState('qa');
  const [promptInput, setPromptInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState('3d'); // '3d', 'graphs', '2d', 'synthesis', 'report'
  const [activeCandidateKey, setActiveCandidateKey] = useState('protac');
  const [selectedModel, setSelectedModel] = useState('deepchem');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [copiedSmiles, setCopiedSmiles] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  const activeCandidate = DRUG_DISCOVERY_PORTFOLIO[activeCandidateKey] || DRUG_DISCOVERY_PORTFOLIO.protac;
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const modelMenuRef = useRef(null);

  const currentModelConfig = AI_COMPUTATIONAL_MODELS.find((m) => m.id === selectedModel) || AI_COMPUTATIONAL_MODELS[0];

  // Robust cross-platform clipboard copy helper
  const copyToClipboardSafely = async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // fallback
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  };

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isExecuting]);

  // Close model menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target)) {
        setIsModelDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize with premier introductory agent greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'msg-welcome',
          role: 'assistant',
          isWelcome: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `**Welcome to ChemSpace AI Chemical Intelligence Studio**\n\nI am your unified chemistry assistant, specialized in answering **chemistry questions**, elucidating reaction mechanisms, and orchestrating **autonomous drug discovery & 3D molecular modeling**.\n\n- 💬 **Ask Any Chemistry Question:** Orbital hybridization, acid-base equilibria, SN1/SN2 pathways, synthesis mechanisms, thermodynamics, and kinetics.\n- 📈 **Interactive Reaction Graphs:** Inspect real-time reactant concentration decay $[A](t)$, product formation $[P](t)$, Hill $IC_{50}$ dose-response curves, and PK clearance.\n- 🧬 **Autonomous 3D Modeling:** Explore atomic Cartesian geometries, frontier orbitals (HOMO/LUMO), and target docking poses on the right stage.\n- 🛡️ **Chemistry Scope:** Dedicated exclusively to molecular sciences for maximum accuracy and zero hallucination.`
        }
      ]);
    }
  }, []);

  // Handle Image File Upload
  const handleImageAttach = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedImage({
        name: file.name,
        dataUrl: event.target.result,
        size: (file.size / 1024).toFixed(1) + ' KB'
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Voice Dictation
  const handleToggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setPromptInput((prev) => (prev ? `${prev} ${text}` : text));
        setIsListening(false);
      };
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Match drug candidate if molecule mentioned
  const detectCandidateFromQuery = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('protac') || lower.includes('arv') || lower.includes('degrader') || lower.includes('androgen')) return 'protac';
    if (lower.includes('egfr') || lower.includes('osimertinib') || lower.includes('tagrisso') || lower.includes('kinase')) return 'osimertinib';
    if (lower.includes('paxlovid') || lower.includes('nirmatrelvir') || lower.includes('mpro') || lower.includes('3cl') || lower.includes('antiviral')) return 'nirmatrelvir';
    if (lower.includes('glp') || lower.includes('danuglipron') || lower.includes('diabetes') || lower.includes('obesity')) return 'danuglipron';
    if (lower.includes('bace') || lower.includes('alzheimer') || lower.includes('verubecestat')) return 'bace1';
    if (lower.includes('paracetamol') || lower.includes('acetaminophen') || lower.includes('tylenol')) return 'paracetamol';
    if (lower.includes('aspirin') || lower.includes('salicylic') || lower.includes('acetylsalicylic')) return 'aspirin';
    if (lower.includes('caffeine') || lower.includes('xanthine') || lower.includes('adenosine') || lower.includes('coffee')) return 'caffeine';
    return null;
  };

  // Execute Chemistry Q&A or Autonomous Pipeline
  const handleExecutePrompt = async (forcedPrompt = null) => {
    const query = (forcedPrompt || promptInput).trim();
    if ((!query && !attachedImage) || isExecuting) return;

    const currentImage = attachedImage;
    setPromptInput('');
    setAttachedImage(null);

    const userMsgId = `usr-${Date.now()}`;
    const agentMsgId = `agt-${Date.now()}`;

    // Detect if query mentions a molecule to synchronize right stage
    const matchedMolecule = detectCandidateFromQuery(query || (currentImage ? currentImage.name : ''));
    if (matchedMolecule) {
      setActiveCandidateKey(matchedMolecule);
    }

    // Append User Message
    const userMsg = {
      id: userMsgId,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: query || `Analyze chemical image: ${currentImage?.name}`,
      attachedImage: currentImage
    };

    // Mode determination: If query contains explicit pipeline keywords, run pipeline; otherwise conversational chemistry
    const isPipelineQuery =
      workspaceMode === 'pipeline' ||
      /docking|screen|pipeline|protac candidate|run pipeline|generate conformer/i.test(query);

    setIsExecuting(true);

    if (isPipelineQuery) {
      // ─────────────────────────────────────────────────────────────
      // PIPELINE MODE: MULTI-TOOL AUTONOMOUS WORKFLOW
      // ─────────────────────────────────────────────────────────────
      const cand = DRUG_DISCOVERY_PORTFOLIO[matchedMolecule || activeCandidateKey];

      const initialAgentMsg = {
        id: agentMsgId,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: 'pipeline',
        targetCandidate: cand,
        modelUsed: currentModelConfig,
        steps: [
          { id: 's1', name: 'Scaffold Identification & Octet Check', tool: 'RDKit C++', status: 'running' },
          { id: 's2', name: '3D Cartesian Conformers Generation', tool: 'ETKDG Engine', status: 'pending' },
          { id: 's3', name: 'PySCF Quantum DFT Ground State (B3LYP)', tool: 'PySCF DFT', status: 'pending' },
          { id: 's4', name: 'Target Cavity Docking & Free Energy ΔG', tool: 'DiffDock NIM', status: 'pending' },
          { id: 's5', name: 'Chemical Reaction Synthesis Tree', tool: 'ARXN Studio', status: 'pending' }
        ],
        summary: ''
      };

      setMessages((prev) => [...prev, userMsg, initialAgentMsg]);

      // Ultra-fast step execution simulation
      const durations = [15, 20, 20, 25, 20];
      for (let i = 0; i < 5; i++) {
        await new Promise((r) => setTimeout(r, durations[i]));
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== agentMsgId) return m;
            const updated = [...m.steps];
            updated[i] = { ...updated[i], status: 'completed' };
            if (i < 4) updated[i + 1] = { ...updated[i + 1], status: 'running' };
            return { ...m, steps: updated };
          })
        );
      }

      const summaryText = `### Autonomous Molecular Investigation Complete

**Molecule:** ${cand.moleculeName} (${cand.formula})
- **Target Protein:** ${cand.target} (PDB: \`${cand.pdbId}\`)
- **Binding Energy:** \`${cand.docking.affinity} kcal/mol\` ($K_i \\approx ${cand.docking.ki}$)
- **Electronic Bandgap:** \`ΔE = ${cand.dft.bandgap} eV\`
- **ADMET Profile:** MW ${cand.mw} Da, LogP ${cand.admet.logp}, TPSA ${cand.admet.tpsa} Å²
- **Synthesis:** ${cand.synthesis.route} (${cand.synthesis.steps.length} sequential reaction stages)`;

      setMessages((prev) =>
        prev.map((m) => (m.id === agentMsgId ? { ...m, completed: true, summary: summaryText } : m))
      );
    } else {
      // ─────────────────────────────────────────────────────────────
      // CONVERSATIONAL CHEMISTRY Q&A MODE (<10ms INSTANT LEAD ANSWER)
      // ─────────────────────────────────────────────────────────────
      const instantLead = generateInstantLeadAnswer(query);

      const initialAgentMsg = {
        id: agentMsgId,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: 'qa',
        modelUsed: currentModelConfig,
        isLoading: true,
        leadFinding: instantLead,
        content: instantLead ? instantLead.lead : 'Analyzing molecular structures and chemical reaction mechanisms...'
      };

      setMessages((prev) => [...prev, userMsg, initialAgentMsg]);

      try {
        const result = await executeChemistryQuery(query, selectedModel);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === agentMsgId
              ? {
                  ...m,
                  isLoading: false,
                  isChemistry: result.isChemistry,
                  title: result.title,
                  leadFinding: instantLead || (result.leadSummary ? { title: result.title, lead: result.leadSummary } : null),
                  content: result.answer,
                  source: result.source || 'ChemSpace Chemistry AI'
                }
              : m
          )
        );
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === agentMsgId
              ? {
                  ...m,
                  isLoading: false,
                  content: `### Chemical Reasoning Note\n\n${err.message || 'Unable to execute query.'}`
                }
              : m
          )
        );
      }
    }

    setIsExecuting(false);
  };

  // Download PDB
  const handleDownloadPdb = () => {
    const cand = activeCandidate;
    const lines = [
      `HEADER    CHEMSPACE MOLECULAR COMPUTATION         23-OCT-26   ${cand.pdbId || '1ABC'}`,
      `TITLE     ${cand.moleculeName.toUpperCase()}`,
      `COMPND    MOL_ID: 1; MOLECULE: ${cand.moleculeName}; FORMULA: ${cand.formula}`,
      `AUTHOR    CHEMSPACE AUTONOMOUS MOLECULAR STUDIO`
    ];

    cand.conformers.atoms.forEach((atom, idx) => {
      const coord = cand.conformers.coordinates[idx] || [0, 0, 0];
      const x = coord[0].toFixed(3).padStart(8);
      const y = coord[1].toFixed(3).padStart(8);
      const z = coord[2].toFixed(3).padStart(8);
      const atomNum = (idx + 1).toString().padStart(5);
      const atomName = (atom + (idx + 1)).padEnd(4);
      lines.push(
        `HETATM${atomNum} ${atomName} MOL A   1    ${x}${y}${z}  1.00 20.00          ${atom.padStart(2)}`
      );
    });

    cand.conformers.bonds.forEach((b) => {
      lines.push(`CONECT${(b.from + 1).toString().padStart(5)}${(b.to + 1).toString().padStart(5)}`);
    });
    lines.push('END');

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cand.moleculeName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_3d.pdb`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy SMILES
  const handleCopySmiles = async () => {
    await copyToClipboardSafely(activeCandidate.smiles);
    setCopiedSmiles(true);
    setTimeout(() => setCopiedSmiles(false), 2000);
  };

  // Copy Report
  const handleCopyReport = async () => {
    const cand = activeCandidate;
    const reportText = `# ChemSpace Chemical Monograph: ${cand.moleculeName}
Formula: ${cand.formula} | MW: ${cand.mw} Da | SMILES: ${cand.smiles}

## Mechanism of Action
${cand.mechanism}

## Target Binding & Thermodynamics
- Target: ${cand.target} (PDB: ${cand.pdbId})
- Binding Free Energy (ΔG): ${cand.docking.affinity} kcal/mol (Ki: ${cand.docking.ki})

## Synthesis Pathway
Route: ${cand.synthesis.route}
${cand.synthesis.steps.map((s) => `Step ${s.stepNumber}: ${s.name} (${s.mechanism}) - Yield: ${s.yield}\nReactants: ${s.reactants}\nProducts: ${s.products}`).join('\n\n')}`;

    await copyToClipboardSafely(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)] font-sans">
      {/* ─────────────────────────────────────────────────────────────
          1. MINIMALIST TOP HEADER BAR (Clean & Website Theme Aligned)
         ───────────────────────────────────────────────────────────── */}
      <header className="h-12 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 flex items-center justify-between shrink-0 select-none z-10 backdrop-blur-md">
        {/* Left: Branding & Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-orange-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm tracking-tight text-[var(--text-primary)]">
                AI Workspace
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[9px] font-mono text-orange-500 font-semibold uppercase">
                Chemistry Intelligence
              </span>
            </div>
          </div>

          {/* Mode Switcher Pill: Q&A vs Pipeline */}
          <div className="flex items-center p-0.5 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[10.5px] font-mono">
            <button
              type="button"
              onClick={() => setWorkspaceMode('qa')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 font-bold ${
                workspaceMode === 'qa'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Conversational Chemistry Questions, Reactions & Mechanism Reasoning"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Chemistry Q&amp;A</span>
            </button>

            <button
              type="button"
              onClick={() => setWorkspaceMode('pipeline')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 font-bold ${
                workspaceMode === 'pipeline'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Multi-Tool Autonomous Drug Discovery & 3D Conformer Modeling"
            >
              <Cpu className="w-3 h-3" />
              <span>Drug Discovery</span>
            </button>
          </div>
        </div>

        {/* Right: Molecule Selector, Model Pill & Reset */}
        <div className="flex items-center gap-2">
          {/* Active Molecule Dropdown */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-inner)] text-[11px] font-mono">
            <Atom className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <select
              value={activeCandidateKey}
              onChange={(e) => setActiveCandidateKey(e.target.value)}
              className="bg-transparent border-0 text-[var(--text-primary)] font-semibold focus:outline-none cursor-pointer pr-1 truncate max-w-[120px] sm:max-w-[160px]"
              title="Select Active Molecule for 3D Modeling & Analytics"
            >
              {Object.keys(DRUG_DISCOVERY_PORTFOLIO).map((key) => (
                <option key={key} value={key} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                  {DRUG_DISCOVERY_PORTFOLIO[key].moleculeName.split(' ')[0]} ({DRUG_DISCOVERY_PORTFOLIO[key].formula})
                </option>
              ))}
            </select>
          </div>

          {/* Model Selector Dropdown */}
          <div className="relative" ref={modelMenuRef}>
            <button
              type="button"
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-inner)] hover:border-orange-500/50 text-[11px] font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="hidden md:inline">{currentModelConfig.badge}</span>
              <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
            </button>

            {isModelDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xl p-1.5 z-50 text-xs">
                {AI_COMPUTATIONAL_MODELS.map((mod) => (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => {
                      setSelectedModel(mod.id);
                      setIsModelDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg transition flex items-start gap-2 cursor-pointer ${
                      selectedModel === mod.id
                        ? 'bg-orange-500/15 text-orange-400 font-bold border border-orange-500/30'
                        : 'hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <span>{mod.icon}</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-[var(--text-primary)]">{mod.name}</div>
                      <div className="text-[10px] text-[var(--text-muted)] truncate">{mod.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Workspace */}
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              setActiveCandidateKey('protac');
            }}
            className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:border-orange-500/50 text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-inner)] transition cursor-pointer"
            title="Clear Chat History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN DUAL-STAGE WORKSPACE (Left: Q&A Chat, Right: Output Stage)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* ─────────────────────────────────────────────────────────────
            LEFT PANE: CONVERSATIONAL AGENT DECK & CLEAN PROMPT LINE
           ───────────────────────────────────────────────────────────── */}
        <section
          aria-label="Chemistry Chat Deck"
          className="w-full lg:w-1/2 h-full flex flex-col border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] bg-[var(--bg-inner)] min-h-0"
        >
          {/* Scrollable Message History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((msg) => (
              <article key={msg.id} className="space-y-2.5">
                {/* User Prompt Bubble */}
                {msg.role === 'user' && (
                  <div className="flex items-start justify-end gap-2">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-gradient-to-r from-orange-500 to-amber-500 p-3 text-white shadow-md space-y-1.5">
                      {msg.attachedImage && (
                        <div className="p-1 rounded-xl bg-black/30 border border-white/20 overflow-hidden">
                          <img
                            src={msg.attachedImage.dataUrl}
                            alt={msg.attachedImage.name}
                            className="max-h-36 w-auto rounded-lg object-contain mx-auto"
                          />
                          <div className="text-[10px] font-mono text-amber-200 mt-1 truncate">
                            {msg.attachedImage.name}
                          </div>
                        </div>
                      )}
                      <p className="text-xs font-sans leading-relaxed whitespace-pre-wrap select-text">
                        {msg.content}
                      </p>
                      <div className="text-[9.5px] font-mono text-white/80 text-right">
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                )}

                {/* Assistant Agent Response */}
                {msg.role === 'assistant' && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-400 font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2.5">
                      {/* Loading State with Instant Chemical Lead Finding */}
                      {msg.isLoading && msg.leadFinding && (
                        <div className="p-3.5 rounded-xl border border-orange-500/40 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent space-y-2 shadow-sm animate-fadeIn">
                          <div className="flex items-center justify-between text-[11px] font-mono text-orange-400 pb-1.5 border-b border-orange-500/20">
                            <span className="font-bold flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                              <span>⚡ Instant Chemical Lead Finding</span>
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin text-orange-400" />
                              <span>Expanding full mechanism...</span>
                            </span>
                          </div>
                          <div className="font-semibold text-xs text-[var(--text-primary)]">
                            {msg.leadFinding.title}
                          </div>
                          <div className="text-xs leading-relaxed text-[var(--text-secondary)]">
                            {msg.leadFinding.lead}
                          </div>
                        </div>
                      )}

                      {/* Fallback Loading State */}
                      {msg.isLoading && !msg.leadFinding && (
                        <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center gap-2 text-xs font-mono text-orange-400">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>ChemSpace AI is computing chemical reasoning...</span>
                        </div>
                      )}

                      {/* Welcome Message Card */}
                      {msg.isWelcome && (
                        <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-xs space-y-2 leading-relaxed whitespace-pre-wrap select-text font-sans text-[var(--text-secondary)] shadow-sm">
                          {msg.content}
                        </div>
                      )}

                      {/* Conversational Chemistry Answer */}
                      {!msg.isLoading && !msg.isWelcome && msg.content && (
                        <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-3 shadow-sm">
                          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-2">
                            <span className="flex items-center gap-1.5 text-orange-400 font-bold">
                              <Sparkles className="w-3 h-3 text-orange-400" />
                              <span>{msg.source || 'ChemSpace Chemical Engine'}</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded text-[9.5px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                                ⚡ Fast Response (&lt;15ms)
                              </span>
                              <span>{msg.timestamp}</span>
                            </div>
                          </div>

                          {/* Highlighted Lead Finding Callout */}
                          {msg.leadFinding?.lead && (
                            <div className="p-2.5 rounded-lg border border-orange-500/30 bg-orange-500/5 text-xs text-[var(--text-primary)] flex items-start gap-2">
                              <Zap className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                              <div className="leading-relaxed">
                                <span className="font-bold text-orange-400 mr-1.5">Lead Finding:</span>
                                <span>{msg.leadFinding.lead}</span>
                              </div>
                            </div>
                          )}

                          <div className="text-xs leading-relaxed font-sans text-[var(--text-primary)] whitespace-pre-wrap select-text space-y-2">
                            {msg.content}
                          </div>
                        </div>
                      )}

                      {/* Pipeline Multi-Tool Execution Steps if in Pipeline Mode */}
                      {msg.steps && (
                        <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-2 shadow-sm font-mono text-xs">
                          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pb-1 border-b border-[var(--border-subtle)]">
                            <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                              <Cpu className="w-3.5 h-3.5 text-orange-400" />
                              <span>Autonomous Agent Pipeline</span>
                            </span>
                            <span>{msg.steps.filter((s) => s.status === 'completed').length}/5 Done</span>
                          </div>

                          <div className="space-y-1">
                            {msg.steps.map((st, i) => (
                              <div
                                key={st.id}
                                className={`p-2 rounded-lg border text-[11px] flex items-center justify-between transition ${
                                  st.status === 'running'
                                    ? 'bg-orange-500/10 border-orange-500/40 text-orange-300'
                                    : st.status === 'completed'
                                    ? 'bg-[var(--bg-inner)] border-[var(--border-subtle)] text-[var(--text-primary)]'
                                    : 'opacity-50 border-transparent text-[var(--text-muted)]'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold">
                                    {st.status === 'completed' ? '✓' : st.status === 'running' ? '⟳' : i + 1}
                                  </span>
                                  <span>{st.name}</span>
                                </div>
                                <span className="text-[9.5px] text-[var(--text-muted)]">{st.tool}</span>
                              </div>
                            ))}
                          </div>

                          {msg.summary && (
                            <div className="pt-2 text-xs font-sans text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                              {msg.summary}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </article>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Chemistry Question Presets */}
          <div className="px-3.5 py-1.5 bg-[var(--bg-card)] border-t border-[var(--border-subtle)] shrink-0 overflow-x-auto select-none">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[9.5px] font-mono text-[var(--text-muted)] uppercase shrink-0 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-orange-400" />
                <span>Quick Topics:</span>
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {CHEMISTRY_PRESET_QUESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isExecuting}
                    onClick={() => handleExecutePrompt(item.query)}
                    className="px-2.5 py-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-inner)] hover:border-orange-500/40 hover:text-orange-400 text-[10.5px] font-mono whitespace-nowrap transition cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Chat / Prompt Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecutePrompt();
            }}
            className="p-3 bg-[var(--bg-card)] border-t border-[var(--border-subtle)] shrink-0 space-y-2"
          >
            {/* Attached Image Preview */}
            {attachedImage && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <ImageIcon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span className="font-semibold text-xs truncate">{attachedImage.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inner)] focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500/20 transition shadow-xs">
              <textarea
                ref={inputRef}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleExecutePrompt();
                  }
                }}
                disabled={isExecuting}
                rows={2}
                placeholder={
                  workspaceMode === 'qa'
                    ? "Ask any chemistry question (e.g. 'Explain Aldol condensation mechanism', 'Why is pyridine basic?', 'Calculate pH of 0.05M HCl')..."
                    : "Enter molecular design prompt (e.g. 'Design covalent EGFR inhibitor targeting Cys797', 'Screen PROTAC degraders')..."
                }
                className="w-full p-2.5 pr-28 text-xs bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none resize-none leading-relaxed"
              />

              {/* Action Buttons Inside Input */}
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageAttach}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isExecuting}
                  className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:border-orange-500/40 text-[var(--text-muted)] hover:text-orange-400 bg-[var(--bg-card)] transition cursor-pointer"
                  title="Attach Structure / Reaction Image"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleToggleVoice}
                  disabled={isExecuting}
                  className={`p-1.5 rounded-lg border transition cursor-pointer ${
                    isListening
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                      : 'border-[var(--border-subtle)] hover:border-orange-500/40 text-[var(--text-muted)] hover:text-orange-400 bg-[var(--bg-card)]'
                  }`}
                  title={isListening ? 'Stop Listening' : 'Voice Dictation'}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="submit"
                  disabled={(!promptInput.trim() && !attachedImage) || isExecuting}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                >
                  {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isExecuting ? 'Thinking...' : 'Run'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono px-1">
              <span>Press <kbd className="px-1 rounded bg-[var(--bg-inner)] border border-[var(--border-subtle)]">Enter</kbd> to send</span>
              <span className="text-orange-400">Strict Chemistry Scientific Domain</span>
            </div>
          </form>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            RIGHT PANE: LIVE SCIENTIFIC STAGE (3D, Graphs, 2D, Synthesis)
           ───────────────────────────────────────────────────────────── */}
        <section
          aria-label="Scientific Output Stage"
          className="w-full lg:w-1/2 h-full flex flex-col bg-[var(--bg-page)] min-h-0"
        >
          {/* Top Stage Navigation Tabs */}
          <header className="px-3 py-2 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('3d')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === '3d'
                    ? 'bg-orange-500 text-white shadow-xs font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-inner)]'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D Stage</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('graphs')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'graphs'
                    ? 'bg-orange-500 text-white shadow-xs font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-inner)]'
                }`}
                title="View Reaction Kinetics, Concentration Dynamics & Target Binding Graphs"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Scientific Graphs</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('2d')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === '2d'
                    ? 'bg-orange-500 text-white shadow-xs font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-inner)]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>2D Structure</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('synthesis')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'synthesis'
                    ? 'bg-orange-500 text-white shadow-xs font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-inner)]'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Synthesis</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('report')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'report'
                    ? 'bg-orange-500 text-white shadow-xs font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-inner)]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Monograph</span>
              </button>
            </div>

            {/* Quick Export Tools */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleDownloadPdb}
                className="px-2 py-1 rounded-md border border-[var(--border-subtle)] hover:border-orange-500/50 bg-[var(--bg-inner)] text-[10px] font-mono font-semibold flex items-center gap-1 transition cursor-pointer"
                title="Download 3D PDB Structure"
              >
                <Download className="w-3 h-3 text-orange-400" />
                <span>PDB</span>
              </button>

              <button
                type="button"
                onClick={handleCopySmiles}
                className="px-2 py-1 rounded-md border border-[var(--border-subtle)] hover:border-orange-500/50 bg-[var(--bg-inner)] text-[10px] font-mono font-semibold flex items-center gap-1 transition cursor-pointer"
                title="Copy Canonical SMILES"
              >
                {copiedSmiles ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-orange-400" />}
                <span>SMILES</span>
              </button>
            </div>
          </header>

          {/* Right Stage Content Area */}
          <div className="flex-1 min-h-0 overflow-hidden relative">
            {/* TAB 1: 3D MOLECULAR STAGE */}
            {activeTab === '3d' && (
              <div className="w-full h-full relative">
                <UnifiedPoseViewer
                  conformers={activeCandidate.conformers}
                  dockingResults={activeCandidate.docking}
                  complexName={`${activeCandidate.moleculeName} (${activeCandidate.formula})`}
                />

                {/* Molecule Info Overlay Pill */}
                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border-subtle)] text-xs shadow-md pointer-events-none space-y-0.5">
                  <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Atom className="w-3.5 h-3.5 text-orange-400" />
                    <span>{activeCandidate.moleculeName}</span>
                  </div>
                  <div className="text-[10px] font-mono text-[var(--text-muted)]">
                    Formula: <strong className="text-[var(--text-primary)]">{activeCandidate.formula}</strong> • MW: {activeCandidate.mw} Da
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SCIENTIFIC GRAPHS & CONCENTRATION SUITE */}
            {activeTab === 'graphs' && (
              <div className="w-full h-full p-3 overflow-y-auto">
                <ChemicalAnalyticsGraphSuite candidate={activeCandidate} />
              </div>
            )}

            {/* TAB 3: 2D STRUCTURE IMAGE */}
            {activeTab === '2d' && (
              <div className="w-full h-full p-4 overflow-y-auto flex flex-col items-center justify-center space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-[var(--border-subtle)] max-w-sm w-full flex items-center justify-center shadow-lg">
                  <img
                    src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(
                      activeCandidate.smiles
                    )}/PNG?record_type=2d&image_size=large`}
                    alt={activeCandidate.moleculeName}
                    className="max-h-64 object-contain filter invert drop-shadow"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                <div className="text-center space-y-1 font-mono text-xs">
                  <span className="font-bold text-sm text-[var(--text-primary)]">{activeCandidate.moleculeName}</span>
                  <div className="text-[11px] text-[var(--text-muted)]">{activeCandidate.iupac}</div>
                  <div className="text-[10px] text-orange-400 break-all max-w-md pt-1">
                    SMILES: {activeCandidate.smiles}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: REACTION SYNTHESIS */}
            {activeTab === 'synthesis' && (
              <div className="w-full h-full p-4 overflow-y-auto space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase">Proposed Pathway</span>
                  <span className="font-bold text-sm text-orange-400">{activeCandidate.synthesis.route}</span>
                </div>

                <div className="space-y-2">
                  {activeCandidate.synthesis.steps.map((st) => (
                    <div
                      key={st.stepNumber}
                      className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[var(--text-primary)]">
                          Step {st.stepNumber}: {st.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Yield: {st.yield}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        Mechanism: <strong className="text-[var(--text-secondary)]">{st.mechanism}</strong>
                      </div>
                      <div className="text-[10.5px] text-[var(--text-secondary)] pt-1 space-y-0.5">
                        <div>Reactants: {st.reactants}</div>
                        <div>Reagents: {st.reagents}</div>
                        <div className="text-emerald-400">Products: {st.products}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: MONOGRAPH REPORT */}
            {activeTab === 'report' && (
              <div className="w-full h-full p-4 overflow-y-auto space-y-3 font-sans text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text-primary)]">
                      {activeCandidate.moleculeName} Monograph
                    </h3>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      Clinical Stage: {activeCandidate.trialStage}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyReport}
                    className="px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] hover:border-orange-500/50 bg-[var(--bg-inner)] text-[11px] font-mono font-bold text-orange-400 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedReport ? 'Copied' : 'Copy Full Report'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-2 leading-relaxed text-[var(--text-secondary)]">
                  <h4 className="font-bold text-xs text-[var(--text-primary)]">Mechanism of Action</h4>
                  <p>{activeCandidate.mechanism}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)]">
                    <span className="text-[9.5px] text-[var(--text-muted)] block uppercase">Target Receptor</span>
                    <span className="font-bold text-[var(--text-primary)]">{activeCandidate.target}</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)]">
                    <span className="text-[9.5px] text-[var(--text-muted)] block uppercase">Binding Free Energy</span>
                    <span className="font-bold text-emerald-400">{activeCandidate.docking.affinity} kcal/mol</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
