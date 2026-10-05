package com.chemspace.app.ui.screens.workspace

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chemspace.app.data.api.WorkspaceHistoryItem
import com.chemspace.app.data.api.WorkspaceStatsResponse
import com.chemspace.app.data.repository.WorkspaceRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class WorkspaceUiState(
    val history: List<WorkspaceHistoryItem> = emptyList(),
    val stats: WorkspaceStatsResponse = WorkspaceStatsResponse(),
    val isLoading: Boolean = false,
    val error: String? = null
)

class WorkspaceViewModel(
    private val repository: WorkspaceRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(WorkspaceUiState())
    val uiState: StateFlow<WorkspaceUiState> = _uiState.asStateFlow()

    init {
        loadWorkspace()
    }

    fun loadWorkspace() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val historyRes = repository.getHistory()
            val statsRes = repository.getStats()

            _uiState.value = _uiState.value.copy(
                isLoading = false,
                history = historyRes.getOrDefault(emptyList()),
                stats = statsRes.getOrDefault(WorkspaceStatsResponse())
            )
        }
    }

    fun deleteItem(id: String) {
        viewModelScope.launch {
            repository.deleteHistoryItem(id)
            _uiState.value = _uiState.value.copy(
                history = _uiState.value.history.filter { it.id != id }
            )
        }
    }

    fun clearAllHistory() {
        viewModelScope.launch {
            repository.clearHistory()
            _uiState.value = _uiState.value.copy(history = emptyList())
        }
    }
}
