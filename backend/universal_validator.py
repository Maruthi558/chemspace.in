"""
ChemSpace Universal Molecular Input & Validation Layer
Provides condition-aware, toolkit-agnostic validation, format detection,
valence checks, classification, and compatibility matrix generation for:
- SMILES & Canonical / Isomeric SMILES
- InChI & InChIKey
- MDL MOL & Multi-record SDF
- Chemical Names (via local catalog and PubChem resolver)
- Organometallics, salts, stereoisomers, peptides, and macrocycles
"""

import os
import re
import json
import logging
import urllib.request
import urllib.parse
from typing import Dict, Any, List, Optional, Tuple

from backend.pure_cheminformatics import (
    parse_smiles_pure,
    calculate_pure_properties,
    generate_pure_3d_coordinates
)

logger = logging.getLogger("chemspace.universal_validator")

# Supported element sets by force fields and tools
ORGANIC_SUBSET = {'H', 'C', 'N', 'O', 'F', 'P', 'S', 'Cl', 'Br', 'I'}
COMMON_METALS = {
    'Li', 'Na', 'K', 'Rb', 'Cs', 'Be', 'Mg', 'Ca', 'Sr', 'Ba',
    'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Pt', 'Pd', 'Ru', 'Rh', 'Au', 'Ag'
}


class MolecularValidationReport:
    """Standardized validation and compatibility report schema."""

    def __init__(self, raw_input: str):
        self.raw_input = raw_input.strip()
        self.detected_format: str = "Unknown"
        self.is_valid: bool = False
        self.is_partially_supported: bool = False
        self.canonical_smiles: Optional[str] = None
        self.isomeric_smiles: Optional[str] = None
        self.inchi: Optional[str] = None
        self.inchikey: Optional[str] = None
        self.molecular_formula: Optional[str] = None
        self.molecular_weight: Optional[float] = None
        self.exact_mass: Optional[float] = None
        self.formal_charge: int = 0
        self.heavy_atom_count: int = 0
        self.total_atom_count: int = 0
        self.bond_count: int = 0
        self.num_rotatable_bonds: int = 0
        self.chiral_centers: List[Dict[str, Any]] = []
        self.has_unassigned_stereocenters: bool = False
        
        # Classification
        self.is_salt_or_mixture: bool = False
        self.fragment_count: int = 1
        self.is_organometallic: bool = False
        self.is_macrocycle: bool = False
        self.is_peptide_like: bool = False
        self.is_zwitterion: bool = False
        self.contains_metals: bool = False
        self.unsupported_elements: List[str] = []
        self.elements_present: List[str] = []

        # Diagnostics & Guidance
        self.warnings: List[str] = []
        self.errors: List[str] = []
        self.repair_suggestions: List[Dict[str, str]] = []
        self.compatibility_matrix: Dict[str, Dict[str, Any]] = {}
        self.recommended_pipeline: List[str] = []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "raw_input": self.raw_input,
            "detected_format": self.detected_format,
            "is_valid": self.is_valid,
            "is_partially_supported": self.is_partially_supported,
            "canonical_smiles": self.canonical_smiles,
            "isomeric_smiles": self.isomeric_smiles,
            "inchi": self.inchi,
            "inchikey": self.inchikey,
            "molecular_formula": self.molecular_formula,
            "molecular_weight": self.molecular_weight,
            "exact_mass": self.exact_mass,
            "formal_charge": self.formal_charge,
            "heavy_atom_count": self.heavy_atom_count,
            "total_atom_count": self.total_atom_count,
            "bond_count": self.bond_count,
            "num_rotatable_bonds": self.num_rotatable_bonds,
            "chiral_centers": self.chiral_centers,
            "has_unassigned_stereocenters": self.has_unassigned_stereocenters,
            "is_salt_or_mixture": self.is_salt_or_mixture,
            "fragment_count": self.fragment_count,
            "is_organometallic": self.is_organometallic,
            "is_macrocycle": self.is_macrocycle,
            "is_peptide_like": self.is_peptide_like,
            "is_zwitterion": self.is_zwitterion,
            "contains_metals": self.contains_metals,
            "unsupported_elements": self.unsupported_elements,
            "elements_present": self.elements_present,
            "warnings": self.warnings,
            "errors": self.errors,
            "repair_suggestions": self.repair_suggestions,
            "compatibility_matrix": self.compatibility_matrix,
            "recommended_pipeline": self.recommended_pipeline
        }


def detect_input_format(raw: str) -> str:
    """Detect whether input is InChI, InChIKey, MOL/SDF, SMILES, or Name."""
    s = raw.strip()
    if not s:
        return "Empty"

    if s.startswith("InChI=") or s.startswith("InChI/"):
        return "InChI"

    if re.match(r'^[A-Z]{14}-[A-Z]{10}-[A-Z0-9]$', s):
        return "InChIKey"

    if "M  END" in s or "\n$$$$" in s or "\r\n$$$$" in s:
        return "SDF/MOL"

    # Check if clearly a chemical name
    if re.match(r'^[A-Z][a-z]{3,}$', s):
        return "Chemical Name"

    # Likely SMILES if it has no spaces and valid chemical symbols
    if not any(c.isspace() for c in s):
        if re.search(r'^[A-Za-z0-9@#\+\-\[\]\(\)\.=\\/:\$%\*]+$', s):
            return "SMILES"

    return "Chemical Name"



detect_molecular_format = detect_input_format


def universal_validate_molecule(raw_input: str) -> MolecularValidationReport:
    """
    Parses and rigorously validates any chemical representation.
    Produces condition-aware diagnostics and tool compatibility assessments.
    """
    report = MolecularValidationReport(raw_input)
    if not raw_input or not raw_input.strip():
        report.errors.append("Empty molecular input received.")
        return report

    raw = raw_input.strip()
    fmt = detect_input_format(raw)
    report.detected_format = fmt

    resolved_smiles = None

    # 1. InChI Format
    if fmt == "InChI":
        report.inchi = raw
        # Resolve InChI to SMILES via PubChem REST API or regex
        resolved = _resolve_inchi_via_pubchem(raw)
        if resolved and resolved.get("smiles"):
            resolved_smiles = resolved["smiles"]
            report.canonical_smiles = resolved_smiles
            if resolved.get("formula"):
                report.molecular_formula = resolved["formula"]
            if resolved.get("mw"):
                report.molecular_weight = resolved["mw"]
            report.warnings.append("InChI structure verified via NCBI PubChem resolver.")
        else:
            # Parse InChI formula from header: InChI=1S/C2H6O/...
            m_form = re.search(r'InChI=1S?/([A-Za-z0-9]+)', raw)
            if m_form:
                report.molecular_formula = m_form.group(1)
                report.is_valid = True
            else:
                report.errors.append("Invalid or unresolvable InChI string syntax.")

    # 2. InChIKey Format
    elif fmt == "InChIKey":
        report.inchikey = raw
        from backend.molecule_resolver import resolve_molecule_query
        resolved = resolve_molecule_query(raw)
        if resolved.get("success") and resolved.get("smiles"):
            resolved_smiles = resolved["smiles"]
            report.canonical_smiles = resolved_smiles
            report.warnings.append(f"Resolved InChIKey to verified SMILES: '{resolved_smiles}'")
        else:
            report.errors.append(f"Could not resolve InChIKey '{raw}' to chemical structure.")

    # 3. MOL / SDF Format
    elif fmt == "SDF/MOL":
        # Extract atoms and formula from MOL block
        mol_info = _parse_mol_block_pure(raw)
        if mol_info:
            report.is_valid = True
            report.heavy_atom_count = mol_info["heavy_atom_count"]
            report.bond_count = mol_info["bond_count"]
            report.elements_present = mol_info["elements_present"]
            report.warnings.append("Parsed MDL MOL structure record successfully.")
        else:
            report.errors.append("Failed to parse MDL MOL block.")

    # 4. SMILES Format
    elif fmt == "SMILES":
        resolved_smiles = raw

    # 5. Chemical Name
    elif fmt == "Chemical Name":
        from backend.molecule_resolver import resolve_molecule_query
        resolved = resolve_molecule_query(raw)
        if resolved.get("success") and resolved.get("smiles"):
            resolved_smiles = resolved["smiles"]
            report.canonical_smiles = resolved_smiles
            report.warnings.append(f"Resolved chemical name '{raw}' to SMILES: '{resolved_smiles}'.")
        else:
            report.errors.append(f"Unrecognized chemical name '{raw}'. Please provide SMILES, InChI, or MOL structure.")

    # If we have SMILES (direct or resolved from Name / InChIKey / InChI), run full pure-python chemical graph validation
    if resolved_smiles:
        graph, parse_warnings, parse_errors = parse_smiles_pure(resolved_smiles)
        report.warnings.extend(parse_warnings)

        if parse_errors:
            report.errors.extend(parse_errors)
            _generate_smiles_repairs(resolved_smiles, parse_errors, report)
        elif graph:
            report.is_valid = True
            report.canonical_smiles = resolved_smiles
            props = calculate_pure_properties(graph)
            report.molecular_formula = props["formula"]
            report.molecular_weight = props["molecular_weight"]
            report.formal_charge = props["formal_charge"]
            report.heavy_atom_count = props["heavy_atom_count"]
            report.total_atom_count = props["total_atom_count"]
            report.bond_count = len(graph.bonds)
            report.num_rotatable_bonds = props["rotatable_bonds"]
            report.elements_present = props["elements_present"]

            # Check fragments (salt or mixture)
            if '.' in resolved_smiles:
                frags = resolved_smiles.split('.')
                report.is_salt_or_mixture = True
                report.fragment_count = len(frags)
                report.warnings.append(f"Multi-component structure detected ({len(frags)} fragments). Smart preparation can desalt active moiety.")

            # Check metals and organometallics
            metals = set(props["elements_present"]).intersection(COMMON_METALS)
            if metals:
                report.contains_metals = True
                report.is_organometallic = True
                report.warnings.append(f"Metal center detected ({', '.join(metals)}). Force field routing adapted to UFF.")

            # Check unsupported / less common elements
            non_organic = set(props["elements_present"]) - ORGANIC_SUBSET
            if non_organic:
                report.unsupported_elements = sorted(list(non_organic))
                report.is_partially_supported = True
                report.warnings.append(f"Contains non-organic elements: {', '.join(report.unsupported_elements)}")

            # Chirality detection
            if '@' in resolved_smiles:
                report.has_unassigned_stereocenters = False
                report.warnings.append("Stereochemical configuration detected in SMILES.")

            # Peptide-like check
            if resolved_smiles.count("C(=O)N") >= 3 or resolved_smiles.count("NC(=O)") >= 3:
                report.is_peptide_like = True
                report.warnings.append("Peptide-like backbone detected. Standard small-molecule Lipinski filters adapted.")

            # Macrocycle check
            if len(graph.atoms) >= 12 and any(c.isdigit() for c in resolved_smiles):
                digits = re.findall(r'[1-9]', resolved_smiles)
                if len(digits) >= 4:
                    report.is_macrocycle = True

    # Build Tool Compatibility Matrix
    _build_compatibility_matrix(report)

    return report


def _resolve_inchi_via_pubchem(inchi: str) -> Optional[Dict[str, Any]]:
    """Resolves InChI string to SMILES via NCBI PubChem PUG REST."""
    try:
        url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/inchi/property/CanonicalSMILES,MolecularFormula,MolecularWeight/JSON"
        data = urllib.parse.urlencode({"inchi": inchi}).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"User-Agent": "ChemSpace-Validator/1.0"})
        with urllib.request.urlopen(req, timeout=3) as resp:
            js = json.loads(resp.read().decode("utf-8"))
            props = js.get("PropertyTable", {}).get("Properties", [{}])[0]
            return {
                "smiles": props.get("CanonicalSMILES"),
                "formula": props.get("MolecularFormula"),
                "mw": round(float(props.get("MolecularWeight", 0)), 2)
            }
    except Exception:
        return None


def _parse_mol_block_pure(mol_text: str) -> Optional[Dict[str, Any]]:
    """Pure-Python parser for MDL MOL counts and atom lines."""
    lines = mol_text.strip().splitlines()
    if len(lines) < 4:
        return None

    # Line 4 is counts line in V2000
    counts_line = lines[3]
    try:
        atom_count = int(counts_line[:3].strip())
        bond_count = int(counts_line[3:6].strip())
    except Exception:
        return None

    elements = []
    heavy = 0
    for i in range(4, 4 + atom_count):
        if i < len(lines):
            parts = lines[i].split()
            if len(parts) >= 4:
                sym = parts[3]
                elements.append(sym)
                if sym != 'H':
                    heavy += 1

    return {
        "heavy_atom_count": heavy,
        "bond_count": bond_count,
        "elements_present": sorted(list(set(elements)))
    }


def _generate_smiles_repairs(raw: str, parse_errors: List[str], report: MolecularValidationReport):
    """Offers constructive repair suggestions for syntax and valence errors."""
    open_p = raw.count('(')
    close_p = raw.count(')')
    if open_p > close_p:
        repaired = raw + (')' * (open_p - close_p))
        report.repair_suggestions.append({
            "type": "parentheses_repair",
            "description": f"Close {open_p - close_p} unclosed branch parentheses.",
            "suggested_smiles": repaired
        })
    elif close_p > open_p:
        report.repair_suggestions.append({
            "type": "parentheses_repair",
            "description": "Remove extra closing branch parentheses.",
            "suggested_smiles": raw.rstrip(')')
        })

    # Check unclosed rings
    for err in parse_errors:
        if "Unclosed ring number(s):" in err:
            m = re.search(r'\[(.*?)\]', err)
            if m:
                unclosed_nums = [n.strip() for n in m.group(1).split(',')]
                for rnum in unclosed_nums:
                    if rnum:
                        report.repair_suggestions.append({
                            "type": "ring_closure_repair",
                            "description": f"Close dangling ring index {rnum} at structure terminus.",
                            "suggested_smiles": raw + rnum
                        })

    # Check hypervalent carboxylate C(=O)(=O)=O or C(=O)=O
    if "C(=O)=O" in raw:
        report.repair_suggestions.append({
            "type": "valence_repair",
            "description": "Fix hypervalent double bond in carboxylic group: replace C(=O)=O with C(=O)O",
            "suggested_smiles": raw.replace("C(=O)=O", "C(=O)O")
        })

    # Check uncharged quaternary nitrogen
    if "[N]" in raw and raw.count("[N]") == 1:
        report.repair_suggestions.append({
            "type": "charge_repair",
            "description": "Add missing positive formal charge to quaternary nitrogen center: [N+]",
            "suggested_smiles": raw.replace("[N]", "[N+]")
        })


def _build_compatibility_matrix(report: MolecularValidationReport):
    """
    Evaluates every scientific tool against the validated molecule.
    Records: compatible, conditionally_compatible, or unsupported with clear rationale.
    """
    matrix: Dict[str, Dict[str, Any]] = {}

    # 1. Cheminformatics & Descriptors
    if report.is_valid:
        matrix["cheminformatics_descriptors"] = {
            "status": "compatible",
            "details": "Supported for chemical graph topology, Hill formula, IUPAC mass, and valence checks.",
            "requires_preparation": report.is_salt_or_mixture
        }
    else:
        matrix["cheminformatics_descriptors"] = {
            "status": "unsupported",
            "details": f"Cannot parse structure: {'; '.join(report.errors)}"
        }

    # 2. 3D Conformer Generation
    if not report.is_valid:
        matrix["conformer_generation"] = {
            "status": "unsupported",
            "details": "Requires valid molecular connectivity."
        }
    elif report.contains_metals or any(el not in ORGANIC_SUBSET for el in report.elements_present):
        matrix["conformer_generation"] = {
            "status": "conditionally_compatible",
            "details": "Contains transition metals or non-standard elements. Routed to Universal Force Field (UFF) / VSEPR 3D solver.",
            "fallback_tool": "VSEPR Universal Force Field"
        }
    elif report.heavy_atom_count > 100:
        matrix["conformer_generation"] = {
            "status": "conditionally_compatible",
            "details": f"Large molecular size ({report.heavy_atom_count} heavy atoms). Conformation sampling may require extended iterations."
        }
    else:
        matrix["conformer_generation"] = {
            "status": "compatible",
            "details": "Fully supported via deterministic 3D VSEPR Cartesian coordinate minimization."
        }

    # 3. DeepChem & ML ADMET Descriptors
    if not report.is_valid:
        matrix["deepchem_ml_admet"] = {
            "status": "unsupported",
            "details": "Invalid chemical input."
        }
    elif report.is_peptide_like or (report.molecular_weight and report.molecular_weight > 900):
        matrix["deepchem_ml_admet"] = {
            "status": "conditionally_compatible",
            "details": "Beyond Lipinski small-molecule training domain. Lipinski scores provided for reference only."
        }
    elif report.is_organometallic:
        matrix["deepchem_ml_admet"] = {
            "status": "conditionally_compatible",
            "details": "Organometallic complex; empirical neural ADMET estimators have reduced confidence."
        }
    else:
        matrix["deepchem_ml_admet"] = {
            "status": "compatible",
            "details": "Suitable for QED drug-likeness, synthetic accessibility (SAS), and ADMET estimators."
        }

    # 4. Molecular Docking
    if not report.is_valid:
        matrix["molecular_docking"] = {
            "status": "unsupported",
            "details": "Requires valid small-molecule ligand structure."
        }
    elif report.num_rotatable_bonds > 25:
        matrix["molecular_docking"] = {
            "status": "conditionally_compatible",
            "details": f"High conformational flexibility ({report.num_rotatable_bonds} rotatable bonds). Docking search space requires expanded grid sampling."
        }
    else:
        matrix["molecular_docking"] = {
            "status": "compatible",
            "details": "Valid ligand candidate. Requires receptor target (PDB) configuration."
        }

    # 5. Ab-Initio Quantum DFT
    if not report.is_valid:
        matrix["quantum_dft"] = {
            "status": "unsupported",
            "details": "Requires valid 3D Cartesian coordinates."
        }
    elif report.heavy_atom_count > 50:
        matrix["quantum_dft"] = {
            "status": "conditionally_compatible",
            "details": f"High computational demand ({report.heavy_atom_count} heavy atoms). Semi-empirical or small basis set (STO-3G/3-21G) recommended."
        }
    else:
        matrix["quantum_dft"] = {
            "status": "compatible",
            "details": "Suitable for B3LYP electronic structure and HOMO-LUMO bandgap calculation."
        }

    report.compatibility_matrix = matrix

    # Construct recommended pipeline
    pipeline = ["Universal Input Validation"]
    if report.is_salt_or_mixture:
        pipeline.append("Salt Stripping & Desalting")
    if report.has_unassigned_stereocenters:
        pipeline.append("Stereochemical Audit")
    pipeline.append("3D Conformer Generation")
    pipeline.append("Physicochemical & ADMET Profiling")
    if matrix.get("molecular_docking", {}).get("status") in ["compatible", "conditionally_compatible"]:
        pipeline.append("Receptor Docking (if target supplied)")
    pipeline.append("Scientific Monograph Synthesis")
    report.recommended_pipeline = pipeline
