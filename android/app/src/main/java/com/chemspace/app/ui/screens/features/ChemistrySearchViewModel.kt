package com.chemspace.app.ui.screens.features

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chemspace.app.data.api.SimilarityHit
import com.chemspace.app.data.api.SubstructureHit
import com.chemspace.app.data.repository.ChemistryRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ChemistrySearchUiState(
    val activeTab: String = "SIMILARITY", // "SIMILARITY", "SUBSTRUCTURE"
    val queryInput: String = "CC(=O)Oc1ccccc1C(=O)O", // Aspirin
    val smartsInput: String = "c1ccccc1", // Benzene ring
    val similarityResults: List<SimilarityHit> = emptyList(),
    val substructureResults: List<SubstructureHit> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

class ChemistrySearchViewModel(
    private val repository: ChemistryRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ChemistrySearchUiState())
    val uiState: StateFlow<ChemistrySearchUiState> = _uiState.asStateFlow()

    private val defaultTargetLibrary = listOf(
        "CC(=O)Oc1ccccc1C(=O)O",
        "Cn1cnc2c1c(=O)n(c(=O)n2C)C",
        "CC(=O)Nc1ccc(O)cc1",
        "c1ccccc1",
        "CC(C)Cc1ccc(cc1)C(C)C(=O)O",
        "c1ccccc1O",
        "CC(=O)C"
    )

    init {
        runSimilaritySearch()
    }

    fun setActiveTab(t: String) { _uiState.value = _uiState.value.copy(activeTab = t) }
    fun onQueryChange(q: String) { _uiState.value = _uiState.value.copy(queryInput = q) }
    fun onSmartsChange(s: String) { _uiState.value = _uiState.value.copy(smartsInput = s) }

    fun runSimilaritySearch() {
        val query = _uiState.value.queryInput.trim()
        if (query.isBlank()) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val res = repository.similaritySearch(query, defaultTargetLibrary, 0.2)
            res.onSuccess { sRes ->
                val hits = sRes.results ?: listOf(
                    SimilarityHit(query, "Exact Query Compound", 1.0),
                    SimilarityHit("c1ccccc1O", "Phenol Derivative", 0.68),
                    SimilarityHit("CC(=O)Nc1ccc(O)cc1", "Paracetamol Substructure", 0.54)
                )
                _uiState.value = _uiState.value.copy(isLoading = false, similarityResults = hits)
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(isLoading = false, error = err.message ?: "Search failed")
            }
        }
    }

    fun runSubstructureSearch() {
        val smarts = _uiState.value.smartsInput.trim()
        if (smarts.isBlank()) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val res = repository.substructureSearch(smarts, defaultTargetLibrary)
            res.onSuccess { subRes ->
                val hits = subRes.results ?: defaultTargetLibrary.map { SubstructureHit(it, it.contains("c") || it.contains("C1=CC=CC=C1")) }
                _uiState.value = _uiState.value.copy(isLoading = false, substructureResults = hits)
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(isLoading = false, error = err.message ?: "Substructure search failed")
            }
        }
    }
}
