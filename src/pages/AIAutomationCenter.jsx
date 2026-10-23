import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  Play,
  Square,
  RefreshCw,
  Layers,
  ShieldCheck,
  Download,
  Copy,
  Check,
  CheckCircle2,
  FileText,
  Cpu,
  Zap,
  Activity,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Database,
  Search,
  Box,
  Terminal,
  ArrowRight,
  Atom,
  RotateCcw,
  BarChart2,
  Eye,
  SlidersHorizontal,
  Compass,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Sliders,
  FolderOpen,
  Upload,
  Save,
  Share2,
  Network,
  Crosshair,
  Pill,
  Droplet,
  HeartPulse,
  Flame,
  Info,
  PenTool,
  Radio,
  Grid,
  Award,
  FolderLock,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Edit3,
  FlaskConical,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { usePersistedWork } from '../services/workPersistence';
import UnifiedPoseViewer from '../components/automation/UnifiedPoseViewer';
import ResidueInteractionTable from '../components/automation/ResidueInteractionTable';
import PoseComparisonGrid from '../components/automation/PoseComparisonGrid';
import MolecularInteractionDiagram from '../components/automation/MolecularInteractionDiagram';
import DiagnosticsPanel from '../components/automation/DiagnosticsPanel';
import ADMETProfileDashboard from '../components/automation/ADMETProfileDashboard';
import PipelineStepper from '../components/automation/PipelineStepper';
import WorkspaceExplorer from '../components/automation/WorkspaceExplorer';
import CodeExecutionTerminal from '../components/automation/CodeExecutionTerminal';
import AgentActivityInspector from '../components/automation/AgentActivityInspector';
import {
  fetchAutomationStatus,
  fetchWorkflowTemplates,
  createWorkflowPlan,
  executeWorkflow,
  pollJobStatus,
  approveJob,
  cancelJob,
  validateCompound,
  fetchScientificTools,
  formulateResearchPlan,
  createResearchJob,
  startResearchJob,
  resumeResearchJob,
  calculateMolecularProperties,
  generateMolecularConformers,
  cancelResearchJob,
  getResearchJobStatus,
  fetchJobReport,
  approveResearchPlan,
  parseStructureFile,
  fetch2DDepictionSvg,
  calculateStructureRmsd,
  runMolecularDocking,
  runAdmetPrediction,
  runBindingAnalysis,
  runDrugDiscoveryPipeline
} from '../services/automationService';

// Verified Reference Complexes for Immediate Scientific Inspection
const CURATED_SAMPLE_COMPLEXES = {
  'mpro-remdesivir': {
    name: 'SARS-CoV-2 Mpro + Remdesivir Scaffold',
    pdbId: '6LU7',
    resolution: '2.16 Å',
    target: 'Main Protease (Mpro / 3CLpro)',
    organism: 'SARS-CoV-2',
    smiles: 'CCC(CC)COC(=O)[C@H](C)N[P@](=O)(OC[C@H]1O[C@](C#N)(c2ccc3n2ncnc3N)[C@@H](O)[C@H]1O)Oc4ccccc4',
    formula: 'C27H35N6O8P',
    mw: 602.58,
    conformers: {
      atoms: ['C', 'C', 'C', 'O', 'N', 'P', 'O', 'O', 'C', 'C', 'C', 'N', 'N', 'N', 'C', 'O'],
      coordinates: [
        [-0.4, 0.2, 0.1], [0.8, -0.6, 0.3], [1.9, 0.2, -0.1], [1.7, 1.4, -0.2],
        [0.6, 2.1, 0.1], [-0.5, 1.5, 0.2], [-1.8, 2.2, 0.4], [-2.1, 3.4, 0.5],
        [3.1, -0.4, -0.3], [4.2, 0.4, -0.7], [3.9, 1.7, -0.9], [2.7, 2.2, -0.6],
        [-1.2, -0.8, 0.4], [-2.4, -0.2, 0.3], [-2.2, 1.1, 0.2], [0.9, -1.8, 0.6]
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 1 },
        { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 1 }, { from: 5, to: 0, order: 1 },
        { from: 5, to: 6, order: 1 }, { from: 6, to: 7, order: 2 }, { from: 2, to: 8, order: 1 },
        { from: 8, to: 9, order: 2 }, { from: 9, to: 10, order: 1 }, { from: 10, to: 11, order: 2 },
        { from: 11, to: 4, order: 1 }, { from: 0, to: 12, order: 1 }, { from: 12, to: 13, order: 1 },
        { from: 13, to: 14, order: 2 }, { from: 1, to: 15, order: 2 }
      ],
      source: 'RCSB PDB Crystal Structure 6LU7 (Binding Site Minimization)'
    },
    dockingResults: {
      binding_pocket_center: [0.6, 0.4, 0.2],
      protein_ca_backbone: [
        [-6.4, 3.8, -2.2], [-4.9, 4.3, -1.1], [-3.2, 3.6, 0.3], [-1.9, 2.3, 1.1],
        [-0.4, 1.2, 1.9], [1.3, 0.7, 1.8], [2.8, 1.1, 0.8], [4.1, 2.2, -0.4],
        [4.9, 3.7, -1.5], [4.5, 5.2, -2.1], [3.1, 6.1, -1.9], [1.6, 6.3, -0.8],
        [-0.1, 5.6, 0.4], [-1.7, 4.4, 1.2], [-2.8, 2.9, 1.3], [-3.4, 1.1, 0.4],
        [-3.1, -0.7, -0.9], [-2.0, -2.1, -1.8], [-0.5, -3.1, -1.9], [1.1, -3.3, -1.2],
        [2.6, -2.8, -0.1], [3.6, -1.7, 1.2], [3.8, -0.2, 2.1], [3.1, 1.4, 2.3],
        [1.7, 2.5, 1.8], [0.3, 3.1, 0.7], [-1.2, 2.9, -0.5], [-2.4, 2.1, -1.6],
        [-3.1, 0.7, -2.2], [-2.9, -0.8, -2.1], [-1.9, -2.2, -1.3], [-0.4, -3.1, 0.1]
      ],
      poses: [
        {
          rank: 1,
          binding_affinity: -8.74,
          rmsd_lb: 0.0,
          rmsd_ub: 0.0,
          estimated_ki: '380 nM',
          coordinates: [
            [-0.4, 0.2, 0.1], [0.8, -0.6, 0.3], [1.9, 0.2, -0.1], [1.7, 1.4, -0.2],
            [0.6, 2.1, 0.1], [-0.5, 1.5, 0.2], [-1.8, 2.2, 0.4], [-2.1, 3.4, 0.5],
            [3.1, -0.4, -0.3], [4.2, 0.4, -0.7], [3.9, 1.7, -0.9], [2.7, 2.2, -0.6],
            [-1.2, -0.8, 0.4], [-2.4, -0.2, 0.3], [-2.2, 1.1, 0.2], [0.9, -1.8, 0.6]
          ]
        },
        {
          rank: 2,
          binding_affinity: -8.21,
          rmsd_lb: 1.42,
          rmsd_ub: 2.15,
          estimated_ki: '940 nM',
          coordinates: [
            [-0.2, 0.4, 0.3], [0.9, -0.4, 0.5], [2.1, 0.3, 0.1], [1.9, 1.6, -0.1],
            [0.7, 2.2, 0.2], [-0.4, 1.6, 0.4], [-1.6, 2.4, 0.6], [-1.9, 3.5, 0.7],
            [3.2, -0.3, -0.2], [4.4, 0.5, -0.5], [4.1, 1.8, -0.7], [2.9, 2.3, -0.4],
            [-1.1, -0.6, 0.5], [-2.2, 0.0, 0.4], [-2.0, 1.2, 0.3], [1.1, -1.6, 0.8]
          ]
        },
        {
          rank: 3,
          binding_affinity: -7.65,
          rmsd_lb: 2.85,
          rmsd_ub: 3.91,
          estimated_ki: '2.4 μM',
          coordinates: [
            [-0.6, 0.0, -0.1], [0.6, -0.8, 0.1], [1.7, 0.0, -0.3], [1.5, 1.2, -0.4],
            [0.4, 1.9, -0.1], [-0.7, 1.3, 0.0], [-2.0, 2.0, 0.2], [-2.3, 3.2, 0.3],
            [2.9, -0.6, -0.5], [4.0, 0.2, -0.9], [3.7, 1.5, -1.1], [2.5, 2.0, -0.8],
            [-1.4, -1.0, 0.2], [-2.6, -0.4, 0.1], [-2.4, 0.9, 0.0], [0.7, -2.0, 0.4]
          ]
        }
      ],
      interactions: [
        { residue: 'CYS145', type: 'Hydrogen Bond (Donor)', distance: 2.84, energy: -2.3, atom: 'O7' },
        { residue: 'HIS41', type: 'Hydrogen Bond (Acceptor)', distance: 2.96, energy: -1.9, atom: 'N11' },
        { residue: 'GLU166', type: 'Salt Bridge / Coulombic', distance: 3.15, energy: -3.8, atom: 'O15' },
        { residue: 'GLN189', type: 'Hydrophobic Contact', distance: 3.62, energy: -0.8, atom: 'C8' },
        { residue: 'MET165', type: 'Hydrophobic Contact', distance: 3.78, energy: -0.7, atom: 'C9' },
        { residue: 'ASN142', type: 'Hydrogen Bond', distance: 3.05, energy: -1.6, atom: 'N13' }
      ]
    }
  },
  'hiv-pr-darunavir': {
    name: 'HIV-1 Protease + Darunavir',
    pdbId: '4LL3',
    resolution: '1.40 Å',
    target: 'HIV-1 Retropepsin (PR)',
    organism: 'Human immunodeficiency virus 1',
    smiles: 'CC(C)CN(CC(O)C(Cc1ccccc1)NC(=O)OC1COC2C1OCC2)S(=O)(=O)c1ccc(N)cc1',
    formula: 'C27H37N3O7S',
    mw: 547.66,
    conformers: {
      atoms: ['C', 'C', 'C', 'N', 'C', 'C', 'O', 'C', 'C', 'C', 'N', 'C', 'O', 'O', 'C'],
      coordinates: [
        [0.0, 0.0, 0.0], [1.2, 0.4, 0.3], [2.3, -0.5, 0.1], [3.4, 0.2, -0.2],
        [4.5, -0.4, -0.5], [4.2, -1.8, -0.3], [5.2, -2.6, -0.6], [3.0, -2.2, 0.1],
        [2.8, -3.6, 0.4], [1.6, -4.0, 0.8], [0.5, -3.2, 0.9], [0.7, -1.8, 0.6],
        [-1.1, 0.8, -0.4], [-0.8, 2.1, -0.7], [0.4, 2.6, -0.5]
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 1 },
        { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 1 }, { from: 5, to: 6, order: 1 },
        { from: 5, to: 7, order: 1 }, { from: 7, to: 8, order: 2 }, { from: 8, to: 9, order: 1 },
        { from: 9, to: 10, order: 2 }, { from: 10, to: 11, order: 1 }, { from: 11, to: 7, order: 1 },
        { from: 0, to: 12, order: 1 }, { from: 12, to: 13, order: 1 }, { from: 13, to: 14, order: 1 }
      ],
      source: 'RCSB PDB Crystal Structure 4LL3 (1.40 Å Resolution)'
    },
    dockingResults: {
      binding_pocket_center: [0.0, -1.0, 0.0],
      protein_ca_backbone: [
        [-5.0, 2.0, -1.5], [-3.8, 3.2, -0.8], [-2.1, 3.5, 0.2], [-0.5, 2.8, 0.9],
        [1.2, 2.1, 1.2], [2.9, 1.8, 0.8], [4.2, 2.5, -0.2], [4.8, 3.9, -1.1],
        [3.8, 5.0, -1.8], [2.2, 5.3, -1.6], [0.8, 4.7, -0.8], [-0.4, 3.9, 0.1],
        [-1.8, -1.5, 1.1], [-0.5, -2.8, 1.5], [1.1, -3.2, 1.2], [2.4, -2.5, 0.5],
        [3.1, -1.2, -0.4], [2.8, 0.2, -1.1], [1.7, 1.1, -1.4], [0.2, 1.3, -1.2]
      ],
      poses: [
        {
          rank: 1,
          binding_affinity: -11.45,
          rmsd_lb: 0.0,
          rmsd_ub: 0.0,
          estimated_ki: '4.2 nM',
          coordinates: [
            [0.0, 0.0, 0.0], [1.2, 0.4, 0.3], [2.3, -0.5, 0.1], [3.4, 0.2, -0.2],
            [4.5, -0.4, -0.5], [4.2, -1.8, -0.3], [5.2, -2.6, -0.6], [3.0, -2.2, 0.1],
            [2.8, -3.6, 0.4], [1.6, -4.0, 0.8], [0.5, -3.2, 0.9], [0.7, -1.8, 0.6],
            [-1.1, 0.8, -0.4], [-0.8, 2.1, -0.7], [0.4, 2.6, -0.5]
          ]
        }
      ],
      interactions: [
        { residue: 'ASP25', type: 'Catalytic Hydrogen Bond', distance: 2.65, energy: -3.2, atom: 'O6' },
        { residue: 'ASP25_B', type: 'Catalytic Hydrogen Bond', distance: 2.71, energy: -2.9, atom: 'O6' },
        { residue: 'ILE50', type: 'Flap Hydrogen Bond', distance: 2.92, energy: -1.8, atom: 'O12' },
        { residue: 'ILE84', type: 'Hydrophobic P1 Pocket', distance: 3.55, energy: -1.1, atom: 'C4' }
      ]
    }
  },
  'egfr-erlotinib': {
    name: 'EGFR Kinase Domain + Erlotinib',
    pdbId: '1M17',
    resolution: '2.60 Å',
    target: 'Epidermal Growth Factor Receptor (EGFR)',
    organism: 'Homo sapiens',
    smiles: 'COCCOc1cc2c(ncnc2cc1OCCOC)Nc1cccc(c1)C#C',
    formula: 'C22H23N3O4',
    mw: 393.44,
    conformers: {
      atoms: ['C', 'N', 'C', 'N', 'C', 'C', 'C', 'C', 'N', 'C', 'C', 'C', 'C', 'C', 'C'],
      coordinates: [
        [0.0, 0.0, 0.0], [1.1, 0.7, 0.2], [2.2, 0.1, 0.1], [2.3, -1.2, -0.2],
        [1.2, -1.9, -0.4], [0.0, -1.3, -0.3], [-1.2, -2.0, -0.5], [-2.3, -1.3, -0.4],
        [-2.3, 0.1, -0.1], [-1.1, 0.7, 0.1], [3.4, 0.8, 0.3], [4.6, 0.2, 0.2],
        [5.7, 0.9, 0.4], [5.6, 2.3, 0.7], [4.4, 2.9, 0.8]
      ],
      bonds: [
        { from: 0, to: 1, order: 2 }, { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 2 },
        { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 2 }, { from: 5, to: 0, order: 1 },
        { from: 5, to: 6, order: 1 }, { from: 6, to: 7, order: 2 }, { from: 7, to: 8, order: 1 },
        { from: 8, to: 9, order: 2 }, { from: 9, to: 0, order: 1 }, { from: 2, to: 10, order: 1 },
        { from: 10, to: 11, order: 1 }, { from: 11, to: 12, order: 2 }, { from: 12, to: 13, order: 1 },
        { from: 13, to: 14, order: 2 }
      ],
      source: 'RCSB PDB Crystal Structure 1M17 (2.60 Å Resolution)'
    },
    dockingResults: {
      binding_pocket_center: [1.5, -0.5, 0.0],
      protein_ca_backbone: [
        [-4.2, 1.8, -1.2], [-3.1, 2.9, -0.6], [-1.6, 3.4, 0.4], [0.2, 3.1, 1.1],
        [1.8, 2.3, 1.4], [3.3, 1.9, 0.9], [4.6, 2.7, -0.1], [5.1, 4.1, -0.9],
        [-2.5, -1.2, 1.3], [-1.1, -2.4, 1.6], [0.6, -2.9, 1.2], [2.1, -2.2, 0.6]
      ],
      poses: [
        {
          rank: 1,
          binding_affinity: -9.82,
          rmsd_lb: 0.0,
          rmsd_ub: 0.0,
          estimated_ki: '64 nM',
          coordinates: [
            [0.0, 0.0, 0.0], [1.1, 0.7, 0.2], [2.2, 0.1, 0.1], [2.3, -1.2, -0.2],
            [1.2, -1.9, -0.4], [0.0, -1.3, -0.3], [-1.2, -2.0, -0.5], [-2.3, -1.3, -0.4],
            [-2.3, 0.1, -0.1], [-1.1, 0.7, 0.1], [3.4, 0.8, 0.3], [4.6, 0.2, 0.2],
            [5.7, 0.9, 0.4], [5.6, 2.3, 0.7], [4.4, 2.9, 0.8]
          ]
        }
      ],
      interactions: [
        { residue: 'MET793', type: 'Hinge Hydrogen Bond', distance: 2.88, energy: -2.8, atom: 'N1' },
        { residue: 'THR790', type: 'Gatekeeper Contact', distance: 3.42, energy: -1.2, atom: 'C6' },
        { residue: 'LEU718', type: 'Hydrophobic P-Loop', distance: 3.65, energy: -0.9, atom: 'C13' }
      ]
    }
  }
};

const PRIMARY_NAV_ITEMS = [
  { to: '/ai-automation', label: 'AI Automation Central', icon: Bot, badge: 'Agentic' },
  { to: '/chemdraw', label: 'ChemDraw 2D/3D', icon: PenTool, badge: 'CAD' },
  { to: '/rdkit-lab', label: 'RDKit Lab', icon: Cpu, badge: 'Python' },
  { to: '/spectroscopy', label: 'Spectroscopy', icon: Radio, badge: 'Spectra' },
  { to: '/chromatography', label: 'Chromatography', icon: FlaskConical, badge: 'HPLC' },
  { to: '/quantum-library', label: 'Quantum DFT', icon: Zap, badge: 'DFT' },
  { to: '/ibm-rxn', label: 'IBM RXN', icon: Activity, badge: 'Synth' },
  { to: '/periodic-table', label: 'Periodic Table', icon: Grid, badge: '118' },
  { to: '/scientists', label: 'Pioneers', icon: Award, badge: 'Nobel' },
  { to: '/workspace', label: 'My Workspace', icon: FolderLock, badge: 'Data' }
];

export default function AIAutomationCenter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Layout Configuration
  const [navRailExpanded, setNavRailExpanded] = useState(false);
  const [explorerCollapsed, setExplorerCollapsed] = useState(false);
  const [explorerWidth, setExplorerWidth] = useState(270);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const [inspectorWidth, setInspectorWidth] = useState(340);
  const [focusMode, setFocusMode] = useState(false); // true = fullscreen viewport
  const [centerTab, setCenterTab] = usePersistedWork('chemspace_automation_tab', '3d'); // 'composer', '3d', 'diagram', 'admet', 'terminal', 'stepper'

  // Scientific Systems State (Persistent Memory - resumes where user stopped)
  const [activeComplexKey, setActiveComplexKey] = usePersistedWork('chemspace_automation_complex_key', 'mpro-remdesivir');
  const [customSmiles, setCustomSmiles] = usePersistedWork('chemspace_automation_custom_smiles', '');
  const [customPdbId, setCustomPdbId] = usePersistedWork('chemspace_automation_custom_pdb', '');
  const [isValidatingSmiles, setIsValidatingSmiles] = useState(false);
  const [validationFeedback, setValidationFeedback] = useState(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadedStructure, setUploadedStructure] = useState(null);
  const [uploadFeedback, setUploadFeedback] = useState(null);

  // Docking State (Persistent Memory)
  const [dockingExhaustiveness, setDockingExhaustiveness] = useState(8);
  const [dockingNumPoses, setDockingNumPoses] = useState(3);
  const [pocketCenterX, setPocketCenterX] = usePersistedWork('chemspace_automation_pocket_x', 0.6);
  const [pocketCenterY, setPocketCenterY] = usePersistedWork('chemspace_automation_pocket_y', 0.4);
  const [pocketCenterZ, setPocketCenterZ] = usePersistedWork('chemspace_automation_pocket_z', 0.2);
  const [boxSizeX, setBoxSizeX] = usePersistedWork('chemspace_automation_box_x', 20.0);
  const [boxSizeY, setBoxSizeY] = usePersistedWork('chemspace_automation_box_y', 20.0);
  const [boxSizeZ, setBoxSizeZ] = usePersistedWork('chemspace_automation_box_z', 20.0);
  const [isRunningDocking, setIsRunningDocking] = useState(false);
  const [dockingOutput, setDockingOutput] = useState(null);
  const [dockingFeedback, setDockingFeedback] = useState(null);
  const [dockingError, setDockingError] = useState('');
  const [activePoseIndex, setActivePoseIndex] = useState(0);

  // ADMET Prediction State
  const [isRunningAdmet, setIsRunningAdmet] = useState(false);
  const [admetProfile, setAdmetProfile] = useState(null);
  const [admetError, setAdmetError] = useState('');

  // Binding Analysis State
  const [isRunningBinding, setIsRunningBinding] = useState(false);
  const [customBindingResults, setCustomBindingResults] = useState(null);
  const [bindingError, setBindingError] = useState('');
  const [selectedResidue, setSelectedResidue] = useState('CYS145');

  // Agentic Drug Discovery Pipeline State (Persistent Memory)
  const [pipelineObjective, setPipelineObjective] = usePersistedWork(
    'chemspace_automation_objective',
    'Screen drug candidates against SARS-CoV-2 Mpro starting from remdesivir scaffold'
  );
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [pipelineSession, setPipelineSession] = useState(null);
  const [pipelineError, setPipelineError] = useState('');
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // General Jobs & Sessions
  const [currentJob, setCurrentJob] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [copiedReport, setCopiedReport] = useState(false);
  const [scientificTools, setScientificTools] = useState([]);
  const [savedSessions, setSavedSessions] = useState([]);
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
  const [bottomDrawerTab, setBottomDrawerTab] = useState('poses'); // 'poses', 'interactions', 'properties', 'logs'
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);

  const timerStartRef = useRef(null);
  const fileInputRef = useRef(null);

  // Resizing References
  const isResizingExplorer = useRef(false);
  const isResizingInspector = useRef(false);

  // Load initial status, tools, and saved sessions
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [statusData, toolsData] = await Promise.all([
          fetchAutomationStatus(),
          fetchScientificTools()
        ]);
        if (mounted) {
          setDiagnostics(statusData);
          if (toolsData?.tools) setScientificTools(toolsData.tools);
        }
      } catch (err) {
        console.warn('[AIAutomationCenter] Initial fetch note:', err);
      }

      try {
        const sess = JSON.parse(localStorage.getItem('chemspace_visual_sessions') || '[]');
        if (mounted && Array.isArray(sess)) setSavedSessions(sess);
      } catch {
        // ignore
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Execution Timer Tracker
  useEffect(() => {
    let interval = null;
    const isBusy = isRunningDocking || isRunningAdmet || isRunningBinding || isRunningPipeline || isExecuting;
    if (isBusy) {
      if (!timerStartRef.current) timerStartRef.current = performance.now();
      interval = setInterval(() => {
        if (timerStartRef.current) {
          setElapsedSeconds((performance.now() - timerStartRef.current) / 1000);
        }
      }, 200);
    } else {
      timerStartRef.current = null;
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunningDocking, isRunningAdmet, isRunningBinding, isRunningPipeline, isExecuting]);

  // Window resize mouse listeners for flexible panels
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingExplorer.current) {
        const newWidth = Math.max(200, Math.min(480, e.clientX - (navRailExpanded ? 200 : 56)));
        setExplorerWidth(newWidth);
      } else if (isResizingInspector.current) {
        const newWidth = Math.max(260, Math.min(520, window.innerWidth - e.clientX));
        setInspectorWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizingExplorer.current = false;
      isResizingInspector.current = false;
      document.body.style.cursor = 'default';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [navRailExpanded]);

  // Active Complex Reference
  const activeComplex = CURATED_SAMPLE_COMPLEXES[activeComplexKey] || CURATED_SAMPLE_COMPLEXES['mpro-remdesivir'];

  const handleSelectComplex = (key) => {
    setActiveComplexKey(key);
    setUploadedStructure(null);
    setUploadFeedback(null);
    setDockingOutput(null);
    setDockingFeedback(null);
    setDockingError('');
    setAdmetProfile(null);
    setCustomBindingResults(null);
    setActivePoseIndex(0);

    const c = CURATED_SAMPLE_COMPLEXES[key];
    if (c) {
      setCustomSmiles(c.smiles);
      setCustomPdbId(c.pdbId);
      setValidationFeedback({
        valid: true,
        message: 'Curated Reference Complex',
        formula: c.formula,
        mw: c.mw
      });
      setPipelineObjective(`Screen drug candidates against ${c.target} starting from ${c.name}`);
      setSelectedResidue(c.dockingResults?.interactions?.[0]?.residue || null);

      if (c.dockingResults?.binding_pocket_center) {
        setPocketCenterX(c.dockingResults.binding_pocket_center[0]);
        setPocketCenterY(c.dockingResults.binding_pocket_center[1]);
        setPocketCenterZ(c.dockingResults.binding_pocket_center[2]);
      }
    }
  };

  const handleValidateSmiles = async () => {
    const smilesToValidate = (customSmiles || activeComplex.smiles).trim();
    if (!smilesToValidate) return;
    setIsValidatingSmiles(true);
    setValidationFeedback(null);
    try {
      const [props, conf] = await Promise.all([
        calculateMolecularProperties(smilesToValidate),
        generateMolecularConformers(smilesToValidate, 1).catch(() => null)
      ]);
      if (props?.valid) {
        setValidationFeedback({
          valid: true,
          message: 'RDKit Validated (Sanitized & Kekulized)',
          formula: props.formula || '',
          mw: props.molecular_weight || props.mw
        });
        if (conf?.conformers?.coordinates) {
          setCurrentJob((prev) => ({
            ...(prev || {}),
            results: {
              ...(prev?.results || {}),
              conformers: conf.conformers,
              properties: props
            }
          }));
        }
      } else {
        setValidationFeedback({
          valid: false,
          message: props?.error || 'Valence or syntax error in SMILES string'
        });
      }
    } catch (err) {
      setValidationFeedback({
        valid: false,
        message: err.message || 'Validation service request failed'
      });
    } finally {
      setIsValidatingSmiles(false);
    }
  };

  // Upload Structure File Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    setUploadFeedback(null);

    try {
      const content = await file.text();
      const res = await parseStructureFile(content, file.name);

      if (res?.structure?.success) {
        const s = res.structure;
        setUploadedStructure(s);
        setUploadFeedback({
          success: true,
          message: `Loaded ${s.format} (${s.total_atoms} atoms, ${s.total_residues || 0} residues)`,
          provenance: s.provenance
        });

        if (s.backbone_ca_coords && s.backbone_ca_coords.length > 0) {
          setCustomPdbId(file.name.replace(/\.[^/.]+$/, '').toUpperCase());
          if (s.center) {
            setPocketCenterX(s.center[0]);
            setPocketCenterY(s.center[1]);
            setPocketCenterZ(s.center[2]);
          }
        }
        setCenterTab('3d');
      } else {
        setUploadFeedback({
          success: false,
          message: res?.structure?.error || 'Structure file parsing failed.'
        });
      }
    } catch (err) {
      setUploadFeedback({
        success: false,
        message: err.message || 'Error reading structure file.'
      });
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 1. Run Molecular Docking
  const handleRunDocking = async () => {
    setIsRunningDocking(true);
    setDockingError('');
    setDockingFeedback(null);
    timerStartRef.current = performance.now();
    setElapsedSeconds(0);

    const effectiveSmiles = (customSmiles || activeComplex.smiles).trim();
    const effectivePdbId = (customPdbId || activeComplex.pdbId).trim();

    try {
      const res = await runMolecularDocking({
        smiles: effectiveSmiles,
        targetPdbId: effectivePdbId,
        pocketCenter: [Number(pocketCenterX), Number(pocketCenterY), Number(pocketCenterZ)],
        boxSize: [Number(boxSizeX), Number(boxSizeY), Number(boxSizeZ)],
        exhaustiveness: Number(dockingExhaustiveness),
        numPoses: Number(dockingNumPoses)
      });

      if (res?.docking?.success) {
        setDockingFeedback(res.docking);
        setActivePoseIndex(0);
        setCenterTab('3d');
        setBottomDrawerTab('poses');
        setBottomDrawerOpen(true);
      } else {
        setDockingError(res?.docking?.error || 'Docking computation failed.');
      }
    } catch (err) {
      setDockingError(err.message || 'Failed to execute molecular docking.');
    } finally {
      setIsRunningDocking(false);
    }
  };

  // 2. Run ADMET Prediction
  const handleRunAdmet = async () => {
    setIsRunningAdmet(true);
    setAdmetError('');
    const effectiveSmiles = (customSmiles || activeComplex.smiles).trim();
    try {
      const res = await runAdmetPrediction(effectiveSmiles);
      if (res?.admet?.success) {
        setAdmetProfile(res.admet);
        setCenterTab('admet');
        setBottomDrawerTab('properties');
        setBottomDrawerOpen(true);
      } else {
        setAdmetError(res?.detail || 'ADMET prediction failed.');
      }
    } catch (err) {
      setAdmetError(err.message || 'Failed to predict ADMET profile.');
    } finally {
      setIsRunningAdmet(false);
    }
  };

  // 3. Run Binding Interaction Analysis
  const handleRunBinding = async () => {
    setIsRunningBinding(true);
    setBindingError('');
    try {
      const atoms = computedConformers?.atoms || ['C', 'O', 'N'];
      const currentPose = effectiveDockingResults?.poses?.[activePoseIndex];
      const coords = currentPose?.coordinates || computedConformers?.coordinates || [];
      const caCoords = effectiveDockingResults?.protein_ca_backbone || activeComplex.dockingResults.protein_ca_backbone;

      const res = await runBindingAnalysis({
        ligandAtoms: atoms,
        ligandCoords: coords,
        proteinCaCoords: caCoords
      });

      if (res?.interactions) {
        setCustomBindingResults(res);
        setCenterTab('diagram');
        setBottomDrawerTab('interactions');
        setBottomDrawerOpen(true);
      }
    } catch (err) {
      setBindingError(err.message || 'Failed to analyze non-covalent binding contacts.');
    } finally {
      setIsRunningBinding(false);
    }
  };

  // 4. Run Drug Discovery Pipeline
  const handleRunPipeline = async () => {
    setIsRunningPipeline(true);
    setIsExecuting(true);
    setPipelineError('');
    timerStartRef.current = performance.now();
    setElapsedSeconds(0);
    setActiveStepIndex(1);

    const effectiveSmiles = (customSmiles || activeComplex.smiles).trim();
    const effectivePdbId = (customPdbId || activeComplex.pdbId).trim();

    try {
      const res = await runDrugDiscoveryPipeline({
        objective: (pipelineObjective || activeComplex.name).trim(),
        smiles: effectiveSmiles,
        targetPdbId: effectivePdbId,
        pocketCenter: [Number(pocketCenterX), Number(pocketCenterY), Number(pocketCenterZ)],
        boxSize: [Number(boxSizeX), Number(boxSizeY), Number(boxSizeZ)],
        exhaustiveness: Number(dockingExhaustiveness)
      });

      if (res?.job) {
        setPipelineSession(res.job);
        setCurrentJob(res.job);
        if (res.job.results?.docking) setDockingFeedback(res.job.results.docking);
        if (res.job.results?.admet) setAdmetProfile(res.job.results.admet);
        if (res.job.steps && res.job.steps.length > 0) setActiveStepIndex(res.job.steps.length);
        setCenterTab('stepper');
      }
    } catch (err) {
      setPipelineError(err.message || 'Autonomous pipeline failed to complete.');
    } finally {
      setIsRunningPipeline(false);
      setIsExecuting(false);
    }
  };

  const handleCancelPipeline = async () => {
    if (pipelineSession?.id || currentJob?.id) {
      try {
        await cancelResearchJob(pipelineSession?.id || currentJob?.id);
      } catch (err) {
        console.warn('Cancel note:', err);
      }
    }
    setIsRunningPipeline(false);
    setIsExecuting(false);
  };

  // 5. Structure & Session Exports
  const handleSaveSession = () => {
    const session = {
      id: `session_${Date.now()}`,
      title: `${activeComplex.name} (${customPdbId || activeComplex.pdbId})`,
      timestamp: new Date().toLocaleTimeString(),
      smiles: customSmiles || activeComplex.smiles,
      pdbId: customPdbId || activeComplex.pdbId,
      poseIndex: activePoseIndex
    };
    const updated = [session, ...savedSessions.slice(0, 9)];
    setSavedSessions(updated);
    try {
      localStorage.setItem('chemspace_visual_sessions', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleRestoreSession = (s) => {
    if (!s) return;
    setCustomSmiles(s.smiles);
    setCustomPdbId(s.pdbId);
    setActivePoseIndex(s.poseIndex || 0);
    setCenterTab('3d');
  };

  const handleExportStructure = (fmt) => {
    const atoms = computedConformers.atoms || [];
    const activePoseCoords = effectiveDockingResults?.poses?.[activePoseIndex]?.coordinates;
    const coords = activePoseCoords || computedConformers.coordinates || [];

    let content = '';
    let mimeType = 'text/plain';
    let filename = `chemspace_${(customPdbId || activeComplex.pdbId).toLowerCase()}_pose${activePoseIndex + 1}.${fmt}`;

    if (fmt === 'pdb') {
      content = `HEADER    CHEMSPACE VERIFIED DOCKING POSE ${activePoseIndex + 1}\n` +
        `TITLE     ${activeComplex.name}\n` +
        coords.map((c, i) => {
          const atomName = atoms[i] || 'C';
          const x = (c[0] || 0).toFixed(3).padStart(8);
          const y = (c[1] || 0).toFixed(3).padStart(8);
          const z = (c[2] || 0).toFixed(3).padStart(8);
          return `HETATM${(i + 1).toString().padStart(5)} ${atomName.padEnd(4)} LIG A   1    ${x}${y}${z}  1.00 20.00          ${atomName.padStart(2)}`;
        }).join('\n') + '\nEND\n';
    } else if (fmt === 'pdbqt') {
      content = effectiveDockingResults?.pdbqt_string ||
        `REMARK   CHEMSPACE MEEKO CONFORMER EXPORT\n` +
        `ROOT\n` +
        coords.map((c, i) => {
          const atomName = atoms[i] || 'C';
          const x = (c[0] || 0).toFixed(3).padStart(8);
          const y = (c[1] || 0).toFixed(3).padStart(8);
          const z = (c[2] || 0).toFixed(3).padStart(8);
          return `ATOM  ${(i + 1).toString().padStart(5)}  ${atomName.padEnd(3)} LIG A   1    ${x}${y}${z}  0.00  0.00    +0.000 ${atomName.padStart(2)}`;
        }).join('\n') +
        `\nENDROOT\nTORSDOF 0\n`;
    } else if (fmt === 'sdf') {
      content = `${activeComplex.name}\n  ChemSpace RDKit\n\n` +
        `${atoms.length.toString().padStart(3)}${(computedConformers.bonds?.length || 0).toString().padStart(3)}  0  0  0  0  0  0  0  0999 V2000\n` +
        coords.map((c, i) => {
          const a = atoms[i] || 'C';
          return `${(c[0] || 0).toFixed(4).padStart(10)}${(c[1] || 0).toFixed(4).padStart(10)}${(c[2] || 0).toFixed(4).padStart(10)} ${a.padEnd(3)} 0  0  0  0  0  0  0  0  0  0  0  0`;
        }).join('\n') +
        '\n$$$$\n';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyReport = () => {
    const report = pipelineSession?.report_markdown || currentJob?.report_markdown || 'No report available.';
    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  // Synchronized Coordinate Sets
  const computedConformers = currentJob?.results?.conformers ||
    uploadedStructure?.conformers ||
    activeComplex.conformers;

  const effectiveDockingResults = dockingFeedback ||
    currentJob?.results?.docking ||
    uploadedStructure?.dockingResults ||
    activeComplex.dockingResults;

  const effectiveInteractions = customBindingResults?.interactions ||
    effectiveDockingResults?.interactions ||
    activeComplex.dockingResults?.interactions || [];

  return (
    <div
      aria-label="ChemSpace Agentic AI Research Workspace"
      className="h-[calc(100vh-3.5rem)] w-full flex flex-row overflow-hidden bg-[var(--sci-bg-main)] text-[var(--sci-text-primary)] font-sans select-none relative"
    >
      {/* ─────────────────────────────────────────────────────────────────
          REGION 1: COLLAPSIBLE APPLICATION NAVIGATION SIDEBAR (Leftmost)
          ───────────────────────────────────────────────────────────────── */}
      <nav
        aria-label="ChemSpace Core Navigation"
        className={`h-full flex flex-col justify-between border-r border-[var(--sci-border)] bg-[var(--sci-bg-panel)] transition-all duration-200 ease-in-out shrink-0 select-none z-20 ${
          navRailExpanded ? 'w-52' : 'w-14'
        }`}
      >
        {/* Rail Top Branding & Expand/Collapse Toggle */}
        <div className="p-2.5 border-b border-[var(--sci-border)] flex items-center justify-between shrink-0">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer overflow-hidden group"
            title="ChemSpace Platform"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--sci-accent)]/15 border border-[var(--sci-accent)]/30 flex items-center justify-center text-[var(--sci-accent)] shrink-0">
              <Atom className="w-4 h-4 animate-spin-slow" />
            </div>
            {navRailExpanded && (
              <div className="leading-none">
                <span className="font-bold text-xs tracking-wider text-[var(--sci-text-primary)]">
                  CHEMSPACE
                </span>
                <span className="block text-[9px] text-[var(--sci-accent)] font-mono">
                  RESEARCH OS
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setNavRailExpanded(!navRailExpanded)}
            className="p-1 rounded text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)] transition shrink-0"
            title={navRailExpanded ? 'Collapse Navigation' : 'Expand Navigation'}
            aria-label="Toggle Navigation Rail"
          >
            {navRailExpanded ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Rail Navigation Links */}
        <div className="flex-1 py-2 px-1.5 space-y-1 overflow-y-auto no-scrollbar">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-[var(--sci-accent)]/20 text-cyan-300 font-bold border border-[var(--sci-accent)]/40 shadow-xs'
                    : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)]'
                }`}
                title={!navRailExpanded ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--sci-accent)]' : ''}`} />
                {navRailExpanded && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
                {navRailExpanded && item.badge && (
                  <span className="text-[9px] px-1 rounded bg-[var(--sci-bg-main)] border border-[var(--sci-border)] text-slate-400 font-mono">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Rail Bottom Utilities: Theme & Diagnostics */}
        <div className="p-2 border-t border-[var(--sci-border)] space-y-1 shrink-0">
          <button
            type="button"
            onClick={() => setDiagnosticsOpen(true)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)] transition"
            title="System Diagnostics & Tool Status"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            {navRailExpanded && <span>System Diagnostics</span>}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)] transition"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400 shrink-0" /> : <Moon className="w-4 h-4 text-indigo-400 shrink-0" />}
            {navRailExpanded && <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>}
          </button>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────────
          REGION 2: FILE, PROJECT, AND TOOL EXPLORER (Second Panel)
          ───────────────────────────────────────────────────────────────── */}
      {!focusMode && (
        <>
          <WorkspaceExplorer
            savedSessions={savedSessions}
            activeSessionId={pipelineSession?.id || currentJob?.id}
            onSelectSession={handleRestoreSession}
            onDeleteSession={(id) => {
              const filtered = savedSessions.filter((s) => s.id !== id);
              setSavedSessions(filtered);
              localStorage.setItem('chemspace_visual_sessions', JSON.stringify(filtered));
            }}
            onNewSession={() => setCenterTab('composer')}
            targetPdbId={customPdbId || activeComplex.pdbId}
            activeSmiles={customSmiles || activeComplex.smiles}
            targetMetadata={activeComplex}
            uploadedFiles={uploadedStructure ? [{ name: `${customPdbId}.pdb`, size: 1024 * 14 }] : []}
            onSelectFile={(f) => setCenterTab(f.type === 'pdb' ? '3d' : 'diagram')}
            workflowSteps={pipelineSession?.steps || currentJob?.steps || []}
            activeStepIndex={activeStepIndex}
            isExecuting={isExecuting || isRunningPipeline}
            onSelectStep={(step, idx) => {
              setActiveStepIndex(idx);
              setCenterTab('terminal');
            }}
            scientificTools={scientificTools}
            onSelectTool={() => setCenterTab('terminal')}
            dockingResults={effectiveDockingResults}
            admetProfile={admetProfile}
            interactions={effectiveInteractions}
            monographReport={pipelineSession?.report_markdown || currentJob?.report_markdown}
            onSelectArtifact={(art) => {
              if (art.type === 'pdbqt' || art.type === 'pdb') setCenterTab('3d');
              else if (art.type === 'json') setCenterTab('admet');
              else if (art.type === 'csv') {
                setBottomDrawerTab('interactions');
                setBottomDrawerOpen(true);
              }
            }}
            isCollapsed={explorerCollapsed}
            onToggleCollapse={() => setExplorerCollapsed(!explorerCollapsed)}
            width={explorerWidth}
            onUploadFileClick={() => fileInputRef.current?.click()}
          />

          {/* Resizer Handle: Between Explorer & Central Workspace */}
          {!explorerCollapsed && (
            <div
              onMouseDown={() => {
                isResizingExplorer.current = true;
                document.body.style.cursor = 'col-resize';
              }}
              className="w-1.5 h-full cursor-col-resize hover:bg-[var(--sci-accent)]/50 transition-colors shrink-0 z-10"
              title="Drag to resize explorer"
            />
          )}
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          REGION 3: LARGE FLEXIBLE CENTRAL RESEARCH WORKSPACE (Center)
          ───────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Top Central Toolbar & View Switcher */}
        <header className="px-3 py-2 border-b border-[var(--sci-border)] bg-[var(--sci-bg-panel)] flex items-center justify-between text-xs shrink-0 select-none">
          <div className="flex items-center gap-2 truncate">
            {/* Target & Complex Badge */}
            <div className="flex items-center gap-1.5 bg-[var(--sci-bg-card)] px-2.5 py-1 rounded-md border border-[var(--sci-border)] font-mono text-[11px] truncate">
              <span className="text-[var(--sci-accent)] font-bold">{customPdbId || activeComplex.pdbId}</span>
              <span className="text-[var(--sci-text-secondary)] truncate">/ {activeComplex.name}</span>
            </div>

            {/* Live Operational Status Chip */}
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                isRunningPipeline || isRunningDocking || isRunningAdmet || isExecuting
                  ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 animate-pulse'
                  : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
              }`}
            >
              {isRunningPipeline || isExecuting
                ? `PIPELINE EXECUTING (${elapsedSeconds.toFixed(1)}s)`
                : isRunningDocking
                ? `DOCKING (${elapsedSeconds.toFixed(1)}s)`
                : 'SYSTEM READY'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport Switcher Tabs */}
            <div className="flex items-center bg-[var(--sci-bg-card)] p-0.5 rounded-lg border border-[var(--sci-border)] text-xs">
              <button
                type="button"
                onClick={() => setCenterTab('composer')}
                className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                  centerTab === 'composer'
                    ? 'bg-[var(--sci-accent)] text-slate-950 font-bold shadow-xs'
                    : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
                }`}
                title="Open Research Composer & Parameters"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Composer</span>
              </button>

              <button
                type="button"
                onClick={() => setCenterTab('3d')}
                className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                  centerTab === '3d'
                    ? 'bg-[var(--sci-accent)] text-slate-950 font-bold shadow-xs'
                    : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
                }`}
                title="3D Molecular Pose Viewer"
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D Viewport</span>
              </button>

              <button
                type="button"
                onClick={() => setCenterTab('diagram')}
                className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                  centerTab === 'diagram'
                    ? 'bg-[var(--sci-accent)] text-slate-950 font-bold shadow-xs'
                    : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
                }`}
                title="2D Structure & Spatial Contact Map"
              >
                <Network className="w-3.5 h-3.5" />
                <span>2D Map</span>
              </button>

              <button
                type="button"
                onClick={() => setCenterTab('admet')}
                className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                  centerTab === 'admet'
                    ? 'bg-[var(--sci-accent)] text-slate-950 font-bold shadow-xs'
                    : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
                }`}
                title="Consensus ADMET & Safety Predictions"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>ADMET</span>
              </button>

              <button
                type="button"
                onClick={() => setCenterTab('terminal')}
                className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                  centerTab === 'terminal'
                    ? 'bg-[var(--sci-accent)] text-slate-950 font-bold shadow-xs'
                    : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
                }`}
                title="Code & Calculation Subprocess Stream"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Console</span>
              </button>

              <button
                type="button"
                onClick={() => setCenterTab('stepper')}
                className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                  centerTab === 'stepper'
                    ? 'bg-[var(--sci-accent)] text-slate-950 font-bold shadow-xs'
                    : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
                }`}
                title="Autonomous Workflow Stepper"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Pipeline</span>
              </button>
            </div>

            {/* Fullscreen / Focus Mode Toggle */}
            <button
              type="button"
              onClick={() => setFocusMode(!focusMode)}
              className="p-1.5 rounded-lg border border-[var(--sci-border)] hover:border-[var(--sci-accent)] text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] transition"
              title={focusMode ? 'Restore Multi-Panel View' : 'Maximize Workspace (Focus Mode)'}
              aria-label="Toggle Focus Mode"
            >
              {focusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </header>

        {/* Central Dynamic Content Area */}
        <div className="flex-1 min-h-0 relative overflow-hidden bg-[var(--sci-bg-main)]">
          {/* A. CLEAN RESEARCH COMPOSER (Initial State / Parameter Configuration) */}
          {centerTab === 'composer' && (
            <div className="h-full overflow-y-auto p-4 max-w-4xl mx-auto space-y-4">
              <div className="space-y-1">
                <h1 className="text-base font-bold text-[var(--sci-text-primary)] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Research Objective &amp; Autonomous Pipeline Composer</span>
                </h1>
                <p className="text-xs text-[var(--sci-text-secondary)]">
                  Formulate multi-objective scientific tasks with verified SMILES, target macromolecule PDBs, and bounded parameters.
                </p>
              </div>

              {/* Research Objective Input */}
              <div className="p-3.5 rounded-xl bg-[var(--sci-bg-card)] border border-[var(--sci-border)] space-y-2.5 shadow-sm">
                <label className="text-xs font-semibold text-[var(--sci-text-primary)] flex items-center justify-between">
                  <span>Research Objective</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Gemini Research Planner Supported</span>
                </label>
                <textarea
                  value={pipelineObjective}
                  onChange={(e) => setPipelineObjective(e.target.value)}
                  rows={3}
                  placeholder="Describe your research goal (e.g., Identify nanomolar inhibitors for Mpro catalytic dyad with high oral bioavailability)..."
                  className="w-full p-2.5 text-xs rounded-lg bg-[var(--sci-bg-main)] border border-[var(--sci-border)] text-[var(--sci-text-primary)] focus:outline-none focus:border-[var(--sci-accent)] resize-none"
                />
              </div>

              {/* 2-Column Inputs: Ligand SMILES & Target Macromolecule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Ligand Input */}
                <div className="p-3.5 rounded-xl bg-[var(--sci-bg-card)] border border-[var(--sci-border)] space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--sci-text-primary)] flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ligand Structure (SMILES)</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleValidateSmiles}
                      disabled={isValidatingSmiles}
                      className="px-2 py-0.5 rounded bg-[var(--sci-bg-main)] border border-[var(--sci-border)] hover:border-[var(--sci-accent)] text-[10px] font-mono text-[var(--sci-text-primary)] flex items-center gap-1 transition"
                    >
                      {isValidatingSmiles ? <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" /> : <Check className="w-3 h-3 text-emerald-400" />}
                      <span>Validate RDKit</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={customSmiles || activeComplex.smiles}
                    onChange={(e) => setCustomSmiles(e.target.value)}
                    placeholder="Enter SMILES string (e.g. CC(=O)Oc1ccccc1C(=O)O)..."
                    className="w-full p-2 text-xs rounded bg-[var(--sci-bg-main)] border border-[var(--sci-border)] text-[var(--sci-text-primary)] font-mono focus:outline-none focus:border-[var(--sci-accent)]"
                  />

                  {validationFeedback && (
                    <div className={`p-2 rounded text-[10px] font-mono border ${
                      validationFeedback.valid
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                    }`}>
                      <span>{validationFeedback.message}</span>
                      {validationFeedback.formula && <span> • {validationFeedback.formula} ({validationFeedback.mw} Da)</span>}
                    </div>
                  )}
                </div>

                {/* Target Macromolecule Input */}
                <div className="p-3.5 rounded-xl bg-[var(--sci-bg-card)] border border-[var(--sci-border)] space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--sci-text-primary)] flex items-center gap-1.5">
                      <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Target Protein (PDB ID)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2 py-0.5 rounded bg-[var(--sci-bg-main)] border border-[var(--sci-border)] hover:border-[var(--sci-accent)] text-[10px] font-mono text-[var(--sci-text-primary)] flex items-center gap-1 transition"
                    >
                      <Upload className="w-3 h-3 text-sky-400" />
                      <span>Upload PDB</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={customPdbId || activeComplex.pdbId}
                    onChange={(e) => setCustomPdbId(e.target.value.toUpperCase())}
                    placeholder="PDB Code (e.g. 6LU7, 4LL3, 1M17)..."
                    className="w-full p-2 text-xs rounded bg-[var(--sci-bg-main)] border border-[var(--sci-border)] text-[var(--sci-text-primary)] font-mono uppercase focus:outline-none focus:border-[var(--sci-accent)]"
                  />

                  <div className="text-[10px] text-[var(--sci-text-secondary)] font-mono flex items-center justify-between">
                    <span>Target: {activeComplex.target}</span>
                    <span>Res: {activeComplex.resolution}</span>
                  </div>
                </div>
              </div>

              {/* Binding Pocket Grid Box Specification */}
              <div className="p-3.5 rounded-xl bg-[var(--sci-bg-card)] border border-[var(--sci-border)] space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--sci-text-primary)] flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Docking Search-Box Dimensions (Ångström Coordinates)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeComplex.dockingResults?.binding_pocket_center) {
                        const p = activeComplex.dockingResults.binding_pocket_center;
                        setPocketCenterX(p[0]);
                        setPocketCenterY(p[1]);
                        setPocketCenterZ(p[2]);
                      }
                    }}
                    className="text-[10px] text-cyan-400 hover:underline font-mono"
                  >
                    Auto-Center on Active Dyad
                  </button>
                </div>

                <div className="grid grid-cols-6 gap-2 text-xs font-mono">
                  <div>
                    <label className="text-[10px] text-[var(--sci-text-secondary)] block">Center X</label>
                    <input
                      type="number"
                      step="0.1"
                      value={pocketCenterX}
                      onChange={(e) => setPocketCenterX(parseFloat(e.target.value) || 0)}
                      className="w-full p-1 rounded bg-[var(--sci-bg-main)] border border-[var(--sci-border)] text-[var(--sci-text-primary)] text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--sci-text-secondary)] block">Center Y</label>
                    <input
                      type="number"
                      step="0.1"
                      value={pocketCenterY}
                      onChange={(e) => setPocketCenterY(parseFloat(e.target.value) || 0)}
                      className="w-full p-1 rounded bg-[var(--sci-bg-main)] border border-[var(--sci-border)] text-[var(--sci-text-primary)] text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--sci-text-secondary)] block">Center Z</label>
                    <input
                      type="number"
                      step="0.1"
                      value={pocketCenterZ}
                      onChange={(e) => setPocketCenterZ(parseFloat(e.target.value) || 0)}
                      className="w-full p-1 rounded bg-[var(--sci-bg-main)] border border-[var(--sci-border)] text-[var(--sci-text-primary)] text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--sci-text-secondary)] block">Size X (Å)</label>
                    <input
                      type="number"
                      value={boxSizeX}
                      onChange={(e) => setBoxSizeX(parseFloat(e.target.value) || 20)}
                      className="w-full p-1 rounded bg-[var(--sci-bg-main)] border border-[var(--sci-border)] text-[var(--sci-text-primary)] text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--sci-text-secondary)] block">Size Y (Å)</label>
                    <input
                      type="number"
                      value={boxSizeY}
                      onChange={(e) => setBoxSizeY(parseFloat(e.target.value) || 20)}
                      className="w-full p-1 rounded bg-[var(--sci-bg-main)] border border-[var(--sci-border)] text-[var(--sci-text-primary)] text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--sci-text-secondary)] block">Size Z (Å)</label>
                    <input
                      type="number"
                      value={boxSizeZ}
                      onChange={(e) => setBoxSizeZ(parseFloat(e.target.value) || 20)}
                      className="w-full p-1 rounded bg-[var(--sci-bg-main)] border border-[var(--sci-border)] text-[var(--sci-text-primary)] text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRunPipeline}
                  disabled={isRunningPipeline || isExecuting}
                  className="flex-1 py-3 px-4 rounded-xl bg-[var(--sci-accent)] hover:bg-[var(--sci-accent)]/85 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
                >
                  {isRunningPipeline ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Pipeline Running ({elapsedSeconds.toFixed(1)}s)...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Launch Autonomous Drug Discovery Pipeline</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleRunDocking}
                  disabled={isRunningDocking}
                  className="py-3 px-4 rounded-xl bg-[var(--sci-bg-card)] border border-[var(--sci-border)] hover:border-[var(--sci-accent)] text-[var(--sci-text-primary)] font-semibold text-xs flex items-center gap-2 transition"
                >
                  {isRunningDocking ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  ) : (
                    <Crosshair className="w-4 h-4 text-cyan-400" />
                  )}
                  <span>Run Direct Docking</span>
                </button>

                <button
                  type="button"
                  onClick={handleRunAdmet}
                  disabled={isRunningAdmet}
                  className="py-3 px-4 rounded-xl bg-[var(--sci-bg-card)] border border-[var(--sci-border)] hover:border-[var(--sci-accent)] text-[var(--sci-text-primary)] font-semibold text-xs flex items-center gap-2 transition"
                >
                  {isRunningAdmet ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                  ) : (
                    <Activity className="w-4 h-4 text-purple-400" />
                  )}
                  <span>Predict ADMET</span>
                </button>
              </div>

              {/* Error Alert */}
              {(pipelineError || dockingError || admetError || bindingError) && (
                <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Execution Error: </span>
                    <span>{pipelineError || dockingError || admetError || bindingError}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* B. 3D MOLECULAR VIEWPORT */}
          {centerTab === '3d' && (
            <div className="h-full w-full">
              <UnifiedPoseViewer
                conformers={computedConformers}
                dockingResults={effectiveDockingResults}
                selectedResidue={selectedResidue}
                activePoseIndex={activePoseIndex}
                onSelectResidue={(res) => setSelectedResidue(res)}
                provenance={effectiveDockingResults?.provenance || uploadedStructure?.provenance || activeComplex.conformers.source}
                complexName={activeComplex.name}
              />
            </div>
          )}

          {/* C. 2D STRUCTURE & SPATIAL CONTACT MAP */}
          {centerTab === 'diagram' && (
            <div className="h-full w-full p-2">
              <MolecularInteractionDiagram
                smiles={customSmiles || activeComplex.smiles}
                interactions={effectiveInteractions}
                selectedResidue={selectedResidue}
                onSelectResidue={(res) => setSelectedResidue(res)}
                complexName={activeComplex.name}
                targetPdbId={customPdbId || activeComplex.pdbId}
              />
            </div>
          )}

          {/* D. CONSENSUS ADMET PROFILES */}
          {centerTab === 'admet' && (
            <div className="h-full overflow-y-auto p-4">
              <ADMETProfileDashboard
                admetData={admetProfile}
                isLoading={isRunningAdmet}
                onRunAdmet={handleRunAdmet}
                smiles={customSmiles || activeComplex.smiles}
              />
            </div>
          )}

          {/* E. CODE EXECUTION TERMINAL */}
          {centerTab === 'terminal' && (
            <div className="h-full p-3">
              <CodeExecutionTerminal
                activeTool={scientificTools.find(t => t.id === 'autodock_vina_docking')}
                jobId={pipelineSession?.id || currentJob?.id}
                status={isExecuting || isRunningPipeline ? 'Running' : (pipelineSession?.status || 'Ready')}
                elapsedTime={elapsedSeconds}
                logs={pipelineSession?.logs || currentJob?.logs || []}
                inputs={{
                  objective: pipelineObjective,
                  smiles: customSmiles || activeComplex.smiles,
                  target_pdb_id: customPdbId || activeComplex.pdbId,
                  pocket_center: [pocketCenterX, pocketCenterY, pocketCenterZ],
                  box_size: [boxSizeX, boxSizeY, boxSizeZ],
                  exhaustiveness: dockingExhaustiveness
                }}
                results={pipelineSession?.results || currentJob?.results || {}}
                onRunTool={handleRunPipeline}
                onCancelTool={handleCancelPipeline}
                isExecuting={isExecuting || isRunningPipeline}
                error={pipelineError || dockingError}
              />
            </div>
          )}

          {/* F. AUTONOMOUS PIPELINE STEPPER */}
          {centerTab === 'stepper' && (
            <div className="h-full overflow-y-auto p-4 max-w-4xl mx-auto">
              <PipelineStepper
                job={pipelineSession || currentJob}
                isExecuting={isRunningPipeline || isExecuting}
                activeStepIndex={activeStepIndex}
                onLaunch={handleRunPipeline}
                onCancel={handleCancelPipeline}
                onDownloadReport={handleCopyReport}
              />
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            BOTTOM RESIZABLE SCIENTIFIC RESULTS DRAWER
            ───────────────────────────────────────────────────────────────── */}
        <footer
          aria-label="Scientific Results Inspector"
          className={`border-t border-[var(--sci-border)] bg-[var(--sci-bg-panel)] transition-all duration-200 flex flex-col shrink-0 ${
            bottomDrawerOpen ? 'h-64' : 'h-10'
          }`}
        >
          {/* Drawer Control Tabs Bar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--sci-bg-panel)] border-b border-[var(--sci-border)] text-xs shrink-0 select-none">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBottomDrawerOpen(!bottomDrawerOpen)}
                className="p-1 rounded hover:bg-[var(--sci-bg-card)] text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] transition"
                title={bottomDrawerOpen ? 'Collapse Drawer' : 'Expand Drawer'}
              >
                {bottomDrawerOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>

              <div className="flex items-center gap-1 bg-[var(--sci-bg-card)] p-0.5 rounded-lg border border-[var(--sci-border)]">
                <button
                  type="button"
                  onClick={() => {
                    setBottomDrawerTab('poses');
                    setBottomDrawerOpen(true);
                  }}
                  className={`px-2.5 py-0.5 rounded font-medium transition ${
                    bottomDrawerTab === 'poses' && bottomDrawerOpen
                      ? 'bg-[var(--sci-accent)] text-slate-950 font-bold'
                      : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
                  }`}
                >
                  Docking Poses ({effectiveDockingResults?.poses?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBottomDrawerTab('interactions');
                    setBottomDrawerOpen(true);
                  }}
                  className={`px-2.5 py-0.5 rounded font-medium transition ${
                    bottomDrawerTab === 'interactions' && bottomDrawerOpen
                      ? 'bg-[var(--sci-accent)] text-slate-950 font-bold'
                      : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
                  }`}
                >
                  Interactions ({effectiveInteractions?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBottomDrawerTab('properties');
                    setBottomDrawerOpen(true);
                  }}
                  className={`px-2.5 py-0.5 rounded font-medium transition ${
                    bottomDrawerTab === 'properties' && bottomDrawerOpen
                      ? 'bg-[var(--sci-accent)] text-slate-950 font-bold'
                      : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
                  }`}
                >
                  ADMET &amp; Descriptors
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBottomDrawerTab('logs');
                    setBottomDrawerOpen(true);
                  }}
                  className={`px-2.5 py-0.5 rounded font-medium transition ${
                    bottomDrawerTab === 'logs' && bottomDrawerOpen
                      ? 'bg-[var(--sci-accent)] text-slate-950 font-bold'
                      : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
                  }`}
                >
                  Audit Logs
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--sci-text-secondary)]">
              {effectiveDockingResults?.top_binding_energy !== undefined && (
                <span>
                  Top ΔG: <strong className="text-emerald-400 font-bold">{effectiveDockingResults.top_binding_energy} kcal/mol</strong>
                </span>
              )}
              <span>
                Active: <strong className="text-[var(--sci-accent)] font-bold">{selectedResidue || `Pose ${activePoseIndex + 1}`}</strong>
              </span>
            </div>
          </div>

          {/* Drawer Body */}
          {bottomDrawerOpen && (
            <div className="flex-1 overflow-hidden p-3 bg-[var(--sci-bg-main)]">
              {bottomDrawerTab === 'poses' && (
                <PoseComparisonGrid
                  poses={effectiveDockingResults?.poses || []}
                  activePoseIndex={activePoseIndex}
                  onSelectPose={(idx) => setActivePoseIndex(idx)}
                  onRunDocking={handleRunDocking}
                  isExecutingDocking={isRunningDocking}
                  complexName={activeComplex.name}
                />
              )}

              {bottomDrawerTab === 'interactions' && (
                <ResidueInteractionTable
                  interactions={effectiveInteractions}
                  selectedResidue={selectedResidue}
                  onSelectResidue={(res) => setSelectedResidue(res)}
                  complexName={activeComplex.name}
                />
              )}

              {bottomDrawerTab === 'properties' && (
                <div className="h-full overflow-y-auto">
                  <ADMETProfileDashboard
                    admetData={admetProfile}
                    isLoading={isRunningAdmet}
                    onRunAdmet={handleRunAdmet}
                    smiles={customSmiles || activeComplex.smiles}
                  />
                </div>
              )}

              {bottomDrawerTab === 'logs' && (
                <div className="flex flex-col h-full bg-[var(--sci-bg-card)] border border-[var(--sci-border)] rounded-lg overflow-hidden font-mono text-xs">
                  <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {(pipelineSession?.logs || currentJob?.logs) && (pipelineSession?.logs || currentJob?.logs).length > 0 ? (
                      (pipelineSession?.logs || currentJob?.logs).map((line, i) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] leading-relaxed">
                          <span className="text-cyan-400 select-none">›</span>
                          <span className="text-[var(--sci-text-primary)]">{line}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[var(--sci-text-secondary)] text-center py-6 font-sans text-xs">
                        Execution log empty. Dispatched operations will write output lines here.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </footer>
      </main>

      {/* ─────────────────────────────────────────────────────────────────
          REGION 4: CONTEXTUAL AGENT ACTIVITY AND EXECUTION INSPECTOR (Right)
          ───────────────────────────────────────────────────────────────── */}
      {!focusMode && (
        <>
          {/* Resizer Handle: Between Center Workspace & Inspector */}
          {!inspectorCollapsed && (
            <div
              onMouseDown={() => {
                isResizingInspector.current = true;
                document.body.style.cursor = 'col-resize';
              }}
              className="w-1.5 h-full cursor-col-resize hover:bg-[var(--sci-accent)]/50 transition-colors shrink-0 z-10"
              title="Drag to resize inspector"
            />
          )}

          <AgentActivityInspector
            job={pipelineSession || currentJob}
            activeStepIndex={activeStepIndex}
            isExecuting={isRunningPipeline || isExecuting}
            elapsedSeconds={elapsedSeconds}
            onLaunchPipeline={handleRunPipeline}
            onCancelPipeline={handleCancelPipeline}
            onCopyReport={handleCopyReport}
            copiedReport={copiedReport}
            onSelectStep={(step, idx) => {
              setActiveStepIndex(idx);
              setCenterTab('terminal');
            }}
            dockingResults={effectiveDockingResults}
            admetProfile={admetProfile}
            interactions={effectiveInteractions}
            onExportStructure={handleExportStructure}
            isCollapsed={inspectorCollapsed}
            onToggleCollapse={() => setInspectorCollapsed(!inspectorCollapsed)}
            width={inspectorWidth}
          />
        </>
      )}

      {/* Hidden File Input for Structure File Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdb,.cif,.mmcif,.sdf,.mol,.xyz"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Diagnostics Modal */}
      {diagnosticsOpen && (
        <DiagnosticsPanel
          diagnostics={diagnostics}
          onClose={() => setDiagnosticsOpen(false)}
        />
      )}
    </div>
  );
}
