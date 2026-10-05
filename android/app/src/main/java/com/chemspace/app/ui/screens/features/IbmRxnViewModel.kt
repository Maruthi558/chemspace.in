package com.chemspace.app.ui.screens.features

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chemspace.app.data.api.ReactionPredictResponse
import com.chemspace.app.data.api.RetrosynthesisResponse
import com.chemspace.app.data.repository.ReactionRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class IbmRxnUiState(
    val activeTab: String = "FORWARD", // "FORWARD", "RETRO"
    val reactantsInput: String = "c1ccccc1O.CC(=O)OC(=O)C", // Salicylic acid / Phenol + Anhydride
    val reagentsInput: String = "H2SO4 (Catalyst)",
    val targetInput: String = "CC(=O)Oc1ccccc1C(=O)O", // Aspirin
    val forwardResult: ReactionPredictResponse? = null,
    val retroResult: RetrosynthesisResponse? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

class IbmRxnViewModel(
    private val repository: ReactionRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(IbmRxnUiState())
    val uiState: StateFlow<IbmRxnUiState> = _uiState.asStateFlow()

    init {
        predictForward()
    }

    fun setActiveTab(t: String) { _uiState.value = _uiState.value.copy(activeTab = t) }
    fun onReactantsChange(v: String) { _uiState.value = _uiState.value.copy(reactantsInput = v) }
    fun onReagentsChange(v: String) { _uiState.value = _uiState.value.copy(reagentsInput = v) }
    fun onTargetChange(v: String) { _uiState.value = _uiState.value.copy(targetInput = v) }

    fun predictForward() {
        val reactants = _uiState.value.reactantsInput.trim()
        if (reactants.isBlank()) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val res = repository.predictReaction(reactants, _uiState.value.reagentsInput)
            res.onSuccess { fRes ->
                _uiState.value = _uiState.value.copy(isLoading = false, forwardResult = fRes)
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(isLoading = false, error = err.message ?: "Reaction prediction failed.")
            }
        }
    }

    fun predictRetro() {
        val target = _uiState.value.targetInput.trim()
        if (target.isBlank()) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val res = repository.predictRetrosynthesis(target)
            res.onSuccess { rRes ->
                _uiState.value = _uiState.value.copy(isLoading = false, retroResult = rRes)
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(isLoading = false, error = err.message ?: "Retrosynthesis planning failed.")
            }
        }
    }
}
