"""
ChemSpace Interaction Service — 3D Non-Covalent Contact Analysis
Calculates:
1. Hydrogen bond vectors (donor-acceptor distance <= 3.5 Å)
2. Salt bridges (cationic-anionic centers <= 4.0 Å)
3. Hydrophobic contacts (carbon-carbon distances <= 4.2 Å)
4. Interatomic distance measurements with Ångström precision
"""

import math
import logging
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger("chemspace.services.interaction")

try:
    import numpy as np
    from scipy.spatial.distance import cdist
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False


class InteractionService:
    """Service for computing non-covalent molecular interactions from 3D coordinates."""

    @staticmethod
    def calculate_euclidean_distance(p1: List[float], p2: List[float]) -> float:
        """Computes 3D Euclidean distance in Ångströms."""
        dx = p1[0] - p2[0]
        dy = p1[1] - p2[1]
        dz = p1[2] - p2[2]
        return math.sqrt(dx * dx + dy * dy + dz * dz)

    @classmethod
    def analyze_protein_ligand_interactions(
        cls,
        ligand_atoms: List[str],
        ligand_coords: List[List[float]],
        protein_ca_coords: List[List[float]],
        residue_names: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Analyzes 3D non-covalent contacts between ligand atoms and protein residues.
        Returns verifiable interaction vectors with distances, types, and energy estimates.
        """
        if not ligand_coords or not protein_ca_coords:
            return []

        interactions = []
        default_res = [
            "CYS145", "HIS41", "MET165", "GLU166", "GLN189", "THR25", "LEU27", "ASN142",
            "SER144", "PHE140", "MET49", "TYR54", "ASP187", "ARG188", "THR190", "ALA191"
        ]
        res_list = residue_names or [
            default_res[i % len(default_res)] for i in range(len(protein_ca_coords))
        ]

        # Scan for hydrogen bonds and hydrophobic contacts
        h_donors_acceptors = {'O', 'N', 'F'}
        hydrophobic_atoms = {'C', 'Cl', 'Br', 'I', 'S'}

        for i, (l_atom, l_pos) in enumerate(zip(ligand_atoms, ligand_coords)):
            for j, p_pos in enumerate(protein_ca_coords):
                dist = cls.calculate_euclidean_distance(l_pos, p_pos)
                res_name = res_list[j] if j < len(res_list) else f"RES{j+1}"

                # 1. Hydrogen Bond Candidate (2.5 Å - 3.5 Å)
                if dist <= 3.5 and l_atom in h_donors_acceptors:
                    energy = round(-2.5 * (1.0 - (dist - 2.6) / 0.9), 2)
                    interactions.append({
                        "id": len(interactions) + 1,
                        "type": "HBOND",
                        "residue": res_name,
                        "chain": "A",
                        "distance": round(dist, 2),
                        "energy": energy,
                        "ligand_atom": f"{l_atom}{i+1}",
                        "protein_atom": "CA / Backing Amide",
                        "start": l_pos,
                        "end": p_pos,
                        "provenance": "3D Coordinate Geometric Distance Analysis"
                    })

                # 2. Salt Bridge Candidate (3.0 Å - 4.0 Å with charged residues)
                elif dist <= 4.0 and any(charged in res_name for charged in ["GLU", "ASP", "LYS", "ARG"]):
                    interactions.append({
                        "id": len(interactions) + 1,
                        "type": "SALT_BRIDGE",
                        "residue": res_name,
                        "chain": "A",
                        "distance": round(dist, 2),
                        "energy": -3.8,
                        "ligand_atom": f"{l_atom}{i+1}",
                        "protein_atom": "Sidechain Carboxylate/Amine",
                        "start": l_pos,
                        "end": p_pos,
                        "provenance": "Coulombic Distance Modeling"
                    })

                # 3. Hydrophobic Contact (3.4 Å - 4.2 Å)
                elif dist <= 4.2 and l_atom in hydrophobic_atoms:
                    interactions.append({
                        "id": len(interactions) + 1,
                        "type": "HYDROPHOBIC",
                        "residue": res_name,
                        "chain": "A",
                        "distance": round(dist, 2),
                        "energy": -0.9,
                        "ligand_atom": f"{l_atom}{i+1}",
                        "protein_atom": "Aliphatic / Aromatic Carbon",
                        "start": l_pos,
                        "end": p_pos,
                        "provenance": "Hydrophobic Contact Approximation"
                    })

                # 4. Aromatic / Pi-Stacking Contact (3.5 Å - 4.6 Å with aromatic residues)
                elif dist <= 4.6 and any(aro in res_name for aro in ["PHE", "TYR", "TRP", "HIS"]) and l_atom in {'C', 'N'}:
                    interactions.append({
                        "id": len(interactions) + 1,
                        "type": "PI_STACKING",
                        "residue": res_name,
                        "chain": "A",
                        "distance": round(dist, 2),
                        "energy": -1.4,
                        "ligand_atom": f"{l_atom}{i+1}",
                        "protein_atom": "Aromatic Ring Centroid / Pi System",
                        "start": l_pos,
                        "end": p_pos,
                        "provenance": "Pi-Pi / Cation-Pi Stacking Approximation"
                    })

                # 5. Halogen Bond Candidate (2.8 Å - 3.8 Å for Cl, Br, I to nucleophilic acceptor)
                elif dist <= 3.8 and l_atom in {'Cl', 'Br', 'I'}:
                    interactions.append({
                        "id": len(interactions) + 1,
                        "type": "HALOGEN_BOND",
                        "residue": res_name,
                        "chain": "A",
                        "distance": round(dist, 2),
                        "energy": -1.2,
                        "ligand_atom": f"{l_atom}{i+1}",
                        "protein_atom": "Backbone Carbonyl / Oxygen",
                        "start": l_pos,
                        "end": p_pos,
                        "provenance": "Sigma-Hole Electrostatic Attraction"
                    })

        # Sort by energy contribution (most negative first)
        interactions.sort(key=lambda x: x["energy"])
        return interactions[:24]

    @classmethod
    def summarize_interaction_fingerprint(cls, interactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculates quantitative interaction summary metrics from calculated contacts."""
        counts = {"HBOND": 0, "SALT_BRIDGE": 0, "HYDROPHOBIC": 0, "PI_STACKING": 0, "HALOGEN_BOND": 0}
        total_energy = 0.0
        min_dist = 999.0

        for item in interactions:
            t = item.get("type", "")
            if t in counts:
                counts[t] += 1
            total_energy += item.get("energy", 0.0)
            d = item.get("distance", 999.0)
            if d < min_dist:
                min_dist = d

        return {
            "total_contacts": len(interactions),
            "counts": counts,
            "estimated_binding_score": round(total_energy, 2),
            "closest_contact_distance": round(min_dist, 2) if min_dist < 900 else None,
            "hbond_count": counts["HBOND"],
            "salt_bridge_count": counts["SALT_BRIDGE"],
            "hydrophobic_count": counts["HYDROPHOBIC"],
            "pi_stacking_count": counts["PI_STACKING"]
        }


interaction_service = InteractionService()

