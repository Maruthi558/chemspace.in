package com.chemspace.app.navigation

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Auth : Screen("auth")
    object Home : Screen("home")

    // The 8 Core ChemSpace Tools
    object AiBot : Screen("ai_bot")
    object ChemDraw : Screen("chemdraw")
    object RdkitLab : Screen("rdkit")
    object Spectroscopy : Screen("spectroscopy")
    object Quantum : Screen("quantum")
    object IbmRxn : Screen("ibm_rxn")
    object PeriodicTable : Screen("periodic_table")
    object ChemistrySearch : Screen("chemistry_search")
}
