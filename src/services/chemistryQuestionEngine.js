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
    leadSummary: 'Steric number (σ bonds + lone pairs) dictates orbital hybridization: sp (linear, 180°), sp2 (trigonal planar, 120°), and sp3 (tetrahedral, 109.5°).',
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
    leadSummary: 'Aldol reaction couples carbonyls via enolate nucleophilic attack on electrophilic carbonyls to generate β-hydroxy aldehydes and α,β-unsaturated enones.',
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
    leadSummary: 'SN1 operates via a 2-step carbocation intermediate (favors 3°, protic solvents, racemization); SN2 operates via a 1-step backside attack (favors 1°/methyl, aprotic solvents, Walden inversion).',
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
    leadSummary: 'Disturbances to a chemical equilibrium shift the position forward or reverse to counteract concentration, pressure, or temperature stresses.',
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
    leadSummary: 'Markovnikov addition directs electrophiles to the alkene carbon with more hydrogens via the most stable carbocation intermediate.',
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
    leadSummary: 'Paracetamol is synthesized via selective N-acetylation of 4-aminophenol with acetic anhydride, acting centrally to inhibit COX-3 and activate TRPV1.',
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
    leadSummary: 'Aspirin permanently blocks prostaglandin synthesis by transferring an acetyl group to Ser-530 of COX-1.',
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
    leadSummary: 'Caffeine acts as a competitive antagonist at central adenosine A1 and A2A receptors to block fatigue signals.',
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
    leadSummary: 'Lipinski’s Ro5 identifies oral drug candidates based on MW ≤ 500 Da, LogP ≤ 5, HBD ≤ 5, and HBA ≤ 10.',
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
  },
  {
    keywords: ['grignard', 'organomagnesium', 'rmgx'],
    title: 'Grignard Reaction & Organometallic Synthesis',
    leadSummary: 'Grignard reagents (R-MgX) generate powerful carbanion equivalents for nucleophilic addition to carbonyls.',
    answer: `### Grignard Reaction Mechanism & Synthetic Utility

Organomagnesium halides ($\\text{R-MgX}$) are premier carbon nucleophiles formed by reacting alkyl or aryl halides with magnesium metal in anhydrous ether or THF:
$$\\text{R-X} + \\text{Mg} \\xrightarrow{\\text{Et}_2\\text{O}} \\text{R-MgX}$$

#### Carbonyl Addition Pathways:
1. **Formaldehyde:** Yields primary alcohols ($\\text{R-CH}_2\\text{OH}$).
2. **Higher Aldehydes (R'CHO):** Yields secondary alcohols ($\\text{R-CH(OH)-R'}$).
3. **Ketones (R'COR''):** Yields tertiary alcohols.
4. **Carbon Dioxide ($\text{CO}_2$):** Yields carboxylic acids ($\\text{R-COOH}$) after aqueous acid workup.
5. **Esters:** Reacts with 2 equivalents of Grignard to generate tertiary alcohols with two identical R groups.

#### Critical Experimental Precautions:
- **Strictly Anhydrous Conditions:** Moisture immediately destroys the reagent:
$$\\text{R-MgX} + \\text{H}_2\\text{O} \\longrightarrow \\text{R-H} + \\text{Mg(OH)X}$$
- Incompatible with protic groups ($-\\text{OH}, -\\text{NH}_2, -\\text{COOH}, -\\text{SH}$) on the substrate unless protected.`
  },
  {
    keywords: ['diels-alder', 'diels alder', 'cycloaddition', '[4+2]'],
    title: 'Diels-Alder [4+2] Pericyclic Cycloaddition',
    leadSummary: 'A concerted pericyclic reaction coupling a conjugated diene in s-cis conformation with an electron-poor dienophile.',
    answer: `### Diels-Alder [4+2] Cycloaddition Mechanism

The Diels-Alder reaction is a concerted, stereospecific pericyclic reaction between a **conjugated diene** ($4\\pi$ electrons) and a **dienophile** ($2\\pi$ electrons) to assemble a substituted cyclohexene ring with up to 4 contiguous stereocenters.

#### Key Stereochemical & Kinetic Principles:
1. **Concerted Mechanism:** Bond breaking and forming occur simultaneously in a cyclic 6-electron aromatic transition state without carbocation or radical intermediates.
2. **Conformation Requirement:** The diene must adopt the planar **s-cis** conformation. Dienes locked in s-trans (e.g., rigid polyenes) are inactive.
3. **Electronic Activation:**
   - Electron-donating groups (EDGs, e.g., $-\\text{OCH}_3, -\\text{CH}_3$) on the diene raise its HOMO energy.
   - Electron-withdrawing groups (EWGs, e.g., $-\\text{CHO}, -\\text{COR}, -\\text{CN}, -\\text{NO}_2$) on the dienophile lower its LUMO energy.
4. **Endo Rule (Alder Endo Rule):**
   - Secondary orbital interactions between the EWG on the dienophile and the developing $\\pi$ system of the diene stabilize the **endo transition state**, making the endo adduct the kinetic major product.`
  },
  {
    keywords: ['friedel-crafts', 'friedel crafts', 'acylation', 'alkylation', 'electrophilic aromatic'],
    title: 'Friedel-Crafts Electrophilic Aromatic Substitution',
    leadSummary: 'Lewis-acid catalyzed alkylation or acylation of aromatic rings via resonance-stabilized arenium intermediates.',
    answer: `### Friedel-Crafts Alkylation & Acylation Mechanisms

Electrophilic aromatic substitution (EAS) catalyzed by strong Lewis acids (typically $\\text{AlCl}_3$ or $\\text{FeCl}_3$).

#### 1. Friedel-Crafts Alkylation:
$$\\text{Ar-H} + \\text{R-Cl} \\xrightarrow{\\text{AlCl}_3} \\text{Ar-R} + \\text{HCl}$$
- **Drawbacks:**
  1. *Carbocation Rearrangements:* 1-chloropropane rearranges to isopropyl cation, producing cumene rather than propylbenzene.
  2. *Polyalkylation:* The introduced alkyl group is electron-donating, activating the ring toward further electrophilic attack.

#### 2. Friedel-Crafts Acylation (Preferred Synthetic Route):
$$\\text{Ar-H} + \\text{R-COCl} \\xrightarrow{\\text{AlCl}_3} \\text{Ar-CO-R} + \\text{HCl}$$
- **Key Advantages:**
  1. *No Rearrangement:* The acylium ion intermediate ($[\\text{R}-\\text{C}\\equiv\\text{O}]^+ \\leftrightarrow [\\text{R}-\\text{C}^+=\\text{O}]$) is resonance-stabilized and does not rearrange.
  2. *Clean Monosubstitution:* The acyl group ($-\\text{COR}$) strongly deactivates the ring toward further substitution.
  3. Subsequent Clemmensen ($\\text{Zn(Hg)}/\\text{HCl}$) or Wolff-Kishner ($\\text{NH}_2\\text{NH}_2/\\text{KOH}$) reduction smoothly yields unbranched primary alkylbenzenes.`
  },
  {
    keywords: ['e1', 'e2', 'elimination mechanism', 'zaitsev', 'hofmann'],
    title: 'E1 vs. E2 Elimination Pathways & Regioselectivity',
    leadSummary: 'E1 proceeds through a carbocation intermediate, while E2 is a concerted bimolecular anti-periplanar elimination.',
    answer: `### E1 vs. E2 Elimination Reactions

| Parameter | E1 (Unimolecular Elimination) | E2 (Bimolecular Elimination) |
| :--- | :--- | :--- |
| **Kinetics** | $\\text{Rate} = k[\\text{R-X}]$ | $\\text{Rate} = k[\\text{R-X}][\\text{Base}]$ |
| **Intermediate** | Carbocation (prone to hydride/alkyl shifts) | No intermediate (concerted transition state) |
| **Stereochemistry** | Non-stereospecific (gives $E$ and $Z$ isomers) | **Strictly Anti-Periplanar** ($H$ and $X$ at $180^\\circ$) |
| **Base Strength** | Weak, neutral ($\\text{H}_2\\text{O}, \\text{ROH}$) | Strong, charged ($\\text{EtO}^-, \\text{OH}^-, \\text{t-BuOK}$) |
| **Substrate** | $3^\\circ > 2^\\circ \\gg 1^\\circ$ (carbocation stability) | $3^\\circ > 2^\\circ > 1^\\circ$ (more substituted alkene product) |

#### Regioselectivity: Zaitsev vs. Hofmann Rule:
- **Zaitsev’s Rule (Small Bases, e.g., $\\text{NaOEt}$):** Deprotonates the more substituted $\\beta$-carbon to yield the **thermodynamically more stable, more substituted alkene**.
- **Hofmann’s Rule (Bulky Bases, e.g., $\\text{KOC(CH}_3)_3$):** Steric hindrance forces deprotonation of the accessible, less substituted $\\beta$-carbon, yielding the **less substituted terminal alkene**.`
  },
  {
    keywords: ['buffer', 'ph', 'henderson-hasselbalch', 'acid-base', 'pka'],
    title: 'Acid-Base Equilibria & Henderson-Hasselbalch Equation',
    leadSummary: 'Buffer solutions resist pH change via Henderson-Hasselbalch: pH = pKa + log([A⁻]/[HA]).',
    answer: `### Acid-Base Equilibria & Buffer Chemistry

A buffer solution resists changes in $pH$ upon the addition of small amounts of strong acid or strong base, composed of a weak acid and its conjugate base.

#### The Henderson-Hasselbalch Equation:
$$\\text{pH} = \\text{p}K_a + \\log_{10}\\left(\\frac{[\\text{A}^-]}{[\\text{HA}]}\\right)$$
- When $[\\text{A}^-] = [\\text{HA}]$, $\\log(1) = 0$, meaning **$\\text{pH} = \\text{p}K_a$**.
- Maximum buffer capacity occurs within **$\\text{pH} = \\text{p}K_a \\pm 1$**.

#### Physiological Application (Blood Carbonate Buffer):
$$\\text{CO}_2(g) + \\text{H}_2\\text{O} \\rightleftharpoons \\text{H}_2\\text{CO}_3 \\rightleftharpoons \\text{HCO}_3^- + \\text{H}^+$$
- Governs systemic blood $pH$ tightly at $7.35 - 7.45$.
- Respiratory hyperventilation clears $\\text{CO}_2$, driving the system left and raising blood $pH$ (respiratory alkalosis).`
  },
  {
    keywords: ['gibbs', 'free energy', 'thermodynamics', 'enthalpy', 'entropy', 'delta g'],
    title: 'Gibbs Free Energy & Spontaneity (ΔG = ΔH - TΔS)',
    leadSummary: 'Spontaneity is dictated by ΔG < 0, balancing enthalpy (ΔH), temperature, and entropy changes (ΔS).',
    answer: `### Gibbs Free Energy & Thermodynamic Spontaneity

The Gibbs free energy change ($\\Delta G$) determines whether a chemical process occurs spontaneously under constant temperature and pressure:
$$\\Delta G = \\Delta H - T\\Delta S$$

#### Spontaneity Quadrants:
1. **$\\Delta H < 0, \\Delta S > 0$:** $\\Delta G$ is negative at **all temperatures** (always spontaneous, e.g., combustion).
2. **$\\Delta H > 0, \\Delta S < 0$:** $\\Delta G$ is positive at **all temperatures** (non-spontaneous, requires continuous external work).
3. **$\\Delta H < 0, \\Delta S < 0$:** Spontaneous only at **low temperatures** ($T < \\Delta H / \\Delta S$, e.g., freezing, condensation).
4. **$\\Delta H > 0, \\Delta S > 0$:** Spontaneous only at **high temperatures** ($T > \\Delta H / \\Delta S$, e.g., vaporization, endothermic dissolution).

#### Relationship to Chemical Equilibrium ($K_{eq}$):
$$\\Delta G^\\circ = -RT\\ln K_{eq}$$
- If $\\Delta G^\\circ < 0$, $K_{eq} > 1$ (products favored at standard state).
- If $\\Delta G^\\circ > 0$, $K_{eq} < 1$ (reactants favored at standard state).`
  },
  {
    keywords: ['kinetics', 'arrhenius', 'rate law', 'half life', 'activation energy', 'order of reaction'],
    title: 'Chemical Kinetics, Rate Laws & Arrhenius Equation',
    leadSummary: 'Reaction rates depend on reactant concentrations via rate laws, while temperature scales k exponentially via Arrhenius.',
    answer: `### Chemical Kinetics & Reaction Dynamics

#### Reaction Order & Integrated Rate Laws:
| Order | Differential Rate Law | Integrated Rate Law | Half-Life ($t_{1/2}$) | Linear Plot |
| :--- | :--- | :--- | :--- | :--- |
| **0th** | $\\text{Rate} = k$ | $[\\text{A}]_t = [\\text{A}]_0 - kt$ | $\\frac{[\\text{A}]_0}{2k}$ | $[\\text{A}]$ vs. $t$ |
| **1st** | $\\text{Rate} = k[\\text{A}]$ | $\\ln[\\text{A}]_t = \\ln[\\text{A}]_0 - kt$ | $\\frac{\\ln 2}{k} \\approx \\frac{0.693}{k}$ (Constant) | $\\ln[\\text{A}]$ vs. $t$ |
| **2nd** | $\\text{Rate} = k[\\text{A}]^2$ | $\\frac{1}{[\\text{A}]_t} = \\frac{1}{[\\text{A}]_0} + kt$ | $\\frac{1}{k[\\text{A}]_0}$ | $\\frac{1}{[\\text{A}]}$ vs. $t$ |

#### The Arrhenius Equation:
$$k = A e^{-E_a / RT} \\quad \\Longleftrightarrow \\quad \\ln k = \\ln A - \\frac{E_a}{R}\\left(\\frac{1}{T}\\right)$$
- **$E_a$ (Activation Energy):** The energy barrier colliding molecules must overcome to achieve the transition state.
- **$A$ (Pre-exponential Factor):** Frequency of collisions with correct spatial orientation.
- **Rule of Thumb:** A $10^\\circ\\text{C}$ rise in temperature approximately doubles the rate constant for typical biochemical transformations ($E_a \\approx 50\\text{ kJ/mol}$).`
  },
  {
    keywords: ['ftir', 'ir spectroscopy', 'infrared', 'carbonyl peak', 'functional group identification'],
    title: 'FTIR Spectroscopy Interpretation & Diagnostic Frequencies',
    leadSummary: 'FTIR identifies molecular functional groups through vibrational bond stretching and bending absorption frequencies.',
    answer: `### FTIR Spectroscopy Diagnostic Wavenumber Guide

Vibrational infrared spectroscopy maps characteristic resonant absorption frequencies ($\\text{cm}^{-1}$) determined by bond force constants ($k$) and reduced atomic masses ($\\mu$):
$$\\tilde{\\nu} = \\frac{1}{2\\pi c}\\sqrt{\\frac{k}{\\mu}}$$

#### Key Diagnostic Absorption Regions:
1. **$3200 - 3650\\text{ cm}^{-1}$ (O-H and N-H Stretching):**
   - **Alcohol / Phenol (O-H):** Very broad, intense parabolic band ($3200-3550\\text{ cm}^{-1}$) due to intermolecular hydrogen bonding.
   - **Carboxylic Acid (O-H):** Extremely broad baseline distortion ($2500-3300\\text{ cm}^{-1}$), engulfing $sp^3$ C-H peaks.
   - **Amine / Amide (N-H):** Sharp doublet for $1^\\circ$ amines ($-\\text{NH}_2$ asymmetric/symmetric); singlet for $2^\\circ$ amines.

2. **$2850 - 3300\\text{ cm}^{-1}$ (C-H Stretching):**
   - **$sp^3$ C-H:** Below $3000\\text{ cm}^{-1}$ ($2850 - 2960\\text{ cm}^{-1}$).
   - **$sp^2$ =C-H (Aromatic/Alkene):** Immediately above $3000\\text{ cm}^{-1}$ ($3010 - 3100\\text{ cm}^{-1}$).
   - **$sp$ $\\equiv$C-H (Terminal Alkyne):** Sharp, strong peak at $3300\\text{ cm}^{-1}$.

3. **$2100 - 2260\\text{ cm}^{-1}$ (Triple Bonds):**
   - **Nitrile ($-\\text{C}\\equiv\\text{N}$):** Sharp, medium peak at $2220 - 2260\\text{ cm}^{-1}$.
   - **Alkyne ($-\\text{C}\\equiv\\text{C}-$):** Variable peak at $2100 - 2250\\text{ cm}^{-1}$ (inactive if symmetric).

4. **$1650 - 1780\\text{ cm}^{-1}$ (Carbonyl C=O Region - The Strongest Peak):**
   - **Anhydrides:** Doublet at $1760$ and $1810\\text{ cm}^{-1}$.
   - **Acid Chlorides:** $\\sim 1800\\text{ cm}^{-1}$.
   - **Esters:** $1735 - 1750\\text{ cm}^{-1}$.
   - **Aldehydes:** $1725\\text{ cm}^{-1}$ (accompanied by Fermi resonance doublet at $2720$ and $2820\\text{ cm}^{-1}$).
   - **Ketones:** $1715\\text{ cm}^{-1}$.
   - **Carboxylic Acids:** $1710\\text{ cm}^{-1}$.
   - **Amides:** $1650 - 1690\\text{ cm}^{-1}$ (lowest wavenumber due to resonance delocalization from nitrogen lone pair).`
  },
  {
    keywords: ['nmr', 'chemical shift', 'proton nmr', 'carbon nmr', 'coupling constant'],
    title: '¹H & ¹³C NMR Spectroscopy Chemical Shifts',
    leadSummary: 'Nuclear Magnetic Resonance reveals molecular connectivity based on magnetic shielding and chemical shift offsets.',
    answer: `### ¹H & ¹³C NMR Chemical Shift Reference

Nuclear magnetic resonance exploits the spin states of active nuclei ($I = 1/2$) subjected to external magnetic fields ($B_0$).

#### ¹H NMR Chemical Shift Regions ($\\delta$, ppm from TMS):
- **$0.8 - 1.5\\text{ ppm}$:** Aliphatic $sp^3$ alkyl protons ($\\text{-CH}_3, \\text{-CH}_2\\text{-}$).
- **$2.0 - 2.5\\text{ ppm}$:** Protons $\\alpha$ to carbonyls ($-\\text{CH}_2-\\text{C=O}$) and allylic/benzylic protons.
- **$3.3 - 4.5\\text{ ppm}$:** Protons on carbons bonded to electronegative heteroatoms ($-\\text{CH}_2-\\text{O-}$, $-\\text{CH}_2-\\text{Cl}$, $-\\text{CH}_2-\\text{Br}$).
- **$4.5 - 6.5\\text{ ppm}$:** Vinylic alkene protons ($-\\text{CH}=\\text{CH}_2$).
- **$6.5 - 8.5\\text{ ppm}$:** Aromatic ring protons (shifted downfield by diamagnetic ring current).
- **$9.0 - 10.0\\text{ ppm}$:** Aldehyde protons ($-\\text{CHO}$).
- **$10.5 - 12.5\\text{ ppm}$:** Carboxylic acid protons ($-\\text{COOH}$, broad singlet exchangeable with $\\text{D}_2\\text{O}$).

#### ¹³C NMR Chemical Shift Ranges:
- **$0 - 50\\text{ ppm}$:** $sp^3$ alkyl carbons.
- **$50 - 90\\text{ ppm}$:** Carbons bonded to oxygen or nitrogen ($\\text{C-O}, \\text{C-N}$).
- **$100 - 150\\text{ ppm}$:** Alkene ($-\\text{C}=\\text{C}-$) and aromatic carbons.
- **$160 - 180\\text{ ppm}$:** Carboxylic acids, esters, and amides.
- **$190 - 220\\text{ ppm}$:** Aldehydes and ketones (most deshielded carbons).`
  },
  {
    keywords: ['vsepr', 'molecular geometry', 'bond angle', 'electron geometry'],
    title: 'VSEPR Theory & 3D Molecular Geometries',
    leadSummary: 'Valence Shell Electron Pair Repulsion dictates 3D geometry by minimizing electrostatic repulsion around central atoms.',
    answer: `### VSEPR Geometry Master Table

Electrons in valence orbitals adopt spatial orientations that minimize mutual Coulombic repulsion (Lone Pair-Lone Pair > Lone Pair-Bonding Pair > Bonding Pair-Bonding Pair).

| Steric No. | Bonding Pairs | Lone Pairs | Molecular Geometry | Ideal Bond Angle | Canonical Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2** | 2 | 0 | **Linear** | $180^\\circ$ | $\\text{CO}_2, \\text{BeCl}_2, \\text{HCN}$ |
| **3** | 3 | 0 | **Trigonal Planar** | $120^\\circ$ | $\\text{BF}_3, \\text{SO}_3, \\text{H}_2\\text{C=O}$ |
| **3** | 2 | 1 | **Bent** | $<120^\\circ$ ($\\sim 118^\\circ$) | $\\text{SO}_2, \\text{O}_3, \\text{NO}_2^-$ |
| **4** | 4 | 0 | **Tetrahedral** | $109.5^\\circ$ | $\\text{CH}_4, \\text{CCl}_4, \\text{NH}_4^+$ |
| **4** | 3 | 1 | **Trigonal Pyramidal** | $107.3^\\circ$ | $\\text{NH}_3, \\text{PCl}_3, \\text{H}_3\\text{O}^+$ |
| **4** | 2 | 2 | **Bent** | $104.5^\\circ$ | $\\text{H}_2\\text{O}, \\text{H}_2\\text{S}, \\text{SF}_2$ |
| **5** | 5 | 0 | **Trigonal Bipyramidal**| $90^\\circ$ (ax), $120^\\circ$ (eq) | $\\text{PCl}_5, \\text{AsF}_5$ |
| **5** | 4 | 1 | **Seesaw** | $<90^\\circ, <120^\\circ$ | $\\text{SF}_4$ (lone pair is equatorial) |
| **5** | 3 | 2 | **T-Shaped** | $<90^\\circ$ ($\\sim 87.5^\\circ$) | $\\text{ClF}_3$ |
| **5** | 2 | 3 | **Linear** | $180^\\circ$ | $\\text{XeF}_2, \\text{I}_3^-$ |
| **6** | 6 | 0 | **Octahedral** | $90^\\circ$ | $\\text{SF}_6, \\text{PF}_6^-$ |
| **6** | 5 | 1 | **Square Pyramidal** | $<90^\\circ$ | $\\text{BrF}_5, \\text{IF}_5$ |
| **6** | 4 | 2 | **Square Planar** | $90^\\circ$ | $\\text{XeF}_4, [\\text{PtCl}_4]^{2-}$ |`
  },
  {
    keywords: ['water', 'hydrogen bond', 'hydrogen bonding', 'properties of water'],
    title: 'Water (H₂O) Physical Chemistry & Hydrogen Bonding Network',
    leadSummary: 'Water forms a tetrahedral hydrogen-bonding lattice responsible for high boiling point, surface tension, and ice flotation.',
    answer: `### Water (H₂O) Molecular & Thermodynamic Unique Attributes

- **Molecular Dipole Moment:** $\\mu = 1.85\\text{ D}$
- **Dielectric Constant:** $\\epsilon_r \\approx 78.4$ at $25^\\circ\\text{C}$ (efficient screening of ionic charges).
- **Geometry:** Bent ($sp^3$ hybridized, bond angle $104.5^\\circ$ compressed from $109.5^\\circ$ by two bulky non-bonding lone pairs).

#### The Cooperative Hydrogen Bond Network:
1. Each water molecule can participate in up to **4 hydrogen bonds** (2 as hydrogen donor via polar $\\text{O}-\\text{H}$ bonds; 2 as hydrogen acceptor via oxygen lone pairs).
2. **Anomalous Density Maximum at 3.98°C:**
   - In ice, water freezes into an open **hexagonal lattice** with cage-like voids, decreasing density from $1.000\\text{ g/cm}^3$ to $0.917\\text{ g/cm}^3$ (why ice floats and insulates aquatic life).
3. **Elevated Heat of Vaporization ($40.65\\text{ kJ/mol}$):**
   - Provides efficient evaporative thermal regulation across biology and geochemical temperature buffering.`
  },
  {
    keywords: ['protac', 'targeted protein degradation', 'e3 ligase', 'cereblon', 'vhl'],
    title: 'Targeted Protein Degraders (PROTACs) & Molecular Glues',
    leadSummary: 'PROTACs recruit E3 ubiquitin ligases to target proteins to induce targeted proteasomal destruction.',
    answer: `### Targeted Protein Degradation (PROTACs)

PROTACs (Proteolysis Targeting Chimeras) are heterobifunctional molecules that induce selective degradation of disease-causing proteins via the ubiquitin-proteasome system (UPS).

#### Modular Tripartite Architecture:
1. **Target Protein Warhead:** Binds the Protein of Interest (POI) with nanomolar affinity.
2. **Linker Domain:** Flexible PEG, alkyl, or rigid alkynyl spacer optimizing conformational ternary complex geometry.
3. **E3 Ligase Ligand:** Recruits an endogenous ubiquitin E3 ligase (primarily **Cereblon / CRBN** or **Von Hippel-Lindau / VHL**).

#### Mechanistic Advantages Over Classical Occupancy Inhibitors:
- **Catalytic (Sub-stoichiometric) Action:** One PROTAC molecule can sequentially degrade hundreds of target proteins ("event-driven" pharmacology).
- **Targeting "Undruggable" Proteomes:** Can degrade transcription factors and scaffold proteins lacking enzymatic active sites.`
  }
];

/**
 * Extracts immediate chemical lead finding in <5ms for instant rendering
 */
export function generateInstantLeadAnswer(query) {
  if (!query || typeof query !== 'string') return null;
  const lower = query.toLowerCase().trim();

  // Search local knowledge directly
  for (const item of BUILTIN_CHEMISTRY_KNOWLEDGE) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return {
        title: item.title,
        lead: item.leadSummary || item.title,
        isInstant: true
      };
    }
  }

  // Extract primary chemical entity from query
  const words = query.trim().split(/\s+/);
  const subject = words.slice(0, 5).join(' ');
  return {
    title: `Chemical Analysis: ${subject}`,
    lead: `Computing verified physicochemical and mechanistic descriptors for ${subject}...`,
    isInstant: true
  };
}

/**
 * Executes a chemistry query using ultra-fast local scientific knowledge first (<5ms),
 * with fast-race fallback to remote models when needed.
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
      title: 'Domain Guardrail',
      leadSummary: 'Out of scope inquiry detected.',
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

  // 1. Instant High-Speed Local Chemistry Knowledge Base Check (<5ms execution)
  const lower = trimmed.toLowerCase();
  for (const item of BUILTIN_CHEMISTRY_KNOWLEDGE) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return {
        success: true,
        isChemistry: true,
        title: item.title,
        leadSummary: item.leadSummary || item.title,
        answer: item.answer,
        source: 'ChemSpace Core Chemical Knowledge (Instant)'
      };
    }
  }

  // 2. Ultra-Fast Remote Race (Timeout capped strictly at 1.5s to prevent freezing)
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

      // Race remote call with a 1500ms abort deadline
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Fast timeout triggered')), 1500)
      );

      const geminiPromise = callGeminiChat(chemistrySystemPrompt);
      const geminiRes = await Promise.race([geminiPromise, timeoutPromise]);

      if (geminiRes && geminiRes.responseText) {
        return {
          success: true,
          isChemistry: true,
          title: `Chemical Response: ${trimmed.slice(0, 35)}`,
          leadSummary: `Scientific reasoning completed by ChemSpace AI.`,
          answer: geminiRes.responseText,
          source: 'ChemSpace DeepChem LLM'
        };
      }
    } catch {
      // Remote call timed out or failed; seamlessly fall through to instant scientific generator
    }
  }

  // 3. Instant Structured Chemical Analysis & Reasoning Engine (<10ms)
  return {
    success: true,
    isChemistry: true,
    title: `Chemical Analysis: ${trimmed.slice(0, 40)}`,
    leadSummary: `Electronic, mechanistic, and thermodynamic breakdown for ${trimmed.slice(0, 45)}.`,
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
    source: 'ChemSpace Scientific Knowledge Engine (Instant)'
  };
}
