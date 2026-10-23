/**
 * ChemSpace Chemistry Intelligence & Conversational Q&A Engine
 * 
 * Provides rigorous, real-world chemical science explanations for:
 * - Organic reaction mechanisms (Aldol, SN1/SN2, E1/E2, Markovnikov, Diels-Alder, etc.)
 * - Hybridization, VSEPR geometry, and molecular orbitals
 * - Physical chemistry (kinetics, thermodynamics, equilibrium, pH buffers, Nernst)
 * - Spectroscopy (FTIR, 1H/13C NMR, UV-Vis, Mass Spec)
 * - Drug discovery, ADMET, and medicinal chemistry
 * 
 * Includes strict chemistry domain guardrails and seamless fallback to a deep
 * built-in chemistry knowledge base when offline.
 */

import { callGeminiChat, hasCustomGeminiApiKey, getGeminiApiKey } from './geminiService';

// Chemistry domain keywords for intelligent intent & scope classification
const CHEMISTRY_KEYWORDS = [
  'chem', 'molecule', 'molecular', 'reaction', 'synthesis', 'mechanism', 'atom', 'atomic',
  'bond', 'covalent', 'ionic', 'hydrogen bond', 'hybrid', 'orbital', 'homo', 'lumo', 'dft',
  'organic', 'inorganic', 'physical', 'acid', 'base', 'ph', 'buffer', 'pka', 'pkb',
  'sn1', 'sn2', 'e1', 'e2', 'aldol', 'grignard', 'diels-alder', 'friedel-crafts', 'oxidation',
  'reduction', 'catalyst', 'enzyme', 'kinetics', 'thermodynamics', 'enthalpy', 'entropy',
  'gibbs', 'equilibrium', 'le chatelier', 'rate law', 'arrhenius', 'half-life', 'concentration',
  'spectroscopy', 'ftir', 'nmr', 'uv-vis', 'mass spec', 'chromatography', 'hplc', 'tlc',
  'lipinski', 'admet', 'logp', 'tpsa', 'ic50', 'ki', 'affinity', 'docking', 'pharmacophore',
  'protac', 'inhibitor', 'receptor', 'smiles', 'formula', 'iupac', 'valence', 'octet',
  'periodic', 'electronegativity', 'ionization', 'isotope', 'element', 'solvent', 'yield',
  'resonance', 'aromatic', 'huckel', 'isomer', 'chirality', 'enantiomer', 'diastereomer',
  'aspirin', 'paracetamol', 'caffeine', 'benzene', 'water', 'glucose', 'ethanol', 'methane'
];

/**
 * Checks whether a user prompt is within the scope of chemical sciences.
 */
export function isChemistryQuery(text) {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase().trim();
  if (lower.length === 0) return false;

  // Single word checks (formulas or element symbols like NaCl, H2O, CH4)
  if (/^[A-Z][a-z]?(\d+)?([A-Z][a-z]?(\d+)?)*$/.test(text.trim())) return true;

  return CHEMISTRY_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Curated, high-depth chemical knowledge base for conversational Q&A
 */
const BUILTIN_CHEMISTRY_KNOWLEDGE = [
  {
    keywords: ['hybrid', 'hybridisation', 'hybridization', 'sp3', 'sp2', 'sp'],
    title: 'Orbital Hybridization & Molecular Geometry',
    answer: `### Orbital Hybridization in Chemistry

Orbital hybridization is the mathematical mixing of non-equivalent atomic orbitals (such as $s$ and $p$) on the same central atom to form identical **hybrid orbitals** with equal energies and directional geometries.

#### Primary Hybridization States:
1. **$sp$ Hybridization (Linear, 180°):**
   - Mixing of one $s$ and one $p$ orbital.
   - Leaves two unhybridized $p$ orbitals available for $\\pi$-bonding.
   - **Examples:** Acetylene ($\\text{H}-\\text{C}\\equiv\\text{C}-\\text{H}$), $\\text{BeCl}_2$, Carbon dioxide ($\\text{O}=\\text{C}=\\text{O}$).

2. **$sp^2$ Hybridization (Trigonal Planar, 120°):**
   - Mixing of one $s$ and two $p$ orbitals.
   - Leaves one unhybridized $p$ orbital forming a $\\pi$-bond.
   - **Examples:** Ethylene ($\\text{CH}_2=\\text{CH}_2$), Benzene ($\\text{C}_6\\text{H}_6$), Formaldehyde ($\\text{H}_2\\text{C}=\\text{O}$).

3. **$sp^3$ Hybridization (Tetrahedral, 109.5°):**
   - Mixing of one $s$ and three $p$ orbitals to form four equivalent $\\sigma$ bonds or accommodate lone pairs.
   - **Examples:** Methane ($\\text{CH}_4$, 109.5°), Ammonia ($\\text{NH}_3$, 107.3° due to lone pair repulsion), Water ($\\text{H}_2\\text{O}$, 104.5°).

4. **Expanded Valence Shells:**
   - **$sp^3d$ (Trigonal Bipyramidal, 90° & 120°):** $\\text{PCl}_5$, $\\text{SF}_4$.
   - **$sp^3d^2$ (Octahedral, 90°):** $\\text{SF}_6$, $[\\text{Fe(CN)}_6]^{3-}$.

**Key Principle:** The steric number (Number of $\\sigma$ bonds + Number of lone pairs) determines the required hybridization state.`
  },
  {
    keywords: ['aldol', 'condensation', 'enolate'],
    title: 'Aldol Addition & Condensation Mechanism',
    answer: `### Aldol Addition and Condensation Mechanism

The Aldol reaction is a foundational carbon-carbon bond-forming transformation in organic synthesis that couples two carbonyl compounds (aldehydes or ketones).

#### Step-by-Step Reaction Mechanism:
1. **Enolate Generation (Deprotonation):**
   - A base (e.g., $\\text{NaOH}$ or $\\text{LDA}$) removes an acidic $\\alpha$-hydrogen from an aldehyde or ketone to generate a resonance-stabilized **enolate nucleophile**:
   $$\\text{R}-\\text{CH}_2-\\text{CHO} + \\text{OH}^- \\rightleftharpoons [\\text{R}-\\text{CH}-\\text{CHO}]^- + \\text{H}_2\\text{O}$$

2. **Nucleophilic Attack (C-C Bond Formation):**
   - The nucleophilic $\\alpha$-carbon of the enolate attacks the electrophilic carbonyl carbon of a second aldehyde molecule to form an alkoxide intermediate:
   $$[\\text{R}-\\text{CH}-\\text{CHO}]^- + \\text{R}'-\\text{CHO} \\longrightarrow \\text{R}'-\\text{CH}(\\text{O}^-)-\\text{CH}(\\text{R})-\\text{CHO}$$

3. **Proton Transfer (Aldol Product):**
   - The alkoxide is protonated by water, yielding a **$\\beta$-hydroxy aldehyde** (Aldol):
   $$\\text{R}'-\\text{CH}(\\text{OH})-\\text{CH}(\\text{R})-\\text{CHO}$$

4. **Dehydration (Condensation Step, with Heat):**
   - Under heating or prolonged basic conditions, the $\\beta$-hydroxy compound undergoes E1cB elimination to form an **$\\alpha,\\beta$-unsaturated carbonyl compound**:
   $$\\text{R}'-\\text{CH}=\\text{C}(\\text{R})-\\text{CHO} + \\text{H}_2\\text{O}$$

**Synthetic Importance:** This creates conjugated conjugated enones with enhanced thermodynamic stability, widely used in total synthesis and steroid frameworks.`
  },
  {
    keywords: ['sn1', 'sn2', 'nucleophilic substitution'],
    title: 'SN1 vs. SN2 Nucleophilic Substitution Comparison',
    answer: `### $S_N1$ vs. $S_N2$ Nucleophilic Substitution

Nucleophilic substitution at $sp^3$ carbons proceeds via two distinct mechanistic pathways dictated by the substrate, nucleophile, leaving group, and solvent.

| Parameter | $S_N1$ (Unimolecular) | $S_N2$ (Bimolecular) |
| :--- | :--- | :--- |
| **Kinetics** | First order: $\\text{Rate} = k[\\text{R-X}]$ | Second order: $\\text{Rate} = k[\\text{R-X}][\\text{Nu}^-]$ |
| **Mechanism** | 2-step: Carbocation intermediate | 1-step concerted: Pentacoordinate transition state |
| **Substrate Preference** | $3^\\circ > 2^\\circ \\gg 1^\\circ > \\text{Methyl}$ (Steric carbocation stability) | $\\text{Methyl} > 1^\\circ > 2^\\circ \\gg 3^\\circ$ (Steric hindrance prevents attack) |
| **Nucleophile** | Weak, neutral ($\\text{H}_2\\text{O}$, $\\text{ROH}$) | Strong, anionic ($\\text{CN}^-$, $\\text{I}^-$, $\\text{OH}^-$, $\\text{RS}^-$) |
| **Solvent** | Polar Protic ($\\text{H}_2\\text{O}$, $\\text{MeOH}$, $\\text{EtOH}$) stabilizes ions | Polar Aprotic ($\\text{DMF}$, $\\text{DMSO}$, Acetone) leaves nucleophile naked |
| **Stereochemistry** | Racemization (with slight inversion retention) | Complete Walden Inversion ($100\\%$ backside attack) |

**Pro Tip:** Secondary ($2^\\circ$) alkyl halides can undergo either path depending on whether a strong nucleophile and polar aprotic solvent are selected.`
  },
  {
    keywords: ['le chatelier', 'equilibrium', 'chatelier'],
    title: 'Le Chatelier’s Principle & Dynamic Equilibrium',
    answer: `### Le Chatelier’s Principle

**Statement:** If an external stress (change in concentration, pressure, volume, or temperature) is applied to a chemical system at dynamic equilibrium, the system will shift in a direction that counteracts that change.

#### Key System Disturbances:
1. **Concentration Changes:**
   - Adding reactants or removing products shifts equilibrium **forward (to the right)**.
   - Adding products shifts equilibrium **reverse (to the left)**.

2. **Pressure & Volume Changes (Gas-Phase Systems):**
   - Increasing total pressure (decreasing volume) shifts equilibrium toward the side with **fewer moles of gas**.
   - Example (Haber Process):
     $$\\text{N}_2(g) + 3\\text{H}_2(g) \\rightleftharpoons 2\\text{NH}_3(g) \\quad (4\\text{ mol} \\rightleftharpoons 2\\text{ mol})$$
     *High pressure ($150-200\\text{ atm}$) drives $\\text{NH}_3$ formation.*

3. **Temperature Changes (Governed by $\\Delta H$):**
   - For an **Exothermic** reaction ($\\Delta H < 0$, heat is a product): Increasing temperature shifts equilibrium to the **left**, decreasing the equilibrium constant $K_{eq}$.
   - For an **Endothermic** reaction ($\\Delta H > 0$, heat is a reactant): Increasing temperature shifts equilibrium to the **right**, increasing $K_{eq}$.

4. **Catalysts:**
   - Catalysts lower activation energy ($E_a$) equally for both forward and reverse paths. **They speed up equilibration but DO NOT shift equilibrium position or change $K_{eq}$.**`
  },
  {
    keywords: ['markovnikov', 'anti-markovnikov', 'addition'],
    title: 'Markovnikov’s Rule vs. Anti-Markovnikov Addition',
    answer: `### Markovnikov’s Rule vs. Anti-Markovnikov Addition

When an asymmetric electrophile (such as $\\text{H-X}$) adds to an asymmetric alkene, regioselectivity is determined by the stability of the intermediate.

#### 1. Markovnikov Addition (Electrophilic Addition):
- **Rule:** The hydrogen atom adds to the carbon with more hydrogen atoms ("the rich get richer"), while the halide adds to the more substituted carbon.
- **Mechanism:**
  1. Protonation of the alkene double bond creates the **more stable carbocation** ($3^\\circ > 2^\\circ > 1^\\circ$ due to hyperconjugation and inductive donation).
  2. Nucleophilic attack by $\\text{X}^-$ on the carbocation yields the Markovnikov product:
  $$\\text{CH}_3-\\text{CH}=\\text{CH}_2 + \\text{HBr} \\longrightarrow \\text{CH}_3-\\text{CH(Br)}-\\text{CH}_3 \\quad (\\text{2-bromopropane, } >90\\%)$$

#### 2. Anti-Markovnikov Addition (Peroxide Effect / Hydroboration):
- **Kharasch Radical Mechanism ($\text{HBr} + \text{ROOR}$):**
  - In the presence of organic peroxides, a bromine radical ($\\text{Br}^\\bullet$) attacks first, attaching to the less substituted carbon to produce the **more stable secondary/tertiary carbon radical**:
  $$\\text{CH}_3-\\text{CH}=\\text{CH}_2 + \\text{HBr} \\xrightarrow{\\text{Peroxide}} \\text{CH}_3-\\text{CH}_2-\\text{CH}_2\\text{Br} \\quad (\\text{1-bromopropane})$$
- **Hydroboration-Oxidation:**
  - Addition of $\\text{BH}_3 \\cdot \\text{THF}$ followed by $\\text{H}_2\\text{O}_2 / \\text{NaOH}$ converts alkenes into anti-Markovnikov alcohols via concerted syn-addition.`
  },
  {
    keywords: ['paracetamol', 'acetaminophen', 'synthesis of paracetamol'],
    title: 'Paracetamol (Acetaminophen) Synthesis & Pharmacodynamics',
    answer: `### Paracetamol (Acetaminophen) Molecular Profile

- **Formula:** $\\text{C}_8\\text{H}_9\\text{NO}_2$ | **MW:** $151.16\\text{ g/mol}$
- **IUPAC:** $N$-(4-hydroxyphenyl)acetamide
- **SMILES:** \`CC(=O)Nc1ccc(O)cc1\`

#### Chemical Synthesis:
Paracetamol is prepared commercially via selective $N$-acetylation of 4-aminophenol:
1. **Starting Material:** 4-aminophenol (prepared from nitrobenzene reduction or phenol nitration).
2. **Reagent:** Acetic anhydride ($\\text{Ac}_2\\text{O}$) in aqueous or buffered medium at $60-80^\\circ\\text{C}$.
$$\\text{HO}-\\text{C}_6\\text{H}_4-\\text{NH}_2 + (\\text{CH}_3\\text{CO})_2\\text{O} \\longrightarrow \\text{HO}-\\text{C}_6\\text{H}_4-\\text{NHCOCH}_3 + \\text{CH}_3\\text{COOH}$$
*Chemoselectivity:* The amino group ($-\\text{NH}_2$) is more nucleophilic than the phenolic hydroxyl ($-\\text{OH}$), producing the amide quantitatively without significant ester byproduct.

#### Mechanism of Action:
- Acts centrally by inhibiting **COX-3** / peroxidase function of prostaglandin $H_2$ synthase (PGHS) in the brain.
- Metabolized in neurons into **AM404**, which inhibits anandamide reuptake and activates $\\text{TRPV1}$ cannabinoid receptors to raise pain thresholds.`
  },
  {
    keywords: ['aspirin', 'acetylsalicylic', 'salicylate'],
    title: 'Aspirin (Acetylsalicylic Acid) Synthesis & Irreversible Inhibition',
    answer: `### Aspirin (Acetylsalicylic Acid) Molecular Profile

- **Formula:** $\\text{C}_9\\text{H}_8\\text{O}_4$ | **MW:** $180.16\\text{ g/mol}$
- **IUPAC:** 2-acetyloxybenzoic acid
- **SMILES:** \`CC(=O)Oc1ccccc1C(=O)O\`

#### Laboratory Synthesis (Esterification):
$$\\text{Salicylic Acid} + \\text{Acetic Anhydride} \\xrightarrow{\\text{H}_2\\text{SO}_4 \\text{ (cat.)}} \\text{Aspirin} + \\text{Acetic Acid}$$
- Salicylic acid's phenolic $-\\text{OH}$ acts as the nucleophile attacking the carbonyl carbon of acetic anhydride.
- Concentrated sulfuric or phosphoric acid acts as an acid catalyst to activate the carbonyl.

#### Mechanism of Action:
- **Irreversible Inactivation of Cyclooxygenase (COX-1 & COX-2):**
  Aspirin enters the hydrophobic channel of the COX enzyme and **transfers its acetyl group to Serine-530** (in COX-1) or **Serine-516** (in COX-2).
- This permanently blocks arachidonic acid from entering the catalytic site, abolishing Thromboxane $A_2$ production in blood platelets for their entire 8-10 day lifespan.`
  },
  {
    keywords: ['caffeine', 'adenosine', 'xanthine'],
    title: 'Caffeine Molecular & Neuropharmacological Profile',
    answer: `### Caffeine (1,3,7-Trimethylxanthine)

- **Formula:** $\\text{C}_8\\text{H}_{10}\\text{N}_4\\text{O}_2$ | **MW:** $194.19\\text{ g/mol}$
- **SMILES:** \`Cn1cnc2c1c(=O)n(c(=O)n2C)C\`
- **Structure:** Purine-dione alkaloid closely resembling adenosine.

#### Mechanism of Action:
- **Non-Selective Adenosine Receptor Antagonist ($A_1$ & $A_{2A}$):**
  Caffeine fits competitively into the binding pocket of adenosine receptors in the central nervous system without activating them. By preventing endogenous adenosine from docking, it prevents somnolence and increases alertness.
- **Secondary Actions:** Competitive inhibitor of phosphodiesterase (PDE), elevating intracellular cyclic AMP (cAMP) and increasing catecholamine release.`
  },
  {
    keywords: ['lipinski', 'rule of 5', 'rule of five', 'drug-likeness', 'ro5'],
    title: 'Lipinski’s Rule of Five for Oral Bioavailability',
    answer: `### Lipinski’s Rule of Five (Ro5)

Formulated by Christopher Lipinski in 1997, this rule predicts whether a chemical compound has structural and physicochemical properties that would likely make it an orally active drug in humans.

#### The 4 Core Thresholds (Multiples of 5):
1. **Molecular Weight (MW):** $\\le 500\\text{ Da}$
   - Larger molecules face severe steric barriers crossing the intestinal epithelial membrane.
2. **Lipophilicity ($\\log P$):** $\\le 5.0$
   - Compounds that are too hydrophilic cannot partition into lipid bilayers; compounds that are too lipophilic precipitate out or get trapped in fat tissue.
3. **Hydrogen Bond Donors (HBD):** $\\le 5$
   - Count of $-\\text{OH}$ and $-\\text{NH}$ groups. High desolvation penalty prevents crossing membrane.
4. **Hydrogen Bond Acceptors (HBA):** $\\le 10$
   - Count of all nitrogen and oxygen atoms.

#### Modern Extensions (Veber’s Rules):
- **Rotatable Bonds:** $\\le 10$ (Limits conformational entropy loss upon binding).
- **Topological Polar Surface Area (TPSA):** $\\le 140\\text{ \\AA}^2$ (Crucial for passive cell membrane permeation; $\\le 70-90\\text{ \\AA}^2$ needed for blood-brain barrier penetration).`
  }
];

/**
 * Executes a chemistry query using either Gemini AI (if available) or
 * deep local chemical science knowledge base.
 */
export async function executeChemistryQuery(query, modelId = 'deepchem') {
  const trimmed = (query || '').trim();
  if (!trimmed) {
    return {
      success: false,
      isChemistry: false,
      answer: 'Please enter a chemistry question, reaction mechanism, or molecular prompt.'
    };
  }

  // Chemistry Domain Guardrail Check
  const inScope = isChemistryQuery(trimmed);
  if (!inScope) {
    return {
      success: true,
      isChemistry: false,
      answer: `### ChemSpace Specialized Chemistry Domain Guardrail

**I am ChemSpace AI, specialized strictly in chemistry, molecular science, and drug discovery.**

Your question appears to be outside the domain of chemical sciences. Please ask about:
- **Organic Chemistry:** Reaction mechanisms (Aldol, SN1/SN2, Diels-Alder, Friedel-Crafts), stereochemistry, syntheses.
- **Physical Chemistry:** Reaction kinetics, rate constants ($k$), equilibrium, Le Chatelier's principle, thermodynamics ($\\Delta G, \\Delta H, \\Delta S$), pH & buffers.
- **Inorganic & Quantum:** Orbital hybridization, crystal field theory, periodic trends, HOMO-LUMO bandgaps, DFT wavefunctions.
- **Analytical & Spectroscopy:** FTIR, $^1\\text{H}/^{13}\\text{C}$ NMR, UV-Vis absorption, mass spectrometry.
- **Drug Discovery & BioNeMo:** Target docking, PROTAC degraders, kinase inhibitors, ADMET pharmacokinetics, and molecular CAD.`
    };
  }

  // 1. If Gemini API is available, ask Gemini with a specialized Chemist persona
  if (hasCustomGeminiApiKey() || getGeminiApiKey()) {
    try {
      const chemistrySystemPrompt = `You are ChemSpace Senior Computational Chemist and Molecular Intelligence Specialist.
Answer the user's chemistry question with absolute scientific rigor, precision, and clarity.
Follow these rules:
1. Use clean markdown formatting with headers, bullet points, and LaTeX notation where helpful (e.g., equations, chemical formulas like H2O, Delta G).
2. Explain the core concept, reaction equations, step-by-step mechanism, and real-world chemical applications.
3. Keep the tone professional, educational, and clean. Avoid unnecessary fluff.
4. Answer ONLY questions related to chemical sciences.

User Chemistry Question:
"${trimmed}"`;

      const geminiRes = await callGeminiChat(chemistrySystemPrompt);
      if (geminiRes && geminiRes.responseText) {
        return {
          success: true,
          isChemistry: true,
          answer: geminiRes.responseText,
          source: 'Gemini 2.5 Flash Chemist'
        };
      }
    } catch (err) {
      console.warn('[Chemistry Engine] Gemini chat call failed, using local knowledge base:', err.message);
    }
  }

  // 2. Built-in Local Knowledge Match
  const lower = trimmed.toLowerCase();
  for (const item of BUILTIN_CHEMISTRY_KNOWLEDGE) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return {
        success: true,
        isChemistry: true,
        title: item.title,
        answer: item.answer,
        source: 'ChemSpace Core Chemical Knowledge'
      };
    }
  }

  // 3. Structured General Chemical Synthesis & Reasoning Response
  return {
    success: true,
    isChemistry: true,
    title: `Chemical Analysis: ${trimmed.slice(0, 40)}`,
    answer: `### Chemical Scientific Analysis

**Topic:** ${trimmed}

#### 1. Fundamental Principle:
In chemical systems, molecular behavior is governed by electronic distribution, orbital symmetry (Woodward-Hoffmann rules), thermodynamics (minimization of Gibbs free energy $\\Delta G = \\Delta H - T\\Delta S$), and activation barriers ($E_a$).

#### 2. Mechanistic Considerations:
- **Electrophile-Nucleophile Interactions:** Reactions proceed via electron pair donation from highest occupied molecular orbitals (HOMO) of the nucleophile into lowest unoccupied molecular orbitals (LUMO) of the electrophile.
- **Steric & Solvation Effects:** Steric hindrance and solvent dielectric constants (polar protic vs polar aprotic) significantly influence reaction pathways and equilibrium positions.
- **Kinetics:** Transition-state stabilization dictates reaction velocity following the Eyring and Arrhenius equations ($k = A e^{-E_a/RT}$).

#### 3. Summary & Recommendation:
For full atomic-resolution exploration, you can toggle the **3D Stage** or inspect the **Scientific Graphs** panel on the right stage to examine reaction kinetics, concentration curves, and frontier orbital energies.`,
    source: 'ChemSpace Scientific Knowledge Engine'
  };
}
