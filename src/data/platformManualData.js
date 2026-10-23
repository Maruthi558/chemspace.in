/**
 * ChemSpace Platform User Manual & Operational Guide Data
 * Written in simple, clear, easy-to-understand language for students,
 * researchers, and new users to understand how the entire website works
 * and what every button click does.
 */

export const MANUAL_NOTIFICATION_INFO = {
  title: 'ChemSpace Platform User Manual & Operational Guide',
  subtitle: 'Official Step-by-Step Interactive Platform Documentation',
  agreementText:
    'Welcome to the ChemSpace Operational Manual! This guide explains in simple, everyday language how to use every tool, draw molecules, simulate reactions, run AI models, and understand what every button on this platform does. Please click "I Agree & Open Manual" to enter the interactive guide.',
  highlights: [
    {
      title: 'Easy to Understand',
      desc: 'Written in simple, clear words so beginners and experts can learn quickly.'
    },
    {
      title: 'Every Button Explained',
      desc: 'Learn exactly what happens when you click any button on any page.'
    },
    {
      title: 'Live Lab Testing',
      desc: 'Click "Try It in Lab" inside any chapter to jump right into that workspace.'
    },
    {
      title: 'Search Anything',
      desc: 'Quick search bar allows you to type any button name or question to find the answer.'
    }
  ]
};

export const MANUAL_CHAPTERS = [
  {
    id: 'getting_started',
    title: '1. Getting Started & Platform Navigation',
    shortTitle: 'Getting Started',
    badge: 'Core Guide',
    icon: 'Compass',
    route: '/',
    simpleSummary:
      'ChemSpace is an all-in-one digital chemistry laboratory on your computer or phone. You can draw molecules, run AI predictions, study chemical reactions, test medicines, and inspect periodic elements with zero software installation.',
    howToUse: [
      {
        step: 1,
        title: 'Use the Left Sidebar to Switch Labs',
        desc: 'On the left side of your screen is the main sidebar menu. Click any tool name (like "AI Workspace", "ChemDraw", or "ARXN") to open that lab immediately.'
      },
      {
        step: 2,
        title: 'Collapse or Expand the Sidebar',
        desc: 'Click the collapse button (<|) at the top of the sidebar if you want more room on your screen to draw or inspect 3D models.'
      },
      {
        step: 3,
        title: 'Switch Dark and Light Themes',
        desc: 'Click the Sun/Moon button at the bottom of the sidebar or top header to toggle between obsidian dark mode (gentle on eyes in dark rooms) and ceramic light mode (clean white background).'
      },
      {
        step: 4,
        title: 'Use Global Search (/ key)',
        desc: 'Press the "/" key on your keyboard or click the search box at the top to type any molecule name (e.g., "aspirin", "caffeine") or tool name to jump there instantly.'
      }
    ],
    buttons: [
      {
        name: 'AI Workspace Flagship Button',
        icon: 'Bot',
        location: 'Top Navigation Header & Sidebar',
        whatItDoes: 'Opens the multimodal AI drug discovery and chemistry reasoning studio.',
        tip: 'Look for the glowing cyan pulse indicator.'
      },
      {
        name: 'ChemSpace AI Copilot',
        icon: 'Sparkles',
        location: 'Top Header & Bottom Right Launcher',
        whatItDoes: 'Opens a floating conversational AI assistant window where you can ask quick chemistry questions or speak via microphone.',
        tip: 'You can drag the window anywhere on your screen.'
      },
      {
        name: 'Vision Controls',
        icon: 'Hand',
        location: 'Top Header Bar',
        whatItDoes: 'Opens touchless webcam gesture settings so you can control the site with your hand in the air without touching a mouse.',
        tip: 'Ideal when your hands are occupied in a wet laboratory.'
      },
      {
        name: 'Sign In / User Workspace',
        icon: 'LogIn',
        location: 'Top Right Header',
        whatItDoes: 'Sign in with your Google account or email to save your drawn molecules, experiments, and history.',
        tip: 'All your work stays safe and synchronized across your devices.'
      }
    ],
    examples: [
      'Want to sketch a quick molecule? Click "ChemDraw CAD" in the sidebar.',
      'Need to know how a reaction works? Click "ARXN" in the sidebar.',
      'Have a photo of a chemical structure on your phone? Click "AI Workspace" and attach the photo.'
    ]
  },
  {
    id: 'ai_workspace',
    title: '2. AI Workspace (Autonomous Multi-Tool Agent)',
    shortTitle: 'AI Workspace',
    badge: 'Agentic AI',
    icon: 'Bot',
    route: '/ai-workspace',
    simpleSummary:
      'The AI Workspace is your personal computational chemistry research assistant. Type any question in plain English or upload a picture of a chemical structure. The AI breaks down the task, builds 3D conformers, checks safety, and generates full synthesis steps.',
    howToUse: [
      {
        step: 1,
        title: 'Type a Question or Pick a Preset',
        desc: 'At the bottom of the left screen, type any request into the box (e.g., "Synthesize Paracetamol from 4-aminophenol") or click one of the preset pills like "PROTAC Degrader" or "Caffeine".'
      },
      {
        step: 2,
        title: 'Attach an Image (Optional)',
        desc: 'Click the image icon to upload any screenshot or photograph of a chemical formula. The AI extracts the structure automatically.'
      },
      {
        step: 3,
        title: 'Choose Your AI Engine',
        desc: 'Click the model selector pill in the top bar to choose between Gemini 2.5 Flash, BioNeMo (docking), RDKit (2D graphs), PySCF (quantum orbitals), or ARXN (reaction synthesis).'
      },
      {
        step: 4,
        title: 'Click Run or Press Enter',
        desc: 'Click the "Run" button or hit Enter. Watch the 7 sequential stages complete, and inspect the interactive 3D molecule on the right stage.'
      }
    ],
    buttons: [
      {
        name: 'Run Button (Paper Plane / Send)',
        icon: 'Send',
        location: 'Bottom Right of Prompt Input',
        whatItDoes: 'Submits your question and runs the 7-step autonomous chemistry calculation pipeline.',
        tip: 'Disabled while an execution is running to prevent duplicate calls.'
      },
      {
        name: 'Attach Image Button',
        icon: 'Image',
        location: 'Bottom Input Line',
        whatItDoes: 'Opens your file picker to select a PNG, JPG, or SVG image of a chemical structure or reaction.',
        tip: 'Great for taking pictures of textbook reactions.'
      },
      {
        name: 'Voice Dictation Button (Microphone)',
        icon: 'Mic',
        location: 'Bottom Input Line',
        whatItDoes: 'Activates your microphone so you can speak your prompt aloud. Click again to stop listening.',
        tip: 'Ensure your browser has microphone permission enabled.'
      },
      {
        name: 'Model Selector Dropdown',
        icon: 'ChevronDown',
        location: 'Top Left of AI Workspace Header',
        whatItDoes: 'Lets you select the specialized AI computational engine for your task.',
        tip: 'DeepChem is best for general questions; BioNeMo is best for protein docking.'
      },
      {
        name: 'Active Molecule Dropdown',
        icon: 'Atom',
        location: 'Top Bar of AI Workspace',
        whatItDoes: 'Quickly switches the right stage to show different clinical drug candidates (PROTAC, Osimertinib, Paxlovid, Aspirin, etc.).',
        tip: 'Changing molecules updates the 3D viewer instantly.'
      },
      {
        name: 'Turbo Mode Toggle (⚡ Fast Verify)',
        icon: 'Zap',
        location: 'Top Bar of AI Workspace',
        whatItDoes: 'Toggles fast verification mode (~0.45s rapid responses) vs deep calculation mode.',
        tip: 'Keep Turbo on for lightning-fast study sessions.'
      },
      {
        name: 'Reset Button',
        icon: 'RotateCcw',
        location: 'Top Right of AI Workspace Header',
        whatItDoes: 'Clears the current chat transcript and resets the workspace back to its initial state.',
        tip: 'Use when you want to start a brand new research topic.'
      },
      {
        name: '3D Stage Tab',
        icon: 'Box',
        location: 'Right Pane Top Tabs',
        whatItDoes: 'Displays the interactive 3D molecule and receptor cavity. Click and drag with mouse to spin; scroll to zoom.',
        tip: 'Hold Shift + drag to pan the view.'
      },
      {
        name: '2D Image Tab',
        icon: 'Image',
        location: 'Right Pane Top Tabs',
        whatItDoes: 'Displays a crisp PubChem vector 2D chemical drawing with formula, MW, and copyable canonical SMILES.',
        tip: 'Click "Download Image" to save the picture to your computer.'
      },
      {
        name: 'Reactions & Synthesis Tab',
        icon: 'FlaskConical',
        location: 'Right Pane Top Tabs',
        whatItDoes: 'Shows the step-by-step laboratory synthesis recipe: starting materials, reagents, temperature, and expected yields.',
        tip: 'Useful for practical organic chemistry synthesis.'
      },
      {
        name: 'Download PDB Button',
        icon: 'Download',
        location: 'Top Right of Stage Tabs',
        whatItDoes: 'Downloads the complete 3D Protein Data Bank (.pdb) Cartesian coordinate file for use in PyMOL or Chimera.',
        tip: 'Compatible with standard molecular visualization software.'
      },
      {
        name: 'Copy Report Button',
        icon: 'Copy',
        location: 'Top Right of Stage Tabs',
        whatItDoes: 'Copies the complete scientific drug discovery monograph into your clipboard so you can paste it into Word, Google Docs, or LaTeX.',
        tip: 'Turned into green checkmark upon copying.'
      }
    ],
    examples: [
      'Prompt: "Design an oral GLP-1 receptor agonist and check oral bioavailability"',
      'Prompt: "Explain the mechanism of Aspirin inhibiting COX-1 enzymes"',
      'Prompt: "Synthesize Caffeine from theophylline with step-by-step reagents"'
    ]
  },
  {
    id: 'chemdraw',
    title: '3. ChemDraw 2D/3D Molecular CAD Studio',
    shortTitle: 'ChemDraw CAD',
    badge: '2D/3D Sketch',
    icon: 'PenTool',
    route: '/chemdraw',
    simpleSummary:
      'ChemDraw is your digital molecular drafting table. Draw bonds, add atoms like Carbon, Nitrogen, and Oxygen, snap benzene rings, and convert your 2D sketch into a spinning 3D molecule with one click.',
    howToUse: [
      {
        step: 1,
        title: 'Select a Bond Tool',
        desc: 'Click "Single Bond" (or Double, Triple, Wedge) from the left tool palette.'
      },
      {
        step: 2,
        title: 'Click and Drag on the Canvas',
        desc: 'Click anywhere on the drafting grid and drag to create bonds at clean 120° angles. Click an existing atom to sprout a new branch.'
      },
      {
        step: 3,
        title: 'Choose Different Elements',
        desc: 'Click any element pill from the bottom palette (e.g., C, H, O, N, S, Cl, Br) to switch the active atom type.'
      },
      {
        step: 4,
        title: 'Click Clean 2D or View 3D',
        desc: 'Click "Clean 2D" to automatically straighten bond lengths, or click "3D Conformer" to watch your drawing turn into a 3D ball-and-stick model.'
      }
    ],
    buttons: [
      {
        name: 'Select / Move Tool',
        icon: 'MousePointer2',
        location: 'Left Toolbar',
        whatItDoes: 'Allows you to click and drag atoms or bonds around the canvas to reposition them.',
        tip: 'Shortcut: Press "S" on keyboard.'
      },
      {
        name: 'Single / Double / Triple Bond Tools',
        icon: 'Minus',
        location: 'Left Toolbar',
        whatItDoes: 'Draws standard covalent bonds. Double clicking a single bond upgrades it to a double bond.',
        tip: 'Double bonds toggle between cis and trans configuration.'
      },
      {
        name: 'Wedge & Dash Stereo Bonds',
        icon: 'Play',
        location: 'Left Toolbar',
        whatItDoes: 'Represents stereochemistry: Wedge = pointing toward you; Dash = pointing away into screen.',
        tip: 'Essential for chiral centers (R/S configurations).'
      },
      {
        name: 'Benzene & Cyclohexane Ring Templates',
        icon: 'Hexagon',
        location: 'Left Toolbar',
        whatItDoes: 'Stamps complete 6-membered aromatic benzene or aliphatic rings in a single click.',
        tip: 'Click on an existing bond to fuse rings together.'
      },
      {
        name: 'Clean 2D Topology Button',
        icon: 'Sparkles',
        location: 'Top Action Bar',
        whatItDoes: 'Uses computational geometry to straighten bonds, equalize lengths, and avoid atom overlap.',
        tip: 'Makes messy drawings look publication-ready.'
      },
      {
        name: '3D Preview Button',
        icon: 'Box',
        location: 'Top Action Bar',
        whatItDoes: 'Generates Cartesian 3D coordinates using force-field minimization and opens an interactive Three.js 3D viewer.',
        tip: 'Spin the 3D model with your mouse.'
      },
      {
        name: 'Export SMILES / Molfile',
        icon: 'Download',
        location: 'Top Action Bar',
        whatItDoes: 'Exports your drawing as a canonical SMILES string or .mol file for computational workflows.',
        tip: 'You can copy the SMILES straight into ARXN or RDKit.'
      },
      {
        name: 'Clear Canvas (Trash)',
        icon: 'Trash2',
        location: 'Top Action Bar',
        whatItDoes: 'Clears the canvas so you can start drawing a new molecule from scratch.',
        tip: 'You can always press Undo (Ctrl+Z) if clicked by accident.'
      }
    ],
    examples: [
      'Draw Ethanol: Place two carbons in a row, add single bond to Oxygen, and add Hydrogens.',
      'Draw Aspirin: Stamp a benzene ring, add carboxylic acid on carbon 1, and acetate ester on carbon 2.'
    ]
  },
  {
    id: 'arxn_synthesis',
    title: '4. ARXN Reaction Synthesis Studio',
    shortTitle: 'ARXN Synthesis',
    badge: 'Synth & Retro',
    icon: 'Activity',
    route: '/ibm-rxn',
    simpleSummary:
      'ARXN is your chemical synthesis command center. You can predict what product forms when mixing two chemicals (Forward Prediction), plan how to build complex molecules from scratch (Retrosynthesis), and explore famous Nobel prize and rare chemical reactions with animated electron pushing.',
    howToUse: [
      {
        step: 1,
        title: 'Choose Forward Prediction or Retrosynthesis',
        desc: 'Use the top tabs: "Forward Prediction" to predict what comes out of a flask, or "Retrosynthesis" to break down a target molecule into commercial starting materials.'
      },
      {
        step: 2,
        title: 'Use Quick Presets or Type Reactants',
        desc: 'Click any reaction preset pill (like "Fischer Esterification", "Suzuki Coupling", or "CuAAC Click Chemistry") to fill reactants and reagents automatically.'
      },
      {
        step: 3,
        title: 'Run Synthesis',
        desc: 'Click the glowing "Run ARXN Synthesis" button. Enjoy the custom orbital reaction loading animation while the engine solves thermodynamic pathways.'
      },
      {
        step: 4,
        title: 'Explore the Reaction Library & Mechanisms',
        desc: 'Click the "Reaction Library" tab to browse 20+ sorted modern and rare reactions. Click "Mechanism CAD" to watch curly electron arrows move step-by-step!'
      }
    ],
    buttons: [
      {
        name: 'Run ARXN Synthesis Button',
        icon: 'Sparkles',
        location: 'Center Action Header',
        whatItDoes: 'Predicts the major chemical product, calculated yield percentage, side products, and reaction classification.',
        tip: 'Shows animated electron particles and orbital rings while calculating.'
      },
      {
        name: 'Plan Retrosynthesis Button',
        icon: 'GitBranch',
        location: 'Retrosynthesis Mode Header',
        whatItDoes: 'Generates multi-step reverse reaction trees breaking your target down into commercially available chemicals.',
        tip: 'Displays confidence scores and overall linear yields.'
      },
      {
        name: 'Reaction Library Tab',
        icon: 'BookOpen',
        location: 'Studio Mode Tabs',
        whatItDoes: 'Opens an interactive catalog of organic reactions filterable by era (Nobel Prize modern vs Rare Specialty) and sortable by Name, Yield, Complexity, or Year.',
        tip: 'Click "Synthesize in ARXN" on any card to load it directly.'
      },
      {
        name: 'Mechanism CAD & Step Player (Play / Pause)',
        icon: 'Play',
        location: 'Mechanism Workspace Step Bar',
        whatItDoes: 'Automatically animates through reaction steps showing how electron pairs jump from nucleophile to electrophile.',
        tip: 'Adjust speed between 1.0s, 2.0s, or 3.0s per step.'
      },
      {
        name: '3D Preview Toggle on Product',
        icon: 'Box',
        location: 'Predicted Product Card',
        whatItDoes: 'Toggles between high-resolution 2D PubChem vector drawing and interactive 3D rotation model.',
        tip: 'Click "AI Workspace" button on the product card to explore its biology.'
      }
    ],
    examples: [
      'CuAAC Click Chemistry: Azide + Terminal Alkyne with Cu(I) catalyst produces 1,4-disubstituted 1,2,3-triazole ring (2022 Nobel Prize).',
      'Buchwald-Hartwig Amination: Aryl halide + Amine with Palladium catalyst forms C-N cross-coupled aromatic amines.',
      'Wittig Olefination: Aldehyde + Phosphonium ylide generates carbon-carbon double bonds via oxaphosphetane intermediate.'
    ]
  },
  {
    id: 'rdkit_lab',
    title: '5. RDKit Cheminformatics Lab',
    shortTitle: 'RDKit Lab',
    badge: 'Cheminformatics',
    icon: 'Cpu',
    route: '/rdkit-lab',
    simpleSummary:
      'The RDKit Lab calculates molecular descriptors to test if a chemical compound would make a good medicine. It evaluates Lipinski’s Rule of Five, water solubility, blood-brain barrier penetration, and drug-likeness scores.',
    howToUse: [
      {
        step: 1,
        title: 'Enter a SMILES or Molecule Name',
        desc: 'Type or paste a canonical SMILES code (e.g., "CC(=O)Oc1ccccc1C(=O)O" for Aspirin).'
      },
      {
        step: 2,
        title: 'Inspect the Physicochemical Scorecard',
        desc: 'Review Molecular Weight (MW < 500 Da), LogP lipophilicity (< 5), Polar Surface Area (TPSA < 140 Å²), and Hydrogen Bond Donors/Acceptors.'
      },
      {
        step: 3,
        title: 'Check Lipinski Rule of 5 Compliance',
        desc: 'See whether the molecule passes or fails each rule. Green badges mean the compound has good oral drug potential.'
      }
    ],
    buttons: [
      {
        name: 'Calculate Descriptors Button',
        icon: 'Cpu',
        location: 'Input Toolbar',
        whatItDoes: 'Runs Python/C++ algorithms to compute over 20 structural descriptors.',
        tip: 'Updates instantly as you modify the SMILES string.'
      },
      {
        name: 'Sample Molecules Picker',
        icon: 'FlaskConical',
        location: 'Top Bar',
        whatItDoes: 'Loads pre-configured molecules like Ibuprofen, Morphine, Atorvastatin, and Caffeine.',
        tip: 'Great for comparing oral drugs with non-drugs.'
      }
    ],
    examples: [
      'Aspirin (MW 180.16 Da, LogP 1.19, TPSA 63.6 Å²) passes all 5 Lipinski rules.',
      'Molecules with LogP between 1 and 3 are usually well absorbed in the human body.'
    ]
  },
  {
    id: 'spectroscopy',
    title: '6. Spectroscopy Suite (FTIR, NMR, UV-Vis, MS)',
    shortTitle: 'Spectroscopy',
    badge: 'Analytical Spectra',
    icon: 'Radio',
    route: '/spectroscopy',
    simpleSummary:
      'The Spectroscopy suite lets you simulate how chemical bonds absorb light, vibrate, and resonate in magnetic fields. You can study FTIR infrared peaks, 1H/13C NMR chemical shifts, UV-Vis absorbance, and Mass Spectrometry fragments.',
    howToUse: [
      {
        step: 1,
        title: 'Pick a Spectrum Type',
        desc: 'Click on the tabs at the top: FTIR, 1H-NMR, 13C-NMR, UV-Vis, or Mass Spec.'
      },
      {
        step: 2,
        title: 'Hover over Peaks',
        desc: 'Move your mouse across the spectrum chart to see the exact wavenumber ($cm^{-1}$) or chemical shift (ppm) and the functional group responsible (e.g., C=O stretch at 1715 $cm^{-1}$).'
      },
      {
        step: 3,
        title: 'Zoom and Pan Chart',
        desc: 'Click and drag on the spectrum to zoom into fingerprint or diagnostic regions.'
      }
    ],
    buttons: [
      {
        name: 'Spectrum Mode Tabs (FTIR / NMR / UV / MS)',
        icon: 'Radio',
        location: 'Top Navigation of Spectroscopy',
        whatItDoes: 'Switches between infrared vibration, nuclear magnetic resonance, ultraviolet absorption, and mass spectrometry.',
        tip: 'FTIR is best for detecting functional groups like carbonyls (C=O) and alcohols (O-H).'
      },
      {
        name: 'Export Spectrum Data',
        icon: 'Download',
        location: 'Chart Header',
        whatItDoes: 'Exports CSV wavenumber tables or high-resolution spectrum plot images.',
        tip: 'Include these graphs in your lab reports.'
      }
    ],
    examples: [
      'Carbonyl peak: Sharp intense absorption at 1700–1750 cm⁻¹ indicates ketones, aldehydes, or esters.',
      'Broad OH band: Wide peak at 3200–3600 cm⁻¹ confirms an alcohol or carboxylic acid hydrogen bond.'
    ]
  },
  {
    id: 'quantum_lab',
    title: '7. Quantum DFT & Molecular Orbitals',
    shortTitle: 'Quantum DFT',
    badge: 'Ab-Initio DFT',
    icon: 'Zap',
    route: '/quantum-library',
    simpleSummary:
      'Quantum Chemistry solves the Schrödinger equation using Density Functional Theory (DFT). You can inspect the Highest Occupied Molecular Orbital (HOMO), Lowest Unoccupied Molecular Orbital (LUMO), electronic bandgap ΔE, and electrostatic potential surfaces.',
    howToUse: [
      {
        step: 1,
        title: 'Select a Molecule or Orbital',
        desc: 'Choose an orbital level (HOMO, LUMO, HOMO-1, etc.) from the orbital energy ladder.'
      },
      {
        step: 2,
        title: 'Inspect the 3D Wavefunction Lobes',
        desc: 'Observe the positive (blue/cyan) and negative (red/orange) phases of the electron probability cloud in 3D.'
      },
      {
        step: 3,
        title: 'Evaluate Chemical Reactivity',
        desc: 'A small HOMO-LUMO gap ΔE means the molecule is highly reactive and easily donates electrons. A large gap means high thermodynamic stability.'
      }
    ],
    buttons: [
      {
        name: 'Orbital Selector Ladder (HOMO / LUMO)',
        icon: 'Layers',
        location: 'Left Panel of Quantum Lab',
        whatItDoes: 'Switches the 3D surface to render different frontier molecular orbitals.',
        tip: 'LUMO shows where nucleophiles attack; HOMO shows where electrophiles attack.'
      },
      {
        name: 'Electrostatic Potential (ESP) Surface',
        icon: 'Flame',
        location: 'Surface Type Controls',
        whatItDoes: 'Colors the molecular surface by electric charge: Red = electron rich (-), Blue = electron poor (+).',
        tip: 'Reveals hydrogen bonding sites instantly.'
      }
    ],
    examples: [
      'Benzene has degenerate HOMO orbitals with aromatic π-electron delocalization above and below the carbon ring.',
      'Chemical hardness η = (LUMO - HOMO) / 2 measures resistance to charge transfer.'
    ]
  },
  {
    id: 'chromatography',
    title: '8. Chromatography & Separation Suite',
    shortTitle: 'Chromatography',
    badge: 'Analytical Separation',
    icon: 'FlaskConical',
    route: '/chromatography',
    simpleSummary:
      'Chromatography simulates separating mixtures of chemical compounds using High-Performance Liquid Chromatography (HPLC) columns or Thin-Layer Chromatography (TLC) plates based on polarity.',
    howToUse: [
      {
        step: 1,
        title: 'Choose Mobile Phase Solvent Ratio',
        desc: 'Adjust the water-to-acetonitrile or hexane-to-ethyl acetate ratio using the slider.'
      },
      {
        step: 2,
        title: 'Run HPLC Chromatogram',
        desc: 'Watch peaks elute across time ($t_R$). Non-polar compounds stick longer to C18 reverse-phase columns.'
      },
      {
        step: 3,
        title: 'Calculate Retention Factor (Rf)',
        desc: 'Use the TLC ruler to measure spot distance divided by solvent front distance.'
      }
    ],
    buttons: [
      {
        name: 'Start Chromatogram Run',
        icon: 'Play',
        location: 'HPLC Controls Header',
        whatItDoes: 'Simulates sample injection and detector signal over retention time.',
        tip: 'Observe peak resolution and theoretical plate count (N).'
      },
      {
        name: 'Solvent Gradient Slider',
        icon: 'Sliders',
        location: 'Solvent Mixture Panel',
        whatItDoes: 'Increases organic modifier percentage to speed up compound elution.',
        tip: 'Higher organic solvent pushes non-polar compounds off the column faster.'
      }
    ],
    examples: [
      'In Reverse-Phase HPLC (C18 column), polar molecules elute first, non-polar molecules elute last.',
      'TLC Retention Factor: Rf = distance traveled by compound / distance traveled by solvent front.'
    ]
  },
  {
    id: 'vision_gestures',
    title: '9. Webcam Vision & Hand Gesture Controls',
    shortTitle: 'Hand Gestures',
    badge: 'Touchless Air CAD',
    icon: 'Hand',
    route: '/',
    simpleSummary:
      'Control ChemSpace touchlessly using your computer webcam. By pointing your finger or pinching your thumb and index finger in the air, you can click buttons, rotate 3D molecules, and scroll pages without touching your keyboard or mouse.',
    howToUse: [
      {
        step: 1,
        title: 'Click "Vision Controls" in the Top Header',
        desc: 'Click the "Vision Controls" button at the top of any page to open the gesture settings panel.'
      },
      {
        step: 2,
        title: 'Enable Webcam Tracking',
        desc: 'Toggle the switch to turn on camera tracking (your video stays 100% private in your browser; no video is ever sent to any server).'
      },
      {
        step: 3,
        title: 'Point Index Finger to Move Cursor',
        desc: 'Point your index finger toward the camera to guide the glowing cyan Air Cursor smoothly across the screen.'
      },
      {
        step: 4,
        title: 'Pinch to Click & Drag',
        desc: 'Briefly tap your thumb and index finger together to click buttons or drag 3D molecules in space.'
      }
    ],
    buttons: [
      {
        name: 'Enable Touchless Gestures Switch',
        icon: 'Hand',
        location: 'Vision Control Panel',
        whatItDoes: 'Turns the AI computer-vision hand tracker on or off.',
        tip: 'Shows a camera preview in the bottom corner so you can see your tracking dots.'
      },
      {
        name: 'Calibrate Gestures Button',
        icon: 'Crosshair',
        location: 'Vision Control Panel',
        whatItDoes: 'Runs a 10-second calibration routine to customize sensitivity to your hand size and room lighting.',
        tip: 'Best performed with good room lighting.'
      }
    ],
    examples: [
      'Pinch gesture: Touch thumb and index together to click tabs and rotate 3D molecules.',
      'Open palm: Wave up and down to scroll pages.'
    ]
  },
  {
    id: 'button_glossary',
    title: '10. Complete Platform Button Glossary',
    shortTitle: 'Button Glossary',
    badge: 'Quick Glossary',
    icon: 'MousePointer2',
    route: '/',
    simpleSummary:
      'An alphabetical reference guide answering: "What does this button do?" across every page of ChemSpace.',
    howToUse: [
      {
        step: 1,
        title: 'Search by Button Name or Icon',
        desc: 'Type any button text (e.g., "Run", "3D", "PDB", "Clean 2D", "Copy", "Reset") into the search box.'
      },
      {
        step: 2,
        title: 'Read What Happens When Clicked',
        desc: 'Every entry tells you its exact action, location, and helpful tips.'
      }
    ],
    buttons: [
      {
        name: 'AI Workspace (Bot Icon)',
        icon: 'Bot',
        location: 'Global Header & Sidebar',
        whatItDoes: 'Opens the flagship conversational chemistry agent and 3D drug modeling workspace.',
        tip: 'Also accessible from homepage hero.'
      },
      {
        name: 'ChemSpace AI Copilot (Sparkles Icon)',
        icon: 'Sparkles',
        location: 'Global Header & Floating Bottom Launcher',
        whatItDoes: 'Opens the floating multimodal AI chat assistant to ask any chemistry question on the fly.',
        tip: 'Supports voice questions.'
      },
      {
        name: 'Theme Toggle (Sun / Moon)',
        icon: 'Sun',
        location: 'Sidebar Bottom & Mobile Header',
        whatItDoes: 'Switches between Obsidian Dark Mode and Ceramic Light Mode.',
        tip: 'Your theme preference is remembered automatically.'
      },
      {
        name: 'Run ARXN Synthesis',
        icon: 'Sparkles',
        location: 'ARXN Reaction Studio',
        whatItDoes: 'Runs forward reaction prediction, calculates product yields, and generates chemical mechanisms.',
        tip: 'Displays animated reaction orbitals while computing.'
      },
      {
        name: 'Clean 2D Topology',
        icon: 'Sparkles',
        location: 'ChemDraw Studio Toolbar',
        whatItDoes: 'Automatically straightens bond angles, normalizes bond lengths, and cleans up messy drawings.',
        tip: 'Use after sketching complex rings.'
      },
      {
        name: 'Download 3D PDB',
        icon: 'Download',
        location: 'AI Workspace Right Stage',
        whatItDoes: 'Exports a crystal Protein Data Bank coordinate file (.pdb) with Cartesian coordinates.',
        tip: 'Open directly in PyMOL, Chimera, or Blender.'
      },
      {
        name: 'Copy Report',
        icon: 'Copy',
        location: 'AI Workspace & Monograph View',
        whatItDoes: 'Copies the complete markdown scientific drug discovery monograph into your clipboard.',
        tip: 'Safe for pasting into Word, LaTeX, or research notes.'
      },
      {
        name: 'Copy SMILES',
        icon: 'Atom',
        location: 'ChemDraw, AI Workspace, and ARXN',
        whatItDoes: 'Copies the canonical Simplified Molecular Input Line Entry System string for the active molecule.',
        tip: 'Universal chemical shorthand string.'
      },
      {
        name: 'Examine Mechanism',
        icon: 'CornerDownRight',
        location: 'ARXN Predicted Product Card',
        whatItDoes: 'Transfers the predicted reaction directly into the interactive Mechanism CAD workspace to view curved electron arrows.',
        tip: 'Play the automated sequence to watch bonds form and break.'
      },
      {
        name: 'Send to ChemDraw',
        icon: 'PenTool',
        location: 'ARXN Studio & Library',
        whatItDoes: 'Opens the active molecule or product inside the ChemDraw CAD drafting board.',
        tip: 'Enables further functional group editing.'
      },
      {
        name: 'Send to Spectroscopy',
        icon: 'Activity',
        location: 'ARXN Studio & ChemDraw',
        whatItDoes: 'Sends the active structure into the Spectroscopy Suite to simulate FTIR and NMR spectra.',
        tip: 'Instantly identifies simulated infrared peaks.'
      },
      {
        name: 'Turbo Mode (⚡ Fast Verify)',
        icon: 'Zap',
        location: 'AI Workspace Header',
        whatItDoes: 'Enables accelerated computation mode to verify molecules in ~0.45s instead of standard full simulation.',
        tip: 'Gold glowing indicator when active.'
      },
      {
        name: 'Reset Workspace',
        icon: 'RotateCcw',
        location: 'AI Workspace & ChemDraw',
        whatItDoes: 'Clears the current chat history, canvas, or parameters to start fresh.',
        tip: 'Does not delete your saved account records.'
      }
    ],
    examples: [
      'Want to copy a molecule string? Click the "SMILES" button.',
      'Want to see how two chemicals react? Click "Run ARXN Synthesis".',
      'Want a complete lab report? Click "Copy Report" in the AI Workspace.'
    ]
  }
];
