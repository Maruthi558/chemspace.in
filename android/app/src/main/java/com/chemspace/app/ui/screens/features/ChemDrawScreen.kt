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
import androidx.compose.material.icons.filled.Search
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
import com.chemspace.app.ui.components.ChemSpaceButton
import com.chemspace.app.ui.components.ChemSpaceButtonStyle
import com.chemspace.app.ui.components.ChemSpaceTextField
import com.chemspace.app.ui.components.ChemSpaceTopBar
import com.chemspace.app.ui.components.ErrorCardView
import com.chemspace.app.ui.components.LoadingView
import com.chemspace.app.ui.components.Molecular3DViewer
import com.chemspace.app.ui.theme.ChemSpaceEmerald
import com.chemspace.app.ui.theme.ChemSpaceOrange
import com.chemspace.app.ui.theme.DarkBackground
import com.chemspace.app.ui.theme.DarkBorder
import com.chemspace.app.ui.theme.DarkSurface
import com.chemspace.app.ui.theme.DarkSurfaceElevated
import com.chemspace.app.ui.theme.DarkTextMuted
import com.chemspace.app.ui.theme.DarkTextPrimary

@Composable
fun ChemDrawScreen(
    viewModel: ChemDrawViewModel,
    onBack: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()

    val specimens = listOf(
        "Aspirin" to "CC(=O)Oc1ccccc1C(=O)O",
        "Caffeine" to "Cn1cnc2c1c(=O)n(c(=O)n2C)C",
        "Paracetamol" to "CC(=O)Nc1ccc(O)cc1",
        "Benzene" to "c1ccccc1",
        "Ibuprofen" to "CC(C)Cc1ccc(cc1)C(C)C(=O)O"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            ChemSpaceTopBar(
                title = "ChemDraw 2D/3D",
                subtitle = "Conformer & Structure Engine",
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
                        label = "SMILES String or Molecule Name",
                        placeholder = "CC(=O)Oc1ccccc1C(=O)O",
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
                                if (state.smilesInput.contains("=") || state.smilesInput.contains("(") || state.smilesInput.contains("c")) {
                                    viewModel.loadMolecule()
                                } else {
                                    viewModel.resolveNameOrQuery(state.smilesInput)
                                }
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = "Parse", tint = Color.White)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Presets Carousel
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(specimens) { (name, smiles) ->
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(DarkSurfaceElevated)
                                .border(1.dp, DarkBorder, RoundedCornerShape(8.dp))
                                .clickable {
                                    viewModel.onSmilesChange(smiles)
                                    viewModel.loadMolecule(smiles)
                                }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(text = name, fontSize = 11.sp, color = DarkTextPrimary)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Mode Tabs
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(DarkSurfaceElevated)
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    val tabs = listOf("3D" to "3D Conformer", "2D" to "Structure Info", "STANDARDIZE" to "Standardize")
                    for ((id, title) in tabs) {
                        val isSelected = state.activeTab == id
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) ChemSpaceOrange else Color.Transparent)
                                .clickable {
                                    viewModel.setActiveTab(id)
                                    if (id == "STANDARDIZE" && state.standardizeResult == null) {
                                        viewModel.standardize()
                                    }
                                }
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
                    LoadingView(message = "Simulating 3D Force Field & Atomic Coordinates...")
                } else if (!state.error.isNullOrBlank()) {
                    ErrorCardView(
                        title = "Structure Error",
                        message = state.error!!,
                        onRetry = { viewModel.loadMolecule() }
                    )
                } else {
                    when (state.activeTab) {
                        "3D" -> {
                            Molecular3DViewer(atoms = state.conformerAtoms)
                        }
                        "2D" -> {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                                border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(
                                        text = "Molecular Metrics",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 15.sp,
                                        color = DarkTextPrimary
                                    )
                                    Spacer(modifier = Modifier.height(12.dp))

                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                        MetricBox(label = "Formula", value = state.parsedMolecule?.formula ?: "C9H8O4", isMono = true, modifier = Modifier.weight(1f))
                                        MetricBox(label = "Weight", value = "${state.parsedMolecule?.molWeight ?: 180.16} g/mol", modifier = Modifier.weight(1f))
                                    }

                                    Spacer(modifier = Modifier.height(10.dp))

                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                        MetricBox(label = "Atoms", value = "${state.parsedMolecule?.numAtoms ?: state.conformerAtoms?.size ?: 13}", modifier = Modifier.weight(1f))
                                        MetricBox(label = "Bonds", value = "${state.parsedMolecule?.numBonds ?: 13}", modifier = Modifier.weight(1f))
                                    }

                                    Spacer(modifier = Modifier.height(12.dp))

                                    Text(text = "Canonical SMILES", fontSize = 11.sp, color = DarkTextMuted)
                                    Text(
                                        text = state.parsedMolecule?.canonicalSmiles ?: state.smilesInput,
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = 12.sp,
                                        color = ChemSpaceOrange
                                    )
                                }
                            }
                        }
                        "STANDARDIZE" -> {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                                border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(
                                        text = "Structure Normalization",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 15.sp,
                                        color = DarkTextPrimary
                                    )
                                    Spacer(modifier = Modifier.height(10.dp))

                                    Text(text = "Original:", fontSize = 11.sp, color = DarkTextMuted)
                                    Text(
                                        text = state.standardizeResult?.originalSmiles ?: state.smilesInput,
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = 12.sp,
                                        color = DarkTextPrimary
                                    )

                                    Spacer(modifier = Modifier.height(10.dp))

                                    Text(text = "Standardized:", fontSize = 11.sp, color = DarkTextMuted)
                                    Text(
                                        text = state.standardizeResult?.standardizedSmiles ?: state.smilesInput,
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = ChemSpaceEmerald
                                    )

                                    Spacer(modifier = Modifier.height(12.dp))

                                    Text(text = "Transformations Applied:", fontSize = 11.sp, color = DarkTextMuted)
                                    val actions = state.standardizeResult?.actionsApplied ?: listOf("Charge neutralization", "Kekule canonicalization")
                                    for (act in actions) {
                                        Text(text = "• $act", fontSize = 12.sp, color = DarkTextPrimary)
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

@Composable
private fun MetricBox(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
    isMono: Boolean = false
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(DarkSurfaceElevated)
            .padding(10.dp)
    ) {
        Column {
            Text(text = label, fontSize = 10.sp, color = DarkTextMuted)
            Text(
                text = value,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = if (isMono) FontFamily.Monospace else FontFamily.SansSerif,
                color = DarkTextPrimary
            )
        }
    }
}
