package com.chemspace.app.ui.screens.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chemspace.app.BuildConfig
import com.chemspace.app.data.local.PreferencesDataStore
import com.chemspace.app.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class SettingsUiState(
    val customUrlInput: String = "",
    val isTestingConnection: Boolean = false,
    val connectionStatus: String? = null,
    val isConnected: Boolean = true
)

class SettingsViewModel(
    private val preferencesDataStore: PreferencesDataStore,
    private val authRepository: AuthRepository
) : ViewModel() {

    val isDarkTheme: StateFlow<Boolean> = preferencesDataStore.isDarkThemeFlow.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = true
    )

    val currentBaseUrl: StateFlow<String> = preferencesDataStore.baseUrlFlow.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = BuildConfig.DEFAULT_BASE_URL
    )

    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    init {
        testServer()
    }

    fun onCustomUrlChange(v: String) { _uiState.value = _uiState.value.copy(customUrlInput = v) }

    fun toggleTheme() {
        viewModelScope.launch {
            val curr = isDarkTheme.value
            preferencesDataStore.setDarkTheme(!curr)
        }
    }

    fun selectPresetUrl(url: String) {
        viewModelScope.launch {
            preferencesDataStore.setBaseUrl(url)
            testServer()
        }
    }

    fun applyCustomUrl() {
        val url = _uiState.value.customUrlInput.trim()
        if (url.isBlank()) return
        viewModelScope.launch {
            preferencesDataStore.setBaseUrl(url)
            testServer()
        }
    }

    fun testServer() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isTestingConnection = true, connectionStatus = "Testing...")
            val online = authRepository.checkServerOnline()
            _uiState.value = _uiState.value.copy(
                isTestingConnection = false,
                isConnected = online,
                connectionStatus = if (online) "Online (REST API Active)" else "Offline / Standalone Fallback"
            )
        }
    }
}
