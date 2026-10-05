package com.chemspace.app.ui.screens.features

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chemspace.app.data.api.SpectroscopyPredictResponse
import com.chemspace.app.data.api.SpectrumDataset
import com.chemspace.app.data.repository.SpectroscopyRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class SpectroscopyUiState(
    val smilesInput: String = "CC(=O)Oc1ccccc1C(=O)O",
    val activeTechnique: String = "ir", // "ir", "uv", "nmr", "ms"
    val dossier: SpectroscopyPredictResponse? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

class SpectroscopyViewModel(
    private val repository: SpectroscopyRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(SpectroscopyUiState())
    val uiState: StateFlow<SpectroscopyUiState> = _uiState.asStateFlow()

    init {
        analyzeSpectra(_uiState.value.smilesInput)
    }

    fun onSmilesChange(v: String) { _uiState.value = _uiState.value.copy(smilesInput = v) }
    fun setActiveTechnique(tech: String) { _uiState.value = _uiState.value.copy(activeTechnique = tech) }

    fun analyzeSpectra(smiles: String = _uiState.value.smilesInput) {
        val query = smiles.trim()
        if (query.isBlank()) return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val res = repository.predictSpectroscopy(query)
            res.onSuccess { response ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    dossier = response
                )
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = err.message ?: "Failed to compute spectroscopy."
                )
            }
        }
    }

    fun getActiveDataset(): SpectrumDataset? {
        val d = _uiState.value.dossier ?: return null
        return d.spectra?.get(_uiState.value.activeTechnique)
    }
}
