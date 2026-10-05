package com.chemspace.app.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = ChemSpaceOrange,
    onPrimary = DarkBackground,
    primaryContainer = ChemSpaceOrangeDark,
    onPrimaryContainer = ChemSpaceOrangeLight,
    secondary = ChemSpaceEmerald,
    onSecondary = DarkBackground,
    secondaryContainer = ChemSpaceEmeraldDark,
    onSecondaryContainer = ChemSpaceEmeraldLight,
    tertiary = ChemSpaceCyan,
    onTertiary = DarkBackground,
    background = DarkBackground,
    onBackground = DarkTextPrimary,
    surface = DarkSurface,
    onSurface = DarkTextPrimary,
    surfaceVariant = DarkSurfaceElevated,
    onSurfaceVariant = DarkTextSecondary,
    outline = DarkBorder,
    outlineVariant = DarkBorderHighlight
)

private val LightColorScheme = lightColorScheme(
    primary = ChemSpaceOrange,
    onPrimary = LightSurface,
    primaryContainer = ChemSpaceOrangeLight,
    onPrimaryContainer = DarkBackground,
    secondary = ChemSpaceEmeraldDark,
    onSecondary = LightSurface,
    secondaryContainer = ChemSpaceEmeraldLight,
    onSecondaryContainer = DarkBackground,
    tertiary = ChemSpaceCyanDark,
    onTertiary = LightSurface,
    background = LightBackground,
    onBackground = LightTextPrimary,
    surface = LightSurface,
    onSurface = LightTextPrimary,
    surfaceVariant = LightSurfaceElevated,
    onSurfaceVariant = LightTextSecondary,
    outline = LightBorder,
    outlineVariant = LightBorderHighlight
)

@Composable
fun ChemSpaceTheme(
    darkTheme: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window
            if (window != null) {
                window.statusBarColor = colorScheme.background.toArgb()
                window.navigationBarColor = colorScheme.background.toArgb()
                val controller = WindowCompat.getInsetsController(window, view)
                controller.isAppearanceLightStatusBars = !darkTheme
                controller.isAppearanceLightNavigationBars = !darkTheme
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
