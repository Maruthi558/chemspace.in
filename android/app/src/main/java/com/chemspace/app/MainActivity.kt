package com.chemspace.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.chemspace.app.navigation.AppNavHost
import com.chemspace.app.ui.theme.ChemSpaceTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val app = application as ChemSpaceApp

        setContent {
            ChemSpaceTheme(darkTheme = true) {
                AppNavHost(preferences = app.preferencesDataStore)
            }
        }
    }
}
