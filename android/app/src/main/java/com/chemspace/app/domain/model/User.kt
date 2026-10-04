package com.chemspace.app.domain.model

data class User(
    val uid: String,
    val username: String,
    val email: String,
    val token: String? = null,
    val isAuthenticated: Boolean = false
)
