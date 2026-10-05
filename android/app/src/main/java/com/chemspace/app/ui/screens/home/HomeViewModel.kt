package com.chemspace.app.ui.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chemspace.app.data.api.UserDto
import com.chemspace.app.data.local.PreferencesDataStore
import com.chemspace.app.data.repository.AuthRepository
import com.chemspace.app.domain.model.Molecule
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class HomeUiState(
    val selectedMolecule: Molecule? = null,
    val isServerOnline: Boolean = true,
    val isLoggingOut: Boolean = false
)

class HomeViewModel(
    private val authRepository: AuthRepository,
    private val preferencesDataStore: PreferencesDataStore
) : ViewModel() {

    val currentUser: StateFlow<UserDto?> = preferencesDataStore.currentUserFlow.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = null
    )

    val isDarkTheme: StateFlow<Boolean> = preferencesDataStore.isDarkThemeFlow.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = true
    )

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    val curatedSpecimens: List<Molecule> = listOf(
        Molecule("Aspirin", "C9H8O4", 180.16, "CC(=O)Oc1ccccc1C(=O)O", "2-acetyloxybenzoic acid", true, 1.24, 63.6, 1, 4),
        Molecule("Caffeine", "C8H10N4O2", 194.19, "Cn1cnc2c1c(=O)n(c(=O)n2C)C", "1,3,7-trimethylpurine-2,6-dione", true, -0.07, 61.8, 0, 6),
        Molecule("Paracetamol", "C8H9NO2", 151.16, "CC(=O)Nc1ccc(O)cc1", "N-(4-hydroxyphenyl)acetamide", true, 0.46, 49.3, 2, 2),
        Molecule("Benzene", "C6H6", 78.11, "c1ccccc1", "benzene", true, 2.13, 0.0, 0, 0),
        Molecule("Ibuprofen", "C13H18O2", 206.28, "CC(C)Cc1ccc(cc1)C(C)C(=O)O", "2-[4-(2-methylpropyl)phenyl]propanoic acid", true, 3.50, 37.3, 1, 2)
    )

    init {
        checkServer()
    }

    private fun checkServer() {
        viewModelScope.launch {
            val online = authRepository.checkServerOnline()
            _uiState.value = _uiState.value.copy(isServerOnline = online)
        }
    }

    fun selectMolecule(molecule: Molecule?) {
        _uiState.value = _uiState.value.copy(selectedMolecule = molecule)
    }

    fun toggleTheme() {
        viewModelScope.launch {
            val current = isDarkTheme.value
            preferencesDataStore.setDarkTheme(!current)
        }
    }

    fun logout(onComplete: () -> Unit) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoggingOut = true)
            authRepository.logout()
            onComplete()
        }
    }
}
