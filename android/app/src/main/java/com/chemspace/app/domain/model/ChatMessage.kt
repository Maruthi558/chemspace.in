package com.chemspace.app.domain.model

data class ChatMessage(
    val id: String = java.util.UUID.randomUUID().toString(),
    val sender: MessageSender,
    val text: String,
    val timestamp: Long = System.currentTimeMillis(),
    val citations: List<String> = emptyList(),
    val toolsUsed: List<String> = emptyList(),
    val confidence: Double? = null,
    val isLoading: Boolean = false
)

enum class MessageSender {
    USER,
    CHEMNOVA_AI,
    SYSTEM
}
