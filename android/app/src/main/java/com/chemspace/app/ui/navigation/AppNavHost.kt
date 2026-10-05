package com.chemspace.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.chemspace.app.ChemSpaceApp
import com.chemspace.app.ui.screens.auth.AuthScreen
import com.chemspace.app.ui.screens.auth.AuthViewModel
import com.chemspace.app.ui.screens.features.AiBotScreen
import com.chemspace.app.ui.screens.features.AiBotViewModel
import com.chemspace.app.ui.screens.features.ChemDrawScreen
import com.chemspace.app.ui.screens.features.ChemDrawViewModel
import com.chemspace.app.ui.screens.features.ChemistrySearchScreen
import com.chemspace.app.ui.screens.features.ChemistrySearchViewModel
import com.chemspace.app.ui.screens.features.IbmRxnScreen
import com.chemspace.app.ui.screens.features.IbmRxnViewModel
import com.chemspace.app.ui.screens.features.PeriodicTableScreen
import com.chemspace.app.ui.screens.features.PeriodicTableViewModel
import com.chemspace.app.ui.screens.features.QuantumScreen
import com.chemspace.app.ui.screens.features.QuantumViewModel
import com.chemspace.app.ui.screens.features.RdkitLabScreen
import com.chemspace.app.ui.screens.features.RdkitLabViewModel
import com.chemspace.app.ui.screens.features.SpectroscopyScreen
import com.chemspace.app.ui.screens.features.SpectroscopyViewModel
import com.chemspace.app.ui.screens.home.HomeScreen
import com.chemspace.app.ui.screens.home.HomeViewModel
import com.chemspace.app.ui.screens.settings.SettingsScreen
import com.chemspace.app.ui.screens.settings.SettingsViewModel
import com.chemspace.app.ui.screens.splash.SplashScreen
import com.chemspace.app.ui.screens.splash.SplashViewModel
import com.chemspace.app.ui.screens.workspace.WorkspaceScreen
import com.chemspace.app.ui.screens.workspace.WorkspaceViewModel

@Composable
fun AppNavHost(
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController(),
    app: ChemSpaceApp = ChemSpaceApp.instance
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route,
        modifier = modifier
    ) {
        composable(Screen.Splash.route) {
            val viewModel = SplashViewModel(app.preferencesDataStore)
            SplashScreen(
                viewModel = viewModel,
                onNavigateToHome = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                },
                onNavigateToAuth = {
                    navController.navigate(Screen.Auth.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Auth.route) {
            val viewModel = AuthViewModel(app.authRepository)
            AuthScreen(
                viewModel = viewModel,
                onAuthSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Auth.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Home.route) {
            val viewModel = HomeViewModel(app.authRepository, app.preferencesDataStore)
            HomeScreen(
                viewModel = viewModel,
                onNavigate = { route -> navController.navigate(route) },
                onLogout = {
                    navController.navigate(Screen.Auth.route) {
                        popUpTo(Screen.Home.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.AiBot.route) {
            val viewModel = AiBotViewModel(app.aiAssistantRepository)
            AiBotScreen(
                viewModel = viewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.ChemDraw.route) {
            val viewModel = ChemDrawViewModel(app.chemistryRepository)
            ChemDrawScreen(
                viewModel = viewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.RdkitLab.route) {
            val viewModel = RdkitLabViewModel(app.chemistryRepository, app.rdkitLabRepository)
            RdkitLabScreen(
                viewModel = viewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Spectroscopy.route) {
            val viewModel = SpectroscopyViewModel(app.spectroscopyRepository)
            SpectroscopyScreen(
                viewModel = viewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Quantum.route) {
            val viewModel = QuantumViewModel(app.quantumRepository)
            QuantumScreen(
                viewModel = viewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.IbmRxn.route) {
            val viewModel = IbmRxnViewModel(app.reactionRepository)
            IbmRxnScreen(
                viewModel = viewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.PeriodicTable.route) {
            val viewModel = PeriodicTableViewModel()
            PeriodicTableScreen(
                viewModel = viewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.ChemistrySearch.route) {
            val viewModel = ChemistrySearchViewModel(app.chemistryRepository)
            ChemistrySearchScreen(
                viewModel = viewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Workspace.route) {
            val viewModel = WorkspaceViewModel(app.workspaceRepository)
            WorkspaceScreen(
                viewModel = viewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Settings.route) {
            val viewModel = SettingsViewModel(app.preferencesDataStore, app.authRepository)
            SettingsScreen(
                viewModel = viewModel,
                onBack = { navController.popBackStack() }
            )
        }
    }
}
