package com.chemspace.app.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chemspace.app.data.api.ApiClient
import com.chemspace.app.data.repository.AuthRepository
import com.chemspace.app.data.repository.ChemistryRepository
import com.chemspace.app.domain.model.ChemistryTool
import com.chemspace.app.domain.model.Molecule
import com.chemspace.app.domain.model.User
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class HomeUiState(
    val isServerOnline: Boolean = true,
    val serverLatencyMs: Long = 42,
    val selectedSpecimen: Molecule? = null
)

class HomeViewModel(
    private val authRepository: AuthRepository,
    private val chemistryRepository: ChemistryRepository
) : ViewModel() {

    val currentUser: StateFlow<User?> = authRepository.currentUser
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val tools: List<ChemistryTool> = ChemistryTool.ALL_TOOLS

    val curatedSpecimens: List<Molecule> = chemistryRepository.getCuratedMolecules()

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        checkServerHealth()
    }

    private fun checkServerHealth() {
        viewModelScope.launch {
            try {
                val t0 = System.currentTimeMillis()
                val response = ApiClient.apiService.checkHealth()
                val latency = System.currentTimeMillis() - t0
                _uiState.value = _uiState.value.copy(
                    isServerOnline = response.isSuccessful,
                    serverLatencyMs = latency
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isServerOnline = false,
                    serverLatencyMs = 0
                )
            }
        }
    }

    fun selectSpecimen(molecule: Molecule) {
        _uiState.value = _uiState.value.copy(selectedSpecimen = molecule)
    }

    fun dismissSpecimen() {
        _uiState.value = _uiState.value.copy(selectedSpecimen = null)
    }

    fun logout(onLoggedOut: () -> Unit) {
        viewModelScope.launch {
            authRepository.logout()
            onLoggedOut()
        }
    }
}
