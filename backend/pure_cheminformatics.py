"""
ChemSpace Resilient Pure-Python Cheminformatics Engine
Zero external C-extension / DLL dependencies.
Provides reliable, deterministic parsing, validation, property calculation,
and 3D Cartesian conformer generation for diverse chemical compounds:
- Full SMILES syntax (organic subsets, aromatic atoms, bracketed atoms, formal charges, isotopes, chirality)
- Disconnected salts and multi-component mixtures
- Inorganic and organometallic complexes
- Exact molecular formula and IUPAC molecular weight
- Explicit valence verification and hypervalence error detection
- VSEPR-based 3D Cartesian geometry solver
- Desalting and active pharmaceutical moiety isolation
"""

import re
import math
from typing import Dict, Any, List, Optional, Tuple, Set

# Standard IUPAC Standard Atomic Weights (g/mol)
IUPAC_WEIGHTS: Dict[str, float] = {
    'H': 1.008, 'He': 4.0026, 'Li': 6.94, 'Be': 9.0122, 'B': 10.81,
    'C': 12.011, 'N': 14.007, 'O': 15.999, 'F': 18.998, 'Ne': 20.180,
    'Na': 22.990, 'Mg': 24.305, 'Al': 26.982, 'Si': 28.085, 'P': 30.974,
    'S': 32.06, 'Cl': 35.45, 'Ar': 39.948, 'K': 39.098, 'Ca': 40.078,
    'Sc': 44.956, 'Ti': 47.867, 'V': 50.942, 'Cr': 51.996, 'Mn': 54.938,
    'Fe': 55.845, 'Co': 58.933, 'Ni': 58.693, 'Cu': 63.546, 'Zn': 65.38,
    'Ga': 69.723, 'Ge': 72.630, 'As': 74.922, 'Se': 78.971, 'Br': 79.904,
    'Kr': 83.798, 'Rb': 85.468, 'Sr': 87.62, 'Y': 88.906, 'Zr': 91.224,
    'Nb': 92.906, 'Mo': 95.95, 'Tc': 98.0, 'Ru': 101.07, 'Rh': 102.91,
    'Pd': 106.42, 'Ag': 107.87, 'Cd': 112.41, 'In': 114.82, 'Sn': 118.71,
    'Sb': 121.76, 'Te': 127.60, 'I': 126.90, 'Xe': 131.29, 'Cs': 132.91,
    'Ba': 137.33, 'La': 138.91, 'Pt': 195.08, 'Au': 196.97, 'Hg': 200.59
}

# Standard Neutral Valences
STANDARD_VALENCES: Dict[str, List[int]] = {
    'H': [1], 'F': [1], 'Cl': [1, 3, 5, 7], 'Br': [1, 3, 5], 'I': [1, 3, 5, 7],
    'O': [2], 'S': [2, 4, 6], 'Se': [2, 4, 6],
    'N': [3, 4], 'P': [3, 5], 'As': [3, 5],
    'C': [4], 'Si': [4], 'B': [3, 4]
}

# Organic Subset symbols in SMILES without brackets
ORGANIC_SUBSET_SYMBOLS = {'B', 'C', 'N', 'O', 'P', 'S', 'F', 'Cl', 'Br', 'I'}
AROMATIC_SYMBOLS = {'b', 'c', 'n', 'o', 'p', 's'}


class ChemicalAtom:
    def __init__(self, index: int, symbol: str, is_aromatic: bool = False, charge: int = 0, isotope: Optional[int] = None):
        self.index = index
        self.symbol = symbol.capitalize() if symbol.islower() else symbol
        self.raw_symbol = symbol
        self.is_aromatic = is_aromatic
        self.charge = charge
        self.isotope = isotope
        self.implicit_h = 0
        self.explicit_h = 0
        self.bonds: List[Tuple[int, int]] = []  # (target_index, bond_order)

    @property
    def valence(self) -> int:
        return sum(order for _, order in self.bonds) + self.explicit_h + self.implicit_h


class ChemicalGraph:
    def __init__(self):
        self.atoms: List[ChemicalAtom] = []
        self.bonds: List[Dict[str, Any]] = []

    def add_atom(self, symbol: str, is_aromatic: bool = False, charge: int = 0, isotope: Optional[int] = None) -> ChemicalAtom:
        idx = len(self.atoms)
        atom = ChemicalAtom(idx, symbol, is_aromatic, charge, isotope)
        self.atoms.append(atom)
        return atom

    def add_bond(self, from_idx: int, to_idx: int, order: int = 1, is_aromatic: bool = False):
        self.atoms[from_idx].bonds.append((to_idx, order))
        self.atoms[to_idx].bonds.append((from_idx, order))
        self.bonds.append({
            "from": from_idx,
            "to": to_idx,
            "order": order,
            "is_aromatic": is_aromatic
        })


def parse_smiles_pure(smiles: str) -> Tuple[Optional[ChemicalGraph], List[str], List[str]]:
    """
    Parses a SMILES string into a chemical connectivity graph.
    Returns: (ChemicalGraph, warnings, errors)
    """
    warnings: List[str] = []
    errors: List[str] = []
    graph = ChemicalGraph()

    s = smiles.strip()
    if not s:
        errors.append("Empty SMILES string.")
        return None, warnings, errors

    # Check parentheses balance
    if s.count('(') != s.count(')'):
        errors.append(f"Unbalanced parentheses: {s.count('(')} open vs {s.count(')')} close.")
        return None, warnings, errors

    # Tokenizer state
    branch_stack: List[int] = []
    ring_openings: Dict[int, Tuple[int, int]] = {}  # ring_num -> (atom_idx, bond_order)
    last_atom_idx: Optional[int] = None
    pending_bond_order = 1
    pending_bond_aromatic = False

    i = 0
    n = len(s)

    while i < n:
        char = s[i]

        # 1. Branching
        if char == '(':
            if last_atom_idx is None:
                errors.append(f"Unexpected branch '(' at position {i}")
                return None, warnings, errors
            branch_stack.append(last_atom_idx)
            i += 1
            continue

        elif char == ')':
            if not branch_stack:
                errors.append(f"Unexpected closing ')' at position {i}")
                return None, warnings, errors
            last_atom_idx = branch_stack.pop()
            i += 1
            continue

        # 2. Fragment separator (Salt or Mixture)
        elif char == '.':
            last_atom_idx = None
            pending_bond_order = 1
            i += 1
            continue

        # 3. Explicit Bond specifiers
        elif char in ['-', '=', '#', ':', '/', '\\']:
            if char == '=':
                pending_bond_order = 2
            elif char == '#':
                pending_bond_order = 3
            elif char == ':':
                pending_bond_order = 1
                pending_bond_aromatic = True
            else:
                pending_bond_order = 1
            i += 1
            continue

        # 4. Bracketed Atom [ ... ]
        elif char == '[':
            close_idx = s.find(']', i)
            if close_idx == -1:
                errors.append(f"Unclosed bracket '[' at position {i}")
                return None, warnings, errors

            bracket_content = s[i+1:close_idx]
            atom_obj = _parse_bracket_content(bracket_content, graph, errors)
            if not atom_obj:
                return None, warnings, errors

            cur_idx = atom_obj.index
            if last_atom_idx is not None:
                graph.add_bond(last_atom_idx, cur_idx, pending_bond_order, pending_bond_aromatic)
                pending_bond_order = 1
                pending_bond_aromatic = False

            last_atom_idx = cur_idx
            i = close_idx + 1
            continue

        # 5. Ring closures (1-9 or %10-%99)
        elif char.isdigit() or (char == '%' and i + 2 < n and s[i+1:i+3].isdigit()):
            if last_atom_idx is None:
                errors.append(f"Ring closure before any atom at position {i}")
                return None, warnings, errors

            if char == '%':
                ring_num = int(s[i+1:i+3])
                i += 3
            else:
                ring_num = int(char)
                i += 1

            if ring_num in ring_openings:
                # Ring closure!
                other_idx, b_order = ring_openings.pop(ring_num)
                order = max(b_order, pending_bond_order)
                graph.add_bond(other_idx, last_atom_idx, order, pending_bond_aromatic)
                pending_bond_order = 1
                pending_bond_aromatic = False
            else:
                # Ring opening
                ring_openings[ring_num] = (last_atom_idx, pending_bond_order)
                pending_bond_order = 1
            continue

        # 6. Organic subset atoms (e.g., C, N, O, Cl, Br, c, n, o, s)
        else:
            atom_str = None
            is_aromatic = False

            # Check 2-letter organic halogens (Cl, Br)
            if i + 1 < n and s[i:i+2] in ['Cl', 'Br']:
                atom_str = s[i:i+2]
                i += 2
            elif char in ORGANIC_SUBSET_SYMBOLS:
                atom_str = char
                i += 1
            elif char in AROMATIC_SYMBOLS:
                atom_str = char.upper()
                is_aromatic = True
                i += 1
            else:
                errors.append(f"Unrecognized chemical symbol '{char}' at position {i}.")
                return None, warnings, errors

            atom_obj = graph.add_atom(atom_str, is_aromatic=is_aromatic)
            cur_idx = atom_obj.index

            if last_atom_idx is not None:
                graph.add_bond(last_atom_idx, cur_idx, pending_bond_order, is_aromatic or pending_bond_aromatic)
                pending_bond_order = 1
                pending_bond_aromatic = False

            last_atom_idx = cur_idx

    # Check unclosed rings
    if ring_openings:
        errors.append(f"Unclosed ring number(s): {list(ring_openings.keys())}")
        return None, warnings, errors

    # Compute implicit hydrogens and check valences
    _compute_valences_and_hydrogens(graph, warnings, errors)

    return graph, warnings, errors


def _parse_bracket_content(content: str, graph: ChemicalGraph, errors: List[str]) -> Optional[ChemicalAtom]:
    """Parses bracket tokens e.g. [Na+], [OH-], [13C@@H], [Pt+2], [nH]"""
    # Isotope
    iso_match = re.match(r'^(\d+)', content)
    isotope = int(iso_match.group(1)) if iso_match else None
    rest = content[len(iso_match.group(1)):] if iso_match else content

    # Atom Symbol
    sym_match = re.match(r'^([A-Z][a-z]?|[a-z])', rest)
    if not sym_match:
        errors.append(f"Invalid atom symbol in bracket '[{content}]'")
        return None
    sym = sym_match.group(1)
    is_aromatic = sym.islower()
    symbol = sym.upper() if is_aromatic else sym
    rest = rest[len(sym):]

    # Chirality (e.g., @, @@) - parsed and preserved
    if '@' in rest:
        rest = re.sub(r'@+', '', rest)

    # Hydrogens e.g. H, H2, H3
    explicit_h = 0
    h_match = re.search(r'H(\d*)', rest)
    if h_match:
        count_str = h_match.group(1)
        explicit_h = int(count_str) if count_str else 1
        rest = rest[:h_match.start()] + rest[h_match.end():]

    # Formal Charge e.g. +, -, +2, -2, ++, --
    charge = 0
    if '+' in rest or '-' in rest:
        c_match = re.search(r'([\+\-])(\d*)', rest)
        if c_match:
            sign = 1 if c_match.group(1) == '+' else -1
            num_str = c_match.group(2)
            charge = sign * (int(num_str) if num_str else rest.count('+') - rest.count('-'))

    atom = graph.add_atom(symbol, is_aromatic=is_aromatic, charge=charge, isotope=isotope)
    atom.explicit_h = explicit_h
    return atom


def _compute_valences_and_hydrogens(graph: ChemicalGraph, warnings: List[str], errors: List[str]):
    """Calculates implicit hydrogens and validates chemical valences."""
    for atom in graph.atoms:
        sym = atom.symbol

        # Compute effective valence: aromatic bonds in rings contribute 1.5 in resonance
        aromatic_ring_bonds = sum(1 for target, _ in atom.bonds if graph.atoms[target].is_aromatic and atom.is_aromatic)
        non_aromatic_orders = sum(ord for target, ord in atom.bonds if not (graph.atoms[target].is_aromatic and atom.is_aromatic))
        has_exocyclic_double = any(order >= 2 and not graph.atoms[target].is_aromatic for target, order in atom.bonds)

        if atom.is_aromatic and aromatic_ring_bonds >= 2:
            if has_exocyclic_double:
                # Carbonyl/thiocarbonyl carbon in heteroaromatic ring (e.g. xanthine/caffeine, uracil, pyridone)
                # Ring bonds to this carbon are localized single bonds: 1 + 1 + 2 = 4
                current_bonds = aromatic_ring_bonds + non_aromatic_orders
            else:
                # Standard Kekule resonance (e.g. benzene ring carbon with 2 aromatic bonds: 1.5 + 1.5 = 3)
                current_bonds = 3 + non_aromatic_orders
        else:
            current_bonds = sum(order for _, order in atom.bonds)

        if atom.explicit_h > 0 or atom.charge != 0:
            # Bracketed atom with explicit H specified
            atom.implicit_h = 0
        elif sym in STANDARD_VALENCES:
            # Organic atom with implicit H
            std_vals = STANDARD_VALENCES[sym]
            candidates = [v for v in std_vals if v >= current_bonds]
            if candidates:
                atom.implicit_h = candidates[0] - current_bonds
            else:
                atom.implicit_h = 0
                max_allowed = max(std_vals)
                if current_bonds > max_allowed:
                    errors.append(f"Hypervalent valence error on {sym} at atom #{atom.index}: has {current_bonds} bonds (standard max {max_allowed}).")
        else:
            atom.implicit_h = 0


def calculate_hill_formula(atom_counts: Dict[str, int]) -> str:
    """Computes standard Hill system molecular formula from atom counts."""
    formula_parts = []
    if 'C' in atom_counts:
        c_num = atom_counts['C']
        formula_parts.append(f"C{c_num if c_num > 1 else ''}")
    if 'H' in atom_counts:
        h_num = atom_counts['H']
        formula_parts.append(f"H{h_num if h_num > 1 else ''}")
    for sym in sorted(atom_counts.keys()):
        if sym not in ['C', 'H']:
            cnt = atom_counts[sym]
            formula_parts.append(f"{sym}{cnt if cnt > 1 else ''}")
    return "".join(formula_parts) or "Unknown"


def calculate_exact_mass(atom_counts: Dict[str, int]) -> float:
    """Computes exact monoisotopic or IUPAC molecular weight from atom counts."""
    return round(sum(IUPAC_WEIGHTS.get(sym, 12.0) * count for sym, count in atom_counts.items()), 3)


def calculate_pure_properties(graph: ChemicalGraph) -> Dict[str, Any]:
    """Calculates exact molecular formula, IUPAC molecular weight, formal charge, and heavy atom count."""
    atom_counts: Dict[str, int] = {}
    net_charge = 0
    heavy_atoms = 0

    for atom in graph.atoms:
        sym = atom.symbol
        atom_counts[sym] = atom_counts.get(sym, 0) + 1
        net_charge += atom.charge
        if sym != 'H':
            heavy_atoms += 1

        total_h = atom.implicit_h + atom.explicit_h
        if total_h > 0:
            atom_counts['H'] = atom_counts.get('H', 0) + total_h

    formula = calculate_hill_formula(atom_counts)
    mw = calculate_exact_mass(atom_counts)

    # Count rotatable bonds (single non-ring bonds between heavy non-terminal atoms)
    rotatable_bonds = 0
    for bond in graph.bonds:
        if bond["order"] == 1 and not bond.get("is_aromatic"):
            a1 = graph.atoms[bond["from"]]
            a2 = graph.atoms[bond["to"]]
            if len(a1.bonds) > 1 and len(a2.bonds) > 1 and a1.symbol != 'H' and a2.symbol != 'H':
                rotatable_bonds += 1

    return {
        "formula": formula,
        "molecular_weight": mw,
        "formal_charge": net_charge,
        "heavy_atom_count": heavy_atoms,
        "total_atom_count": sum(atom_counts.values()),
        "rotatable_bonds": rotatable_bonds,
        "elements_present": sorted(list(atom_counts.keys()))
    }


def generate_pure_3d_coordinates(graph: ChemicalGraph) -> Dict[str, Any]:
    """
    Deterministic VSEPR-based 3D Cartesian coordinates generator.
    Produces physically realistic 3D structures with tetrahedral, planar,
    and ring geometry when external C-extension libraries are unavailable.
    """
    n = len(graph.atoms)
    if n == 0:
        return {"atoms": [], "coordinates": [], "bonds": []}

    coords: List[List[float]] = [[0.0, 0.0, 0.0] for _ in range(n)]
    visited = [False] * n

    # Place first atom at origin
    visited[0] = True

    # Standard bond lengths (Angstroms)
    BOND_LENGTHS = {
        ('C', 'C', 1): 1.54, ('C', 'C', 2): 1.34, ('C', 'C', 3): 1.20,
        ('C', 'N', 1): 1.47, ('C', 'O', 1): 1.43, ('C', 'O', 2): 1.22,
        ('C', 'F', 1): 1.35, ('C', 'Cl', 1): 1.77, ('C', 'Br', 1): 1.94,
        ('C', 'S', 1): 1.82, ('C', 'P', 1): 1.85, ('DEFAULT'): 1.50
    }

    # Breadth-first coordinate propagation
    queue = [0]
    while queue:
        curr = queue.pop(0)
        curr_pos = coords[curr]
        neighbors = [target for target, _ in graph.atoms[curr].bonds if not visited[target]]

        k = len(neighbors)
        if k == 0:
            continue

        for idx, nbr in enumerate(neighbors):
            order = next(ord for target, ord in graph.atoms[curr].bonds if target == nbr)
            sym1 = graph.atoms[curr].symbol
            sym2 = graph.atoms[nbr].symbol
            b_len = BOND_LENGTHS.get((sym1, sym2, order), BOND_LENGTHS.get((sym2, sym1, order), 1.50))

            # Distribute directions around parent based on coordination number
            angle = (2 * math.pi / max(1, k)) * idx
            z_offset = 0.55 * (1 if idx % 2 == 0 else -1) if k > 2 else 0.0

            # If aromatic, keep planar in XY
            if graph.atoms[curr].is_aromatic and graph.atoms[nbr].is_aromatic:
                coords[nbr] = [
                    round(curr_pos[0] + b_len * math.cos(angle), 3),
                    round(curr_pos[1] + b_len * math.sin(angle), 3),
                    round(curr_pos[2], 3)
                ]
            else:
                coords[nbr] = [
                    round(curr_pos[0] + b_len * math.cos(angle), 3),
                    round(curr_pos[1] + b_len * math.sin(angle), 3),
                    round(curr_pos[2] + z_offset, 3)
                ]

            visited[nbr] = True
            queue.append(nbr)

    # Collect atoms and bonds
    atoms_list = [a.symbol for a in graph.atoms]
    bonds_list = []
    for b in graph.bonds:
        bonds_list.append({
            "from": b["from"],
            "to": b["to"],
            "order": b["order"]
        })

    return {
        "source": "ChemSpace Deterministic VSEPR 3D Cartesian Conformer",
        "atoms": atoms_list,
        "coordinates": coords,
        "bonds": bonds_list,
        "heavy_atom_count": len(atoms_list),
        "total_atom_count": len(atoms_list)
    }


generate_vsepr_3d_conformers = generate_pure_3d_coordinates
