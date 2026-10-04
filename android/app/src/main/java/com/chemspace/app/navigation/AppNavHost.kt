package com.chemspace.app.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.chemspace.app.data.local.PreferencesDataStore
import com.chemspace.app.data.repository.AiAssistantRepository
import com.chemspace.app.data.repository.AuthRepository
import com.chemspace.app.data.repository.ChemistryRepository
import com.chemspace.app.ui.auth.AuthScreen
import com.chemspace.app.ui.auth.AuthViewModel
import com.chemspace.app.ui.home.HomeScreen
import com.chemspace.app.ui.home.HomeViewModel
import com.chemspace.app.ui.home.features.AiBotScreen
import com.chemspace.app.ui.home.features.ChemDrawScreen
import com.chemspace.app.ui.home.features.ChemistrySearchScreen
import com.chemspace.app.ui.home.features.IbmRxnScreen
import com.chemspace.app.ui.home.features.PeriodicTableScreen
import com.chemspace.app.ui.home.features.QuantumScreen
import com.chemspace.app.ui.home.features.RdkitLabScreen
import com.chemspace.app.ui.home.features.SpectroscopyScreen
import com.chemspace.app.ui.splash.SplashScreen
import com.chemspace.app.ui.splash.SplashViewModel

@Composable
fun AppNavHost(
    navController: NavHostController = rememberNavController(),
    preferences: PreferencesDataStore
) {
    // Instantiate repositories
    val authRepository = remember { AuthRepository(preferences = preferences) }
    val chemistryRepository = remember { ChemistryRepository() }
    val aiAssistantRepository = remember { AiAssistantRepository() }

    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route
    ) {
        // 1. Animated Splash Screen
        composable(Screen.Splash.route) {
            val splashViewModel = remember { SplashViewModel(authRepository) }
            SplashScreen(
                viewModel = splashViewModel,
                onNavigate = { destination ->
                    navController.navigate(destination) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                }
            )
        }

        // 2. Authentication Screen
        composable(Screen.Auth.route) {
            val authViewModel = remember { AuthViewModel(authRepository) }
            AuthScreen(
                viewModel = authViewModel,
                onAuthSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Auth.route) { inclusive = true }
                    }
                }
            )
        }

        // 3. Home Screen
        composable(Screen.Home.route) {
            val homeViewModel = remember { HomeViewModel(authRepository, chemistryRepository) }
            HomeScreen(
                viewModel = homeViewModel,
                onNavigateToTool = { route ->
                    navController.navigate(route)
                },
                onLogout = {
                    navController.navigate(Screen.Auth.route) {
                        popUpTo(Screen.Home.route) { inclusive = true }
                    }
                }
            )
        }

        // 4. Feature Screens
        composable(Screen.AiBot.route) {
            AiBotScreen(
                repository = aiAssistantRepository,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.ChemDraw.route) {
            ChemDrawScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.RdkitLab.route) {
            RdkitLabScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Spectroscopy.route) {
            SpectroscopyScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Quantum.route) {
            QuantumScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.IbmRxn.route) {
            IbmRxnScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.PeriodicTable.route) {
            PeriodicTableScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.ChemistrySearch.route) {
            ChemistrySearchScreen(
                repository = chemistryRepository,
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
