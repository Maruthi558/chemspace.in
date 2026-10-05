package com.chemspace.app.domain.model

data class PeriodicElement(
    val z: Int,
    val symbol: String,
    val name: String,
    val mass: Double,
    val category: String,
    val colorHex: String,
    val period: Int = 1,
    val group: Int = 1,
    val electronConfig: String = "",
    val electronegativity: Double? = null,
    val summary: String = ""
)
