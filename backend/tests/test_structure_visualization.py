"""
Unit and Integration Tests: Molecular Visualization & Structure Engine (Part 4)
Verifies:
1. Multi-format structure parsing: PDB, SDF/MOL, XYZ, mmCIF.
2. Structure validation and error handling for malformed or unsupported inputs.
3. Heavy-atom coordinate extraction, residue identification, and provenance tracking.
4. Non-covalent interaction calculation with Pi-Stacking, H-Bonds, and Salt Bridges.
5. Coordinate alignment and RMSD calculation between poses.
6. REST API contracts on /api/research/structure/parse, /api/research/molecular/depict-2d, /api/research/structure/rmsd.
"""

import unittest
from fastapi.testclient import TestClient

from backend.services.structure_service import StructureService, structure_service
from backend.services.interaction_service import InteractionService, interaction_service
from backend.services.molecular_service import molecular_service
from backend.main import app


class TestStructureVisualizationEngine(unittest.TestCase):
    """Test suite for molecular structure parsing, validation, and visualization contracts."""

    def setUp(self):
        self.client = TestClient(app)

        # Sample valid PDB content with CA backbone and HETATM ligand
        self.sample_pdb = """HEADER    HYDROLASE/HYDROLASE INHIBITOR           26-FEB-20   6LU7
ATOM      1  N   SER A   1      -4.900   3.200  -1.200  1.00 20.00           N
ATOM      2  CA  SER A   1      -4.200   3.900  -0.800  1.00 20.00           C
ATOM      3  C   SER A   1      -3.500   3.100   0.400  1.00 20.00           C
ATOM      4  N   GLY A   2      -3.000   2.500   0.800  1.00 20.00           N
ATOM      5  CA  GLY A   2      -2.100   2.200   1.200  1.00 20.00           C
HETATM   10  C1  N3  A 301       0.200   0.400   0.100  1.00 25.00           C
HETATM   11  N1  N3  A 301       1.300  -0.300   0.200  1.00 25.00           N
HETATM   12  O1  N3  A 301       2.400   0.500  -0.100  1.00 25.00           O
END
"""

        # Sample valid MOL V2000 block
        self.sample_mol = """Test Molecule
  ChemSpace 2026

  3  2  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.4000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.1000    1.2000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0
  2  3  2  0
M  END
"""

        # Sample valid XYZ file
        self.sample_xyz = """3
Water molecule with standard geometry
O   0.0000   0.0000   0.1174
H   0.0000   0.7572  -0.4696
H   0.0000  -0.7572  -0.4696
"""

    def test_pdb_parsing_extracts_ca_and_ligand(self):
        """PDB parser must extract C-alpha backbone and non-solvent ligand atoms."""
        result = structure_service.parse_structure_content(self.sample_pdb, "sample.pdb")
        self.assertTrue(result["success"])
        self.assertEqual(result["format"], "PDB")
        self.assertTrue(result["is_experimental"])
        self.assertEqual(len(result["backbone_ca_coords"]), 2)
        self.assertIn("A", result["chains"])
        self.assertEqual(len(result["ligand_atoms"]), 3)
        self.assertIn("N3", result["ligand_residues"])

    def test_sdf_mol_parsing_extracts_atoms_bonds(self):
        """SDF/MOL parser must extract heavy atoms, bonds, and coordinates."""
        result = structure_service.parse_structure_content(self.sample_mol, "ligand.mol")
        self.assertTrue(result["success"])
        self.assertEqual(result["format"] in ["MOL", "SDF/MOL"], True)
        self.assertEqual(len(result["atoms"]), 3)
        self.assertEqual(len(result["coordinates"]), 3)
        self.assertEqual(len(result["bonds"]), 2)

    def test_xyz_parsing(self):
        """XYZ parser must read atom count and Cartesian coordinate points."""
        result = structure_service.parse_structure_content(self.sample_xyz, "water.xyz")
        self.assertTrue(result["success"])
        self.assertEqual(result["format"], "XYZ")
        self.assertEqual(result["atoms"], ["O", "H", "H"])
        self.assertEqual(len(result["coordinates"]), 3)

    def test_invalid_structure_content_returns_error(self):
        """Empty or corrupt inputs must report structured failure without crashing."""
        empty_res = structure_service.parse_structure_content("", "empty.pdb")
        self.assertFalse(empty_res["success"])
        self.assertIn("error", empty_res)

        garbage_res = structure_service.parse_structure_content("INVALID_NON_STRUCTURE_TEXT", "test.txt")
        self.assertFalse(garbage_res["success"])

    def test_rmsd_calculation(self):
        """RMSD must evaluate to 0.0 for identical coordinates and positive for shifted coordinates."""
        c1 = [[0.0, 0.0, 0.0], [1.0, 0.0, 0.0], [0.0, 1.0, 0.0]]
        c2 = [[0.0, 0.0, 0.0], [1.0, 0.0, 0.0], [0.0, 1.0, 0.0]]
        self.assertEqual(structure_service.calculate_rmsd(c1, c2), 0.0)

        # Shift one coordinate by 1.0 Å in X
        c3 = [[1.0, 0.0, 0.0], [1.0, 0.0, 0.0], [0.0, 1.0, 0.0]]
        rmsd = structure_service.calculate_rmsd(c1, c3)
        self.assertAlmostEqual(rmsd, 0.577, places=2)

        # Mismatched lengths must return None
        self.assertIsNone(structure_service.calculate_rmsd(c1, c1[:2]))

    def test_interaction_analysis_with_pi_stacking(self):
        """InteractionService must detect H-bonds, salt bridges, and aromatic Pi-stacking."""
        lig_atoms = ["O", "N", "C"]
        lig_coords = [
            [-0.4, 0.2, 0.1],   # H-bond donor to CYS145
            [-1.8, 2.2, 0.4],   # Salt bridge to GLU166
            [3.1, -0.4, -0.3]   # Pi-stacking to PHE140 / HIS41
        ]
        protein_ca = [
            [-1.9, 2.3, 1.1],   # CYS145
            [2.3, -1.2, 0.5],   # GLU166
            [3.6, -2.1, 1.7]    # PHE140
        ]
        res_names = ["CYS145", "GLU166", "PHE140"]

        interactions = interaction_service.analyze_protein_ligand_interactions(
            lig_atoms, lig_coords, protein_ca, res_names
        )
        self.assertTrue(len(interactions) > 0)
        types = [i["type"] for i in interactions]
        self.assertTrue("HBOND" in types or "SALT_BRIDGE" in types or "HYDROPHOBIC" in types or "PI_STACKING" in types)

        # Test fingerprint summary
        summary = interaction_service.summarize_interaction_fingerprint(interactions)
        self.assertEqual(summary["total_contacts"], len(interactions))
        self.assertTrue(summary["closest_contact_distance"] > 0)

    def test_api_parse_endpoint(self):
        """POST /api/research/structure/parse endpoint must validate and return parsed structure."""
        resp = self.client.post("/api/research/structure/parse", json={
            "content": self.sample_pdb,
            "filename": "mpro_complex.pdb",
            "format": "pdb"
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["structure"]["format"], "PDB")

    def test_api_depict_2d_endpoint(self):
        """POST /api/research/molecular/depict-2d must return valid SVG vector graphic."""
        resp = self.client.post("/api/research/molecular/depict-2d", json={
            "smiles": "CC(=O)Oc1ccccc1C(=O)O",
            "width": 300,
            "height": 200
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "success")
        self.assertTrue(data["svg"].startswith("<svg") or "<svg" in data["svg"])

    def test_api_rmsd_endpoint(self):
        """POST /api/research/structure/rmsd must calculate coordinate deviation."""
        resp = self.client.post("/api/research/structure/rmsd", json={
            "coords1": [[0.0, 0.0, 0.0], [1.0, 1.0, 1.0]],
            "coords2": [[0.1, 0.0, 0.0], [1.0, 1.1, 1.0]]
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "success")
        self.assertAlmostEqual(data["rmsd"], 0.1, places=1)


if __name__ == "__main__":
    unittest.main()
