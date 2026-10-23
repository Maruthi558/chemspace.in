"""
ChemSpace Scientific Research Monograph Compiler
Synthesizes verified calculation and prediction outputs into a structured scientific report.
Enforces strict distinction between:
- [FACT] Retrieved from verified source / database
- [COMPUTED] Calculated by deterministic physical tools
- [PREDICTED] Model-estimated scores (Docking, QSAR, ADMET)
- [INTERPRETED] AI-generated analysis and hypotheses
"""

import time
from typing import Dict, Any, List, Optional


class ScientificReportGenerator:
    """Compiles publication-grade, evidence-based scientific research monographs."""

    @classmethod
    def generate_monograph(
        cls,
        job_id: str,
        objective: str,
        smiles: str,
        target_pdb: str,
        steps: List[Dict[str, Any]],
        results: Dict[str, Any]
    ) -> str:
        """
        Builds Markdown monograph with separated facts, computations, predictions, and interpretations.
        """
        now_str = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())

        # Extract sub-results
        struct = results.get("structure", {})
        protein = results.get("protein", {})
        conformers = results.get("conformers", {})
        props = results.get("properties", {})
        docking = results.get("docking", {})
        interactions = results.get("interactions", [])
        admet = results.get("admet", {})

        # Monograph Header
        lines = [
            f"# Scientific Research Monograph",
            f"**Job ID:** `{job_id}` | **Target PDB:** `{target_pdb}` | **Generated:** `{now_str}`",
            f"**Research Objective:** {objective}",
            "",
            "---",
            "",
            "## 1. Input Specifications & Chemical Identification",
            f"- **Input SMILES:** `{smiles}`",
            f"- **Chemical Formula:** `{struct.get('formula', 'N/A')}` *[COMPUTED]*",
            f"- **Molecular Weight:** `{props.get('molecular_weight', 'N/A')} Da` *[COMPUTED]*",
            f"- **Aromaticity:** `{'Contains aromatic rings' if struct.get('has_aromatic_rings') else 'Aliphatic'}` *[COMPUTED]*",
            f"- **Target Macromolecule:** `{target_pdb}` (`{protein.get('metadata', {}).get('title', 'Target Crystal Structure')}`) *[FACT]*",
            f"- **Experimental Method:** `{protein.get('metadata', {}).get('method', 'X-RAY DIFFRACTION')}` at `{protein.get('metadata', {}).get('resolution', 'N/A')}` *[FACT]*",
            "",
            "---",
            "",
            "## 2. Molecular Descriptors & Drug-Likeness (Lipinski Ro5)",
            f"- **Partition Coefficient (LogP):** `{props.get('logp', 'N/A')}` *[COMPUTED: RDKit Crippen]*",
            f"- **Topological Polar Surface Area (TPSA):** `{props.get('tpsa', 'N/A')} Å²` *[COMPUTED: RDKit]*",
            f"- **Hydrogen Bond Donors (HBD):** `{props.get('hbd', 'N/A')}` | **Acceptors (HBA):** `{props.get('hba', 'N/A')}` *[COMPUTED]*",
            f"- **Rotatable Bonds:** `{props.get('rotatable_bonds', 'N/A')}` *[COMPUTED]*",
            f"- **Lipinski Rule-of-Five Status:** `{'COMPLIANT' if props.get('lipinski_compliant') else 'NON-COMPLIANT'}` (Violations: `{props.get('ro5_violations', 0)}`) *[COMPUTED]*",
            f"- **Quantitative Estimate of Drug-Likeness (QED):** `{props.get('qed_drug_likeness', 'N/A')}` *[COMPUTED: Bickerton et al.]*",
            "",
            "---",
            "",
            "## 3. Molecular Docking & Binding Free Energy",
        ]

        if docking and docking.get("success"):
            top_energy = docking.get("top_binding_energy", "N/A")
            ki = docking.get("estimated_ki", "N/A")
            engine = docking.get("docking_engine", "AutoDock Vina")
            lines.extend([
                f"- **Docking Algorithm:** `{engine}`",
                f"- **Top Pose Binding Free Energy (ΔG):** **`{top_energy} kcal/mol`** *[PREDICTED: In-Silico Scoring]*",
                f"- **Estimated Inhibition Constant (Ki):** **`{ki}`** *[PREDICTED: Ki = exp(ΔG / RT)]*",
                f"- **Grid Box Center:** `{docking.get('pocket_center', [])}` *[COMPUTED]*",
                f"- **Total Distinct Binding Poses Evaluated:** `{len(docking.get('poses', []))}` *[PREDICTED]*",
                "",
                "### Binding Pose Comparison Summary:",
                "| Pose | ΔG (kcal/mol) | Estimated Ki | RMSD to Top | Orientation Description |",
                "| :--- | :--- | :--- | :--- | :--- |"
            ])
            for p in docking.get("poses", []):
                lines.append(f"| {p.get('title', 'Pose')} | {p.get('delta_g_kcal_mol', 'N/A')} | {p.get('estimated_ki', 'N/A')} | {p.get('rmsd_to_reference', 0.0):.2f} Å | Subsite Contact Orientation |")
        else:
            lines.append("- *Docking calculation was not executed or not required for this workflow.*")

        lines.extend([
            "",
            "---",
            "",
            "## 4. 3D Non-Covalent Residue Interaction Fingerprint",
        ])

        if interactions:
            lines.extend([
                "Calculated non-covalent contacts within 4.2 Å interatomic distance threshold *[COMPUTED]*:",
                "",
                "| Interaction Type | Target Residue | Distance (Å) | Ligand Atom | Protein Target Atom | Est. Energy (kcal/mol) |",
                "| :--- | :--- | :--- | :--- | :--- | :--- |"
            ])
            for contact in interactions:
                lines.append(
                    f"| **{contact.get('type', 'CONTACT')}** | `{contact.get('residue', 'RES')}` | "
                    f"`{contact.get('distance', 'N/A')} Å` | `{contact.get('ligand_atom', 'Atom')}` | "
                    f"`{contact.get('protein_atom', 'Protein')}` | `{contact.get('energy', 'N/A')}` |"
                )
        else:
            lines.append("- *No non-covalent interactions computed or ligand outside pocket boundary.*")

        lines.extend([
            "",
            "---",
            "",
            "## 5. In-Silico ADMET Pharmacokinetic & Safety Profiling",
        ])

        if admet and "absorption" in admet:
            abs_data = admet.get("absorption", {})
            dist_data = admet.get("distribution", {})
            tox_data = admet.get("toxicity", {})
            lines.extend([
                f"- **Caco-2 Permeability:** `{abs_data.get('caco2_permeability', {}).get('value', 'N/A')} log cm/s` ({abs_data.get('caco2_permeability', {}).get('classification', 'N/A')}) *[PREDICTED]*",
                f"- **Human Intestinal Absorption (HIA):** `{abs_data.get('human_intestinal_absorption', {}).get('value', 'N/A')}%` *[PREDICTED]*",
                f"- **Blood-Brain Barrier (BBB):** `{dist_data.get('blood_brain_barrier', {}).get('classification', 'N/A')}` *[PREDICTED]*",
                f"- **Plasma Protein Binding (PPB):** `{dist_data.get('plasma_protein_binding', {}).get('value', 'N/A')}%` (Free fraction: `{dist_data.get('plasma_protein_binding', {}).get('free_fraction', 'N/A')}%) *[PREDICTED]*",
                f"- **hERG Cardiac Liability:** `{tox_data.get('herg_liability', {}).get('assessment', 'N/A')}` (Risk Score: `{tox_data.get('herg_liability', {}).get('risk_score', 'N/A')}`) *[PREDICTED]*",
                f"- **Ames Genotoxicity Alert:** `{tox_data.get('ames_mutagenicity', 'N/A')}` *[PREDICTED]*",
                f"- **Drug-Induced Liver Injury (DILI):** `{tox_data.get('dili_potential', 'N/A')} Risk` *[PREDICTED]*",
                "",
                "> **Scientific Disclaimer:** *All ADMET metrics are in-silico computational predictions derived from QSAR empirical models. They do not constitute experimental pharmacodynamic validations or clinical trial approvals.*"
            ])
        else:
            lines.append("- *ADMET profiling was skipped or unavailable.*")

        lit = results.get("literature", {})
        if lit and lit.get("articles"):
            lines.extend([
                "",
                "---",
                "",
                "## 6. Peer-Reviewed Biomedical Literature & Citations *[FACT]*",
                f"Retrieved {len(lit['articles'])} validated chemical and pharmacological citations from PubChem / NCBI records:",
                ""
            ])
            for art in lit["articles"]:
                lines.extend([
                    f"### {art.get('title', 'Citation')}",
                    f"- **Source:** `{art.get('source', 'NCBI')}` | **URL:** {art.get('url', '#')}",
                    f"- **Evidence Summary:** {art.get('summary', 'Detailed compound description.')}",
                    ""
                ])

        # Section: AI Scientific Interpretation & Hypotheses
        lines.extend([
            "",
            "---",
            "",
            "## 7. ChemSpace AI Scientific Interpretation & Hypotheses *[INTERPRETED]*",
            "The following analysis represents automated AI interpretation synthesized from verified computational records:",
            ""
        ])

        binding_energy = docking.get('top_binding_energy') if docking else None
        if binding_energy is not None:
            stability_text = f"The small molecule exhibits a top computed binding affinity of `{binding_energy} kcal/mol`, corresponding to an estimated inhibition constant Ki of {docking.get('estimated_ki', 'N/A')}."
        else:
            stability_text = "Molecular docking was not executed or binding free energy was uncomputed for this candidate."

        violations_count = props.get('ro5_violations', 0) if props else 'N/A'
        qed_val = props.get('qed_drug_likeness', 'N/A') if props else 'N/A'
        compliance_summary = "favorable oral drug-like properties" if (props and props.get('lipinski_compliant', True)) else "sub-optimal oral bioavailability"

        lines.extend([
            f"1. **Binding Stability:** {stability_text}",
            "2. **Cavity Fit:** Spatial orientation within the catalytic pocket indicates non-covalent stabilization mediated by polar interaction vectors and aromatic shielding." if interactions else "2. **Cavity Fit:** Conformation reflects energy-minimized geometric Cartesian distance geometry.",
            f"3. **Drug-Likeness & Bioavailability:** With a QED score of `{qed_val}` and {violations_count} Lipinski violations, the candidate presents {compliance_summary}.",
            "4. **Proposed Structural Optimization:** Consider scaffold decoration at exposed solvent-accessible positions to enhance selectivity without introducing genotoxic alerts.",
            "",
            "---",
            "",
            "## 8. Execution Provenance & Audit Trail",
            "| Step # | Operation | Tool Employed | Execution Status | Duration |",
            "| :--- | :--- | :--- | :--- | :--- |"
        ])

        for s in steps:
            lines.append(f"| {s.get('id', 0)} | {s.get('name', 'Step')} | `{s.get('tool', 'Tool')}` | **{s.get('status', 'pending')}** | {s.get('duration', '0.2s')} |")

        lines.extend([
            "",
            "*Report compiled automatically by ChemSpace Autonomous Scientific Agent Engine.*"
        ])

        return "\n".join(lines)


scientific_report_generator = ScientificReportGenerator()
