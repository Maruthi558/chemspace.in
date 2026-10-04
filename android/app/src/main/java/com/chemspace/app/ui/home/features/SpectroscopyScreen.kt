package com.chemspace.app.ui.home.features

import androidx.compose.foundation.Canvas
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
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chemspace.app.ui.components.ChemSpaceTopBar
import com.chemspace.app.ui.theme.ChemSpaceBackgroundDark
import com.chemspace.app.ui.theme.ChemSpaceBorderDark
import com.chemspace.app.ui.theme.ChemSpaceCardDark
import com.chemspace.app.ui.theme.ChemSpaceEmeraldAccent
import com.chemspace.app.ui.theme.ChemSpaceOrangeLight
import com.chemspace.app.ui.theme.ChemSpaceOrangePrimary
import com.chemspace.app.ui.theme.ChemSpaceSurfaceDark
import com.chemspace.app.ui.theme.ChemSpaceSurfaceElevatedDark
import com.chemspace.app.ui.theme.ChemSpaceTextPrimaryDark
import com.chemspace.app.ui.theme.ChemSpaceTextSecondaryDark

enum class SpectrumType {
    FTIR,
    NMR_1H,
    MASS_SPEC
}

@Composable
fun SpectroscopyScreen(
    onNavigateBack: () -> Unit
) {
    var selectedType by remember { mutableStateOf(SpectrumType.FTIR) }

    Scaffold(
        topBar = {
            ChemSpaceTopBar(
                title = "Multi-Modal Spectroscopy",
                showBackButton = true,
                onBackClick = onNavigateBack
            )
        },
        containerColor = ChemSpaceBackgroundDark
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            Text(
                text = "Analytical Waveform & Peak Deconvolution",
                color = ChemSpaceTextPrimaryDark,
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Infrared vibrational bands, nuclear magnetic resonance chemical shifts, and mass-to-charge ratios.",
                color = ChemSpaceTextSecondaryDark,
                fontSize = 12.sp,
                lineHeight = 16.sp,
                modifier = Modifier.padding(top = 2.dp, bottom = 12.dp)
            )

            // Spectrum Mode Tabs
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(42.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(ChemSpaceSurfaceDark)
                    .padding(4.dp)
            ) {
                SpectrumType.values().forEach { type ->
                    val isSelected = selectedType == type
                    val label = when (type) {
                        SpectrumType.FTIR -> "FTIR InfraRed"
                        SpectrumType.NMR_1H -> "¹H NMR Shift"
                        SpectrumType.MASS_SPEC -> "Mass Spec (m/z)"
                    }
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(6.dp))
                            .background(if (isSelected) ChemSpaceSurfaceElevatedDark else Color.Transparent)
                            .clickable { selectedType = type },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = label,
                            color = if (isSelected) ChemSpaceOrangePrimary else ChemSpaceTextSecondaryDark,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Simulated Waveform Spectrum Canvas
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(220.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(ChemSpaceCardDark)
                    .border(1.dp, ChemSpaceBorderDark, RoundedCornerShape(12.dp))
                    .padding(16.dp)
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val w = size.width
                    val h = size.height

                    // Grid lines
                    for (i in 1..4) {
                        val y = h * (i / 5f)
                        drawLine(
                            color = Color(0xFF263040),
                            start = Offset(0f, y),
                            end = Offset(w, y),
                            strokeWidth = 1f
                        )
                    }

                    // Simulated peaks according to spectrum type
                    when (selectedType) {
                        SpectrumType.FTIR -> {
                            // Baseline at top (transmittance)
                            val peaks = listOf(0.2f to 0.75f, 0.45f to 0.4f, 0.7f to 0.85f, 0.85f to 0.6f)
                            for ((xRatio, depth) in peaks) {
                                drawLine(
                                    color = ChemSpaceOrangePrimary,
                                    start = Offset(xRatio * w, h * 0.2f),
                                    end = Offset(xRatio * w, h * depth),
                                    strokeWidth = 2.5f,
                                    cap = StrokeCap.Round
                                )
                            }
                        }
                        SpectrumType.NMR_1H -> {
                            // Baseline at bottom
                            val peaks = listOf(0.15f to 0.8f, 0.35f to 0.45f, 0.6f to 0.3f, 0.85f to 0.15f)
                            for ((xRatio, heightRatio) in peaks) {
                                drawLine(
                                    color = ChemSpaceEmeraldAccent,
                                    start = Offset(xRatio * w, h * 0.9f),
                                    end = Offset(xRatio * w, h * heightRatio),
                                    strokeWidth = 3f,
                                    cap = StrokeCap.Round
                                )
                            }
                        }
                        SpectrumType.MASS_SPEC -> {
                            val peaks = listOf(0.1f to 0.6f, 0.3f to 0.4f, 0.55f to 0.2f, 0.75f to 0.5f, 0.9f to 0.1f)
                            for ((xRatio, top) in peaks) {
                                drawLine(
                                    color = Color(0xFF38BDF8),
                                    start = Offset(xRatio * w, h * 0.9f),
                                    end = Offset(xRatio * w, h * top),
                                    strokeWidth = 2f,
                                    cap = StrokeCap.Round
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Peak assignment table
            Text(
                text = "Diagnostic Peak Assignments",
                color = ChemSpaceTextPrimaryDark,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold
            )

            Spacer(modifier = Modifier.height(8.dp))

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(ChemSpaceSurfaceDark)
                    .padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                when (selectedType) {
                    SpectrumType.FTIR -> {
                        PeakRow("1750 cm⁻¹", "Strong (s)", "Carbonyl C=O Ester Stretch")
                        PeakRow("1685 cm⁻¹", "Very Strong (vs)", "Aromatic Carboxylic Acid C=O")
                        PeakRow("2800–3200 cm⁻¹", "Broad (br)", "Carboxylic Acid O-H Stretch")
                        PeakRow("1605 cm⁻¹", "Medium (m)", "Benzene Ring C=C Aromatic")
                    }
                    SpectrumType.NMR_1H -> {
                        PeakRow("δ 2.35 ppm", "Singlet (3H)", "Acetyl Methyl (-OCOCH₃)")
                        PeakRow("δ 7.15 ppm", "Doublet (1H)", "Aromatic C-3 Proton (J = 8.2 Hz)")
                        PeakRow("δ 8.12 ppm", "Doublet of Doublets (1H)", "Aromatic C-6 ortho to -COOH")
                        PeakRow("δ 11.5 ppm", "Broad Singlet (1H)", "Carboxylic Acid -COOH")
                    }
                    SpectrumType.MASS_SPEC -> {
                        PeakRow("m/z 180.04", "100% (Base)", "Molecular Ion [M]⁺ (C₉H₈O₄)")
                        PeakRow("m/z 138.03", "84%", "Loss of Ketene [M - C₂H₂O]⁺")
                        PeakRow("m/z 121.03", "42%", "Salicylyl Cation [M - C₂H₃O₂]⁺")
                    }
                }
            }
        }
    }
}

@Composable
private fun PeakRow(label: String, intensity: String, assignment: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(label, color = ChemSpaceOrangeLight, fontSize = 13.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
            Text(assignment, color = ChemSpaceTextSecondaryDark, fontSize = 11.sp)
        }
        Text(intensity, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Medium)
    }
}
