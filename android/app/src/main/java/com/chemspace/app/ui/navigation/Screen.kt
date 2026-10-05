package com.chemspace.app.ui.navigation

sealed class Screen(val route: String) {
    data object Splash : Screen("splash")
    data object Auth : Screen("auth")
    data object Home : Screen("home")
    data object AiBot : Screen("ai_bot")
    data object ChemDraw : Screen("chemdraw")
    data object RdkitLab : Screen("rdkit_lab")
    data object Spectroscopy : Screen("spectroscopy")
    data object Quantum : Screen("quantum")
    data object IbmRxn : Screen("ibm_rxn")
    data object PeriodicTable : Screen("periodic_table")
    data object ChemistrySearch : Screen("chemistry_search")
    data object Workspace : Screen("workspace")
    data object Settings : Screen("settings")
}
