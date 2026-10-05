package com.chemspace.app.ui.screens.features

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chemspace.app.data.api.AtomDto
import com.chemspace.app.data.api.ParseMoleculeResponse
import com.chemspace.app.data.api.StandardizeResponse
import com.chemspace.app.data.repository.ChemistryRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ChemDrawUiState(
    val smilesInput: String = "CC(=O)Oc1ccccc1C(=O)O",
    val activeTab: String = "3D", // "3D", "2D", "STANDARDIZE"
    val parsedMolecule: ParseMoleculeResponse? = null,
    val conformerAtoms: List<AtomDto>? = null,
    val standardizeResult: StandardizeResponse? = null,
    val isLoading: Boolean = false,
    val error: String? = null,
    val successNotice: String? = null
)

class ChemDrawViewModel(
    private val repository: ChemistryRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ChemDrawUiState())
    val uiState: StateFlow<ChemDrawUiState> = _uiState.asStateFlow()

    init {
        loadMolecule(_uiState.value.smilesInput)
    }

    fun onSmilesChange(v: String) {
        _uiState.value = _uiState.value.copy(smilesInput = v, error = null)
    }

    fun setActiveTab(tab: String) {
        _uiState.value = _uiState.value.copy(activeTab = tab)
    }

    fun loadMolecule(smiles: String = _uiState.value.smilesInput) {
        val query = smiles.trim()
        if (query.isBlank()) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null, successNotice = null)
            val parseRes = repository.parseMolecule(query)
            val conformerRes = repository.generate3DConformer(query)

            parseRes.onSuccess { parsed ->
                val atoms = conformerRes.getOrNull()?.atoms ?: parsed.atoms
                _uiState.value = _uiState.value.copy(
                    smilesInput = query,
                    parsedMolecule = parsed,
                    conformerAtoms = atoms,
                    isLoading = false,
                    successNotice = "Parsed: ${parsed.formula ?: "Valid Molecule"}"
                )
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = err.message ?: "Unable to parse structure."
                )
            }
        }
    }

    fun resolveNameOrQuery(nameQuery: String) {
        if (nameQuery.isBlank()) return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val res = repository.resolveMolecule(nameQuery)
            res.onSuccess { resolved ->
                if (!resolved.smiles.isNullOrBlank()) {
                    loadMolecule(resolved.smiles)
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false, error = "Could not resolve name '$nameQuery'")
                }
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(isLoading = false, error = err.message ?: "Resolution failed")
            }
        }
    }

    fun standardize() {
        val smiles = _uiState.value.smilesInput.trim()
        if (smiles.isBlank()) return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val res = repository.standardizeMolecule(smiles)
            res.onSuccess { std ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    standardizeResult = std,
                    successNotice = "Standardized successfully."
                )
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(isLoading = false, error = err.message ?: "Standardization failed")
            }
        }
    }
}
