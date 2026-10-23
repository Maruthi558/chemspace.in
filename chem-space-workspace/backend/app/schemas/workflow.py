"""
Chem-Space Workspace Core Schemas
Pydantic models for workflow nodes, edges, execution, and chemistry data.
"""
from typing import Any, Dict, List, Optional, Literal, Union
from pydantic import BaseModel, Field, field_validator
from enum import Enum
from datetime import datetime
import uuid


class NodeStatus(str, Enum):
    IDLE = "idle"
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    SKIPPED = "skipped"
    AWAITING_APPROVAL = "awaiting_approval"


class NodeCategory(str, Enum):
    USER_INPUT = "user_input"
    MOLECULE_IDENTIFICATION = "molecule_identification"
    STRUCTURE_VALIDATION = "structure_validation"
    MOLECULAR_DESCRIPTORS = "molecular_descriptors"
    PHYSICOCHEMICAL_ANALYSIS = "physicochemical_analysis"
    DRUG_LIKENESS_SCREENING = "drug_likeness_screening"
    REACTION_ANALYSIS = "reaction_analysis"
    EXTERNAL_MODEL_PREDICTION = "external_model_prediction"
    LITERATURE_RETRIEVAL = "literature_retrieval"
    CANDIDATE_GENERATION = "candidate_generation"
    CANDIDATE_COMPARISON = "candidate_comparison"
    RESULTS_VERIFICATION = "results_verification"
    HUMAN_APPROVAL = "human_approval"
    RESEARCH_REPORT = "research_report"
    EXPORT_RESULTS = "export_results"


class PortType(str, Enum):
    MOLECULE = "molecule"
    MOLECULE_LIST = "molecule_list"
    STRING = "string"
    NUMBER = "number"
    BOOLEAN = "boolean"
    OBJECT = "object"
    ARRAY = "array"
    WORKFLOW_CONFIG = "workflow_config"
    RESEARCH_OBJECTIVE = "research_objective"
    REPORT = "report"


class PortDefinition(BaseModel):
    id: str
    name: str
    type: PortType
    required: bool = True
    description: str = ""
    default: Any = None


class NodeDefinition(BaseModel):
    """Definition of a workflow node type (template)."""
    type: str
    category: NodeCategory
    name: str
    description: str
    icon: str
    color: str
    inputs: List[PortDefinition] = Field(default_factory=list)
    outputs: List[PortDefinition] = Field(default_factory=list)
    config_schema: Dict[str, Any] = Field(default_factory=dict)
    handler: str  # Reference to handler function


class WorkflowNode(BaseModel):
    """Instance of a node in a workflow."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str
    position: Dict[str, float] = Field(default_factory=lambda: {"x": 0, "y": 0})
    config: Dict[str, Any] = Field(default_factory=dict)
    data: Dict[str, Any] = Field(default_factory=dict)
    status: NodeStatus = NodeStatus.IDLE
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    execution_id: Optional[str] = None


class WorkflowEdge(BaseModel):
    """Connection between nodes."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source: str
    target: str
    source_handle: Optional[str] = None
    target_handle: Optional[str] = None
    type: str = "default"


class WorkflowGraph(BaseModel):
    """Complete workflow definition."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str = ""
    nodes: List[WorkflowNode] = Field(default_factory=list)
    edges: List[WorkflowEdge] = Field(default_factory=list)
    viewport: Dict[str, Any] = Field(default_factory=lambda: {"x": 0, "y": 0, "zoom": 1})
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    version: int = 1
    tags: List[str] = Field(default_factory=list)


class WorkflowExecution(BaseModel):
    """Workflow execution instance."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workflow_id: str
    status: NodeStatus = NodeStatus.IDLE
    current_node: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    node_results: Dict[str, Any] = Field(default_factory=dict)
    node_errors: Dict[str, str] = Field(default_factory={})
    logs: List[Dict[str, Any]] = Field(default_factory=list)
    config: Dict[str, Any] = Field(default_factory=dict)


class MoleculeData(BaseModel):
    """Molecule representation with computed properties."""
    smiles: str
    canonical_smiles: Optional[str] = None
    name: Optional[str] = None
    iupac_name: Optional[str] = None
    formula: Optional[str] = None
    molecular_weight: Optional[float] = None
    svg_2d: Optional[str] = None
    coordinates_3d: Optional[Dict[str, Any]] = None
    source: str = "user_input"
    confidence: float = 1.0
    ambiguous: bool = False
    alternatives: List["MoleculeData"] = Field(default_factory=list)

    # Computed descriptors
    heavy_atom_count: Optional[int] = None
    rotatable_bonds: Optional[int] = None
    hbd: Optional[int] = None  # Hydrogen bond donors
    hba: Optional[int] = None  # Hydrogen bond acceptors
    tpsa: Optional[float] = None  # Topological polar surface area
    logp: Optional[float] = None
    formal_charge: Optional[int] = None

    # Drug-likeness
    lipinski_pass: Optional[bool] = None
    lipinski_violations: List[str] = Field(default_factory=list)
    veber_pass: Optional[bool] = None
    egan_pass: Optional[bool] = None

    # Predictions (with provenance)
    predictions: Dict[str, Dict[str, Any]] = Field(default_factory=dict)

    class Config:
        arbitrary_types_allowed = True


class ResearchObjective(BaseModel):
    """User's research goal."""
    molecule_input: str
    objective: str
    target_protein: Optional[str] = None
    desired_properties: Dict[str, Any] = Field(default_factory=dict)
    constraints: Dict[str, Any] = Field(default_factory=dict)
    num_candidates: int = 10
    max_iterations: int = 5


class AgentMessage(BaseModel):
    """Message between agents."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_agent: str
    to_agent: str
    message_type: str
    content: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    requires_approval: bool = False
    approved: Optional[bool] = None


class AgentResult(BaseModel):
    """Result from an agent execution."""
    agent_name: str
    success: bool
    output: Dict[str, Any]
    reasoning: str = ""
    confidence: float = 1.0
    warnings: List[str] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
    next_actions: List[Dict[str, Any]] = Field(default_factory=list)


class ExecutionLog(BaseModel):
    """Structured execution log entry."""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    level: Literal["debug", "info", "warning", "error"]
    node_id: Optional[str] = None
    agent: Optional[str] = None
    message: str
    data: Dict[str, Any] = Field(default_factory=dict)


class ResearchReport(BaseModel):
    """Final research report."""
    workflow_id: str
    execution_id: str
    objective: ResearchObjective
    input_molecule: MoleculeData
    methods: List[str] = Field(default_factory=list)
    tools_used: List[str] = Field(default_factory=list)
    computed_descriptors: Dict[str, Any] = Field(default_factory=dict)
    predictions: Dict[str, Any] = Field(default_factory=dict)
    candidates: List[MoleculeData] = Field(default_factory=list)
    literature_evidence: List[Dict[str, Any]] = Field(default_factory=list)
    execution_history: List[ExecutionLog] = Field(default_factory=list)
    failed_tasks: List[Dict[str, Any]] = Field(default_factory=list)
    uncertainties: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    recommended_next_steps: List[str] = Field(default_factory=list)
    generated_at: datetime = Field(default_factory=datetime.utcnow)


# Forward reference resolution
MoleculeData.model_rebuild()