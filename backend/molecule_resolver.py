"""
ChemSpace Molecule Input Resolution Engine
Provides unified Molecule Name + SMILES resolution, ambiguity handling,
lightweight suggestions, and 2D vector depiction.
"""

import re
import json
import urllib.request
import urllib.parse
from typing import Dict, Any, List, Optional

try:
    from rdkit import Chem, rdBase
    from rdkit.Chem import AllChem, Descriptors, rdMolDescriptors, rdDepictor
    from rdkit.Chem.Draw import rdMolDraw2D
    rdBase.DisableLog('rdApp.error')
    rdBase.DisableLog('rdApp.warning')
    RDKIT_AVAILABLE = True
except Exception:
    RDKIT_AVAILABLE = False


# In-memory resolution cache to avoid redundant external network lookups
_RESOLUTION_CACHE: Dict[str, Dict[str, Any]] = {}

# Ambiguous chemical terms that must present choices to the user rather than guessing
AMBIGUOUS_CHEMICALS: Dict[str, List[Dict[str, str]]] = {
    "xylene": [
        {"name": "o-Xylene (1,2-Dimethylbenzene)", "smiles": "Cc1ccccc1C", "formula": "C8H10", "mw": "106.17"},
        {"name": "m-Xylene (1,3-Dimethylbenzene)", "smiles": "Cc1cccc(C)c1", "formula": "C8H10", "mw": "106.17"},
        {"name": "p-Xylene (1,4-Dimethylbenzene)", "smiles": "Cc1ccc(C)cc1", "formula": "C8H10", "mw": "106.17"}
    ],
    "dimethylbenzene": [
        {"name": "o-Xylene (1,2-Dimethylbenzene)", "smiles": "Cc1ccccc1C", "formula": "C8H10", "mw": "106.17"},
        {"name": "m-Xylene (1,3-Dimethylbenzene)", "smiles": "Cc1cccc(C)c1", "formula": "C8H10", "mw": "106.17"},
        {"name": "p-Xylene (1,4-Dimethylbenzene)", "smiles": "Cc1ccc(C)cc1", "formula": "C8H10", "mw": "106.17"}
    ],
    "butanol": [
        {"name": "1-Butanol (n-Butanol)", "smiles": "CCCCO", "formula": "C4H10O", "mw": "74.12"},
        {"name": "2-Butanol (sec-Butanol)", "smiles": "CCC(C)O", "formula": "C4H10O", "mw": "74.12"},
        {"name": "Isobutanol (2-Methylpropan-1-ol)", "smiles": "CC(C)CO", "formula": "C4H10O", "mw": "74.12"},
        {"name": "tert-Butanol (2-Methylpropan-2-ol)", "smiles": "CC(C)(C)O", "formula": "C4H10O", "mw": "74.12"}
    ],
    "butyl alcohol": [
        {"name": "1-Butanol (n-Butyl alcohol)", "smiles": "CCCCO", "formula": "C4H10O", "mw": "74.12"},
        {"name": "2-Butanol (sec-Butyl alcohol)", "smiles": "CCC(C)O", "formula": "C4H10O", "mw": "74.12"},
        {"name": "Isobutanol (Isobutyl alcohol)", "smiles": "CC(C)CO", "formula": "C4H10O", "mw": "74.12"},
        {"name": "tert-Butanol (tert-Butyl alcohol)", "smiles": "CC(C)(C)O", "formula": "C4H10O", "mw": "74.12"}
    ],
    "propanol": [
        {"name": "1-Propanol (n-Propanol)", "smiles": "CCCO", "formula": "C3H8O", "mw": "60.10"},
        {"name": "2-Propanol (Isopropanol / IPA)", "smiles": "CC(O)C", "formula": "C3H8O", "mw": "60.10"}
    ],
    "propyl alcohol": [
        {"name": "1-Propanol (n-Propyl alcohol)", "smiles": "CCCO", "formula": "C3H8O", "mw": "60.10"},
        {"name": "Isopropanol (Isopropyl alcohol)", "smiles": "CC(O)C", "formula": "C3H8O", "mw": "60.10"}
    ],
    "cresol": [
        {"name": "o-Cresol (2-Methylphenol)", "smiles": "Cc1ccccc1O", "formula": "C7H8O", "mw": "108.14"},
        {"name": "m-Cresol (3-Methylphenol)", "smiles": "Cc1cccc(O)c1", "formula": "C7H8O", "mw": "108.14"},
        {"name": "p-Cresol (4-Methylphenol)", "smiles": "Cc1ccc(O)cc1", "formula": "C7H8O", "mw": "108.14"}
    ],
    "toluidine": [
        {"name": "o-Toluidine (2-Methylaniline)", "smiles": "Cc1ccccc1N", "formula": "C7H9N", "mw": "107.16"},
        {"name": "m-Toluidine (3-Methylaniline)", "smiles": "Cc1cccc(N)c1", "formula": "C7H9N", "mw": "107.16"},
        {"name": "p-Toluidine (4-Methylaniline)", "smiles": "Cc1ccc(N)cc1", "formula": "C7H9N", "mw": "107.16"}
    ],
    "phthalic acid": [
        {"name": "Phthalic Acid (Benzene-1,2-dicarboxylic acid)", "smiles": "O=C(O)c1ccccc1C(=O)O", "formula": "C8H6O4", "mw": "166.13"},
        {"name": "Isophthalic Acid (Benzene-1,3-dicarboxylic acid)", "smiles": "O=C(O)c1cccc(c1)C(=O)O", "formula": "C8H6O4", "mw": "166.13"},
        {"name": "Terephthalic Acid (Benzene-1,4-dicarboxylic acid)", "smiles": "O=C(O)c1ccc(cc1)C(=O)O", "formula": "C8H6O4", "mw": "166.13"}
    ]
}


# High-speed verified local dictionary for common reagents, solvents, drugs, and laboratory chemicals
COMMON_MOLECULE_CATALOG: Dict[str, Dict[str, Any]] = {
    # Solvents & Reagents
    "water": {"name": "Water", "iupac": "Oxidane", "smiles": "O", "formula": "H2O", "mw": 18.02, "aliases": ["h2o", "aqua", "oxidane", "నీరు", "पानी"]},
    "ethanol": {"name": "Ethanol", "iupac": "Ethanol", "smiles": "CCO", "formula": "C2H6O", "mw": 46.07, "aliases": ["ethyl alcohol", "grain alcohol", "etoh", "ఇథనాల్", "एथेनॉल"]},
    "methanol": {"name": "Methanol", "iupac": "Methanol", "smiles": "CO", "formula": "CH4O", "mw": 32.04, "aliases": ["methyl alcohol", "wood alcohol", "meoh", "మిథనాల్", "मेथनॉल"]},
    "isopropanol": {"name": "Isopropanol", "iupac": "Propan-2-ol", "smiles": "CC(O)C", "formula": "C3H8O", "mw": 60.10, "aliases": ["isopropyl alcohol", "ipa", "2-propanol", "rubbing alcohol"]},
    "acetone": {"name": "Acetone", "iupac": "Propan-2-one", "smiles": "CC(=O)C", "formula": "C3H6O", "mw": 58.08, "aliases": ["propanone", "dimethyl ketone"]},
    "acetic acid": {"name": "Acetic Acid", "iupac": "Ethanoic acid", "smiles": "CC(=O)O", "formula": "C2H4O2", "mw": 60.05, "aliases": ["ethanoic acid", "vinegar acid", "glacial acetic acid", "ఎసిటిక్ ఆమ్లం", "एसिटिक एसिड"]},
    "acetic anhydride": {"name": "Acetic Anhydride", "iupac": "Acetyl acetate", "smiles": "CC(=O)OC(=O)C", "formula": "C4H6O3", "mw": 102.09, "aliases": ["ethanoic anhydride"]},
    "ethyl acetate": {"name": "Ethyl Acetate", "iupac": "Ethyl ethanoate", "smiles": "CCOC(=O)C", "formula": "C4H8O2", "mw": 88.11, "aliases": ["etac", "ethyl ethanoate"]},
    "diethyl ether": {"name": "Diethyl Ether", "iupac": "Ethoxyethane", "smiles": "CCOCC", "formula": "C4H10O", "mw": 74.12, "aliases": ["ether", "ethoxyethane"]},
    "tetrahydrofuran": {"name": "Tetrahydrofuran", "iupac": "Oxolane", "smiles": "C1CCOC1", "formula": "C4H8O", "mw": 72.11, "aliases": ["thf", "oxolane"]},
    "dichloromethane": {"name": "Dichloromethane", "iupac": "Dichloromethane", "smiles": "ClCCl", "formula": "CH2Cl2", "mw": 84.93, "aliases": ["dcm", "methylene chloride"]},
    "chloroform": {"name": "Chloroform", "iupac": "Trichloromethane", "smiles": "ClC(Cl)Cl", "formula": "CHCl3", "mw": 119.38, "aliases": ["trichloromethane"]},
    "dimethyl sulfoxide": {"name": "Dimethyl Sulfoxide", "iupac": "Methanesulfinylmethane", "smiles": "CS(=O)C", "formula": "C2H6OS", "mw": 78.13, "aliases": ["dmso"]},
    "dimethylformamide": {"name": "Dimethylformamide", "iupac": "N,N-Dimethylformamide", "smiles": "CN(C)C=O", "formula": "C3H7NO", "mw": 73.09, "aliases": ["dmf"]},
    "acetonitrile": {"name": "Acetonitrile", "iupac": "Acetonitrile", "smiles": "CC#N", "formula": "C2H3N", "mw": 41.05, "aliases": ["mecn", "cyanomethane"]},
    "toluene": {"name": "Toluene", "iupac": "Methylbenzene", "smiles": "Cc1ccccc1", "formula": "C7H8", "mw": 92.14, "aliases": ["methylbenzene", "toluol", "టోలుయీన్"]},
    "benzene": {"name": "Benzene", "iupac": "Benzene", "smiles": "c1ccccc1", "formula": "C6H6", "mw": 78.11, "aliases": ["benzol", "[6]annulene", "బెంజీన్", "बेंजीन"]},
    "phenol": {"name": "Phenol", "iupac": "Phenol", "smiles": "Oc1ccccc1", "formula": "C6H6O", "mw": 94.11, "aliases": ["hydroxybenzene", "carbolic acid"]},
    "aniline": {"name": "Aniline", "iupac": "Aniline", "smiles": "Nc1ccccc1", "formula": "C6H7N", "mw": 93.13, "aliases": ["aminobenzene", "phenylamine"]},
    "pyridine": {"name": "Pyridine", "iupac": "Pyridine", "smiles": "c1ccncc1", "formula": "C5H5N", "mw": 79.10, "aliases": ["azabenzene"]},
    "cyclohexane": {"name": "Cyclohexane", "iupac": "Cyclohexane", "smiles": "C1CCCCC1", "formula": "C6H12", "mw": 84.16, "aliases": ["hexamethylene"]},

    # Biomolecules & Pharmaceuticals
    "aspirin": {"name": "Aspirin", "iupac": "2-Acetyloxybenzoic acid", "smiles": "CC(=O)Oc1ccccc1C(=O)O", "formula": "C9H8O4", "mw": 180.16, "aliases": ["acetylsalicylic acid", "asa", "ఆస్పిరిన్", "एस्पिरिन"]},
    "salicylic acid": {"name": "Salicylic Acid", "iupac": "2-Hydroxybenzoic acid", "smiles": "O=C(O)c1ccccc1O", "formula": "C7H6O3", "mw": 138.12, "aliases": ["2-hydroxybenzoic acid"]},
    "paracetamol": {"name": "Paracetamol", "iupac": "N-(4-Hydroxyphenyl)acetamide", "smiles": "CC(=O)Nc1ccc(O)cc1", "formula": "C8H9NO2", "mw": 151.16, "aliases": ["acetaminophen", "tylenol", "apap", "పారాసిటమాల్", "पैरासिटामोल"]},
    "acetaminophen": {"name": "Acetaminophen", "iupac": "N-(4-Hydroxyphenyl)acetamide", "smiles": "CC(=O)Nc1ccc(O)cc1", "formula": "C8H9NO2", "mw": 151.16, "aliases": ["paracetamol", "tylenol"]},
    "caffeine": {"name": "Caffeine", "iupac": "1,3,7-Trimethylpurine-2,6-dione", "smiles": "Cn1cnc2c1c(=O)n(c(=O)n2C)C", "formula": "C8H10N4O2", "mw": 194.19, "aliases": ["1,3,7-trimethylxanthine", "కెఫీన్", "कैफीन"]},
    "ibuprofen": {"name": "Ibuprofen", "iupac": "2-[4-(2-Methylpropyl)phenyl]propanoic acid", "smiles": "CC(C)Cc1ccc(cc1)C(C)C(=O)O", "formula": "C13H18O2", "mw": 206.28, "aliases": ["advil", "motrin", "ఐబుప్రోఫెన్"]},
    "glucose": {"name": "D-Glucose", "iupac": "(2R,3S,4R,5R)-2,3,4,5,6-Pentahydroxyhexanal", "smiles": "OCC1OC(O)C(O)C(O)C1O", "formula": "C6H12O6", "mw": 180.16, "aliases": ["dextrose", "blood sugar", "గ్లూకోజ్", "ग्लूकोज"]},
    "fructose": {"name": "D-Fructose", "iupac": "D-Fructose", "smiles": "OCC1OC(O)(CO)C(O)C1O", "formula": "C6H12O6", "mw": 180.16, "aliases": ["fruit sugar", "levulose"]},
    "sucrose": {"name": "Sucrose", "iupac": "Sucrose", "smiles": "OCC1OC(OC2(CO)OC(CO)C(O)C2O)C(O)C(O)C1O", "formula": "C12H22O11", "mw": 342.30, "aliases": ["table sugar", "saccharose"]},
    "benzoic acid": {"name": "Benzoic Acid", "iupac": "Benzoic acid", "smiles": "O=C(O)c1ccccc1", "formula": "C7H6O2", "mw": 122.12, "aliases": ["dracylic acid"]},
    "benzaldehyde": {"name": "Benzaldehyde", "iupac": "Benzaldehyde", "smiles": "O=Cc1ccccc1", "formula": "C7H6O", "mw": 106.12, "aliases": ["oil of bitter almond"]},
    "urea": {"name": "Urea", "iupac": "Carbamide", "smiles": "NC(=O)N", "formula": "CH4N2O", "mw": 60.06, "aliases": ["carbamide"]},
    "glycine": {"name": "Glycine", "iupac": "2-Aminoacetic acid", "smiles": "NCC(=O)O", "formula": "C2H5NO2", "mw": 75.07, "aliases": ["aminoacetic acid"]},
    "alanine": {"name": "Alanine", "iupac": "2-Aminopropanoic acid", "smiles": "CC(N)C(=O)O", "formula": "C3H7NO2", "mw": 89.09, "aliases": ["2-aminopropionic acid"]},
    "dopamine": {"name": "Dopamine", "iupac": "4-(2-Aminoethyl)benzene-1,2-diol", "smiles": "NCCc1ccc(O)c(O)c1", "formula": "C8H11NO2", "mw": 153.18, "aliases": ["hydroxytyramine"]},
    "serotonin": {"name": "Serotonin", "iupac": "3-(2-Aminoethyl)-1H-indol-5-ol", "smiles": "NCCc1c[nH]c2ccc(O)cc12", "formula": "C10H12N2O", "mw": 176.21, "aliases": ["5-hydroxytryptamine", "5-ht"]},
    "nicotine": {"name": "Nicotine", "iupac": "3-[(2S)-1-Methylpyrrolidin-2-yl]pyridine", "smiles": "CN1CCCC1c2cccnc2", "formula": "C10H14N2", "mw": 162.23, "aliases": ["3-(1-methyl-2-pyrrolidinyl)pyridine"]},
    "ascorbic acid": {"name": "Ascorbic Acid", "iupac": "(5R)-[(1S)-1,2-Dihydroxyethyl]-3,4-dihydroxyfuran-2(5H)-one", "smiles": "OCC(O)C1OC(=O)C(O)=C1O", "formula": "C6H8O6", "mw": 176.12, "aliases": ["vitamin c", "l-ascorbic acid"]},
    "citric acid": {"name": "Citric Acid", "iupac": "2-Hydroxypropane-1,2,3-tricarboxylic acid", "smiles": "OC(=O)CC(O)(CC(=O)O)C(=O)O", "formula": "C6H8O7", "mw": 192.12, "aliases": ["citronensaure"]},
    "lactic acid": {"name": "Lactic Acid", "iupac": "2-Hydroxypropanoic acid", "smiles": "CC(O)C(=O)O", "formula": "C3H6O3", "mw": 90.08, "aliases": ["milk acid"]},
    "naphthalene": {"name": "Naphthalene", "iupac": "Naphthalene", "smiles": "c1ccc2ccccc2c1", "formula": "C10H8", "mw": 128.17, "aliases": ["mothballs"]},
    "methane": {"name": "Methane", "iupac": "Methane", "smiles": "C", "formula": "CH4", "mw": 16.04, "aliases": ["natural gas"]},
    "ethane": {"name": "Ethane", "iupac": "Ethane", "smiles": "CC", "formula": "C2H6", "mw": 30.07, "aliases": []},
    "propane": {"name": "Propane", "iupac": "Propane", "smiles": "CCC", "formula": "C3H8", "mw": 44.10, "aliases": []},
    "ethylene": {"name": "Ethylene", "iupac": "Ethene", "smiles": "C=C", "formula": "C2H4", "mw": 28.05, "aliases": ["ethene"]},
    "acetylene": {"name": "Acetylene", "iupac": "Ethyne", "smiles": "C#C", "formula": "C2H2", "mw": 26.04, "aliases": ["ethyne"]},
    "formaldehyde": {"name": "Formaldehyde", "iupac": "Methanal", "smiles": "C=O", "formula": "CH2O", "mw": 30.03, "aliases": ["methanal", "formalin"]},
    "vanillin": {"name": "Vanillin", "iupac": "4-Hydroxy-3-methoxybenzaldehyde", "smiles": "COc1cc(C=O)ccc1O", "formula": "C8H8O3", "mw": 152.15, "aliases": ["vanilla"]},
    "menthol": {"name": "Menthol", "iupac": "5-Methyl-2-(propan-2-yl)cyclohexan-1-ol", "smiles": "CC1CCC(C(C1)O)C(C)C", "formula": "C10H20O", "mw": 156.27, "aliases": ["peppermint camphor"]},
    "cholesterol": {"name": "Cholesterol", "iupac": "Cholesterol", "smiles": "CC(C)CCCC(C)C1CCC2C3CC=C4CC(O)CCC4(C)C3CCC12C", "formula": "C27H46O", "mw": 386.65, "aliases": []},
    "morphine": {"name": "Morphine", "iupac": "Morphine", "smiles": "CN1CCC23C4Oc5c(O)ccc(CC1C2C=CC4O)c53", "formula": "C17H19NO3", "mw": 285.34, "aliases": []},
    "resveratrol": {"name": "Resveratrol", "iupac": "5-[(E)-2-(4-Hydroxyphenyl)ethenyl]benzene-1,3-diol", "smiles": "Oc1ccc(C=Cc2cc(O)cc(O)c2)cc1", "formula": "C14H12O3", "mw": 228.24, "aliases": []},
    "penicillin g": {"name": "Penicillin G", "iupac": "Benzylpenicillin", "smiles": "CC1(C)SC2C(NC(=O)Cc3ccccc3)C(=O)N2C1C(=O)O", "formula": "C16H18N2O4S", "mw": 334.39, "aliases": ["benzylpenicillin"]}
}


def clean_query_text(raw: str) -> str:
    """Removes excess whitespace and conversational prefixes."""
    if not raw:
        return ""
    q = raw.strip()
    # Strip common conversational commands
    q = re.sub(r'^(?:show me|find|get|what is|lookup|calculate|structure of|smiles for|smiles of|compound)\s+', '', q, flags=re.I)
    q = q.rstrip('?.!').strip()
    return q


def generate_2d_svg(smiles: str, width: int = 240, height: int = 160) -> Optional[str]:
    """Generates a clean, transparent, theme-compatible 2D vector depiction of the molecule."""
    if not RDKIT_AVAILABLE or not smiles:
        return None
    try:
        mol = Chem.MolFromSmiles(smiles)
        if not mol:
            return None
        rdDepictor.Compute2DCoords(mol)
        drawer = rdMolDraw2D.MolDraw2DSVG(width, height)
        opts = drawer.drawOptions()
        opts.clearBackground = False  # Transparent background
        opts.bondLineWidth = 2.2
        opts.padding = 0.08
        drawer.DrawMolecule(mol)
        drawer.FinishDrawing()
        svg = drawer.GetDrawingText()
        # Clean SVG header for seamless DOM embedding
        svg = re.sub(r'<\?xml[^>]*\?>', '', svg).strip()
        return svg
    except Exception:
        return None


def is_likely_smiles(query: str) -> bool:
    """Intelligently detects whether query string represents raw SMILES notation."""
    if not query:
        return False
    q = query.strip()

    # If it directly matches known chemical names in English or Indic, it's a name
    lower = q.lower()
    if lower in COMMON_MOLECULE_CATALOG or lower in AMBIGUOUS_CHEMICALS:
        return False

    for entry in COMMON_MOLECULE_CATALOG.values():
        if any(alias.lower() == lower for alias in entry.get("aliases", [])):
            return False

    # Check for typical SMILES characters (rings, branching, double/triple bonds, bracketed atoms)
    has_smiles_chars = bool(re.search(r'[=#\(\)1-9@\[\]]', q))
    has_no_spaces = ' ' not in q

    # Common short linear SMILES without special punctuation
    short_smiles = {'CCO', 'CC', 'CO', 'CCC', 'CCCC', 'O', 'C', 'NCC(=O)O', 'ClCCl', 'CCOCC'}
    if q in short_smiles:
        return True

    if has_smiles_chars and has_no_spaces:
        return True

    return False


def query_pubchem_external(chemical_name: str) -> Optional[Dict[str, Any]]:
    """Proxies request to PubChem PUG REST API on the server side."""
    safe_name = urllib.parse.quote(chemical_name.strip())
    url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{safe_name}/property/CanonicalSMILES,IsomericSMILES,MolecularFormula,MolecularWeight,IUPACName,Title/JSON"

    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "ChemSpace-Scientific-Platform/3.1 (academic research)"}
        )
        with urllib.request.urlopen(req, timeout=4.0) as res:
            if res.status == 200:
                data = json.loads(res.read().decode('utf-8'))
                props_list = data.get("PropertyTable", {}).get("Properties", [])
                if props_list:
                    # If multiple hits returned, we can capture up to 3 for disambiguation
                    primary = props_list[0]
                    return {
                        "primary": primary,
                        "candidates": props_list[:4]
                    }
    except Exception:
        pass
    return None


def resolve_molecule_query(query: str) -> Dict[str, Any]:
    """
    Main resolution function. Converges Molecule Name OR SMILES into a
    normalized, canonical molecular representation.
    """
    clean_q = clean_query_text(query)
    if not clean_q:
        return {
            "success": False,
            "error": "Empty molecule input. Please enter a molecule name or SMILES string."
        }

    lower_q = clean_q.lower()

    # 1. Check in-memory cache
    if lower_q in _RESOLUTION_CACHE:
        return _RESOLUTION_CACHE[lower_q]

    # 2. Check for known ambiguous terms requiring isomer choice
    if lower_q in AMBIGUOUS_CHEMICALS:
        response = {
            "success": True,
            "ambiguous": True,
            "query": clean_q,
            "message": f"Multiple structural isomers found for '{clean_q}'. Please select the intended molecule:",
            "matches": AMBIGUOUS_CHEMICALS[lower_q]
        }
        _RESOLUTION_CACHE[lower_q] = response
        return response

    # 3. Detect if it's already a valid SMILES string
    if RDKIT_AVAILABLE and is_likely_smiles(clean_q):
        try:
            mol = Chem.MolFromSmiles(clean_q)
            if mol:
                canonical_smiles = Chem.MolToSmiles(mol)
                formula = rdMolDescriptors.CalcMolFormula(mol)
                mw = round(Descriptors.MolWt(mol), 2)
                svg = generate_2d_svg(canonical_smiles)

                # Attempt reverse identification from local catalog
                recognized_name = None
                recognized_iupac = None
                for entry in COMMON_MOLECULE_CATALOG.values():
                    if entry["smiles"] == canonical_smiles:
                        recognized_name = entry["name"]
                        recognized_iupac = entry.get("iupac")
                        break

                response = {
                    "success": True,
                    "ambiguous": False,
                    "input_type": "smiles",
                    "query": clean_q,
                    "name": recognized_name or clean_q,
                    "iupac": recognized_iupac or "",
                    "smiles": canonical_smiles,
                    "formula": formula,
                    "mw": mw,
                    "svg_2d": svg,
                    "source": "RDKit Kernel"
                }
                _RESOLUTION_CACHE[lower_q] = response
                return response
        except Exception:
            pass

    # 4. Check local high-speed catalog by common name or alias
    matched_entry = None
    if lower_q in COMMON_MOLECULE_CATALOG:
        matched_entry = COMMON_MOLECULE_CATALOG[lower_q]
    else:
        for entry in COMMON_MOLECULE_CATALOG.values():
            if entry["name"].lower() == lower_q or entry.get("iupac", "").lower() == lower_q:
                matched_entry = entry
                break
            if any(a.lower() == lower_q for a in entry.get("aliases", [])):
                matched_entry = entry
                break

    if matched_entry:
        smiles = matched_entry["smiles"]
        formula = matched_entry["formula"]
        mw = matched_entry["mw"]
        svg = generate_2d_svg(smiles)

        if RDKIT_AVAILABLE:
            try:
                mol = Chem.MolFromSmiles(smiles)
                if mol:
                    smiles = Chem.MolToSmiles(mol)
                    formula = rdMolDescriptors.CalcMolFormula(mol)
                    mw = round(Descriptors.MolWt(mol), 2)
            except Exception:
                pass

        response = {
            "success": True,
            "ambiguous": False,
            "input_type": "name",
            "query": clean_q,
            "name": matched_entry["name"],
            "iupac": matched_entry.get("iupac", matched_entry["name"]),
            "smiles": smiles,
            "formula": formula,
            "mw": mw,
            "svg_2d": svg,
            "source": "ChemSpace Verified Catalog"
        }
        _RESOLUTION_CACHE[lower_q] = response
        return response

    # 5. Query external chemical database (PubChem PUG REST) on backend
    pubchem_result = query_pubchem_external(clean_q)
    if pubchem_result:
        primary = pubchem_result["primary"]
        canonical_smiles = primary.get("CanonicalSMILES") or primary.get("IsomericSMILES")
        if canonical_smiles:
            formula = primary.get("MolecularFormula", "")
            raw_mw = primary.get("MolecularWeight", 0)
            try:
                mw = round(float(raw_mw), 2)
            except Exception:
                mw = 0.0

            svg = generate_2d_svg(canonical_smiles)

            if RDKIT_AVAILABLE:
                try:
                    mol = Chem.MolFromSmiles(canonical_smiles)
                    if mol:
                        canonical_smiles = Chem.MolToSmiles(mol)
                        formula = formula or rdMolDescriptors.CalcMolFormula(mol)
                        mw = mw or round(Descriptors.MolWt(mol), 2)
                except Exception:
                    pass

            response = {
                "success": True,
                "ambiguous": False,
                "input_type": "name",
                "query": clean_q,
                "name": primary.get("Title") or primary.get("IUPACName") or clean_q.capitalize(),
                "iupac": primary.get("IUPACName") or "",
                "smiles": canonical_smiles,
                "formula": formula,
                "mw": mw,
                "svg_2d": svg,
                "source": "NIH PubChem Verified Database"
            }
            _RESOLUTION_CACHE[lower_q] = response
            return response

    # 6. If invalid or not found, return scientific, actionable error messages
    if any(c in clean_q for c in ['=', '#', '(', ')', '@', '[', ']']) and ' ' not in clean_q:
        return {
            "success": False,
            "ambiguous": False,
            "query": clean_q,
            "input_type": "smiles",
            "error": "Invalid SMILES. Please check the structure or enter the molecule name."
        }

    return {
        "success": False,
        "ambiguous": False,
        "query": clean_q,
        "input_type": "name",
        "error": f"Molecule not found for '{clean_q}'. Please check the name or enter a valid SMILES string."
    }


def suggest_molecules(query: str, limit: int = 8) -> List[Dict[str, str]]:
    """Returns fast, lightweight autocomplete suggestions matching the query."""
    if not query or len(query.strip()) < 1:
        return []

    q = query.strip().lower()
    results = []
    seen = set()

    # Search in ambiguous catalog first if user starts typing e.g. "xyl", "butan", "propan"
    for term, isomers in AMBIGUOUS_CHEMICALS.items():
        if term.startswith(q) or q in term:
            for iso in isomers:
                if iso["name"] not in seen:
                    results.append(iso)
                    seen.add(iso["name"])
                    if len(results) >= limit:
                        return results

    # Search in common catalog
    for key, entry in COMMON_MOLECULE_CATALOG.items():
        name = entry["name"]
        iupac = entry.get("iupac", "")
        aliases = entry.get("aliases", [])

        # Priority 1: Prefix match on name or key
        if key.startswith(q) or name.lower().startswith(q) or iupac.lower().startswith(q):
            if name not in seen:
                results.append({"name": name, "smiles": entry["smiles"], "formula": entry["formula"], "mw": str(entry["mw"])})
                seen.add(name)

        # Priority 2: Alias match
        elif any(a.lower().startswith(q) for a in aliases):
            if name not in seen:
                results.append({"name": name, "smiles": entry["smiles"], "formula": entry["formula"], "mw": str(entry["mw"])})
                seen.add(name)

        if len(results) >= limit:
            return results

    # Substring search if still under limit
    if len(results) < limit:
        for key, entry in COMMON_MOLECULE_CATALOG.items():
            name = entry["name"]
            if (q in key or q in name.lower()) and name not in seen:
                results.append({"name": name, "smiles": entry["smiles"], "formula": entry["formula"], "mw": str(entry["mw"])})
                seen.add(name)
                if len(results) >= limit:
                    break

    return results
