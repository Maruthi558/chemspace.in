"""
Unit and Integration Test Suite: ChemSpace Agentic AI Research Engine
Validates:
1. Tool Registry: Registration, schema definitions, hardware specs, and empirical health checks.
2. Research Planner: Input resolution, dependency DAG formulation, and rule-based fallback.
3. Report Generator: Peer-level scientific monograph generation with strict evidence tags ([FACT], [COMPUTED], [PREDICTED], [INTERPRETED]).
4. Agent Engine: Session lifecycle, step-level state transitions, bounded retries, prerequisite validation, and skipping.
5. FastAPI Research Endpoints: HTTP contracts for tools, planning, jobs, and direct tool execution.
"""

import unittest
import os
import json
from unittest.mock import patch

from backend.services.tool_registry import tool_registry, ToolReadiness
from backend.services.research_planner import ResearchPlanner, ResearchPlan, PlannedStep
from backend.services.report_generator import ScientificReportGenerator
from backend.services.agent_engine import (
    AgentEngine,
    ResearchSession,
    AgentStepRecord,
    WorkflowState,
    StepState
)
from fastapi.testclient import TestClient
from backend.main import app


class TestToolRegistry(unittest.TestCase):
    """Tests the Scientific Tool Registry and empirical health checks."""

    def setUp(self):
        self.registry = tool_registry

    def test_registered_tools_count_and_keys(self):
        tools = self.registry.list_tools()
        self.assertGreaterEqual(len(tools), 9)
        tool_ids = [t["id"] for t in tools]
        self.assertIn("rdkit_molecular_analysis", tool_ids)
        self.assertIn("rdkit_conformer_3d", tool_ids)
        self.assertIn("rcsb_pdb_resolver", tool_ids)
        self.assertIn("autodock_vina_docking", tool_ids)
        self.assertIn("interaction_vector_engine", tool_ids)
        self.assertIn("openadmet_qsar", tool_ids)
        self.assertIn("gemini_research_assistant", tool_ids)

    def test_tool_definition_structure(self):
        tool = self.registry.get_tool("rdkit_molecular_analysis")
        self.assertIsNotNone(tool)
        self.assertEqual(tool.category, "cheminformatics")
        self.assertIn("smiles", tool.input_schema.get("properties", {}))
        self.assertIn("molecular_weight", tool.output_schema.get("properties", {}))
        self.assertIn("logp", tool.output_schema.get("properties", {}))
        self.assertIn("tpsa", tool.output_schema.get("properties", {}))
        self.assertIn("CPU", tool.hardware_requirements.upper())

    def test_health_checks_execution(self):
        health_report = self.registry.run_health_checks()
        self.assertGreaterEqual(len(health_report), 9)
        self.assertIn("rdkit_molecular_analysis", health_report)
        self.assertEqual(health_report["rdkit_molecular_analysis"]["readiness"], ToolReadiness.READY)

    def test_nonexistent_tool_lookup(self):
        tool = self.registry.get_tool("quantum_teleportation_matrix")
        self.assertIsNone(tool)


class TestResearchPlanner(unittest.TestCase):
    """Tests research objective decomposition and dependency DAG planning."""

    def test_input_resolution_known_drugs(self):
        smi, pdb = ResearchPlanner.resolve_inputs("Screen aspirin derivatives against inflammation")
        self.assertEqual(smi, "CC(=O)Oc1ccccc1C(=O)O")

        smi_rem, pdb_rem = ResearchPlanner.resolve_inputs("Dock remdesivir into SARS-CoV-2 Mpro")
        self.assertIn("6LU7", pdb_rem)

    def test_input_resolution_pdb_ids(self):
        smi, pdb = ResearchPlanner.resolve_inputs("Dock compound into crystal structure 7JTL")
        self.assertEqual(pdb, "7JTL")

    def test_deterministic_fallback_planner(self):
        objective = "Dock remdesivir against 6LU7 Mpro and analyze binding interactions"
        plan = ResearchPlanner.plan_research(
            objective=objective,
            smiles="CCC(CC)COC(=O)[C@H](C)N[P@](=O)(OC[C@H]1O[C@](C#N)(c2ccc3n2ncnc3N)[C@@H](O)[C@H]1O)Oc4ccccc4",
            target_pdb="6LU7",
            use_gemini=False
        )
        self.assertIsInstance(plan, ResearchPlan)
        self.assertGreaterEqual(len(plan.steps), 5)

        step_tools = [s.tool_id for s in plan.steps]
        self.assertIn("rdkit_molecular_analysis", step_tools)
        self.assertIn("rcsb_pdb_resolver", step_tools)
        self.assertIn("rdkit_conformer_3d", step_tools)
        self.assertIn("autodock_vina_docking", step_tools)
        self.assertIn("interaction_vector_engine", step_tools)

        # Verify dependency ordering: conformer depends on step 1 (molecular analysis)
        conf_step = next(s for s in plan.steps if s.tool_id == "rdkit_conformer_3d")
        self.assertIn(1, conf_step.depends_on)


class TestScientificReportGenerator(unittest.TestCase):
    """Tests peer-review scientific monograph synthesis and evidence provenance tags."""

    def test_monograph_generation_with_evidence_tags(self):
        results = {
            "structure": {
                "formula": "C9H8O4",
                "has_aromatic_rings": True
            },
            "protein": {
                "metadata": {"title": "Prostaglandin H2 Synthase-1", "method": "X-RAY", "resolution": "2.2 Å"}
            },
            "properties": {
                "molecular_weight": 180.16,
                "logp": 1.19,
                "tpsa": 63.6,
                "hbd": 1,
                "hba": 3,
                "rotatable_bonds": 2,
                "qed": 0.58
            },
            "docking": {
                "success": True,
                "top_binding_energy": -6.42,
                "estimated_ki": "19.4 uM",
                "poses": [{"title": "Pose 1", "delta_g_kcal_mol": -6.42, "estimated_ki": "19.4 uM"}]
            },
            "interactions": [
                {"type": "hbond", "residue": "TYR355", "distance": "2.75 Å"}
            ]
        }

        report = ScientificReportGenerator.generate_monograph(
            job_id="job_test_123",
            objective="Evaluate aspirin binding against COX-1",
            smiles="CC(=O)Oc1ccccc1C(=O)O",
            target_pdb="1CX2",
            steps=[
                {"name": "Structure Sanitization", "tool_name": "RDKit Cheminformatics", "status": "completed"},
                {"name": "Physicochemical Profiling", "tool_name": "RDKit Descriptors", "status": "completed"}
            ],
            results=results
        )

        self.assertIsInstance(report, str)
        self.assertIn("# Scientific Research Monograph", report)
        self.assertIn("Input Specifications", report)
        self.assertIn("Molecular Descriptors", report)
        self.assertIn("Molecular Docking", report)
        self.assertIn("AI Scientific Interpretation", report)
        self.assertIn("Execution Provenance", report)

        # Verify mandatory evidence provenance tags
        self.assertIn("[FACT]", report)
        self.assertIn("[COMPUTED]", report)
        self.assertIn("[PREDICTED]", report)
        self.assertIn("[INTERPRETED]", report)


class TestAgentEngine(unittest.TestCase):
    """Tests research session execution, failure handling, and state transitions."""

    def setUp(self):
        self.engine = AgentEngine()
        # Fast local execution: avoid remote Gemini timeouts during unit tests
        self.patcher = patch.object(ResearchPlanner, '_plan_via_gemini', return_value=None)
        self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    def test_session_creation(self):
        session = self.engine.create_session(
            objective="Screen kinase candidate against EGFR",
            smiles="COc1cc2ncnc(Nc3ccc(F)c(Cl)c3)c2cc1OCCCN4CCOCC4",
            target_pdb_id="7JTL"
        )
        self.assertIsNotNone(session.id)
        self.assertIn(session.status, [WorkflowState.DRAFT, WorkflowState.READY])
        self.assertGreaterEqual(len(session.steps), 4)

    def test_session_execution_end_to_end(self):
        session = self.engine.create_session(
            objective="Analyze aspirin molecular structure and properties",
            smiles="CC(=O)Oc1ccccc1C(=O)O",
            target_pdb_id="1CX2"
        )
        completed_session = self.engine.execute_session(session.id)
        self.assertIn(
            completed_session.status,
            [WorkflowState.COMPLETED, WorkflowState.PARTIAL]
        )

        # Check results dictionary
        self.assertIn("properties", completed_session.results)
        self.assertAlmostEqual(completed_session.results["properties"]["molecular_weight"], 180.16, places=1)

        # Check monograph was compiled
        self.assertIsNotNone(completed_session.report_markdown)
        self.assertIn("[COMPUTED]", completed_session.report_markdown)

    def test_prerequisite_failure_and_skipping(self):
        session = self.engine.create_session(
            objective="Analyze invalid molecule",
            smiles="INVALID_CHEMICAL_STRING_XYZ%%@@",
            target_pdb_id="1CX2"
        )
        executed_session = self.engine.execute_session(session.id)

        # Sanitization step should fail
        step_1 = next(s for s in executed_session.steps if s.id == 1)
        self.assertEqual(step_1.status, StepState.FAILED)

        # Dependent steps should be skipped, not fabricated
        dependent_steps = [s for s in executed_session.steps if 1 in s.depends_on]
        for dep in dependent_steps:
            self.assertEqual(dep.status, StepState.SKIPPED)

    def test_session_cancellation(self):
        session = self.engine.create_session(
            objective="Cancelable objective",
            smiles="CC(=O)O",
            target_pdb_id="6LU7"
        )
        success = self.engine.cancel_session(session.id)
        self.assertTrue(success)
        reloaded = self.engine.get_session(session.id)
        self.assertEqual(reloaded.status, WorkflowState.CANCELLED)


class TestResearchAPIEndpoints(unittest.TestCase):
    """Tests the new REST API contracts for the Agentic AI Research Engine."""

    def setUp(self):
        self.client = TestClient(app)
        self.patcher = patch.object(ResearchPlanner, '_plan_via_gemini', return_value=None)
        self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    def test_get_tools_endpoint(self):
        res = self.client.get("/api/research/tools")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("count", data)
        self.assertIn("tools", data)
        self.assertGreaterEqual(data["count"], 9)

    def test_plan_endpoint(self):
        payload = {
            "objective": "Screen kinase inhibitor against EGFR",
            "smiles": "COc1cc2ncnc(Nc3ccc(F)c(Cl)c3)c2cc1OCCCN4CCOCC4",
            "protein_id": "7JTL",
            "use_gemini": False
        }
        res = self.client.post("/api/research/plan", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("plan", data)
        self.assertIn("steps", data["plan"])
        self.assertGreaterEqual(len(data["plan"]["steps"]), 4)

    def test_create_and_start_job_endpoint(self):
        create_payload = {
            "objective": "Screen aspirin against COX-1",
            "smiles": "CC(=O)Oc1ccccc1C(=O)O",
            "target_pdb_id": "1CX2"
        }
        create_res = self.client.post("/api/research/jobs", json=create_payload)
        self.assertEqual(create_res.status_code, 200)
        job_data = create_res.json()["job"]
        job_id = job_data["id"]

        start_res = self.client.post(f"/api/research/jobs/{job_id}/start")
        self.assertEqual(start_res.status_code, 200)
        executed_data = start_res.json()["job"]
        self.assertIn(executed_data["status"], [WorkflowState.COMPLETED, WorkflowState.PARTIAL])
        self.assertIsNotNone(executed_data.get("report_markdown"))

    def test_direct_tool_execution_endpoint(self):
        payload = {
            "tool_id": "rdkit_molecular_analysis",
            "params": {
                "smiles": "CC(=O)Oc1ccccc1C(=O)O"
            }
        }
        res = self.client.post("/api/research/tools/execute", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertTrue(data["result"]["valid"])
        self.assertAlmostEqual(data["result"]["properties"]["molecular_weight"], 180.16, places=1)


if __name__ == "__main__":
    unittest.main()
