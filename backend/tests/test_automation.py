"""
Comprehensive Test Suite for ChemSpace AI Automation Center
Tests:
- Tool Registry and Catalog Readiness
- BioNeMo Adapter & Credential Redaction
- Chemical Validation Layer & SMILES Parsing
- Physicochemical & Lipinski Ro5 Descriptors
- 3D Conformer Generation & Coordinates
- Workflow Planner & Step Sequences
- Async Workflow Execution & State Machine Transitions
- Job Cancellation Support
- Scientific Report Synthesis
"""

import unittest
import asyncio
import os
import json
import time

from backend.adapters.bionemo_adapter import BioNeMoAdapter, bionemo_adapter
from backend.automation_engine import (
    ScientificValidationLayer,
    ToolRegistry,
    CommandInterpreter,
    WorkflowPlanner,
    WorkflowExecutor,
    ReportGenerator,
    JobStatus,
    StepStatus
)


class TestBioNeMoAdapter(unittest.TestCase):
    """Test BioNeMo adapter behavior, credential safety, and scientific honesty."""

    def setUp(self):
        self.adapter = BioNeMoAdapter()

    def test_unconfigured_state_reporting(self):
        """Adapter must report unconfigured when no NGC_API_KEY is present."""
        # Temporarily mock missing key
        orig_key = os.environ.get("NGC_API_KEY")
        if "NGC_API_KEY" in os.environ:
            del os.environ["NGC_API_KEY"]
        if "NVIDIA_API_KEY" in os.environ:
            del os.environ["NVIDIA_API_KEY"]

        adapter = BioNeMoAdapter()
        status = adapter.get_catalog_status()

        self.assertFalse(status["configured"])
        self.assertIn("services", status)
        self.assertIn("drug-discovery-pipeline", status["services"])
        self.assertEqual(status["services"]["drug-discovery-pipeline"]["status"], "unconfigured")

        # Must reject execution without fabricating data
        result = adapter.execute_service("diffdock-nim", {"smiles": "CCO"})
        self.assertFalse(result["success"])
        self.assertEqual(result["code"], "AWAITING_CREDENTIALS")

        # Restore original
        if orig_key:
            os.environ["NGC_API_KEY"] = orig_key

    def test_credential_masking_never_leaks(self):
        """Masked key must never reveal raw secret."""
        os.environ["NGC_API_KEY"] = "nvapi-test123456789secretkey"
        adapter = BioNeMoAdapter()
        masked = adapter.get_masked_key()

        self.assertIsNotNone(masked)
        self.assertNotIn("secretkey", masked)
        self.assertTrue(masked.startswith("nvap"))
        self.assertTrue(masked.endswith("y"))

        # Clean up
        del os.environ["NGC_API_KEY"]


class TestScientificValidationLayer(unittest.TestCase):
    """Test chemical structure validation and property calculations."""

    def test_valid_smiles_parsing(self):
        """Valid SMILES like Aspirin and Caffeine must parse successfully."""
        aspirin = "CC(=O)Oc1ccccc1C(=O)O"
        res = ScientificValidationLayer.parse_and_validate_smiles(aspirin)
        self.assertTrue(res["valid"])
        self.assertTrue(res["contains_aromatic"])
        self.assertGreater(res["estimated_atom_count"], 5)

    def test_invalid_smiles_rejection(self):
        """Unbalanced or malformed chemical strings must be rejected."""
        invalid_parentheses = "CC(=O(Oc1ccccc1"
        res1 = ScientificValidationLayer.parse_and_validate_smiles(invalid_parentheses)
        self.assertFalse(res1["valid"])
        self.assertIn("parentheses", res1["error"])

        gibberish = "randomtextwithoutatoms"
        res2 = ScientificValidationLayer.parse_and_validate_smiles(gibberish)
        # Should either fail or flag no recognized atoms
        self.assertFalse(res2["valid"])

    def test_physicochemical_properties_aspirin(self):
        """Physicochemical descriptors for Aspirin must be compliant with Lipinski Ro5."""
        aspirin = "CC(=O)Oc1ccccc1C(=O)O"
        props = ScientificValidationLayer.calculate_physicochemical_properties(aspirin)

        self.assertAlmostEqual(props["molecular_weight"], 180.16, delta=5.0)
        self.assertLess(props["logp"], 5.0)
        self.assertLessEqual(props["hbd"], 5)
        self.assertLessEqual(props["hba"], 10)
        self.assertTrue(props["lipinski_compliant"])
        self.assertEqual(props["ro5_violations"], 0)
        self.assertGreater(props["qed_drug_likeness"], 0.4)

    def test_3d_conformer_generation(self):
        """3D Cartesian coordinates and bond topology must be populated."""
        aspirin = "CC(=O)Oc1ccccc1C(=O)O"
        confs = ScientificValidationLayer.fetch_3d_coordinates_for_smiles(aspirin, "Aspirin")

        self.assertIn("atoms", confs)
        self.assertIn("coordinates", confs)
        self.assertIn("bonds", confs)
        self.assertGreater(len(confs["atoms"]), 0)
        self.assertEqual(len(confs["atoms"]), len(confs["coordinates"]))
        # Coordinates must have 3 dimensions (X, Y, Z)
        self.assertEqual(len(confs["coordinates"][0]), 3)


class TestWorkflowEngine(unittest.TestCase):
    """Test command interpretation, planning, and asynchronous execution."""

    def test_command_interpreter(self):
        """Interpreter extracts compound names, intents, and SMILES correctly."""
        prompt = "Optimize aspirin scaffold for improved bioavailability"
        extracted = CommandInterpreter.extract_chemical_query(prompt)

        self.assertEqual(extracted["detected_name"], "Aspirin")
        self.assertEqual(extracted["intent"], "lead-optimization")
        self.assertIn("c1ccccc1", extracted["detected_smiles"])

    def test_workflow_planner(self):
        """Planner builds sequential scientific steps for requested intent."""
        steps = WorkflowPlanner.create_plan(
            intent="quantum-profiling",
            detected_name="Caffeine",
            detected_smiles="Cn1cnc2c1c(=O)n(c(=O)n2C)C",
            prompt="Calculate DFT bandgap for caffeine"
        )

        self.assertGreaterEqual(len(steps), 4)
        step_ops = [s.operation for s in steps]
        self.assertIn("validate_smiles", step_ops)
        self.assertIn("generate_3d_conformer", step_ops)
        self.assertIn("calculate_descriptors", step_ops)
        self.assertIn("solve_electronic_properties", step_ops)
        self.assertIn("compile_report", step_ops)

    def test_end_to_end_job_execution(self):
        """Job executes through executor and produces complete report."""
        executor = WorkflowExecutor()
        job = executor.create_job("Assess ADMET properties for paracetamol", "admet-screening")

        self.assertEqual(job.status, JobStatus.DRAFT)
        self.assertIsNotNone(job.id)

        # Run async execution
        asyncio.run(executor.execute_job_async(job.id))

        self.assertEqual(job.status, JobStatus.COMPLETED)
        self.assertIsNotNone(job.properties)
        self.assertIsNotNone(job.three_d_conformers)
        self.assertIsNotNone(job.scientific_report)
        self.assertIn("Scientific Automation Report", job.scientific_report)
        self.assertIn("Paracetamol", job.scientific_report)
        self.assertIn("Lipinski Rule-of-Five", job.scientific_report)

    def test_job_cancellation(self):
        """Executor safely marks job as cancelled when requested."""
        executor = WorkflowExecutor()
        job = executor.create_job("Test cancel job", "virtual-screening")
        cancelled = executor.cancel_job(job.id)

        self.assertTrue(cancelled)
        self.assertEqual(job.status, JobStatus.CANCELLED)
        self.assertTrue(job.cancellation_requested)


class TestLangGraphWorkflowEngine(unittest.TestCase):
    """Test LangGraph StateGraph, checkpointer, and node execution flow."""

    def test_scientific_registry_capabilities(self):
        """Central registry must return typed capabilities for all 8 scientific tools."""
        from backend.adapters.scientific_registry import scientific_registry
        caps = scientific_registry.get_all_capabilities()
        self.assertGreaterEqual(len(caps), 8)
        tool_ids = [c["id"] for c in caps]
        self.assertIn("rdkit_cheminformatics", tool_ids)
        self.assertIn("deepchem_ml_properties", tool_ids)
        self.assertIn("bionemo_nim_pipeline", tool_ids)
        self.assertIn("quantum_dft", tool_ids)
        self.assertIn("pubchem_conformers", tool_ids)
        self.assertIn("protein_structure_rcsb", tool_ids)

    def test_langgraph_job_creation_and_planning(self):
        """LangGraph orchestrator builds structured plan and typed state."""
        from backend.langgraph_engine import langgraph_orchestrator
        job = langgraph_orchestrator.create_job("Screen drug candidates against SARS-CoV-2 Mpro")
        self.assertIsNotNone(job.get("id"))
        self.assertIn(job.get("status"), ["Draft", "Ready"])
        self.assertGreaterEqual(len(job.get("steps", [])), 4)

    def test_langgraph_end_to_end_execution(self):
        """LangGraph executes all nodes and generates validated scientific report."""
        from backend.langgraph_engine import langgraph_orchestrator
        job = langgraph_orchestrator.create_job("Calculate DFT bandgap for Caffeine")
        job_id = job["id"]

        # Run asynchronous execution through LangGraph StateGraph
        asyncio.run(langgraph_orchestrator.execute_job_async(job_id))

        final_job = langgraph_orchestrator.get_job_dict(job_id)
        self.assertEqual(final_job.get("status"), "Completed")
        self.assertIsNotNone(final_job.get("properties"))
        self.assertIsNotNone(final_job.get("quantum_results"))
        self.assertIsNotNone(final_job.get("three_d_conformers"))
        self.assertIsNotNone(final_job.get("scientific_report"))
        self.assertIn("ChemSpace Scientific Research Report: Caffeine", final_job["scientific_report"])
        self.assertIn("HOMO-LUMO Bandgap", final_job["scientific_report"])

    def test_langgraph_approval_interception(self):
        """Orchestrator tracks approval and resume behavior."""
        from backend.langgraph_engine import langgraph_orchestrator
        job = langgraph_orchestrator.create_job("Dock remdesivir with DiffDock cloud NIM")
        job_id = job["id"]

        # If approval requested, approving resumes state
        res_approve = langgraph_orchestrator.approve_job(job_id, True)
        self.assertTrue(res_approve)
        j = langgraph_orchestrator.get_job_dict(job_id)
        self.assertTrue(j.get("approval_granted"))


if __name__ == "__main__":
    unittest.main()

