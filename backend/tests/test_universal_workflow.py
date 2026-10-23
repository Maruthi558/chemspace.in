"""
Unit and Integration Test Suite: ChemSpace Universal Molecular Workflow & AI Automation
Tests:
1. Pure-Python cheminformatics graph parser, formula calculation, IUPAC weights, and VSEPR 3D generation.
2. Universal molecular input validator (SMILES, InChI, SDF/MOL, Chemical Names).
3. Compound capability & compatibility engine (matrix for RDKit, VSEPR, DeepChem, Docking, Quantum).
4. Edge-case classifications (Aromatics, Fused rings, Zwitterions, Salts, Stereoisomers, Organometallics, Macrocycles).
5. Error detection & repair suggestions (unclosed rings, unbalanced parens, hypervalent bonds).
6. Smart preparation (desalting salts/mixtures into active parents, preserving provenance).
7. Batch processing engine with isolated fault handling across valid and corrupt records.
"""

import unittest
import os
import json

from backend.pure_cheminformatics import (
    parse_smiles_pure,
    calculate_pure_properties,
    generate_vsepr_3d_conformers,
    calculate_hill_formula,
    calculate_exact_mass
)
from backend.universal_validator import (
    universal_validate_molecule,
    detect_molecular_format,
    MolecularValidationReport
)
from backend.smart_preparator import (
    prepare_molecule_smart,
    PreparationResult
)
from backend.batch_engine import (
    parse_batch_input,
    execute_batch_job
)


class TestPureCheminformatics(unittest.TestCase):
    """Tests the zero-DLL pure-Python chemical graph kernel."""

    def test_aspirin_properties(self):
        smiles = "CC(=O)Oc1ccccc1C(=O)O"
        graph, warnings, errors = parse_smiles_pure(smiles)
        self.assertIsNotNone(graph)
        self.assertEqual(len(errors), 0)

        props = calculate_pure_properties(graph)
        self.assertEqual(props["formula"], "C9H8O4")
        self.assertAlmostEqual(props["molecular_weight"], 180.16, places=1)
        self.assertEqual(props["heavy_atom_count"], 13)
        self.assertEqual(props["rotatable_bonds"], 3)

    def test_caffeine_properties(self):
        smiles = "CN1C=NC2=C1C(=O)N(C(=O)N2C)C"
        graph, warnings, errors = parse_smiles_pure(smiles)
        self.assertIsNotNone(graph)
        self.assertEqual(len(errors), 0)

        props = calculate_pure_properties(graph)
        self.assertEqual(props["formula"], "C8H10N4O2")
        self.assertAlmostEqual(props["molecular_weight"], 194.19, places=1)
        self.assertEqual(props["heavy_atom_count"], 14)

    def test_vsepr_3d_conformer_generation(self):
        smiles = "CCO"  # Ethanol
        graph, _, _ = parse_smiles_pure(smiles)
        conformers = generate_vsepr_3d_conformers(graph)
        self.assertIn("atoms", conformers)
        self.assertIn("coordinates", conformers)
        self.assertIn("bonds", conformers)
        self.assertEqual(len(conformers["atoms"]), 3)
        self.assertEqual(len(conformers["coordinates"]), 3)
        # Verify 3D Cartesian format
        for coord in conformers["coordinates"]:
            self.assertEqual(len(coord), 3)

    def test_hypervalent_detection(self):
        # Carbon with 6 bonds: C(=O)(=O)=O
        smiles = "C(=O)(=O)=O"
        graph, warnings, errors = parse_smiles_pure(smiles)
        self.assertTrue(len(errors) > 0 or len(warnings) > 0)
        self.assertTrue(any("valence" in e.lower() for e in errors + warnings))


class TestUniversalValidator(unittest.TestCase):
    """Tests molecular format detection, classification, and compatibility matrix."""

    def test_format_detection(self):
        self.assertEqual(detect_molecular_format("CC(=O)Oc1ccccc1C(=O)O"), "SMILES")
        self.assertEqual(detect_molecular_format("InChI=1S/C2H6O/c1-2-3/h3H,2H2,1H3"), "InChI")
        self.assertEqual(detect_molecular_format("BSYNRYMUTXBXSQ-UHFFFAOYSA-N"), "InChIKey")
        self.assertEqual(detect_molecular_format("Aspirin"), "Chemical Name")

    def test_salt_mixture_detection(self):
        # Sodium acetate
        report = universal_validate_molecule("CC(=O)[O-].[Na+]")
        self.assertTrue(report.is_valid)
        self.assertTrue(report.is_salt_or_mixture)
        self.assertEqual(report.fragment_count, 2)
        self.assertIn("Salt Stripping & Desalting", report.recommended_pipeline)

    def test_metformin_hydrochloride(self):
        report = universal_validate_molecule("CN(C)C(=N)N=C(N)N.Cl")
        self.assertTrue(report.is_valid)
        self.assertTrue(report.is_salt_or_mixture)
        self.assertEqual(report.fragment_count, 2)
        self.assertIn("C4H12ClN5", report.molecular_formula)

    def test_organometallic_detection(self):
        # Cisplatin
        report = universal_validate_molecule("N.N.Cl[Pt]Cl")
        self.assertTrue(report.contains_metals or report.is_organometallic)

    def test_stereocenter_detection(self):
        # L-alanine with tetrahedral chiral center
        report = universal_validate_molecule("C[C@@H](N)C(=O)O")
        self.assertTrue(report.is_valid)
        self.assertEqual(report.detected_format, "SMILES")

    def test_repair_suggestions_for_unclosed_ring(self):
        # Unclosed ring 1
        report = universal_validate_molecule("c1ccccc")
        self.assertFalse(report.is_valid)
        self.assertTrue(any("Unclosed ring" in err for err in report.errors))
        self.assertTrue(len(report.repair_suggestions) > 0)
        self.assertTrue(any("1" in rep.get("suggested_smiles", "") for rep in report.repair_suggestions))

    def test_repair_suggestions_for_unbalanced_parentheses(self):
        report = universal_validate_molecule("CC(=O")
        self.assertFalse(report.is_valid)
        self.assertTrue(len(report.repair_suggestions) > 0)

    def test_compatibility_matrix_contract(self):
        report = universal_validate_molecule("c1ccccc1")
        self.assertTrue(report.is_valid)
        matrix = report.compatibility_matrix
        self.assertIn("cheminformatics_descriptors", matrix)
        self.assertIn("conformer_generation", matrix)
        self.assertIn("deepchem_ml_admet", matrix)
        self.assertIn("molecular_docking", matrix)
        self.assertIn("quantum_dft", matrix)

        for key, info in matrix.items():
            self.assertIn(info["status"], ["compatible", "conditionally_compatible", "unsupported"])
            self.assertIn("details", info)


class TestSmartPreparator(unittest.TestCase):
    """Tests non-destructive smart preparation and desalting."""

    def test_salt_stripping(self):
        prep = prepare_molecule_smart("CC(=O)[O-].[Na+]")
        self.assertTrue(prep.success)
        self.assertTrue(prep.modifications_applied)
        # Active parent isolated should be acetate moiety
        self.assertEqual(prep.prepared_smiles, "CC(=O)[O-]")
        self.assertEqual(len(prep.stripped_salts), 1)
        self.assertEqual(prep.stripped_salts[0], "[Na+]")

        # Provenance history
        self.assertTrue(any("Stripped 1 non-parent salt" in log for log in prep.provenance_log))

    def test_clean_molecule_preservation(self):
        prep = prepare_molecule_smart("c1ccccc1")
        self.assertTrue(prep.success)
        self.assertFalse(prep.modifications_applied)
        self.assertEqual(prep.prepared_smiles, "c1ccccc1")
        self.assertEqual(len(prep.stripped_salts), 0)


class TestBatchEngine(unittest.TestCase):
    """Tests multi-compound parsing, execution, and failure isolation."""

    def test_parse_batch_input_multiline(self):
        batch_text = "Aspirin\nCaffeine\nCC(=O)O"
        items = parse_batch_input(batch_text)
        self.assertEqual(len(items), 3)
        self.assertEqual(items[0], "Aspirin")
        self.assertEqual(items[1], "Caffeine")
        self.assertEqual(items[2], "CC(=O)O")

    def test_parse_batch_input_sdf(self):
        sdf_block = """Mol1
  -OEChem-02102604002D

  3  2  0     0  0  0  0  0  0999 V2000
    1.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.0000    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0
  2  3  1  0
M  END
$$$$
Mol2
  -OEChem-02102604002D

  1  0  0     0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
M  END
$$$$"""
        items = parse_batch_input(sdf_block)
        self.assertEqual(len(items), 2)

    def test_execute_batch_job_with_fault_isolation(self):
        # 1 valid, 1 invalid (hypervalent), 1 valid salt
        compounds = [
            "c1ccccc1",        # Benzene (Valid)
            "C(=O)(=O)=O",     # Hypervalent carbon (Fails or flagged)
            "CC(=O)[O-].[Na+]" # Sodium Acetate (Valid salt)
        ]

        result = execute_batch_job(compounds, template_id="lipinski_screening")
        self.assertIn("batch_id", result)
        self.assertEqual(result["total_compounds"], 3)
        self.assertEqual(len(result["results"]), 3)

        # Compound 1: Benzene should succeed
        c1 = result["results"][0]
        self.assertEqual(c1["status"], "Completed")
        self.assertEqual(c1["properties"]["formula"], "C6H6")

        # Compound 3: Sodium Acetate should complete with preparation applied
        c3 = result["results"][2]
        self.assertEqual(c3["status"], "Completed")
        self.assertTrue(c3["preparation_applied"])

        # Check metrics
        self.assertTrue(result["completed"] >= 2)


if __name__ == "__main__":
    unittest.main()
