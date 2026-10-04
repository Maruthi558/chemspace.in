package com.chemspace.app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chemspace.app.data.repository.AuthRepository
import com.chemspace.app.ui.components.ButtonState
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

enum class AuthMode {
    LOGIN,
    SIGNUP
}

data class AuthUiState(
    val mode: AuthMode = AuthMode.LOGIN,
    val identifier: String = "",
    val username: String = "",
    val email: String = "",
    val password: String = "",
    val buttonState: ButtonState = ButtonState.NORMAL,
    val errorMessage: String? = null
)

class AuthViewModel(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    private val _loginSuccessEvent = MutableSharedFlow<Unit>()
    val loginSuccessEvent: SharedFlow<Unit> = _loginSuccessEvent.asSharedFlow()

    fun onIdentifierChange(value: String) {
        _uiState.update { it.copy(identifier = value, errorMessage = null) }
    }

    fun onUsernameChange(value: String) {
        _uiState.update { it.copy(username = value, errorMessage = null) }
    }

    fun onEmailChange(value: String) {
        _uiState.update { it.copy(email = value, errorMessage = null) }
    }

    fun onPasswordChange(value: String) {
        _uiState.update { it.copy(password = value, errorMessage = null) }
    }

    fun setMode(mode: AuthMode) {
        _uiState.update { it.copy(mode = mode, errorMessage = null, buttonState = ButtonState.NORMAL) }
    }

    fun submit() {
        val state = _uiState.value
        if (state.buttonState == ButtonState.LOADING) return

        if (state.mode == AuthMode.LOGIN) {
            if (state.identifier.isBlank()) {
                _uiState.update { it.copy(errorMessage = "Please enter your username or email.") }
                return
            }
            if (state.password.isBlank()) {
                _uiState.update { it.copy(errorMessage = "Please enter your password.") }
                return
            }

            _uiState.update { it.copy(buttonState = ButtonState.LOADING, errorMessage = null) }
            viewModelScope.launch {
                val result = authRepository.login(state.identifier, state.password)
                result.fold(
                    onSuccess = {
                        _uiState.update { it.copy(buttonState = ButtonState.SUCCESS) }
                        _loginSuccessEvent.emit(Unit)
                    },
                    onFailure = { error ->
                        _uiState.update {
                            it.copy(
                                buttonState = ButtonState.ERROR,
                                errorMessage = error.message ?: "Authentication failed."
                            )
                        }
                    }
                )
            }
        } else {
            // SIGNUP
            if (state.username.isBlank()) {
                _uiState.update { it.copy(errorMessage = "Username is required.") }
                return
            }
            if (state.email.isBlank() || !state.email.contains("@")) {
                _uiState.update { it.copy(errorMessage = "Please provide a valid scientific email address.") }
                return
            }
            if (state.password.length < 6) {
                _uiState.update { it.copy(errorMessage = "Password must be at least 6 characters.") }
                return
            }

            _uiState.update { it.copy(buttonState = ButtonState.LOADING, errorMessage = null) }
            viewModelScope.launch {
                val result = authRepository.register(state.username, state.email, state.password)
                result.fold(
                    onSuccess = {
                        _uiState.update { it.copy(buttonState = ButtonState.SUCCESS) }
                        _loginSuccessEvent.emit(Unit)
                    },
                    onFailure = { error ->
                        _uiState.update {
                            it.copy(
                                buttonState = ButtonState.ERROR,
                                errorMessage = error.message ?: "Registration failed."
                            )
                        }
                    }
                )
            }
        }
    }
}
