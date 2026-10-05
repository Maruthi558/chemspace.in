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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
fun QuantumScreen(
    viewModel: QuantumViewModel,
    onBack: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()

    val methods = listOf("DFT (B3LYP)", "HF (Hartree-Fock)", "MP2")
    val basisSets = listOf("6-31G(d)", "3-21G", "cc-pVDZ")

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            ChemSpaceTopBar(
                title = "Quantum Chemistry",
                subtitle = "DFT • Frontier Orbitals",
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
                                viewModel.runCalculation()
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = "Calculate", tint = Color.White)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Method Selector
                Text(text = "Theoretical Method", fontSize = 11.sp, color = DarkTextMuted)
                Spacer(modifier = Modifier.height(4.dp))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(methods) { m ->
                        val isSelected = state.method == m
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) ChemSpaceOrange else DarkSurfaceElevated)
                                .border(1.dp, if (isSelected) ChemSpaceOrange else DarkBorder, RoundedCornerShape(8.dp))
                                .clickable {
                                    viewModel.setMethod(m)
                                    viewModel.runCalculation()
                                }
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(text = m, fontSize = 11.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal, color = if (isSelected) Color.White else DarkTextPrimary)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Basis Set Selector
                Text(text = "Gaussian Basis Set", fontSize = 11.sp, color = DarkTextMuted)
                Spacer(modifier = Modifier.height(4.dp))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(basisSets) { b ->
                        val isSelected = state.basisSet == b
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) ChemSpaceEmerald else DarkSurfaceElevated)
                                .border(1.dp, if (isSelected) ChemSpaceEmerald else DarkBorder, RoundedCornerShape(8.dp))
                                .clickable {
                                    viewModel.setBasisSet(b)
                                    viewModel.runCalculation()
                                }
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(text = b, fontSize = 11.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal, color = if (isSelected) Color.White else DarkTextPrimary)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                if (state.isLoading) {
                    LoadingView(message = "Solving Kohn-Sham SCF equations & evaluating Fock matrix...")
                } else if (!state.error.isNullOrBlank()) {
                    ErrorCardView(title = "Quantum Engine Error", message = state.error!!, onRetry = { viewModel.runCalculation() })
                } else {
                    val r = state.result

                    // Total Electronic Energy Card
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = DarkSurface),
                        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(text = "Total Electronic Energy", fontSize = 12.sp, color = DarkTextMuted)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "${r?.totalEnergyHartree ?: -232.4820} Hartree",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = ChemSpaceOrange,
                                fontFamily = FontFamily.Monospace
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "${r?.totalEnergyKcalMol ?: -145884.52} kcal/mol  •  Zero-Point: ${r?.zeroPointEnergy ?: "0.1482 Hartree"}",
                                fontSize = 12.sp,
                                color = DarkTextPrimary
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Frontier Molecular Orbitals Card
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = DarkSurface),
                        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(text = "Frontier Molecular Orbitals", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = DarkTextPrimary)
                            Spacer(modifier = Modifier.height(12.dp))

                            val orb = r?.molecularOrbitals
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(DarkSurfaceElevated)
                                        .padding(10.dp)
                                ) {
                                    Column {
                                        Text(text = "HOMO Energy", fontSize = 10.sp, color = DarkTextMuted)
                                        Text(text = "${orb?.homoEnergy ?: -6.42} eV", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = ChemSpaceCyan, fontFamily = FontFamily.Monospace)
                                    }
                                }
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(DarkSurfaceElevated)
                                        .padding(10.dp)
                                ) {
                                    Column {
                                        Text(text = "LUMO Energy", fontSize = 10.sp, color = DarkTextMuted)
                                        Text(text = "${orb?.lumoEnergy ?: -0.68} eV", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = ChemSpaceOrange, fontFamily = FontFamily.Monospace)
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(DarkSurfaceElevated)
                                        .padding(10.dp)
                                ) {
                                    Column {
                                        Text(text = "HOMO-LUMO Gap (ΔE)", fontSize = 10.sp, color = DarkTextMuted)
                                        Text(text = "${orb?.energyGapEv ?: 5.74} eV", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = ChemSpaceEmerald, fontFamily = FontFamily.Monospace)
                                    }
                                }
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(DarkSurfaceElevated)
                                        .padding(10.dp)
                                ) {
                                    Column {
                                        Text(text = "Chemical Hardness (η)", fontSize = 10.sp, color = DarkTextMuted)
                                        Text(text = "${orb?.chemicalHardness ?: 2.87} eV", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = DarkTextPrimary, fontFamily = FontFamily.Monospace)
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Dipole Moment Card
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = DarkSurface),
                        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(text = "Electric Dipole Moment", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = DarkTextPrimary)
                            Spacer(modifier = Modifier.height(6.dp))
                            val d = r?.dipoleMoment
                            Text(
                                text = "Total: ${d?.totalDebye ?: 1.49} Debye  (dx: ${d?.dx ?: 0.12}, dy: ${d?.dy ?: 1.48}, dz: ${d?.dz ?: 0.05})",
                                fontSize = 12.sp,
                                fontFamily = FontFamily.Monospace,
                                color = ChemSpaceOrange
                            )
                        }
                    }
                }
            }
        }
    }
}
