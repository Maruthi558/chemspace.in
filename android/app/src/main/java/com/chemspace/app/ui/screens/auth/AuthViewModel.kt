package com.chemspace.app.ui.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chemspace.app.data.api.UserDto
import com.chemspace.app.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

enum class AuthMode {
    SIGN_IN,
    REGISTER,
    EMAIL_OTP,
    PHONE_OTP
}

data class AuthUiState(
    val authMode: AuthMode = AuthMode.SIGN_IN,
    val identifierInput: String = "",
    val usernameInput: String = "",
    val emailInput: String = "",
    val passwordInput: String = "",
    val otpInput: String = "",
    val phoneInput: String = "",
    val isOtpSent: Boolean = false,
    val isLoading: Boolean = false,
    val error: String? = null,
    val successMessage: String? = null,
    val authenticatedUser: UserDto? = null
)

class AuthViewModel(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    fun setAuthMode(mode: AuthMode) {
        _uiState.value = _uiState.value.copy(
            authMode = mode,
            error = null,
            successMessage = null,
            isOtpSent = false,
            otpInput = ""
        )
    }

    fun onIdentifierChange(v: String) { _uiState.value = _uiState.value.copy(identifierInput = v, error = null) }
    fun onUsernameChange(v: String) { _uiState.value = _uiState.value.copy(usernameInput = v, error = null) }
    fun onEmailChange(v: String) { _uiState.value = _uiState.value.copy(emailInput = v, error = null) }
    fun onPasswordChange(v: String) { _uiState.value = _uiState.value.copy(passwordInput = v, error = null) }
    fun onOtpChange(v: String) { _uiState.value = _uiState.value.copy(otpInput = v.filter { it.isDigit() }.take(6), error = null) }
    fun onPhoneChange(v: String) { _uiState.value = _uiState.value.copy(phoneInput = v, error = null) }

    fun submitSignIn() {
        val identifier = _uiState.value.identifierInput.trim()
        val password = _uiState.value.passwordInput
        if (identifier.isBlank() || password.isBlank()) {
            _uiState.value = _uiState.value.copy(error = "Please enter your username/email and password.")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = authRepository.login(identifier, password)
            result.onSuccess { response ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    authenticatedUser = response.user ?: UserDto(username = identifier, name = identifier)
                )
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = err.message ?: "Sign-in failed. Please verify credentials."
                )
            }
        }
    }

    fun submitRegister() {
        val username = _uiState.value.usernameInput.trim()
        val email = _uiState.value.emailInput.trim()
        val password = _uiState.value.passwordInput
        if (username.length < 3) {
            _uiState.value = _uiState.value.copy(error = "Username must be at least 3 characters.")
            return
        }
        if (!email.contains("@") || !email.contains(".")) {
            _uiState.value = _uiState.value.copy(error = "Please enter a valid email address.")
            return
        }
        if (password.length < 6) {
            _uiState.value = _uiState.value.copy(error = "Password must be at least 6 characters.")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = authRepository.register(username, email, password)
            result.onSuccess { response ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    authenticatedUser = response.user ?: UserDto(username = username, email = email, name = username)
                )
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = err.message ?: "Registration failed. Please try again."
                )
            }
        }
    }

    fun sendEmailOtp() {
        val email = _uiState.value.emailInput.trim()
        if (!email.contains("@") || !email.contains(".")) {
            _uiState.value = _uiState.value.copy(error = "Please enter a valid email address.")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = authRepository.sendEmailOtp(email)
            result.onSuccess { res ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    isOtpSent = true,
                    successMessage = res.message ?: "Verification code dispatched to $email"
                )
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = err.message ?: "Failed to dispatch verification email."
                )
            }
        }
    }

    fun verifyEmailOtp() {
        val email = _uiState.value.emailInput.trim()
        val otp = _uiState.value.otpInput.trim()
        if (otp.length != 6) {
            _uiState.value = _uiState.value.copy(error = "Please enter the 6-digit numeric verification code.")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = authRepository.verifyEmailOtp(email, otp)
            result.onSuccess { res ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    authenticatedUser = res.user ?: UserDto(email = email, username = email.substringBefore("@"))
                )
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = err.message ?: "Invalid or expired verification code."
                )
            }
        }
    }

    fun sendPhoneOtp() {
        val phone = _uiState.value.phoneInput.trim()
        if (phone.length < 8) {
            _uiState.value = _uiState.value.copy(error = "Please enter a valid phone number.")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = authRepository.sendPhoneOtp(phone)
            result.onSuccess { res ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    isOtpSent = true,
                    successMessage = res.message ?: "SMS code sent to $phone"
                )
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = err.message ?: "Failed to dispatch SMS verification code."
                )
            }
        }
    }

    fun verifyPhoneOtp() {
        val phone = _uiState.value.phoneInput.trim()
        val otp = _uiState.value.otpInput.trim()
        if (otp.length != 6) {
            _uiState.value = _uiState.value.copy(error = "Please enter the 6-digit SMS verification code.")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = authRepository.verifyPhoneOtp(phone, otp)
            result.onSuccess { res ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    authenticatedUser = res.user ?: UserDto(name = "Scientist ($phone)")
                )
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = err.message ?: "Invalid SMS verification code."
                )
            }
        }
    }

    fun handleGoogleAuthSuccess(idToken: String, email: String?, name: String?, photoUrl: String?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = authRepository.handleGoogleSignIn(idToken, email, name, photoUrl)
            result.onSuccess { user ->
                _uiState.value = _uiState.value.copy(isLoading = false, authenticatedUser = user)
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(isLoading = false, error = err.message ?: "Google Sign-In failed.")
            }
        }
    }

    fun continueAsGuest() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val guest = authRepository.continueAsGuest()
            _uiState.value = _uiState.value.copy(isLoading = false, authenticatedUser = guest)
        }
    }
}
