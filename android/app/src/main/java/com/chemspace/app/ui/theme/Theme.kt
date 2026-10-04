package com.chemspace.app.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val ChemSpaceDarkColorScheme = darkColorScheme(
    primary = ChemSpaceOrangePrimary,
    onPrimary = ChemSpaceBackgroundDark,
    primaryContainer = ChemSpaceOrangeContainer,
    onPrimaryContainer = ChemSpaceOrangeLight,

    secondary = ChemSpaceEmeraldAccent,
    onSecondary = ChemSpaceBackgroundDark,
    secondaryContainer = ChemSpaceEmeraldContainer,
    onSecondaryContainer = ChemSpaceEmeraldLight,

    tertiary = ChemSpaceCyan,
    onTertiary = ChemSpaceBackgroundDark,

    background = ChemSpaceBackgroundDark,
    onBackground = ChemSpaceTextPrimaryDark,

    surface = ChemSpaceSurfaceDark,
    onSurface = ChemSpaceTextPrimaryDark,
    surfaceVariant = ChemSpaceCardDark,
    onSurfaceVariant = ChemSpaceTextSecondaryDark,

    outline = ChemSpaceBorderDark,
    outlineVariant = ChemSpaceBorderSubtleDark,

    error = ChemSpaceError,
    onError = ChemSpaceBackgroundDark
)

private val ChemSpaceLightColorScheme = lightColorScheme(
    primary = ChemSpaceOrangePrimary,
    onPrimary = ChemSpaceSurfaceLight,
    primaryContainer = ChemSpaceOrangeLight.copy(alpha = 0.2f),
    onPrimaryContainer = ChemSpaceOrangeDark,

    secondary = ChemSpaceEmeraldDark,
    onSecondary = ChemSpaceSurfaceLight,
    secondaryContainer = ChemSpaceEmeraldLight.copy(alpha = 0.2f),
    onSecondaryContainer = ChemSpaceEmeraldDark,

    tertiary = ChemSpaceCyan,
    onTertiary = ChemSpaceSurfaceLight,

    background = ChemSpaceBackgroundLight,
    onBackground = ChemSpaceTextPrimaryLight,

    surface = ChemSpaceSurfaceLight,
    onSurface = ChemSpaceTextPrimaryLight,
    surfaceVariant = ChemSpaceSurfaceElevatedLight,
    onSurfaceVariant = ChemSpaceTextSecondaryLight,

    outline = ChemSpaceBorderLight,

    error = ChemSpaceError,
    onError = ChemSpaceSurfaceLight
)

@Composable
fun ChemSpaceTheme(
    darkTheme: Boolean = true, // Default to ChemSpace signature dark space aesthetic
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) ChemSpaceDarkColorScheme else ChemSpaceLightColorScheme
    val view = LocalView.current

    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window
            if (window != null) {
                window.statusBarColor = colorScheme.background.toArgb()
                window.navigationBarColor = colorScheme.background.toArgb()
                val insetsController = WindowCompat.getInsetsController(window, view)
                insetsController.isAppearanceLightStatusBars = !darkTheme
                insetsController.isAppearanceLightNavigationBars = !darkTheme
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
