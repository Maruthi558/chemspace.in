package com.chemspace.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.chemspace.app.ui.navigation.AppNavHost
import com.chemspace.app.ui.theme.ChemSpaceTheme
import com.chemspace.app.ui.theme.DarkBackground

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val app = application as ChemSpaceApp

        setContent {
            val isDark by app.preferencesDataStore.isDarkThemeFlow.collectAsState(initial = true)

            ChemSpaceTheme(darkTheme = isDark) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = DarkBackground
                ) {
                    AppNavHost(app = app)
                }
            }
        }
    }
}
