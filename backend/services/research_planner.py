"""
ChemSpace AI Research Planner — Structured Goal Decomposition & Tool Selection
Provides:
1. Smart objective parsing and ligand/target resolution.
2. Structured Gemini LLM planning with schema-constrained function/tool calling.
3. Deterministic scientific fallback planner for offline/unconfigured environments.
4. Dependency graph mapping and capability validation.
"""

import os
import re
import json
import uuid
import logging
import urllib.request
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field, asdict

from .tool_registry import tool_registry, ToolReadiness

logger = logging.getLogger("chemspace.services.planner")

COMMON_TARGET_CATALOG = {
    "mpro": "6LU7",
    "3clpro": "6LU7",
    "sars-cov-2": "6LU7",
    "covid": "6LU7",
    "egfr": "1M17",
    "erlotinib": "1M17",
    "gefitinib": "7JTL",
    "bcr-abl": "1IEP",
    "abl": "1IEP",
    "imatinib": "1IEP",
    "gleevec": "1IEP",
    "hiv-1 protease": "1HVR",
    "hiv protease": "1HVR",
    "cox-2": "1CX2",
    "cyclooxygenase": "1CX2",
    "ace2": "1R42"
}

COMMON_LIGAND_CATALOG = {
    "aspirin": "CC(=O)Oc1ccccc1C(=O)O",
    "acetylsalicylic acid": "CC(=O)Oc1ccccc1C(=O)O",
    "caffeine": "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
    "paracetamol": "CC(=O)Nc1ccc(O)cc1",
    "acetaminophen": "CC(=O)Nc1ccc(O)cc1",
    "ibuprofen": "CC(C)Cc1ccc(cc1)C(C)C(=O)O",
    "imatinib": "Cc1ccc(NC(=O)c2ccc(CN3CCN(C)CC3)cc2)cc1Nc4nccc(n4)c5cccnc5",
    "remdesivir": "CCC(CC)COC(=O)[C@H](C)N[P@](=O)(OC[C@H]1O[C@](C#N)(c2ccc3n2ncnc3N)[C@@H](O)[C@H]1O)Oc4ccccc4",
    "gefitinib": "COc1cc2ncnc(Nc3ccc(F)c(Cl)c3)c2cc1OCCCN4CCOCC4",
    "erlotinib": "COCCOc1cc2c(cc1OCCOC)ncnc2Nc3cccc(c3)C#C",
    "metformin": "CN(C)C(=N)NC(=N)N",
    "ethanol": "CCO"
}


@dataclass
class PlannedStep:
    step_id: int
    name: str
    tool_id: str
    tool_name: str
    operation: str
    description: str
    depends_on: List[int] = field(default_factory=list)
    status: str = "pending"
    readiness: str = ToolReadiness.READY
    is_optional: bool = False
    hardware: str = "CPU"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class ResearchPlan:
    plan_id: str
    objective: str
    resolved_smiles: str
    resolved_target_pdb: str
    workflow_type: str
    steps: List[PlannedStep] = field(default_factory=list)
    summary: str = ""
    planner_source: str = "Deterministic Scientific Planner"
    unsupported_steps: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "plan_id": self.plan_id,
            "objective": self.objective,
            "resolved_smiles": self.resolved_smiles,
            "resolved_target_pdb": self.resolved_target_pdb,
            "workflow_type": self.workflow_type,
            "steps": [s.to_dict() for s in self.steps],
            "summary": self.summary,
            "planner_source": self.planner_source,
            "unsupported_steps": self.unsupported_steps
        }


class ResearchPlanner:
    """Formulates executable scientific research plans using registered tools."""

    @classmethod
    def resolve_inputs(cls, objective: str, smiles: Optional[str] = None, target_pdb: Optional[str] = None) -> Tuple[str, str]:
        """Resolves molecular SMILES and target PDB code from parameters or objective string."""
        resolved_smiles = (smiles or "").strip()
        resolved_pdb = (target_pdb or "").strip().upper()

        obj_lower = (objective or "").lower()

        # 1. Resolve SMILES if missing
        if not resolved_smiles:
            # Check for direct SMILES in objective
            smiles_match = re.search(r'([A-Za-z0-9@+\-\[\]\(\)\\\/=#$%]{6,})', objective or "")
            if smiles_match and any(c in smiles_match.group(1) for c in ['=', '(', ')', '#', '@']):
                resolved_smiles = smiles_match.group(1)
            else:
                for name, smi in COMMON_LIGAND_CATALOG.items():
                    if name in obj_lower:
                        resolved_smiles = smi
                        break
        if not resolved_smiles:
            resolved_smiles = "CC(=O)Oc1ccccc1C(=O)O"  # Default reference: Aspirin

        # 2. Resolve PDB ID if missing
        if not resolved_pdb or not re.match(r'^[0-9][A-Za-z0-9]{3}$', resolved_pdb):
            # Check for 4-character PDB code in text
            pdb_match = re.search(r'\b([0-9][A-Za-z0-9]{3})\b', objective or "")
            if pdb_match:
                resolved_pdb = pdb_match.group(1).upper()
            else:
                for name, code in COMMON_TARGET_CATALOG.items():
                    if name in obj_lower:
                        resolved_pdb = code
                        break
        if not resolved_pdb or not re.match(r'^[0-9][A-Za-z0-9]{3}$', resolved_pdb):
            resolved_pdb = "6LU7"  # Default reference: SARS-CoV-2 Mpro

        return resolved_smiles, resolved_pdb

    @classmethod
    def plan_research(
        cls,
        objective: str,
        smiles: Optional[str] = None,
        target_pdb: Optional[str] = None,
        use_gemini: bool = True
    ) -> ResearchPlan:
        """
        Creates an end-to-end executable research plan.
        Attempts structured Gemini LLM reasoning first; falls back cleanly to deterministic planner.
        """
        clean_obj = (objective or "").strip()
        if not clean_obj:
            clean_obj = "Perform full molecular docking and ADMET characterization."

        res_smiles, res_pdb = cls.resolve_inputs(clean_obj, smiles, target_pdb)

        # 1. Try Gemini Structured LLM Plan if configured
        if use_gemini:
            gemini_plan = cls._plan_via_gemini(clean_obj, res_smiles, res_pdb)
            if gemini_plan is not None:
                return gemini_plan

        # 2. Deterministic Scientific Planner (Guaranteed reliable, zero network dependency)
        return cls._plan_deterministic(clean_obj, res_smiles, res_pdb)

    @classmethod
    def _plan_via_gemini(cls, objective: str, smiles: str, target_pdb: str) -> Optional[ResearchPlan]:
        """Calls Google Gemini API requesting strict structured JSON plan."""
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_AI_STUDIO_API_KEY")
        if not api_key:
            return None

        tools_summary = []
        for t in tool_registry.list_tools():
            tools_summary.append(f"- ID: {t['id']} | Name: {t['name']} | Readiness: {t['readiness']} | Capabilities: {', '.join(t['capabilities'])}")

        tools_context = "\n".join(tools_summary)

        system_prompt = f"""You are the ChemSpace Chief Scientific Research Planner.
You must decompose a chemical research objective into an ordered sequence of executable tool steps.
You MUST ONLY choose tools from this registered tool list:
{tools_context}

Output a single valid JSON object with EXACTLY this structure:
{{
  "workflow_type": "docking_and_admet",
  "summary": "Brief scientific summary of the experimental rationale",
  "steps": [
    {{
      "step_id": 1,
      "name": "Human readable step name",
      "tool_id": "one of the registered tool IDs",
      "operation": "operation name",
      "description": "What this step accomplishes",
      "depends_on": []
    }}
  ]
}}
Do NOT output markdown blocks or extra commentary. Return only the JSON object."""

        models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-3.5-flash"]
        user_query = f"Objective: {objective}\nLigand SMILES: {smiles}\nTarget PDB: {target_pdb}"

        for model in models:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
                payload = {
                    "contents": [{"role": "user", "parts": [{"text": user_query}]}],
                    "systemInstruction": {"parts": [{"text": system_prompt}]},
                    "generationConfig": {"temperature": 0.2, "maxOutputTokens": 2048}
                }
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=5) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    # Strip any backticks if present
                    if text.startswith("```json"):
                        text = text[7:]
                    if text.startswith("```"):
                        text = text[3:]
                    if text.endswith("```"):
                        text = text[:-3]
                    parsed = json.loads(text.strip())

                    # Validate registered tools
                    planned_steps = []
                    for idx, s in enumerate(parsed.get("steps", [])):
                        t_id = s.get("tool_id")
                        tool_meta = tool_registry.get_tool(t_id)
                        if tool_meta:
                            planned_steps.append(PlannedStep(
                                step_id=idx + 1,
                                name=s.get("name", tool_meta.name),
                                tool_id=t_id,
                                tool_name=tool_meta.name,
                                operation=s.get("operation", "execute"),
                                description=s.get("description", tool_meta.description),
                                depends_on=s.get("depends_on", []),
                                readiness=tool_meta.readiness,
                                hardware=tool_meta.hardware_requirements
                            ))

                    if planned_steps:
                        return ResearchPlan(
                            plan_id=f"plan-{uuid.uuid4().hex[:8]}",
                            objective=objective,
                            resolved_smiles=smiles,
                            resolved_target_pdb=target_pdb,
                            workflow_type=parsed.get("workflow_type", "ai_directed_workflow"),
                            steps=planned_steps,
                            summary=parsed.get("summary", "AI-formulated research workflow sequence."),
                            planner_source=f"Google Gemini ({model})"
                        )
            except Exception as e:
                logger.warning("Gemini plan generation attempt failed on model %s: %s", model, e)
                continue

        return None

    @classmethod
    def _plan_deterministic(cls, objective: str, smiles: str, target_pdb: str) -> ResearchPlan:
        """
        Deterministic scientific research planner mapping objectives into verified step sequences.
        """
        obj_lower = objective.lower()

        # Classify objective
        is_docking = any(w in obj_lower for w in ["dock", "pose", "affinity", "binding", "complex", "protein", "target"])
        is_admet = any(w in obj_lower for w in ["admet", "toxicity", "caco", "bbb", "herg", "ames", "pharmacokinetic", "bioavailability"])
        is_dynamics = any(w in obj_lower for w in ["dynamic", "md", "openmm", "simulation", "trajectory", "picosecond", "nanosecond"])
        is_literature = any(w in obj_lower for w in ["literature", "paper", "publication", "reference", "citation", "pubmed", "mechanism", "evidence", "clinical", "research", "overview"])

        steps: List[PlannedStep] = []
        unsupported: List[str] = []

        # Step 1: Chemical Structure Sanitization
        steps.append(PlannedStep(
            step_id=1,
            name="Chemical Structure Sanitization & Valence Verification",
            tool_id="rdkit_molecular_analysis",
            tool_name="RDKit Molecular Informatics",
            operation="validate_and_sanitize",
            description=f"Validates chemical syntax for SMILES '{smiles[:35]}...', verifies valence rules, and calculates Lipinski Ro5 compliance.",
            depends_on=[],
            readiness=tool_registry.get_tool("rdkit_molecular_analysis").readiness
        ))

        # Step 2: Target PDB Resolution (if macromolecule involved)
        if is_docking or True:
            steps.append(PlannedStep(
                step_id=2,
                name=f"Target PDB {target_pdb} Alignment & Pocket Definition",
                tool_id="rcsb_pdb_resolver",
                tool_name="RCSB Protein Data Bank Resolver",
                operation="fetch_and_parse_backbone",
                description=f"Downloads crystal structure {target_pdb} from RCSB, extracts C-alpha backbone coordinates, and determines catalytic pocket center.",
                depends_on=[],
                readiness=tool_registry.get_tool("rcsb_pdb_resolver").readiness
            ))

        # Step 3: 3D Conformer Generation
        steps.append(PlannedStep(
            step_id=3,
            name="3D Conformer Generation & MMFF94 Energy Minimization",
            tool_id="rdkit_conformer_3d",
            tool_name="RDKit 3D Distance Geometry & MMFF94",
            operation="generate_3d_conformers",
            description="Embeds 3D Cartesian coordinates using ETKDG v3 distance geometry and minimizes conformational strain energy.",
            depends_on=[1],
            readiness=tool_registry.get_tool("rdkit_conformer_3d").readiness
        ))

        # Step 4: Ligand PDBQT Preparation
        if is_docking:
            steps.append(PlannedStep(
                step_id=4,
                name="Meeko Ligand PDBQT & Torsion Tree Preparation",
                tool_id="meeko_ligand_prep",
                tool_name="Meeko Ligand & PDBQT Preparator",
                operation="prepare_ligand_pdbqt",
                description="Assigns Gasteiger partial charges and builds rotatable bond torsion trees for docking simulation.",
                depends_on=[1, 3],
                readiness=tool_registry.get_tool("meeko_ligand_prep").readiness
            ))

            # Step 5: AutoDock Vina Docking
            steps.append(PlannedStep(
                step_id=5,
                name=f"AutoDock Vina Docking & Pose Prediction ({target_pdb})",
                tool_id="autodock_vina_docking",
                tool_name="AutoDock Vina Docking & Pose Scoring",
                operation="execute_docking",
                description=f"Samples small-molecule binding orientations in the {target_pdb} pocket; calculates binding free energy (ΔG) and Ki.",
                depends_on=[2, 4],
                readiness=tool_registry.get_tool("autodock_vina_docking").readiness
            ))

            # Step 6: 3D Non-Covalent Interactions
            steps.append(PlannedStep(
                step_id=6,
                name="3D Non-Covalent Interaction Fingerprinting",
                tool_id="interaction_vector_engine",
                tool_name="3D Non-Covalent Interaction Engine",
                operation="analyze_interactions",
                description="Measures interatomic distances to identify hydrogen bonds (≤3.5 Å), salt bridges (≤4.0 Å), and hydrophobic contacts.",
                depends_on=[5],
                readiness=tool_registry.get_tool("interaction_vector_engine").readiness
            ))

        # Step 7: ADMET Pharmacokinetics & Safety Endpoints
        steps.append(PlannedStep(
            step_id=len(steps) + 1,
            name="In-Silico ADMET Pharmacokinetic & Safety Profiling",
            tool_id="openadmet_qsar",
            tool_name="OpenADMET QSAR & Toxicity Engine",
            operation="predict_admet_profile",
            description="Predicts intestinal absorption, blood-brain penetration, CYP450 inhibition, and cardiac hERG liability flags.",
            depends_on=[1],
            readiness=tool_registry.get_tool("openadmet_qsar").readiness
        ))

        # Step 8: Biomedical Literature & Evidence Search (if requested)
        if is_literature:
            lit_tool = tool_registry.get_tool("biomedical_literature")
            steps.append(PlannedStep(
                step_id=len(steps) + 1,
                name="Biomedical Literature & Scientific Evidence Retrieval",
                tool_id="biomedical_literature",
                tool_name="Biomedical & Chemical Literature Retrieval",
                operation="search_literature",
                description=f"Queries PubMed and PubChem compound monographs for peer-reviewed citations and mechanism-of-action data for target {target_pdb}.",
                depends_on=[],
                readiness=lit_tool.readiness if lit_tool else "Ready",
                is_optional=True
            ))

        # If Molecular Dynamics was explicitly requested, add an optional step with resource notice
        if is_dynamics:
            openmm_tool = tool_registry.get_tool("openmm_simulation")
            steps.append(PlannedStep(
                step_id=len(steps) + 1,
                name="OpenMM Molecular Dynamics Simulation (Explicit Solvent)",
                tool_id="openmm_simulation",
                tool_name="OpenMM Molecular Dynamics Engine",
                operation="run_simulation",
                description="Requires dedicated CUDA GPU. Flagged for resource pre-check before initiation.",
                depends_on=[5],
                readiness=openmm_tool.readiness,
                is_optional=True,
                hardware="CUDA GPU"
            ))
            if openmm_tool.readiness != ToolReadiness.READY:
                unsupported.append("Molecular Dynamics (OpenMM C++ CUDA engine not installed on host)")

        return ResearchPlan(
            plan_id=f"plan-{uuid.uuid4().hex[:8]}",
            objective=objective,
            resolved_smiles=smiles,
            resolved_target_pdb=target_pdb,
            workflow_type="docking_and_admet" if is_docking else "molecular_characterization",
            steps=steps,
            summary=f"Automated multi-step computational pipeline evaluating {smiles[:20]} against {target_pdb}.",
            planner_source="Deterministic Scientific Rule Engine",
            unsupported_steps=unsupported
        )


research_planner = ResearchPlanner()
