"""
ChemSpace Scientific Domain Services Package
Contains modular, independently testable scientific services:
- molecular_service: RDKit cheminformatics, conformers, and descriptors
- structure_service: RCSB PDB crystal structures and Gemmi preparation
- docking_service: Meeko ligand/receptor preparation and AutoDock Vina execution
- interaction_service: 3D coordinate non-covalent interaction calculation
- admet_service: Validated ADMET property prediction models
- tool_registry: Tool registration, schema validation, and dynamic health checks
- research_planner: AI research planning with Gemini structured tool use & fallback
- agent_engine: Stateful agent workflow orchestration and recovery
- report_generator: Scientific research monograph compiler
"""

from .molecular_service import MolecularService, molecular_service
from .structure_service import StructureService, structure_service
from .docking_service import DockingService, docking_service
from .interaction_service import InteractionService, interaction_service
from .admet_service import ADMETService, admet_service
from .tool_registry import ToolRegistryService, tool_registry, ToolReadiness, ScientificTool
from .research_planner import ResearchPlanner, research_planner, ResearchPlan, PlannedStep
from .agent_engine import AgentEngine, agent_engine, ResearchSession, WorkflowState, AgentStepRecord
from .report_generator import ScientificReportGenerator, scientific_report_generator
from .research_orchestrator import ResearchOrchestrator, research_orchestrator

__all__ = [
    "MolecularService",
    "molecular_service",
    "StructureService",
    "structure_service",
    "DockingService",
    "docking_service",
    "InteractionService",
    "interaction_service",
    "ADMETService",
    "admet_service",
    "ToolRegistryService",
    "tool_registry",
    "ToolReadiness",
    "ScientificTool",
    "ResearchPlanner",
    "research_planner",
    "ResearchPlan",
    "PlannedStep",
    "AgentEngine",
    "agent_engine",
    "ResearchSession",
    "WorkflowState",
    "AgentStepRecord",
    "ScientificReportGenerator",
    "scientific_report_generator",
    "ResearchOrchestrator",
    "research_orchestrator"
]
