package com.chemspace.app.ui.screens.features

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chemspace.app.data.repository.AiAssistantRepository
import com.chemspace.app.domain.model.ChatMessage
import com.chemspace.app.domain.model.MessageSender
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AiBotUiState(
    val messages: List<ChatMessage> = emptyList(),
    val inputQuery: String = "",
    val isLoading: Boolean = false,
    val conversationId: String = "conv_${System.currentTimeMillis()}"
)

class AiBotViewModel(
    private val repository: AiAssistantRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(
        AiBotUiState(
            messages = listOf(
                ChatMessage(
                    sender = MessageSender.ASSISTANT,
                    content = "Hello! I am **ChemNova**, your self-hosted chemistry intelligence engine. I can solve reaction mechanisms, compute quantum molecular properties, analyze spectroscopy (FT-IR, NMR, MS), and synthesize pathways. What chemical inquiry can I assist with?"
                )
            )
        )
    )
    val uiState: StateFlow<AiBotUiState> = _uiState.asStateFlow()

    val suggestedPrompts = listOf(
        "Explain aspirin synthesis mechanism",
        "Compare DFT functionals B3LYP vs PBE",
        "What are the 1H-NMR peaks of paracetamol?",
        "Explain the Sₙ2 Walden inversion"
    )

    fun onQueryChange(q: String) {
        _uiState.value = _uiState.value.copy(inputQuery = q)
    }

    fun sendMessage(queryText: String? = null) {
        val text = (queryText ?: _uiState.value.inputQuery).trim()
        if (text.isBlank()) return

        val userMsg = ChatMessage(sender = MessageSender.USER, content = text)
        val updatedList = _uiState.value.messages + userMsg

        _uiState.value = _uiState.value.copy(
            messages = updatedList,
            inputQuery = "",
            isLoading = true
        )

        viewModelScope.launch {
            val result = repository.queryChemNova(text, _uiState.value.conversationId)
            result.onSuccess { res ->
                val assistantMsg = ChatMessage(
                    sender = MessageSender.ASSISTANT,
                    content = res.response ?: res.responseText ?: "Analysis completed.",
                    intent = res.intent,
                    confidence = res.confidence,
                    toolUsed = res.toolUsed,
                    tools = res.tools ?: emptyList(),
                    citations = res.citations ?: emptyList()
                )
                _uiState.value = _uiState.value.copy(
                    messages = _uiState.value.messages + assistantMsg,
                    isLoading = false
                )
            }.onFailure { err ->
                val errorMsg = ChatMessage(
                    sender = MessageSender.ASSISTANT,
                    content = "Notice: ${err.message ?: "Could not complete query. Please retry."}",
                    isError = true
                )
                _uiState.value = _uiState.value.copy(
                    messages = _uiState.value.messages + errorMsg,
                    isLoading = false
                )
            }
        }
    }

    fun clearChat() {
        _uiState.value = _uiState.value.copy(
            messages = listOf(
                ChatMessage(
                    sender = MessageSender.ASSISTANT,
                    content = "Chat session cleared. How can ChemNova assist your laboratory research?"
                )
            )
        )
    }
}
