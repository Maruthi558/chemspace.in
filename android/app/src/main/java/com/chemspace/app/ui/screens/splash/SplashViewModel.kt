package com.chemspace.app.ui.screens.splash

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chemspace.app.data.local.PreferencesDataStore
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

sealed class SplashDestination {
    data object Loading : SplashDestination()
    data object Home : SplashDestination()
    data object Auth : SplashDestination()
}

class SplashViewModel(
    private val preferencesDataStore: PreferencesDataStore
) : ViewModel() {

    private val _destination = MutableStateFlow<SplashDestination>(SplashDestination.Loading)
    val destination: StateFlow<SplashDestination> = _destination

    init {
        checkSession()
    }

    private fun checkSession() {
        viewModelScope.launch {
            delay(1200) // ChemSpace splash logo animation interval
            val token = preferencesDataStore.authTokenFlow.first()
            if (!token.isNullOrBlank()) {
                _destination.value = SplashDestination.Home
            } else {
                _destination.value = SplashDestination.Auth
            }
        }
    }
}
