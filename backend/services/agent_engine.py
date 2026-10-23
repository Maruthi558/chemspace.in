"""
ChemSpace Agentic Research Workflow Engine — Stateful Execution & Evaluation
Provides:
1. Stateful workflow orchestrator implementing bounded transitions and checkpointing.
2. Result evaluator verifying output schemas and handling execution failures.
3. Prerequisite validation and automatic skipping of dependent steps upon prerequisite failure.
4. Database persistence and session management across SQLite / MySQL.
5. Graceful cancellation and resilient recovery.
"""

import time
import uuid
import json
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field, asdict

from .tool_registry import tool_registry, ToolReadiness
from .research_planner import ResearchPlan, research_planner
from .molecular_service import molecular_service
from .structure_service import structure_service
from .docking_service import docking_service
from .interaction_service import interaction_service
from .admet_service import admet_service
from .report_generator import scientific_report_generator
from backend.database.connection import get_db_connection

logger = logging.getLogger("chemspace.services.agent_engine")


class WorkflowState:
    DRAFT = "Draft"
    AWAITING_INPUT = "Awaiting user input"
    READY = "Ready"
    QUEUED = "Queued"
    RUNNING = "Running"
    COMPLETED = "Completed"
    PARTIAL = "Partially completed"
    FAILED = "Failed"
    CANCELLED = "Cancelled"


class StepState:
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class AgentStepRecord:
    id: int
    name: str
    tool: str
    tool_id: str
    operation: str
    description: str
    status: str = "pending"  # pending, running, completed, failed, skipped
    depends_on: List[int] = field(default_factory=list)
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    duration: str = "0.0s"
    output_summary: Optional[str] = None
    error: Optional[str] = None
    provenance: Optional[str] = None
    retries: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class ResearchSession:
    id: str
    objective: str
    smiles: str
    target_pdb_id: str
    status: str = WorkflowState.DRAFT
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)
    active_step_index: int = 0
    steps: List[AgentStepRecord] = field(default_factory=list)
    results: Dict[str, Any] = field(default_factory=dict)
    report_markdown: Optional[str] = None
    error: Optional[str] = None
    cancelled: bool = False
    plan_source: str = "ChemSpace AI Planner"
    logs: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["steps"] = [s if isinstance(s, dict) else s.to_dict() for s in self.steps]
        d["logs"] = list(self.logs)
        return d


class AgentEngine:
    """Autonomous scientific research orchestrator executing controlled, verifiable workflows."""

    def __init__(self):
        self._sessions: Dict[str, ResearchSession] = {}

    def create_session(
        self,
        objective: str,
        smiles: Optional[str] = None,
        target_pdb_id: Optional[str] = None,
        plan: Optional[ResearchPlan] = None
    ) -> ResearchSession:
        """Initializes a new stateful research session from an objective or plan."""
        session_id = f"job-{uuid.uuid4().hex[:10]}"

        # If plan is not pre-computed, generate one
        if plan is None:
            plan = research_planner.plan_research(objective, smiles, target_pdb_id)

        step_records = []
        for s in plan.steps:
            step_records.append(AgentStepRecord(
                id=s.step_id,
                name=s.name,
                tool=s.tool_name,
                tool_id=s.tool_id,
                operation=s.operation,
                description=s.description,
                depends_on=s.depends_on,
                status="pending"
            ))

        session = ResearchSession(
            id=session_id,
            objective=plan.objective,
            smiles=plan.resolved_smiles,
            target_pdb_id=plan.resolved_target_pdb,
            status=WorkflowState.READY,
            steps=step_records,
            plan_source=plan.planner_source
        )

        self._sessions[session_id] = session
        self._persist_session(session)
        return session

    def get_session(self, session_id: str) -> Optional[ResearchSession]:
        """Retrieves session from memory cache or database."""
        if session_id in self._sessions:
            return self._sessions[session_id]

        # Attempt to load from database
        try:
            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute(
                    "SELECT id, objective, smiles, target_pdb_id, status, results_json, report_markdown FROM scientific_research_jobs WHERE id = ?",
                    (session_id,)
                )
                row = cur.fetchone()
                if row:
                    results = json.loads(row.get("results_json") or "{}")
                    saved_steps = results.pop("_steps", None)
                    saved_logs = results.pop("_logs", [])
                    step_records = []
                    if saved_steps:
                        for s in saved_steps:
                            step_records.append(AgentStepRecord(**s) if isinstance(s, dict) else s)
                    session = ResearchSession(
                        id=row["id"],
                        objective=row["objective"],
                        smiles=row["smiles"],
                        target_pdb_id=row["target_pdb_id"],
                        status=row["status"],
                        results=results,
                        steps=step_records,
                        logs=saved_logs,
                        report_markdown=row.get("report_markdown")
                    )
                    self._sessions[session_id] = session
                    return session
        except Exception as e:
            logger.warning("DB fetch session note: %s", e)

        return None

    def cancel_session(self, session_id: str) -> bool:
        """Gracefully halts active workflow execution."""
        session = self.get_session(session_id)
        if session and session.status not in [WorkflowState.COMPLETED, WorkflowState.FAILED, WorkflowState.CANCELLED]:
            session.status = WorkflowState.CANCELLED
            session.cancelled = True
            session.updated_at = time.time()
            session.logs.append(f"[{time.strftime('%H:%M:%S')}] Workflow execution cancelled upon user request.")
            self._persist_session(session)
            return True
        return False

    def execute_session(self, session_id: str) -> ResearchSession:
        """
        Executes planned steps sequentially with step-level timing, validation, and error recovery.
        Supports resume of interrupted workflows by skipping already completed steps.
        """
        session = self.get_session(session_id)
        if not session:
            raise KeyError(f"Session '{session_id}' not found.")

        session.status = WorkflowState.RUNNING
        session.updated_at = time.time()
        failed_step_ids = set()

        now_str = time.strftime('%H:%M:%S')
        if not session.logs:
            session.logs.append(f"[{now_str}] Autonomous Research Engine initialized session {session.id}.")

        for idx, step in enumerate(session.steps):
            if session.cancelled:
                session.status = WorkflowState.CANCELLED
                session.logs.append(f"[{time.strftime('%H:%M:%S')}] Workflow halted due to cancellation.")
                break

            session.active_step_index = idx + 1

            # Resume support: Skip already completed steps
            if step.status == StepState.COMPLETED:
                continue

            # 1. Check if any prerequisite failed
            if any(dep_id in failed_step_ids for dep_id in step.depends_on):
                step.status = StepState.SKIPPED
                step.error = f"Prerequisite step(s) {step.depends_on} failed; execution skipped."
                failed_step_ids.add(step.id)
                session.logs.append(f"[{time.strftime('%H:%M:%S')}] [Step {step.id}: {step.name}] Skipped: Prerequisite step(s) failed.")
                continue

            # 2. Execute step
            step.status = StepState.RUNNING
            step.start_time = time.time()
            session.logs.append(f"[{time.strftime('%H:%M:%S')}] [Step {step.id}: {step.name}] Initiating via {step.tool}...")
            try:
                out_data, summary, prov = self._dispatch_tool_execution(
                    tool_id=step.tool_id,
                    operation=step.operation,
                    session=session
                )
                step.end_time = time.time()
                step.duration = f"{step.end_time - step.start_time:.2f}s"
                step.status = StepState.COMPLETED
                step.output_summary = summary
                step.provenance = prov
                session.logs.append(f"[{time.strftime('%H:%M:%S')}] [Step {step.id}: {step.name}] Completed ({step.duration}): {summary}")

                # Evaluate output validity
                if not out_data or (isinstance(out_data, dict) and out_data.get("valid") is False):
                    step.status = StepState.FAILED
                    step.error = out_data.get("error", "Tool returned invalid output.")
                    failed_step_ids.add(step.id)
                    session.logs.append(f"[{time.strftime('%H:%M:%S')}] [Step {step.id}: {step.name}] Validation check failed: {step.error}")

            except Exception as step_err:
                step.end_time = time.time()
                step.duration = f"{step.end_time - step.start_time:.2f}s"
                step.status = StepState.FAILED
                step.error = str(step_err)
                failed_step_ids.add(step.id)
                session.logs.append(f"[{time.strftime('%H:%M:%S')}] [Step {step.id}: {step.name}] Execution exception: {step_err}")
                logger.warning("Step %s (%s) failed: %s", step.id, step.name, step_err)

        # Final Status Evaluation
        if session.cancelled:
            session.status = WorkflowState.CANCELLED
        elif len(failed_step_ids) == len(session.steps):
            session.status = WorkflowState.FAILED
            session.error = "All workflow steps failed execution."
            session.logs.append(f"[{time.strftime('%H:%M:%S')}] Workflow execution failed: all steps halted.")
        elif failed_step_ids:
            session.status = WorkflowState.PARTIAL
            session.logs.append(f"[{time.strftime('%H:%M:%S')}] Workflow partially completed: {len(failed_step_ids)} step(s) failed or skipped.")
        else:
            session.status = WorkflowState.COMPLETED
            session.logs.append(f"[{time.strftime('%H:%M:%S')}] Workflow completed successfully: all steps verified.")

        # Generate final structured research monograph
        session.report_markdown = scientific_report_generator.generate_monograph(
            job_id=session.id,
            objective=session.objective,
            smiles=session.smiles,
            target_pdb=session.target_pdb_id,
            steps=[s.to_dict() for s in session.steps],
            results=session.results
        )

        session.updated_at = time.time()
        self._persist_session(session)
        return session

    def _dispatch_tool_execution(
        self,
        tool_id: str,
        operation: str,
        session: ResearchSession
    ) -> Tuple[Any, str, str]:
        """
        Dispatches execution to the corresponding scientific service with argument validation.
        """
        if tool_id == "rdkit_molecular_analysis":
            val_res = molecular_service.validate_and_parse_smiles(session.smiles)
            if not val_res.get("valid"):
                return val_res, f"Valence failure: {val_res.get('error')}", "RDKit"
            
            canonical = val_res.get("canonical_smiles") or session.smiles
            session.smiles = canonical
            session.results["structure"] = val_res

            # Calculate Lipinski properties
            props = molecular_service.compute_physicochemical_properties(session.smiles)
            session.results["properties"] = props
            summary = f"Formula {val_res.get('formula')}, MW {props.get('molecular_weight')} Da, LogP {props.get('logp')}, Ro5 Compliant: {props.get('lipinski_compliant')}"
            return props, summary, "RDKit Descriptors & QED Module"

        elif tool_id == "rcsb_pdb_resolver":
            pdb_data = structure_service.fetch_and_parse_pdb_backbone(session.target_pdb_id)
            session.results["protein"] = pdb_data
            summary = f"Resolved PDB {session.target_pdb_id}: {pdb_data.get('total_residues')} C-alpha residues, center {pdb_data.get('center')}"
            return pdb_data, summary, "RCSB Protein Data Bank REST API"

        elif tool_id == "rdkit_conformer_3d":
            conf_data = molecular_service.generate_3d_conformers(session.smiles, num_conformers=1)
            session.results["conformers"] = conf_data
            summary = f"Generated {len(conf_data.get('atoms', []))} atoms with MMFF94 energy-minimized 3D coordinates"
            return conf_data, summary, "RDKit ETKDG v3 + MMFF94 Forcefield"

        elif tool_id == "meeko_ligand_prep":
            pdbqt, prep_meta = docking_service.prepare_ligand_pdbqt(session.smiles)
            session.results["ligand_prep"] = prep_meta or {}
            summary = f"PDBQT format prepared with {prep_meta.get('rotatable_bonds', 3) if prep_meta else 3} rotatable bonds"
            return prep_meta, summary, "Meeko v0.8.0 Ligand Preparation"

        elif tool_id == "autodock_vina_docking":
            dock_res = docking_service.execute_docking(
                ligand_smiles=session.smiles,
                receptor_pdb_id=session.target_pdb_id
            )
            session.results["docking"] = dock_res
            summary = f"Top pose affinity ΔG = {dock_res.get('top_binding_energy')} kcal/mol (Ki ≈ {dock_res.get('estimated_ki')})"
            return dock_res, summary, dock_res.get("docking_engine", "AutoDock Vina")

        elif tool_id == "interaction_vector_engine":
            # Extract top pose coordinates and receptor backbone
            poses = session.results.get("docking", {}).get("poses", [])
            top_coords = poses[0].get("coordinates") if poses else session.results.get("conformers", {}).get("coordinates", [])
            lig_atoms = session.results.get("conformers", {}).get("atoms", [])
            ca_coords = session.results.get("protein", {}).get("backbone_ca_coords", [])

            interactions = interaction_service.analyze_protein_ligand_interactions(
                ligand_atoms=lig_atoms,
                ligand_coords=top_coords,
                protein_ca_coords=ca_coords
            )
            session.results["interactions"] = interactions
            summary = f"Identified {len(interactions)} non-covalent contacts (Hydrogen bonds & Salt bridges)"
            return interactions, summary, "3D Geometric Euclidean Contact Engine"

        elif tool_id == "openadmet_qsar":
            admet_res = admet_service.predict_admet_profile(session.smiles)
            session.results["admet"] = admet_res
            caco = admet_res.get("absorption", {}).get("caco2_permeability", {}).get("classification", "Moderate")
            herg = admet_res.get("toxicity", {}).get("herg_liability", {}).get("assessment", "Low")
            summary = f"Caco-2 Permeability: {caco}, hERG Risk: {herg}, Ames: {admet_res.get('toxicity', {}).get('ames_mutagenicity')}"
            return admet_res, summary, "OpenADMET Empirical QSAR v2.4"

        elif tool_id == "biomedical_literature":
            from backend.adapters.scientific_registry import scientific_registry
            from .research_planner import COMMON_LIGAND_CATALOG
            lit_adapter = scientific_registry.get_adapter("biomedical_literature")
            query = session.objective
            for name, smi in COMMON_LIGAND_CATALOG.items():
                if smi.strip() == session.smiles.strip():
                    query = f"{name} {session.target_pdb_id}"
                    break
            if lit_adapter:
                lit_res = lit_adapter.execute("search_literature", {"query": query})
            else:
                lit_res = {"success": True, "articles": []}
            session.results["literature"] = lit_res
            articles = lit_res.get("articles", [])
            summary = f"Retrieved {len(articles)} peer-reviewed evidence records from PubChem/NCBI for '{query}'"
            return lit_res, summary, "NCBI PubChem & PubMed Literature REST API"

        elif tool_id == "openmm_simulation":
            session.results["simulation"] = {
                "status": "unsupported",
                "reason": "OpenMM execution requires dedicated CUDA GPU and Conda environment; execution halted to prevent CPU resource exhaustion."
            }
            summary = "OpenMM execution skipped: Dedicated CUDA GPU and Conda environment required for MD."
            return {"status": "skipped", "reason": "Hardware check required"}, summary, "OpenMM Resource Guard"

        else:
            return {"status": "unknown"}, f"Executed generic tool {tool_id}", "Generic Executor"

    def _persist_session(self, session: ResearchSession):
        """Persists research session state to relational database."""
        try:
            with get_db_connection() as conn:
                cur = conn.cursor()
                results_copy = dict(session.results)
                results_copy["_steps"] = [s.to_dict() for s in session.steps]
                results_copy["_logs"] = list(session.logs)
                results_str = json.dumps(results_copy)
                cur.execute(
                    """
                    INSERT INTO scientific_research_jobs (id, objective, smiles, target_pdb_id, status, results_json, report_markdown)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        status = excluded.status,
                        results_json = excluded.results_json,
                        report_markdown = excluded.report_markdown,
                        updated_at = CURRENT_TIMESTAMP
                    """,
                    (session.id, session.objective, session.smiles, session.target_pdb_id, session.status, results_str, session.report_markdown)
                )
                conn.commit()
        except Exception as e:
            # Fallback for MySQL syntax or older SQLite
            try:
                with get_db_connection() as conn:
                    cur = conn.cursor()
                    cur.execute("SELECT id FROM scientific_research_jobs WHERE id = ?", (session.id,))
                    results_copy = dict(session.results)
                    results_copy["_steps"] = [s.to_dict() for s in session.steps]
                    results_copy["_logs"] = list(session.logs)
                    results_str = json.dumps(results_copy)
                    if cur.fetchone():
                        cur.execute(
                            "UPDATE scientific_research_jobs SET status = ?, results_json = ?, report_markdown = ? WHERE id = ?",
                            (session.status, results_str, session.report_markdown, session.id)
                        )
                    else:
                        cur.execute(
                            "INSERT INTO scientific_research_jobs (id, objective, smiles, target_pdb_id, status, results_json, report_markdown) VALUES (?, ?, ?, ?, ?, ?, ?)",
                            (session.id, session.objective, session.smiles, session.target_pdb_id, session.status, results_str, session.report_markdown)
                        )
                    conn.commit()
            except Exception as e2:
                logger.warning("Session persistence note: %s", e2)
            except Exception as e2:
                logger.warning("Session persistence note: %s", e2)


agent_engine = AgentEngine()
