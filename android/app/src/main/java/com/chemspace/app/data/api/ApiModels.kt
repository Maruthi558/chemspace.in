package com.chemspace.app.data.api

import com.google.gson.annotations.SerializedName

// Authentication
data class LoginRequest(
    @SerializedName("identifier") val identifier: String,
    @SerializedName("password") val password: String
)

data class RegisterRequest(
    @SerializedName("username") val username: String,
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

data class UserDto(
    @SerializedName("id") val id: String? = null,
    @SerializedName("username") val username: String? = null,
    @SerializedName("email") val email: String? = null
)

data class AuthResponse(
    @SerializedName("status") val status: String? = null,
    @SerializedName("message") val message: String? = null,
    @SerializedName("detail") val detail: String? = null,
    @SerializedName("token") val token: String? = null,
    @SerializedName("user") val user: UserDto? = null
)

// AI Chat
data class AIChatRequest(
    @SerializedName("query") val query: String,
    @SerializedName("conversation_id") val conversationId: String? = null
)

data class AIChatResponse(
    @SerializedName("status") val status: String? = null,
    @SerializedName("response") val response: String? = null,
    @SerializedName("responseText") val responseText: String? = null,
    @SerializedName("provider") val provider: String? = null,
    @SerializedName("intent") val intent: String? = null,
    @SerializedName("confidence") val confidence: Double? = null,
    @SerializedName("tool_used") val toolUsed: Boolean = false,
    @SerializedName("tools") val tools: List<Map<String, Any>>? = null,
    @SerializedName("citations") val citations: List<String>? = null,
    @SerializedName("warnings") val warnings: List<String>? = null
)

// Molecule Resolution
data class MoleculeResolveRequest(
    @SerializedName("query") val query: String
)

data class MoleculeResolveResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("name") val name: String? = null,
    @SerializedName("iupac") val iupac: String? = null,
    @SerializedName("formula") val formula: String? = null,
    @SerializedName("mw") val mw: Double? = null,
    @SerializedName("smiles") val smiles: String? = null,
    @SerializedName("svg_2d") val svg2D: String? = null,
    @SerializedName("source") val source: String? = null,
    @SerializedName("error") val error: String? = null
)

// Server Health
data class HealthResponse(
    @SerializedName("status") val status: String? = null,
    @SerializedName("version") val version: String? = null,
    @SerializedName("engine") val engine: String? = null
)
