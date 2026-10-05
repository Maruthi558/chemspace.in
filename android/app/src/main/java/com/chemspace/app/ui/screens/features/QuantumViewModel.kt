package com.chemspace.app.ui.screens.features

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chemspace.app.data.api.QuantumCalcResponse
import com.chemspace.app.data.repository.QuantumRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class QuantumUiState(
    val smilesInput: String = "c1ccccc1",
    val method: String = "DFT (B3LYP)",
    val basisSet: String = "6-31G(d)",
    val solventModel: String = "Gas Phase",
    val result: QuantumCalcResponse? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

class QuantumViewModel(
    private val repository: QuantumRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(QuantumUiState())
    val uiState: StateFlow<QuantumUiState> = _uiState.asStateFlow()

    init {
        runCalculation()
    }

    fun onSmilesChange(v: String) { _uiState.value = _uiState.value.copy(smilesInput = v) }
    fun setMethod(m: String) { _uiState.value = _uiState.value.copy(method = m) }
    fun setBasisSet(b: String) { _uiState.value = _uiState.value.copy(basisSet = b) }

    fun runCalculation() {
        val smiles = _uiState.value.smilesInput.trim()
        if (smiles.isBlank()) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val res = repository.calculateQuantum(
                smiles = smiles,
                method = _uiState.value.method,
                basisSet = _uiState.value.basisSet,
                solventModel = _uiState.value.solventModel
            )
            res.onSuccess { qRes ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    result = qRes
                )
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = err.message ?: "Quantum calculation failed."
                )
            }
        }
    }
}
