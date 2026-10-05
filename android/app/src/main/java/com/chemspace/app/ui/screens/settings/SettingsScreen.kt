package com.chemspace.app.ui.screens.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chemspace.app.BuildConfig
import com.chemspace.app.ui.components.ChemSpaceButton
import com.chemspace.app.ui.components.ChemSpaceButtonStyle
import com.chemspace.app.ui.components.ChemSpaceTextField
import com.chemspace.app.ui.components.ChemSpaceTopBar
import com.chemspace.app.ui.theme.ChemSpaceCyan
import com.chemspace.app.ui.theme.ChemSpaceEmerald
import com.chemspace.app.ui.theme.ChemSpaceOrange
import com.chemspace.app.ui.theme.DarkBackground
import com.chemspace.app.ui.theme.DarkBorder
import com.chemspace.app.ui.theme.DarkSurface
import com.chemspace.app.ui.theme.DarkSurfaceElevated
import com.chemspace.app.ui.theme.DarkTextMuted
import com.chemspace.app.ui.theme.DarkTextPrimary

@Composable
fun SettingsScreen(
    viewModel: SettingsViewModel,
    onBack: () -> Unit
) {
    val isDark by viewModel.isDarkTheme.collectAsState()
    val currentUrl by viewModel.currentBaseUrl.collectAsState()
    val state by viewModel.uiState.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            ChemSpaceTopBar(
                title = "Settings",
                subtitle = "Preferences & Network",
                onBackClick = onBack
            )

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Theme Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(text = "Appearance Theme", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = DarkTextPrimary)
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = if (isDark) "ChemSpace Deep Space (Dark)" else "Laboratory Clean (Light)",
                                fontSize = 12.sp,
                                color = DarkTextMuted
                            )
                        }

                        Switch(
                            checked = isDark,
                            onCheckedChange = { viewModel.toggleTheme() },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = ChemSpaceOrange,
                                checkedTrackColor = ChemSpaceOrange.copy(alpha = 0.3f),
                                uncheckedThumbColor = DarkTextMuted,
                                uncheckedTrackColor = DarkSurfaceElevated
                            )
                        )
                    }
                }

                // Server Endpoint Configuration
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(text = "API Server Endpoint", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = DarkTextPrimary)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Currently connected to: $currentUrl",
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            color = ChemSpaceEmerald
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        // Presets
                        Text(text = "Quick Presets", fontSize = 11.sp, color = DarkTextMuted)
                        Spacer(modifier = Modifier.height(6.dp))

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(DarkSurfaceElevated)
                                    .border(1.dp, if (currentUrl.contains("che445")) ChemSpaceOrange else DarkBorder, RoundedCornerShape(8.dp))
                                    .clickable { viewModel.selectPresetUrl(BuildConfig.PROD_BASE_URL) }
                                    .padding(vertical = 8.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = "Production Server", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = DarkTextPrimary)
                            }

                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(DarkSurfaceElevated)
                                    .border(1.dp, if (currentUrl.contains("10.0.2.2")) ChemSpaceOrange else DarkBorder, RoundedCornerShape(8.dp))
                                    .clickable { viewModel.selectPresetUrl(BuildConfig.DEV_BASE_URL) }
                                    .padding(vertical = 8.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = "Emulator Localhost", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = DarkTextPrimary)
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        ChemSpaceTextField(
                            value = state.customUrlInput,
                            onValueChange = { viewModel.onCustomUrlChange(it) },
                            label = "Custom Server Base URL",
                            placeholder = "https://your-custom-backend.com/"
                        )

                        if (state.customUrlInput.isNotBlank()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            ChemSpaceButton(
                                text = "Apply Custom Endpoint",
                                onClick = { viewModel.applyCustomUrl() },
                                style = ChemSpaceButtonStyle.OUTLINE
                            )
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            ChemSpaceButton(
                                text = "Test Connectivity",
                                onClick = { viewModel.testServer() },
                                isLoading = state.isTestingConnection,
                                style = ChemSpaceButtonStyle.SECONDARY,
                                modifier = Modifier.weight(1f)
                            )

                            Spacer(modifier = Modifier.width(10.dp))

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (state.isConnected) ChemSpaceEmerald.copy(alpha = 0.15f) else Color(0x33EF4444))
                                    .padding(horizontal = 10.dp, vertical = 8.dp)
                            ) {
                                Text(
                                    text = state.connectionStatus ?: "Ready",
                                    fontSize = 11.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.Bold,
                                    color = if (state.isConnected) ChemSpaceEmerald else Color(0xFFEF4444)
                                )
                            }
                        }
                    }
                }

                // Application & Build Specifications
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(text = "Application Specifications", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = DarkTextPrimary)
                        Spacer(modifier = Modifier.height(12.dp))

                        SpecRow(label = "Package Name", value = BuildConfig.APPLICATION_ID)
                        SpecRow(label = "Version Name", value = BuildConfig.VERSION_NAME)
                        SpecRow(label = "Version Code", value = "${BuildConfig.VERSION_CODE}")
                        SpecRow(label = "Android SDK Target", value = "API 34 (Android 14/15)")
                        SpecRow(label = "Min Supported SDK", value = "API 26 (Android 8.0 Oreo)")
                        SpecRow(label = "Architecture", value = "ARM64-v8a • x86_64")
                        SpecRow(label = "Build Variant", value = BuildConfig.BUILD_TYPE.uppercase())
                        SpecRow(label = "Signing Status", value = "Production Keystore Verified")
                    }
                }
            }
        }
    }
}

@Composable
private fun SpecRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, fontSize = 12.sp, color = DarkTextMuted)
        Text(text = value, fontSize = 12.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.SemiBold, color = DarkTextPrimary)
    }
}
