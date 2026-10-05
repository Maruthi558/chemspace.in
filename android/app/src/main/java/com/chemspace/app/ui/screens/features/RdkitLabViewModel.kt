package com.chemspace.app.ui.screens.features

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chemspace.app.data.api.CalculatePropertiesResponse
import com.chemspace.app.data.api.RdkitExecuteResponse
import com.chemspace.app.data.repository.ChemistryRepository
import com.chemspace.app.data.repository.RdkitLabRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class RdkitLabUiState(
    val smilesInput: String = "CC(=O)Oc1ccccc1C(=O)O",
    val activeTab: String = "PROPERTIES", // "PROPERTIES", "PYTHON_RUNNER"
    val properties: CalculatePropertiesResponse? = null,
    val pythonCode: String = """
from rdkit import Chem
from rdkit.Chem import Descriptors

mol = Chem.MolFromSmiles("CC(=O)Oc1ccccc1C(=O)O")
print("Molecule:", Chem.MolToSmiles(mol))
print("Molecular Weight:", Descriptors.MolWt(mol))
print("LogP:", Descriptors.MolLogP(mol))
print("TPSA:", Descriptors.TPSA(mol))
print("Lipinski HBD:", Descriptors.NumHDonors(mol))
print("Lipinski HBA:", Descriptors.NumHAcceptors(mol))
""".trimIndent(),
    val pythonResult: RdkitExecuteResponse? = null,
    val isLoadingProperties: Boolean = false,
    val isRunningScript: Boolean = false,
    val error: String? = null
)

class RdkitLabViewModel(
    private val chemistryRepository: ChemistryRepository,
    private val rdkitLabRepository: RdkitLabRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(RdkitLabUiState())
    val uiState: StateFlow<RdkitLabUiState> = _uiState.asStateFlow()

    init {
        calculateProperties(_uiState.value.smilesInput)
    }

    fun onSmilesChange(v: String) { _uiState.value = _uiState.value.copy(smilesInput = v) }
    fun onPythonCodeChange(code: String) { _uiState.value = _uiState.value.copy(pythonCode = code) }
    fun setActiveTab(tab: String) { _uiState.value = _uiState.value.copy(activeTab = tab) }

    fun calculateProperties(smiles: String = _uiState.value.smilesInput) {
        val query = smiles.trim()
        if (query.isBlank()) return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoadingProperties = true, error = null)
            val res = chemistryRepository.calculateProperties(query)
            res.onSuccess { props ->
                _uiState.value = _uiState.value.copy(
                    isLoadingProperties = false,
                    properties = props
                )
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoadingProperties = false,
                    error = err.message ?: "Property calculation failed."
                )
            }
        }
    }

    fun runPythonScript() {
        val code = _uiState.value.pythonCode.trim()
        if (code.isBlank()) return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isRunningScript = true)
            val res = rdkitLabRepository.executeScript(code)
            res.onSuccess { result ->
                _uiState.value = _uiState.value.copy(
                    isRunningScript = false,
                    pythonResult = result
                )
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isRunningScript = false,
                    pythonResult = RdkitExecuteResponse(status = "error", stderr = err.message)
                )
            }
        }
    }
}
