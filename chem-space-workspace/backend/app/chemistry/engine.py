"""
Chemistry Engine Adapter Interface
Abstract base for chemistry computation backends.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class AtomData:
    index: int
    symbol: str
    x: float
    y: float
    z: float
    charge: int = 0


@dataclass
class BondData:
    from_idx: int
    to_idx: int
    order: int
    aromatic: bool = False


@dataclass
class Conformer3D:
    atoms: List[AtomData]
    bonds: List[BondData]
    source: str = "unknown"


class ChemistryEngine(ABC):
    """Abstract interface for chemistry computation engines."""

    @abstractmethod
    def parse_smiles(self, smiles: str) -> Tuple[Optional[Any], List[str], List[str]]:
        """Parse SMILES into internal representation. Returns (mol, warnings, errors)."""
        pass

    @abstractmethod
    def to_canonical_smiles(self, mol: Any) -> str:
        """Convert molecule to canonical SMILES."""
        pass

    @abstractmethod
    def calculate_properties(self, mol: Any) -> Dict[str, Any]:
        """Calculate molecular descriptors."""
        pass

    @abstractmethod
    def generate_2d_svg(self, mol: Any, width: int, height: int) -> Optional[str]:
        """Generate 2D SVG depiction."""
        pass

    @abstractmethod
    def generate_3d_conformer(self, mol: Any) -> Optional[Conformer3D]:
        """Generate 3D coordinates."""
        pass

    @abstractmethod
    def get_molecular_formula(self, mol: Any) -> str:
        """Get molecular formula (Hill notation)."""
        pass

    @abstractmethod
    def get_molecular_weight(self, mol: Any) -> float:
        """Get exact molecular weight."""
        pass

    @abstractmethod
    def count_hbd_hba(self, mol: Any) -> Tuple[int, int]:
        """Count H-bond donors and acceptors."""
        pass

    @abstractmethod
    def calculate_tpsa(self, mol: Any) -> float:
        """Calculate topological polar surface area."""
        pass

    @abstractmethod
    def calculate_logp(self, mol: Any) -> float:
        """Calculate logP (partition coefficient)."""
        pass

    @abstractmethod
    def check_lipinski(self, mol: Any) -> Dict[str, Any]:
        """Check Lipinski Rule of Five."""
        pass

    @abstractmethod
    def check_veber(self, mol: Any) -> Dict[str, Any]:
        """Check Veber rules."""
        pass

    @abstractmethod
    def check_egan(self, mol: Any) -> Dict[str, Any]:
        """Check Egan rules."""
        pass

    @abstractmethod
    def find_substructure(self, mol: Any, query_smiles: str) -> List[List[int]]:
        """Find substructure matches."""
        pass

    @abstractmethod
    def calculate_similarity(self, mol1: Any, mol2: Any, fp_type: str = "morgan") -> float:
        """Calculate molecular similarity."""
        pass

    @abstractmethod
    def is_valid(self, mol: Any) -> bool:
        """Check if molecule is valid."""
        pass


class ChemistryEngineFactory:
    """Factory for creating chemistry engine instances."""

    _engines: Dict[str, ChemistryEngine] = {}

    @classmethod
    def register(cls, name: str, engine: ChemistryEngine):
        cls._engines[name] = engine

    @classmethod
    def get(cls, name: str = "rdkit") -> ChemistryEngine:
        if name not in cls._engines:
            raise ValueError(f"Chemistry engine '{name}' not registered. Available: {list(cls._engines.keys())}")
        return cls._engines[name]

    @classmethod
    def get_default(cls) -> ChemistryEngine:
        # Prefer RDKit, fallback to pure Python
        if "rdkit" in cls._engines:
            return cls._engines["rdkit"]
        if "pure" in cls._engines:
            return cls._engines["pure"]
        raise RuntimeError("No chemistry engine available")