package com.chemspace.app.domain.model

data class ChatMessage(
    val id: String = java.util.UUID.randomUUID().toString(),
    val sender: MessageSender,
    val content: String,
    val timestamp: String = java.text.SimpleDateFormat("HH:mm", java.util.Locale.getDefault()).format(java.util.Date()),
    val intent: String? = null,
    val confidence: Double? = null,
    val toolUsed: Boolean = false,
    val tools: List<String> = emptyList(),
    val citations: List<String> = emptyList(),
    val isError: Boolean = false
)

enum class MessageSender {
    USER,
    ASSISTANT
}
