package com.chemspace.app.domain.model

data class Molecule(
    val id: String = "",
    val name: String,
    val formula: String,
    val smiles: String,
    val molecularWeight: Double,
    val iupacName: String? = null,
    val logP: Double? = null,
    val tpsa: Double? = null,
    val hbd: Int? = null,
    val hba: Int? = null,
    val rotatableBonds: Int? = null,
    val rings: Int? = null,
    val description: String? = null,
    val svg2D: String? = null,
    val source: String? = null
)
