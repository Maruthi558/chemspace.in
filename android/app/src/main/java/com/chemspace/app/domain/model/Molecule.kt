package com.chemspace.app.domain.model

data class Molecule(
    val name: String,
    val formula: String,
    val mw: Double,
    val smiles: String,
    val iupac: String,
    val ro5: Boolean = true,
    val logP: Double? = null,
    val tpsa: Double? = null,
    val hbd: Int? = null,
    val hba: Int? = null
)
