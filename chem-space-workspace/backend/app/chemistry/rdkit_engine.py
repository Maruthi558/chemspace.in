"""
RDKit Chemistry Engine Implementation
Full-featured chemistry computation using RDKit.
"""
from typing import Dict, Any, List, Optional, Tuple
from rdkit import Chem
from rdkit.Chem import (
    AllChem, Descriptors, rdMolDescriptors, rdDepictor,
    rdMolAlign, rdDistGeom, rdFMCS, Lipinski, rdMolHash
)
from rdkit.Chem.Draw import rdMolDraw2D
from rdkit.Chem import rdMolTransforms
import re

from .engine import ChemistryEngine, Conformer3D, AtomData, BondData


class RDKitEngine(ChemistryEngine):
    """RDKit-based chemistry engine."""

    def __init__(self):
        self._initialized = False

    def _ensure_init(self):
        if not self._initialized:
            rdDepictor.SetPreferCoordGen(True)
            self._initialized = True

    def parse_smiles(self, smiles: str) -> Tuple[Optional[Any], List[str], List[str]]:
        warnings = []
        errors = []

        if not smiles or not smiles.strip():
            errors.append("Empty SMILES string")
            return None, warnings, errors

        try:
            mol = Chem.MolFromSmiles(smiles.strip())
            if mol is None:
                errors.append(f"Failed to parse SMILES: {smiles}")
                return None, warnings, errors

            # Sanitize
            try:
                Chem.SanitizeMol(mol)
            except Exception as e:
                warnings.append(f"Sanitization warning: {str(e)}")

            return mol, warnings, errors
        except Exception as e:
            errors.append(f"Parse error: {str(e)}")
            return None, warnings, errors

    def to_canonical_smiles(self, mol: Any) -> str:
        return Chem.MolToSmiles(mol, canonical=True)

    def calculate_properties(self, mol: Any) -> Dict[str, Any]:
        self._ensure_init()
        props = {}

        # Basic counts
        props["heavy_atom_count"] = mol.GetNumHeavyAtoms()
        props["total_atom_count"] = mol.GetNumAtoms()
        props["rotatable_bonds"] = rdMolDescriptors.CalcNumRotatableBonds(mol)
        props["ring_count"] = rdMolDescriptors.CalcNumRings(mol)
        props["aromatic_ring_count"] = rdMolDescriptors.CalcNumAromaticRings(mol)
        props["heteroatom_count"] = rdMolDescriptors.CalcNumHeteroatoms(mol)

        # Molecular weight
        props["molecular_weight"] = round(Descriptors.MolWt(mol), 3)
        props["exact_mass"] = round(Descriptors.ExactMolWt(mol), 3)

        # Lipophilicity
        props["logp"] = round(Descriptors.MolLogP(mol), 3)
        props["molar_refractivity"] = round(Descriptors.MolMR(mol), 3)

        # Polar surface area
        props["tpsa"] = round(rdMolDescriptors.CalcTPSA(mol), 2)

        # H-bond donors/acceptors
        hbd, hba = self.count_hbd_hba(mol)
        props["hbd"] = hbd
        props["hba"] = hba

        # Formal charge
        props["formal_charge"] = Chem.GetFormalCharge(mol)

        # Fraction Csp3
        props["fraction_csp3"] = round(rdMolDescriptors.CalcFractionCSP3(mol), 3)

        # Number of stereocenters
        props["num_stereocenters"] = rdMolDescriptors.CalcNumAtomStereoCenters(mol)

        # Molecular formula
        props["formula"] = self.get_molecular_formula(mol)

        return props

    def generate_2d_svg(self, mol: Any, width: int = 300, height: int = 200) -> Optional[str]:
        try:
            self._ensure_init()
            # Generate 2D coordinates
            rdDepictor.Compute2DCoords(mol)

            drawer = rdMolDraw2D.MolDraw2DSVG(width, height)
            opts = drawer.drawOptions()
            opts.clearBackground = False
            opts.bondLineWidth = 2.0
            opts.padding = 0.1
            opts.addAtomIndices = False
            opts.addStereoAnnotation = True

            drawer.DrawMolecule(mol)
            drawer.FinishDrawing()
            svg = drawer.GetDrawingText()

            # Clean SVG
            svg = re.sub(r'<\?xml[^>]*\?>', '', svg).strip()
            return svg
        except Exception:
            return None

    def generate_3d_conformer(self, mol: Any) -> Optional[Conformer3D]:
        try:
            # Add hydrogens
            mol_h = Chem.AddHs(mol)

            # Generate 3D coordinates using ETKDG
            params = AllChem.ETKDGv3()
            params.randomSeed = 42  # Deterministic
            params.useSmallRingTorsions = True
            params.useMacrocycleTorsions = True
            params.useBasicKnowledge = True

            result = AllChem.EmbedMolecule(mol_h, params)
            if result != 0:
                # Try with simpler parameters
                params = AllChem.ETKDGv2()
                params.randomSeed = 42
                result = AllChem.EmbedMolecule(mol_h, params)
                if result != 0:
                    return None

            # Optimize with MMFF94
            try:
                AllChem.MMFFOptimizeMolecule(mol_h)
            except Exception:
                # Fallback to UFF
                try:
                    AllChem.UFFOptimizeMolecule(mol_h)
                except Exception:
                    pass

            # Extract coordinates
            conf = mol_h.GetConformer()
            atoms = []
            for i in range(mol_h.GetNumAtoms()):
                atom = mol_h.GetAtomWithIdx(i)
                pos = conf.GetAtomPosition(i)
                atoms.append(AtomData(
                    index=i,
                    symbol=atom.GetSymbol(),
                    x=round(pos.x, 4),
                    y=round(pos.y, 4),
                    z=round(pos.z, 4),
                    charge=atom.GetFormalCharge()
                ))

            bonds = []
            for bond in mol_h.GetBonds():
                bonds.append(BondData(
                    from_idx=bond.GetBeginAtomIdx(),
                    to_idx=bond.GetEndAtomIdx(),
                    order=bond.GetBondTypeAsDouble(),
                    aromatic=bond.GetIsAromatic()
                ))

            return Conformer3D(
                atoms=atoms,
                bonds=bonds,
                source="RDKit ETKDGv3 + MMFF94 Optimization"
            )
        except Exception as e:
            return None

    def get_molecular_formula(self, mol: Any) -> str:
        return rdMolDescriptors.CalcMolFormula(mol)

    def get_molecular_weight(self, mol: Any) -> float:
        return round(Descriptors.MolWt(mol), 3)

    def count_hbd_hba(self, mol: Any) -> Tuple[int, int]:
        hbd = Lipinski.NumHDonors(mol)
        hba = Lipinski.NumHAcceptors(mol)
        return hbd, hba

    def calculate_tpsa(self, mol: Any) -> float:
        return round(rdMolDescriptors.CalcTPSA(mol), 2)

    def calculate_logp(self, mol: Any) -> float:
        return round(Descriptors.MolLogP(mol), 3)

    def check_lipinski(self, mol: Any) -> Dict[str, Any]:
        mw = Descriptors.MolWt(mol)
        logp = Descriptors.MolLogP(mol)
        hbd = Lipinski.NumHDonors(mol)
        hba = Lipinski.NumHAcceptors(mol)

        violations = []
        if mw > 500:
            violations.append(f"Molecular weight {mw:.1f} > 500")
        if logp > 5:
            violations.append(f"LogP {logp:.2f} > 5")
        if hbd > 5:
            violations.append(f"H-bond donors {hbd} > 5")
        if hba > 10:
            violations.append(f"H-bond acceptors {hba} > 10")

        return {
            "pass": len(violations) == 0,
            "violations": violations,
            "properties": {
                "molecular_weight": round(mw, 2),
                "logp": round(logp, 2),
                "hbd": hbd,
                "hba": hba
            }
        }

    def check_veber(self, mol: Any) -> Dict[str, Any]:
        rotatable = rdMolDescriptors.CalcNumRotatableBonds(mol)
        tpsa = rdMolDescriptors.CalcTPSA(mol)

        violations = []
        if rotatable > 10:
            violations.append(f"Rotatable bonds {rotatable} > 10")
        if tpsa > 140:
            violations.append(f"TPSA {tpsa:.1f} > 140")

        return {
            "pass": len(violations) == 0,
            "violations": violations,
            "properties": {
                "rotatable_bonds": rotatable,
                "tpsa": round(tpsa, 1)
            }
        }

    def check_egan(self, mol: Any) -> Dict[str, Any]:
        logp = Descriptors.MolLogP(mol)
        tpsa = rdMolDescriptors.CalcTPSA(mol)

        violations = []
        if logp > 5.88:
            violations.append(f"LogP {logp:.2f} > 5.88")
        if tpsa > 131.6:
            violations.append(f"TPSA {tpsa:.1f} > 131.6")

        return {
            "pass": len(violations) == 0,
            "violations": violations,
            "properties": {
                "logp": round(logp, 2),
                "tpsa": round(tpsa, 1)
            }
        }

    def find_substructure(self, mol: Any, query_smiles: str) -> List[List[int]]:
        query_mol = Chem.MolFromSmiles(query_smiles)
        if query_mol is None:
            return []
        matches = mol.GetSubstructMatches(query_mol)
        return [list(match) for match in matches]

    def calculate_similarity(self, mol1: Any, mol2: Any, fp_type: str = "morgan") -> float:
        if fp_type == "morgan":
            fp1 = rdMolDescriptors.GetMorganFingerprintAsBitVect(mol1, 2, nBits=2048)
            fp2 = rdMolDescriptors.GetMorganFingerprintAsBitVect(mol2, 2, nBits=2048)
        elif fp_type == "maccs":
            fp1 = rdMolDescriptors.GetMACCSKeysFingerprint(mol1)
            fp2 = rdMolDescriptors.GetMACCSKeysFingerprint(mol2)
        else:
            fp1 = rdMolDescriptors.GetMorganFingerprintAsBitVect(mol1, 2, nBits=2048)
            fp2 = rdMolDescriptors.GetMorganFingerprintAsBitVect(mol2, 2, nBits=2048)

        from rdkit.DataStructs import TanimotoSimilarity
        return round(TanimotoSimilarity(fp1, fp2), 4)

    def is_valid(self, mol: Any) -> bool:
        return mol is not None and mol.GetNumAtoms() > 0


# Register the engine
from .engine import ChemistryEngineFactory
ChemistryEngineFactory.register("rdkit", RDKitEngine())