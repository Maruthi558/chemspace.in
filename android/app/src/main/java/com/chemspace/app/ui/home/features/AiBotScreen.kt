package com.chemspace.app.ui.home.features

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chemspace.app.data.repository.AiAssistantRepository
import com.chemspace.app.domain.model.ChatMessage
import com.chemspace.app.ui.components.ChemSpaceLogoMark
import com.chemspace.app.ui.components.ChemSpaceTopBar
import com.chemspace.app.ui.theme.ChemSpaceBackgroundDark
import com.chemspace.app.ui.theme.ChemSpaceBorderDark
import com.chemspace.app.ui.theme.ChemSpaceCardDark
import com.chemspace.app.ui.theme.ChemSpaceEmeraldAccent
import com.chemspace.app.ui.theme.ChemSpaceOrangePrimary
import com.chemspace.app.ui.theme.ChemSpaceSurfaceDark
import com.chemspace.app.ui.theme.ChemSpaceSurfaceElevatedDark
import com.chemspace.app.ui.theme.ChemSpaceTextPrimaryDark
import com.chemspace.app.ui.theme.ChemSpaceTextSecondaryDark
import kotlinx.coroutines.launch

@Composable
fun AiBotScreen(
    repository: AiAssistantRepository,
    onNavigateBack: () -> Unit
) {
    val messages by repository.messages.collectAsState()
    var inputQuery by remember { mutableStateOf("") }
    var isSending by remember { mutableStateOf(false) }
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()

    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    Scaffold(
        topBar = {
            ChemSpaceTopBar(
                title = "AI Bot • ChemNova",
                showBackButton = true,
                onBackClick = onNavigateBack,
                actions = {
                    IconButton(onClick = { repository.clearChat() }) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = "Clear Chat",
                            tint = ChemSpaceTextSecondaryDark
                        )
                    }
                }
            )
        },
        containerColor = ChemSpaceBackgroundDark
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .imePadding()
        ) {
            // Chat history
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                items(messages, key = { it.id }) { message ->
                    ChatMessageBubble(message = message)
                }
            }

            // Input Bar
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(ChemSpaceSurfaceDark)
                    .border(1.dp, ChemSpaceBorderDark)
                    .padding(horizontal = 14.dp, vertical = 10.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    BasicTextField(
                        value = inputQuery,
                        onValueChange = { inputQuery = it },
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(20.dp))
                            .background(ChemSpaceCardDark)
                            .border(1.dp, ChemSpaceBorderDark, RoundedCornerShape(20.dp))
                            .padding(horizontal = 16.dp, vertical = 10.dp),
                        textStyle = TextStyle(
                            color = ChemSpaceTextPrimaryDark,
                            fontSize = 14.sp
                        ),
                        cursorBrush = SolidColor(ChemSpaceOrangePrimary),
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                        keyboardActions = KeyboardActions(
                            onSend = {
                                if (inputQuery.isNotBlank() && !isSending) {
                                    val q = inputQuery
                                    inputQuery = ""
                                    isSending = true
                                    scope.launch {
                                        repository.sendMessage(q)
                                        isSending = false
                                    }
                                }
                            }
                        ),
                        decorationBox = { innerTextField ->
                            if (inputQuery.isEmpty()) {
                                Text(
                                    text = "Ask about molecules, spectra, mechanisms...",
                                    color = ChemSpaceTextSecondaryDark.copy(alpha = 0.6f),
                                    fontSize = 14.sp
                                )
                            }
                            innerTextField()
                        }
                    )

                    Spacer(modifier = Modifier.width(10.dp))

                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .clip(CircleShape)
                            .background(if (inputQuery.isNotBlank() && !isSending) ChemSpaceOrangePrimary else ChemSpaceSurfaceElevatedDark),
                        contentAlignment = Alignment.Center
                    ) {
                        if (isSending) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                color = Color.White,
                                strokeWidth = 2.dp
                            )
                        } else {
                            IconButton(
                                onClick = {
                                    if (inputQuery.isNotBlank()) {
                                        val q = inputQuery
                                        inputQuery = ""
                                        isSending = true
                                        scope.launch {
                                            repository.sendMessage(q)
                                            isSending = false
                                        }
                                    }
                                },
                                enabled = inputQuery.isNotBlank()
                            ) {
                                Icon(
                                    imageVector = Icons.AutoMirrored.Filled.Send,
                                    contentDescription = "Send",
                                    tint = if (inputQuery.isNotBlank()) Color.White else ChemSpaceTextSecondaryDark,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ChatMessageBubble(message: ChatMessage) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (message.isUser) Arrangement.End else Arrangement.Start
    ) {
        if (!message.isUser) {
            ChemSpaceLogoMark(size = 28.dp, animated = false)
            Spacer(modifier = Modifier.width(8.dp))
        }

        Box(
            modifier = Modifier
                .fillMaxWidth(0.85f)
                .clip(
                    RoundedCornerShape(
                        topStart = 14.dp,
                        topEnd = 14.dp,
                        bottomStart = if (message.isUser) 14.dp else 2.dp,
                        bottomEnd = if (message.isUser) 2.dp else 14.dp
                    )
                )
                .background(
                    if (message.isUser) ChemSpaceSurfaceElevatedDark
                    else ChemSpaceCardDark
                )
                .border(
                    width = 1.dp,
                    color = if (message.isUser) ChemSpaceBorderDark else ChemSpaceEmeraldAccent.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(
                        topStart = 14.dp,
                        topEnd = 14.dp,
                        bottomStart = if (message.isUser) 14.dp else 2.dp,
                        bottomEnd = if (message.isUser) 2.dp else 14.dp
                    )
                )
                .padding(14.dp)
        ) {
            Column {
                if (!message.isUser) {
                    Text(
                        text = "ChemNova Intelligence",
                        color = ChemSpaceEmeraldAccent,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(bottom = 4.dp)
                    )
                }

                Text(
                    text = message.text,
                    color = ChemSpaceTextPrimaryDark,
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                )
            }
        }
    }
}
