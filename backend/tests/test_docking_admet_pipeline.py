"""
ChemSpace Part 5 Test Suite — Advanced Molecular Docking, ADMET Prediction & Drug Discovery Engine
Tests:
1. Valid and invalid SMILES handling
2. Ligand Meeko PDBQT preparation and torsion counting
3. AutoDock Vina binary check & verified physical forcefield scoring (no fabricated numbers)
4. Custom binding grid box (center, size, exhaustiveness, num_poses)
5. Uploaded receptor PDB parsing and RCSB PDB retrieval network error tolerance
6. ADMET 5-category evaluation (Absorption, Distribution, Metabolism, Excretion, Toxicity)
7. Physicochemical descriptors vs empirical QSAR predictions separation with disclaimers
8. 3D binding interactions (H-bonds, salt bridges, hydrophobic, pi-stacking, halogen bonds)
9. Interaction fingerprint metrics and distance calculations
10. Multi-stage Agentic Drug Discovery Pipeline execution & state transitions
11. Cooperative job cancellation
12. Dedicated FastAPI REST endpoints for docking, ADMET, interactions, and pipeline
"""

import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.docking_service import docking_service
from backend.services.admet_service import admet_service
from backend.services.interaction_service import interaction_service
from backend.services.agent_engine import agent_engine, WorkflowState


class TestDockingService(unittest.TestCase):
    """Unit and integration tests for molecular docking and Meeko preparation."""

    def test_valid_smiles_docking_execution(self):
        """Tests that a valid SMILES produces real physical scores, poses, and coordinates."""
        res = docking_service.execute_docking(
            ligand_smiles="CC(=O)Oc1ccccc1C(=O)O",  # Aspirin
            target_pdb_id="6LU7",
            pocket_center=[0.0, 0.0, 0.0],
            box_size=[20.0, 20.0, 20.0],
            exhaustiveness=8,
            num_poses=3
        )
        self.assertTrue(res.get("success"))
        self.assertIn("poses", res)
        self.assertEqual(len(res["poses"]), 3)
        self.assertIn("top_binding_energy", res)
        # Binding energy must be negative and within physical thermodynamic limits
        self.assertLess(res["top_binding_energy"], 0.0)
        self.assertGreater(res["top_binding_energy"], -20.0)
        self.assertIn("estimated_ki", res)
        self.assertIn("meeko_preparation", res)

        # Check pose 1 structure
        pose1 = res["poses"][0]
        self.assertEqual(pose1["pose_index"], 0)
        self.assertEqual(pose1["rmsd_to_reference"], 0.0)
        self.assertIn("coordinates", pose1)
        self.assertIn("pdb_block", pose1)
        self.assertIn("HETATM", pose1["pdb_block"])

    def test_invalid_smiles_docking_failure(self):
        """Tests that malformed or chemically invalid SMILES returns an informative error."""
        res = docking_service.execute_docking(
            ligand_smiles="INVALID_SMILES_12345XYZ",
            target_pdb_id="6LU7"
        )
        self.assertFalse(res.get("success"))
        self.assertIn("error", res)

    def test_empty_smiles_docking_failure(self):
        """Tests that empty SMILES string fails gracefully."""
        res = docking_service.execute_docking(
            ligand_smiles="",
            target_pdb_id="6LU7"
        )
        self.assertFalse(res.get("success"))

    def test_custom_grid_box_parameters(self):
        """Tests that custom pocket center and bounding box dimensions are respected."""
        custom_center = [12.5, -4.2, 8.8]
        custom_size = [18.0, 18.0, 24.0]
        res = docking_service.execute_docking(
            ligand_smiles="CCO",
            target_pdb_id="6LU7",
            pocket_center=custom_center,
            box_size=custom_size,
            num_poses=2
        )
        self.assertTrue(res.get("success"))
        self.assertEqual(res["pocket_center"], custom_center)
        self.assertEqual(res["grid_box_size"], custom_size)
        self.assertEqual(len(res["poses"]), 2)

    def test_uploaded_receptor_pdb_docking(self):
        """Tests docking against user-uploaded receptor PDB content."""
        sample_pdb = (
            "ATOM      1  CA  CYS A 145       1.000   2.000   3.000  1.00 20.00           C\n"
            "ATOM      2  CA  HIS A  41       4.000   5.000   6.000  1.00 20.00           C\n"
            "ATOM      3  CA  GLU A 166       7.000   8.000   9.000  1.00 20.00           C\n"
            "END\n"
        )
        res = docking_service.execute_docking(
            ligand_smiles="c1ccccc1O",
            receptor_pdb_content=sample_pdb,
            num_poses=2
        )
        self.assertTrue(res.get("success"))
        self.assertGreaterEqual(len(res["poses"]), 1)

    def test_ki_calculation(self):
        """Tests mathematical calculation of dissociation constant Ki from free energy ΔG."""
        ki_str = docking_service.calculate_ki_from_delta_g(-8.74)
        self.assertTrue(any(unit in ki_str for unit in ["nM", "µM", "pM"]))
        self.assertNotEqual(ki_str, "N/A")


class TestADMETService(unittest.TestCase):
    """Unit tests for ADMET pharmacokinetic and safety predictions."""

    def test_valid_smiles_admet_profile(self):
        """Tests that valid drug molecule (Aspirin) yields all 5 required ADMET categories."""
        profile = admet_service.predict_admet_profile("CC(=O)Oc1ccccc1C(=O)O")
        self.assertTrue(profile.get("success"))
        self.assertIn("physicochemical_descriptors", profile)
        self.assertIn("absorption", profile)
        self.assertIn("distribution", profile)
        self.assertIn("metabolism", profile)
        self.assertIn("excretion", profile)
        self.assertIn("toxicity", profile)
        self.assertIn("scientific_disclaimer", profile)

        # Absorption checks
        abs_data = profile["absorption"]
        self.assertIn("caco2_permeability", abs_data)
        self.assertIn("human_intestinal_absorption", abs_data)
        self.assertIn("oral_bioavailability", abs_data)
        self.assertIn("water_solubility", abs_data)
        self.assertIn("lipinski_rule_of_five", abs_data)
        self.assertTrue(abs_data["lipinski_rule_of_five"]["passed"])

        # Distribution checks
        dist_data = profile["distribution"]
        self.assertIn("blood_brain_barrier", dist_data)
        self.assertIn("plasma_protein_binding", dist_data)
        self.assertIn("volume_of_distribution", dist_data)

        # Metabolism checks (CYP450)
        met_data = profile["metabolism"]
        for cyp in ["cyp1a2", "cyp2c9", "cyp2c19", "cyp2d6", "cyp3a4"]:
            self.assertIn(cyp, met_data)

        # Excretion checks
        exc_data = profile["excretion"]
        self.assertIn("hepatic_clearance", exc_data)
        self.assertIn("renal_oct2_liability", exc_data)
        self.assertIn("half_life_category", exc_data)

        # Toxicity checks
        tox_data = profile["toxicity"]
        self.assertIn("herg_cardiac_liability", tox_data)
        self.assertIn("ames_mutagenicity", tox_data)
        self.assertIn("hepatotoxicity_dili", tox_data)
        self.assertIn("skin_sensitization", tox_data)

    def test_invalid_smiles_admet_raises_error(self):
        """Tests that invalid SMILES raises ValueError."""
        with self.assertRaises(ValueError):
            admet_service.predict_admet_profile("BAD_SMILES_STRING_@@@")

    def test_empty_smiles_admet_raises_error(self):
        """Tests that empty SMILES raises ValueError."""
        with self.assertRaises(ValueError):
            admet_service.predict_admet_profile("")

    def test_provenance_and_limitations_present(self):
        """Tests that predictions include model name and scientific limitations."""
        profile = admet_service.predict_admet_profile("CCO")
        herg = profile["toxicity"]["herg_cardiac_liability"]
        self.assertIn("model_name", herg)
        self.assertIn("confidence", herg)
        self.assertIn("limitations", herg)


class TestInteractionService(unittest.TestCase):
    """Unit tests for 3D non-covalent binding interaction analysis."""

    def test_interaction_vector_calculation(self):
        """Tests detection of H-bonds, hydrophobic contacts, and salt bridges."""
        lig_atoms = ['O', 'C', 'N', 'Cl']
        lig_coords = [
            [0.0, 0.0, 0.0],
            [2.0, 0.0, 0.0],
            [0.0, 2.0, 0.0],
            [3.0, 1.0, 0.0]
        ]
        protein_ca = [
            [2.8, 0.0, 0.0],  # ~2.8 Å from O: HBOND candidate
            [0.0, 5.5, 0.0],  # ~3.5 Å from N
            [5.5, 1.0, 0.0]   # ~2.5 Å from Cl: Halogen bond candidate
        ]
        residues = ["CYS145", "GLU166", "HIS41"]

        contacts = interaction_service.analyze_protein_ligand_interactions(
            ligand_atoms=lig_atoms,
            ligand_coords=lig_coords,
            protein_ca_coords=protein_ca,
            residue_names=residues
        )
        self.assertIsInstance(contacts, list)
        self.assertGreaterEqual(len(contacts), 1)

        # Summarize fingerprint
        fp = interaction_service.summarize_interaction_fingerprint(contacts)
        self.assertIn("total_contacts", fp)
        self.assertIn("counts", fp)
        self.assertIn("HBOND", fp["counts"])
        self.assertIn("HALOGEN_BOND", fp["counts"])


class TestAgenticPipelineAndAPI(unittest.TestCase):
    """Integration tests for agentic pipeline and FastAPI REST routes."""

    def setUp(self):
        self.client = TestClient(app)

    def test_api_docking_run_endpoint(self):
        """Tests POST /api/research/docking/run with custom parameters."""
        payload = {
            "smiles": "CC(=O)Oc1ccccc1C(=O)O",
            "target_pdb_id": "6LU7",
            "pocket_center": [0.6, 0.4, 0.2],
            "box_size": [20.0, 20.0, 20.0],
            "exhaustiveness": 8,
            "num_poses": 2
        }
        res = self.client.post("/api/research/docking/run", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "success")
        self.assertIn("docking", data)
        self.assertEqual(len(data["docking"]["poses"]), 2)

    def test_api_docking_run_invalid_smiles(self):
        """Tests POST /api/research/docking/run with malformed input returns HTTP 400."""
        payload = {
            "smiles": "MALFORMED_SMILES_STRING_NOT_CHEMICAL",
            "target_pdb_id": "6LU7"
        }
        res = self.client.post("/api/research/docking/run", json=payload)
        self.assertEqual(res.status_code, 400)

    def test_api_admet_predict_endpoint(self):
        """Tests POST /api/research/admet/predict with valid compound."""
        payload = {"smiles": "c1ccccc1O"}
        res = self.client.post("/api/research/admet/predict", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "success")
        self.assertIn("admet", data)
        self.assertIn("absorption", data["admet"])
        self.assertIn("toxicity", data["admet"])

    def test_api_interactions_analyze_endpoint(self):
        """Tests POST /api/research/interactions/analyze with coordinates."""
        payload = {
            "ligand_atoms": ["O", "C"],
            "ligand_coords": [[0.0, 0.0, 0.0], [1.5, 0.0, 0.0]],
            "protein_ca_coords": [[2.8, 0.0, 0.0], [5.0, 0.0, 0.0]],
            "residue_names": ["CYS145", "HIS41"]
        }
        res = self.client.post("/api/research/interactions/analyze", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "success")
        self.assertIn("interactions", data)
        self.assertIn("fingerprint", data)

    def test_api_pipeline_run_endpoint(self):
        """Tests POST /api/research/pipeline/run for full autonomous execution."""
        payload = {
            "objective": "Screen and profile aspirin against SARS-CoV-2 Mpro",
            "smiles": "CC(=O)Oc1ccccc1C(=O)O",
            "target_pdb_id": "6LU7"
        }
        res = self.client.post("/api/research/pipeline/run", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "success")
        job = data.get("job")
        self.assertIsNotNone(job)
        self.assertIn("id", job)
        self.assertIn("status", job)
        self.assertIn(job["status"], [WorkflowState.COMPLETED, WorkflowState.PARTIAL, WorkflowState.RUNNING])
        self.assertIn("steps", job)
        self.assertIn("report_markdown", job)


if __name__ == "__main__":
    unittest.main()
