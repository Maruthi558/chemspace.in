package com.chemspace.app.domain.model

data class ChemistryTool(
    val id: String,
    val title: String,
    val subtitle: String,
    val badge: String,
    val formulaTag: String,
    val description: String,
    val route: String,
    val isAvailable: Boolean = true
) {
    companion object {
        val ALL_TOOLS = listOf(
            ChemistryTool(
                id = "ai_bot",
                title = "AI Bot",
                subtitle = "ChemNova Intelligence",
                badge = "AI",
                formulaTag = "LLM + RAG",
                description = "Self-hosted chemistry-first AI engine with real-time scientific web research and tool routing.",
                route = "ai_bot"
            ),
            ChemistryTool(
                id = "chemdraw",
                title = "ChemDraw 2D/3D",
                subtitle = "Molecular Canvas Studio",
                badge = "CAD",
                formulaTag = "CH₃-COOH",
                description = "Interactive 2D structural drafting with Kekulé bond angles and real-time 3D conformer generation.",
                route = "chemdraw"
            ),
            ChemistryTool(
                id = "rdkit",
                title = "RDKit Lab",
                subtitle = "Python Cheminformatics",
                badge = "Python",
                formulaTag = "C₉H₈O₄",
                description = "Physicochemical descriptor computation, Lipinski Rule of 5 evaluation, and Morgan fingerprints.",
                route = "rdkit"
            ),
            ChemistryTool(
                id = "spectroscopy",
                title = "Spectroscopy",
                subtitle = "Analytical Peak Engine",
                badge = "Spectra",
                formulaTag = "FTIR • NMR",
                description = "Diagnostic infrared absorption bands, ¹H/¹³C NMR chemical shifts, and mass spectrometry m/z predictions.",
                route = "spectroscopy"
            ),
            ChemistryTool(
                id = "quantum",
                title = "Quantum DFT",
                subtitle = "Electronic Structure",
                badge = "DFT",
                formulaTag = "ΔE (HOMO-LUMO)",
                description = "B3LYP density functional theory calculations, orbital wavefunction contours, and dipole moments.",
                route = "quantum"
            ),
            ChemistryTool(
                id = "ibm_rxn",
                title = "IBM RXN",
                subtitle = "Reaction Synthesis",
                badge = "Synth",
                formulaTag = "R-COOH + R'-OH",
                description = "Forward reaction prediction, retrosynthetic disconnection pathways, and precursor tree planning.",
                route = "ibm_rxn"
            ),
            ChemistryTool(
                id = "periodic_table",
                title = "Periodic Table",
                subtitle = "118 Elements Matrix",
                badge = "118 El",
                formulaTag = "H¹ → Og¹¹⁸",
                description = "Electronegativity gradients, electron configurations, ionization energies, and oxidation states.",
                route = "periodic_table"
            ),
            ChemistryTool(
                id = "chemistry_search",
                title = "Chemistry Search",
                subtitle = "PubChem & CIR Resolver",
                badge = "Search",
                formulaTag = "Name → SMILES",
                description = "Instant resolution of IUPAC names, trade names, CAS numbers, and canonical SMILES strings.",
                route = "chemistry_search"
            )
        )
    }
}
