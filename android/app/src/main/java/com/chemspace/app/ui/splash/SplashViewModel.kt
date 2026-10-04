package com.chemspace.app.ui.splash

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chemspace.app.data.repository.AuthRepository
import com.chemspace.app.navigation.Screen
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch

class SplashViewModel(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _navigationEvent = MutableSharedFlow<String>()
    val navigationEvent: SharedFlow<String> = _navigationEvent.asSharedFlow()

    init {
        checkSessionAndNavigate()
    }

    private fun checkSessionAndNavigate() {
        viewModelScope.launch {
            // Allow the scientific logo reveal animation to progress smoothly (2200ms)
            delay(2200)

            val isLoggedIn = authRepository.isUserLoggedIn.firstOrNull() ?: false
            if (isLoggedIn) {
                _navigationEvent.emit(Screen.Home.route)
            } else {
                _navigationEvent.emit(Screen.Auth.route)
            }
        }
    }
}
