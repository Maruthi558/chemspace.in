"""
Unit and Integration Test Suite: ChemSpace Scientific Domain Services & API Contracts
Tests:
1. MolecularService: RDKit SMILES validation, Lipinski Ro5, QED, 3D conformer generation, 2D SVG depiction.
2. StructureService: RCSB PDB structure resolution, backbone extraction.
3. DockingService: Meeko ligand preparation, AutoDock Vina / physical forcefield pose evaluation, Ki calculation.
4. InteractionService: 3D Euclidean contacts, non-covalent bond classification (HBOND, SALT_BRIDGE, HYDROPHOBIC).
5. ADMETService: In-silico QSAR pharmacokinetics, toxicity alerts, clinical disclaimers.
6. ResearchOrchestrator: Multi-step research workflow state machine, error handling, monograph generation.
7. Scientific REST API Endpoints: Typed request/response validation on /api/research/*.
"""

import unittest
import os
import json
from fastapi.testclient import TestClient

from backend.services.molecular_service import MolecularService, molecular_service
from backend.services.structure_service import StructureService, structure_service
from backend.services.docking_service import DockingService, docking_service
from backend.services.interaction_service import InteractionService, interaction_service
from backend.services.admet_service import ADMETService, admet_service
from backend.services.research_orchestrator import ResearchOrchestrator, research_orchestrator
from backend.main import app


class TestMolecularService(unittest.TestCase):
    """Test RDKit-backed molecular informatics service."""

    def setUp(self):
        self.service = molecular_service
        self.aspirin_smiles = "CC(=O)Oc1ccccc1C(=O)O"
        self.imatinib_smiles = "Cc1ccc(NC(=O)c2ccc(CN3CCN(C)CC3)cc2)cc1Nc4nccc(n4)c5cccnc5"

    def test_valid_smiles_parsing(self):
        res = self.service.validate_and_parse_smiles(self.aspirin_smiles)
        self.assertTrue(res["valid"])
        self.assertEqual(res["formula"], "C9H8O4")
        self.assertEqual(res["heavy_atom_count"], 13)
        self.assertTrue(res["has_aromatic_rings"])
        self.assertIn("RDKit", res["provenance"])

    def test_physicochemical_properties(self):
        props = self.service.compute_physicochemical_properties(self.aspirin_smiles)
        self.assertAlmostEqual(props["molecular_weight"], 180.16, places=1)
        self.assertTrue(props["lipinski_compliant"])
        self.assertEqual(props["ro5_violations"], 0)
        self.assertTrue(0 < props["qed_drug_likeness"] < 1)
        self.assertIn("RDKit", props["provenance"])

    def test_invalid_smiles_handling(self):
        res = self.service.validate_and_parse_smiles("INVALID_SMILES_123%%$$")
        self.assertFalse(res["valid"])
        self.assertIn("error", res)

    def test_3d_conformer_generation(self):
        res = self.service.generate_3d_conformers(self.aspirin_smiles, num_conformers=1)
        self.assertIn("atoms", res)
        self.assertIn("coordinates", res)
        self.assertIn("bonds", res)
        self.assertGreater(len(res["atoms"]), 0)
        self.assertEqual(len(res["atoms"]), len(res["coordinates"]))
        # Verify 3D coordinates have x, y, z
        for coord in res["coordinates"]:
            self.assertEqual(len(coord), 3)

    def test_2d_depiction_svg(self):
        svg = self.service.generate_2d_depiction_svg(self.aspirin_smiles)
        self.assertIn("<svg", svg)
        self.assertIn("</svg>", svg)


class TestStructureService(unittest.TestCase):
    """Test macromolecular retrieval and backbone coordinate extraction."""

    def setUp(self):
        self.service = structure_service

    def test_fetch_pdb_metadata(self):
        meta = self.service.fetch_pdb_metadata("1IEP")
        self.assertEqual(meta["pdb_id"], "1IEP")
        self.assertIn("title", meta)
        self.assertIn("method", meta)
        self.assertIn("provenance", meta)

    def test_fetch_and_parse_pdb_backbone(self):
        data = self.service.fetch_and_parse_pdb_backbone("1IEP")
        self.assertEqual(data["pdb_id"], "1IEP")
        self.assertIn("backbone_ca_coords", data)
        self.assertIn("center", data)
        self.assertEqual(len(data["center"]), 3)
        self.assertGreater(len(data["backbone_ca_coords"]), 0)


class TestDockingService(unittest.TestCase):
    """Test molecular docking calculation and pose evaluation."""

    def setUp(self):
        self.service = docking_service
        self.smiles = "CC(=O)Oc1ccccc1C(=O)O"

    def test_meeko_pdbqt_preparation(self):
        pdbqt, meta = self.service.prepare_ligand_pdbqt(self.smiles)
        if pdbqt:
            self.assertIn("ROOT", pdbqt)
            self.assertIn("TORSDOF", pdbqt)
        else:
            self.assertIn("warning", meta)

    def test_ki_calculation(self):
        # ΔG = -8.74 kcal/mol -> Ki around 390 nM
        ki_str = self.service.calculate_ki_from_delta_g(-8.74)
        self.assertIn("nM", ki_str)

    def test_docking_execution(self):
        res = self.service.execute_docking(
            ligand_smiles=self.smiles,
            receptor_pdb_id="1IEP",
            pocket_center=[10.0, 20.0, 30.0],
            box_size=[20.0, 20.0, 20.0]
        )
        self.assertTrue(res["success"])
        self.assertEqual(res["target_pdb_id"], "1IEP")
        self.assertLess(res["top_binding_energy"], 0)
        self.assertEqual(len(res["poses"]), 3)
        self.assertIn("estimated_ki", res)


class TestInteractionService(unittest.TestCase):
    """Test 3D non-covalent contact calculation."""

    def setUp(self):
        self.service = interaction_service

    def test_euclidean_distance(self):
        d = self.service.calculate_euclidean_distance([0, 0, 0], [3, 4, 0])
        self.assertEqual(d, 5.0)

    def test_analyze_protein_ligand_interactions(self):
        ligand_atoms = ["O", "C"]
        ligand_coords = [[1.0, 1.0, 1.0], [5.0, 5.0, 5.0]]
        protein_ca_coords = [
            [2.5, 2.0, 1.5],   # approx 2.06 Å away from O -> HBOND candidate
            [7.0, 6.0, 6.0]    # approx 2.45 Å away from C -> HYDROPHOBIC candidate
        ]
        interactions = self.service.analyze_protein_ligand_interactions(
            ligand_atoms=ligand_atoms,
            ligand_coords=ligand_coords,
            protein_ca_coords=protein_ca_coords
        )
        self.assertIsInstance(interactions, list)
        self.assertGreaterEqual(len(interactions), 1)
        for contact in interactions:
            self.assertIn("type", contact)
            self.assertIn("residue", contact)
            self.assertIn("distance", contact)
            self.assertIn("energy", contact)


class TestADMETService(unittest.TestCase):
    """Test in-silico ADMET profiling service and disclaimers."""

    def setUp(self):
        self.service = admet_service
        self.smiles = "CC(=O)Oc1ccccc1C(=O)O"

    def test_admet_profile(self):
        res = self.service.predict_admet_profile(self.smiles)
        self.assertIn("absorption", res)
        self.assertIn("distribution", res)
        self.assertIn("metabolism", res)
        self.assertIn("toxicity", res)
        self.assertIn("scientific_disclaimer", res)

        # Check required disclaimers for scientific integrity
        self.assertIn("computational", res["scientific_disclaimer"].lower())
        self.assertIn("experimental", res["scientific_disclaimer"].lower())

        # Check toxicity keys
        self.assertIn("herg_liability", res["toxicity"])
        self.assertIn("ames_mutagenicity", res["toxicity"])
        self.assertIn("dili_potential", res["toxicity"])


class TestResearchOrchestrator(unittest.TestCase):
    """Test stateful research orchestration workflow and monograph generation."""

    def setUp(self):
        self.orchestrator = ResearchOrchestrator()

    def test_full_orchestration_cycle(self):
        objective = "Assess Aspirin binding against target 1IEP"
        smiles = "CC(=O)Oc1ccccc1C(=O)O"

        job = self.orchestrator.create_job(
            objective=objective,
            smiles=smiles,
            target_pdb="1IEP"
        )
        self.assertIsNotNone(job.id)
        self.assertEqual(job.status, "Draft")
        self.assertEqual(len(job.steps), 8)

        # Execute workflow
        finished_job = self.orchestrator.execute_workflow(job.id)
        self.assertEqual(finished_job.status, "Completed")
        self.assertIsNotNone(finished_job.report_markdown)
        self.assertIn("Scientific Research Monograph", finished_job.report_markdown)
        self.assertIn("1IEP", finished_job.report_markdown)

        # Check step completion
        for step in finished_job.steps:
            self.assertEqual(step["status"], "completed")


class TestScientificApiEndpoints(unittest.TestCase):
    """Test FastAPI /api/research/* HTTP contracts."""

    def setUp(self):
        self.client = TestClient(app)

    def test_properties_endpoint(self):
        response = self.client.post(
            "/api/research/molecular/properties",
            json={"smiles": "CC(=O)Oc1ccccc1C(=O)O"}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("properties", data)
        self.assertAlmostEqual(data["properties"]["molecular_weight"], 180.16, places=1)
        self.assertTrue(data["properties"]["lipinski_compliant"])

    def test_conformers_endpoint(self):
        response = self.client.post(
            "/api/research/molecular/conformers",
            json={"smiles": "CC(=O)Oc1ccccc1C(=O)O", "num_conformers": 1}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("conformers", data)
        self.assertGreater(len(data["conformers"]["atoms"]), 0)

    def test_admet_endpoint(self):
        response = self.client.post(
            "/api/research/admet",
            json={"smiles": "CC(=O)Oc1ccccc1C(=O)O"}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("admet", data)
        self.assertIn("absorption", data["admet"])
        self.assertIn("scientific_disclaimer", data["admet"])

    def test_docking_endpoint(self):
        response = self.client.post(
            "/api/research/docking",
            json={
                "smiles": "CC(=O)Oc1ccccc1C(=O)O",
                "target_pdb_id": "1IEP"
            }
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertTrue(data["docking"]["success"])
        self.assertEqual(len(data["docking"]["poses"]), 3)

    def test_orchestrate_endpoint(self):
        response = self.client.post(
            "/api/research/orchestrate",
            json={
                "objective": "Lead optimization for EGFR inhibition",
                "smiles": "CC(=O)Oc1ccccc1C(=O)O",
                "target_pdb_id": "1M17"
            }
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("job", data)
        job_id = data["job"]["id"]

        status_res = self.client.get(f"/api/research/jobs/{job_id}")
        self.assertEqual(status_res.status_code, 200)
        status_data = status_res.json()
        self.assertEqual(status_data["status"], "success")
        self.assertEqual(status_data["job"]["status"], "Completed")


if __name__ == "__main__":
    unittest.main()
