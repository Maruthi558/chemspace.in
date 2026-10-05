package com.chemspace.app.domain.model

data class User(
    val uid: String,
    val username: String,
    val name: String,
    val email: String,
    val workplace: String = "ChemSpace Research Institute",
    val role: String = "Lead Research Chemist",
    val avatar: String = "",
    val isGuest: Boolean = false
)
