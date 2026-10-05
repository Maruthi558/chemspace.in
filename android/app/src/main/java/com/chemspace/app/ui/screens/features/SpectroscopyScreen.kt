package com.chemspace.app.ui.screens.features

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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
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
import com.chemspace.app.ui.components.ChemSpaceTextField
import com.chemspace.app.ui.components.ChemSpaceTopBar
import com.chemspace.app.ui.components.ErrorCardView
import com.chemspace.app.ui.components.LoadingView
import com.chemspace.app.ui.components.SpectraChartCanvas
import com.chemspace.app.ui.theme.ChemSpaceEmerald
import com.chemspace.app.ui.theme.ChemSpaceOrange
import com.chemspace.app.ui.theme.DarkBackground
import com.chemspace.app.ui.theme.DarkBorder
import com.chemspace.app.ui.theme.DarkSurface
import com.chemspace.app.ui.theme.DarkSurfaceElevated
import com.chemspace.app.ui.theme.DarkTextMuted
import com.chemspace.app.ui.theme.DarkTextPrimary

@Composable
fun SpectroscopyScreen(
    viewModel: SpectroscopyViewModel,
    onBack: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val activeDataset = viewModel.getActiveDataset()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            ChemSpaceTopBar(
                title = "Spectroscopy Suite",
                subtitle = "FT-IR • UV-Vis • NMR • MS",
                onBackClick = onBack
            )

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp)
            ) {
                // Chemical Input
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    ChemSpaceTextField(
                        value = state.smilesInput,
                        onValueChange = { viewModel.onSmilesChange(it) },
                        label = "Molecular Target SMILES",
                        isMonospace = true,
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Box(
                        modifier = Modifier
                            .padding(top = 18.dp)
                            .size(48.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(ChemSpaceOrange)
                            .clickable(enabled = !state.isLoading) {
                                viewModel.analyzeSpectra()
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = "Simulate", tint = Color.White)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Technique Selector
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(DarkSurfaceElevated)
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    val techniques = listOf(
                        "ir" to "FT-IR",
                        "uv" to "UV-Vis",
                        "nmr" to "1H NMR",
                        "ms" to "EI-MS"
                    )
                    for ((id, title) in techniques) {
                        val isSelected = state.activeTechnique == id
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) ChemSpaceOrange else Color.Transparent)
                                .clickable { viewModel.setActiveTechnique(id) }
                                .padding(vertical = 8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = title,
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Color.White else DarkTextMuted
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                if (state.isLoading) {
                    LoadingView(message = "Computing vibrational modes, electronic transitions & chemical shifts...")
                } else if (!state.error.isNullOrBlank()) {
                    ErrorCardView(title = "Simulation Error", message = state.error!!, onRetry = { viewModel.analyzeSpectra() })
                } else {
                    // Spectral Chart View
                    SpectraChartCanvas(dataset = activeDataset)

                    Spacer(modifier = Modifier.height(16.dp))

                    // Peak Assignments Table
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = DarkSurface),
                        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = "Peak Resonance & Assignment Table",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = DarkTextPrimary
                            )
                            Spacer(modifier = Modifier.height(10.dp))

                            val peaks = activeDataset?.peaks ?: emptyList()
                            if (peaks.isEmpty()) {
                                Text(
                                    text = "No discrete peaks detected for this modality.",
                                    fontSize = 12.sp,
                                    color = DarkTextMuted
                                )
                            } else {
                                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                    for (p in peaks) {
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(DarkSurfaceElevated)
                                                .padding(horizontal = 12.dp, vertical = 8.dp),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Column(modifier = Modifier.weight(1f)) {
                                                Text(
                                                    text = "${p.x} ${if (state.activeTechnique == "ir") "cm⁻¹" else if (state.activeTechnique == "uv") "nm" else if (state.activeTechnique == "nmr") "ppm" else "m/z"}",
                                                    fontFamily = FontFamily.Monospace,
                                                    fontWeight = FontWeight.Bold,
                                                    fontSize = 13.sp,
                                                    color = ChemSpaceOrange
                                                )
                                                Text(
                                                    text = p.assignment ?: "Spectral Band",
                                                    fontSize = 11.sp,
                                                    color = DarkTextPrimary
                                                )
                                            }
                                            Text(
                                                text = p.intensity ?: "${p.y}%",
                                                fontFamily = FontFamily.Monospace,
                                                fontSize = 11.sp,
                                                color = ChemSpaceEmerald
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
