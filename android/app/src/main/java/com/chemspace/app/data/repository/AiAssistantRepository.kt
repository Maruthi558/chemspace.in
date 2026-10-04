package com.chemspace.app.data.repository

import com.chemspace.app.data.api.AIChatRequest
import com.chemspace.app.data.api.ApiClient
import com.chemspace.app.data.api.ChemSpaceApiService
import com.chemspace.app.domain.model.ChatMessage
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

class AiAssistantRepository(
    private val apiService: ChemSpaceApiService = ApiClient.apiService
) {

    private val _messages = MutableStateFlow<List<ChatMessage>>(
        listOf(
            ChatMessage(
                id = "welcome",
                text = "Hello! I am ChemSpace AI Assistant. Ask me anything about chemical structures, reaction mechanisms, spectroscopy peaks, or computational chemistry workflows.",
                isUser = false,
                timestamp = System.currentTimeMillis()
            )
        )
    )
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    private val conversationId = UUID.randomUUID().toString()

    suspend fun sendMessage(query: String): Result<ChatMessage> {
        val trimmed = query.trim()
        if (trimmed.isEmpty()) {
            return Result.failure(IllegalArgumentException("Message cannot be empty."))
        }

        // Append user message immediately
        val userMsg = ChatMessage(
            id = UUID.randomUUID().toString(),
            text = trimmed,
            isUser = true,
            timestamp = System.currentTimeMillis()
        )
        _messages.value = _messages.value + userMsg

        return try {
            val response = apiService.sendChatMessage(
                AIChatRequest(query = trimmed, conversationId = conversationId)
            )

            val replyText = if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                body.responseText ?: body.response ?: "I processed your request, but received an empty response."
            } else {
                generateOfflineResponse(trimmed)
            }

            val botMsg = ChatMessage(
                id = UUID.randomUUID().toString(),
                text = replyText,
                isUser = false,
                timestamp = System.currentTimeMillis()
            )
            _messages.value = _messages.value + botMsg
            Result.success(botMsg)
        } catch (e: Exception) {
            // Offline fallback response
            val botMsg = ChatMessage(
                id = UUID.randomUUID().toString(),
                text = generateOfflineResponse(trimmed),
                isUser = false,
                timestamp = System.currentTimeMillis()
            )
            _messages.value = _messages.value + botMsg
            Result.success(botMsg)
        }
    }

    private fun generateOfflineResponse(query: String): String {
        val lower = query.lowercase()
        return when {
            "aspirin" in lower -> "Aspirin (acetylsalicylic acid, C9H8O4, MW: 180.16 g/mol) is synthesized via acetylation of salicylic acid with acetic anhydride under acid catalysis. Its canonical SMILES is CC(=O)Oc1ccccc1C(=O)O."
            "water" in lower -> "Water (H2O, MW: 18.015 g/mol) features a bent molecular geometry (~104.5° H-O-H angle) with high electric dipole moment (1.85 D) and extensive hydrogen bonding network."
            "caffeine" in lower -> "Caffeine (C8H10N4O2, MW: 194.19 g/mol) is a purine alkaloid consisting of a fused pyrimidinedione and imidazole ring system with three methyl substituents."
            "benzene" in lower -> "Benzene (C6H6, MW: 78.11 g/mol) has a planar hexagonal D6h symmetry with six delocalized pi-electrons obeying Hückel's 4n+2 rule (n=1)."
            "nmr" in lower || "spectroscopy" in lower -> "In NMR spectroscopy, chemical shift (δ in ppm) reflects local electron shielding. Aromatic protons generally resonate between 6.5–8.5 ppm, aldehydes at 9–10 ppm, and aliphatic protons at 0.8–2.0 ppm."
            "dft" in lower || "quantum" in lower -> "Density Functional Theory (DFT) with hybrid functionals like B3LYP and basis sets such as 6-31G(d) enables accurate prediction of equilibrium geometry, HOMO-LUMO energy gaps, and infrared vibrational frequencies."
            else -> "ChemSpace AI Assistant analyzed '$query'. In full connectivity mode, this query is routed through our scientific RAG engine and chemical verification pipelines."
        }
    }

    fun clearChat() {
        _messages.value = listOf(
            ChatMessage(
                id = "welcome_reset",
                text = "Conversation reset. How can I assist your chemical research today?",
                isUser = false,
                timestamp = System.currentTimeMillis()
            )
        )
    }
}
