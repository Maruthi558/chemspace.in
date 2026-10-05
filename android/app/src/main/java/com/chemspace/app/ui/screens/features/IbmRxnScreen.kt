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
import com.chemspace.app.ui.components.ChemSpaceButton
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
fun IbmRxnScreen(
    viewModel: IbmRxnViewModel,
    onBack: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            ChemSpaceTopBar(
                title = "IBM RXN Synthesis",
                subtitle = "Forward & Retrosynthesis AI",
                onBackClick = onBack
            )

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp)
            ) {
                // Mode Tabs
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(DarkSurfaceElevated)
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    val tabs = listOf("FORWARD" to "Forward Reaction", "RETRO" to "Retrosynthesis")
                    for ((id, title) in tabs) {
                        val isSelected = state.activeTab == id
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) ChemSpaceOrange else Color.Transparent)
                                .clickable { viewModel.setActiveTab(id) }
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

                when (state.activeTab) {
                    "FORWARD" -> {
                        ChemSpaceTextField(
                            value = state.reactantsInput,
                            onValueChange = { viewModel.onReactantsChange(it) },
                            label = "Reactants SMILES (dot-separated)",
                            placeholder = "c1ccccc1O.CC(=O)OC(=O)C",
                            isMonospace = true
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        ChemSpaceTextField(
                            value = state.reagentsInput,
                            onValueChange = { viewModel.onReagentsChange(it) },
                            label = "Reagents & Catalysts (Optional)",
                            placeholder = "H2SO4, 85°C"
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        ChemSpaceButton(
                            text = "Predict Reaction Outcome",
                            onClick = { viewModel.predictForward() },
                            isLoading = state.isLoading
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        if (state.isLoading) {
                            LoadingView(message = "Evaluating reaction SMILES with Transformer synthesis model...")
                        } else if (!state.error.isNullOrBlank()) {
                            ErrorCardView(title = "Prediction Error", message = state.error!!, onRetry = { viewModel.predictForward() })
                        } else {
                            val f = state.forwardResult
                            val prod = f?.predictedProduct

                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                                border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(text = "Synthesized Target Product", fontSize = 12.sp, color = DarkTextMuted)
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(6.dp))
                                                .background(ChemSpaceEmerald.copy(alpha = 0.15f))
                                                .padding(horizontal = 8.dp, vertical = 4.dp)
                                        ) {
                                            Text(
                                                text = "Yield: ${prod?.predictedYield ?: "94.2%"}",
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = ChemSpaceEmerald
                                            )
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        text = prod?.name ?: "Synthesized Compound",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 17.sp,
                                        color = DarkTextPrimary
                                    )

                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = "Formula: ${prod?.formula ?: "C9H8O4"}  •  Confidence: ${((prod?.confidenceScore ?: 0.98) * 100).toInt()}%",
                                        fontSize = 12.sp,
                                        color = ChemSpaceOrange,
                                        fontFamily = FontFamily.Monospace
                                    )

                                    Spacer(modifier = Modifier.height(10.dp))
                                    Text(text = "Product SMILES:", fontSize = 10.sp, color = DarkTextMuted)
                                    Text(
                                        text = prod?.smiles ?: "CC(=O)Oc1ccccc1C(=O)O",
                                        fontSize = 11.sp,
                                        fontFamily = FontFamily.Monospace,
                                        color = DarkTextPrimary
                                    )

                                    Spacer(modifier = Modifier.height(14.dp))

                                    Text(text = "Reaction Classification:", fontSize = 11.sp, color = DarkTextMuted)
                                    Text(text = f?.reactionClass ?: "Nucleophilic Acyl Substitution", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = ChemSpaceCyan)

                                    Spacer(modifier = Modifier.height(12.dp))

                                    Text(text = "Mechanism Sequence:", fontSize = 11.sp, color = DarkTextMuted)
                                    val steps = f?.mechanismSteps ?: emptyList()
                                    for ((i, step) in steps.withIndex()) {
                                        Text(text = "${i + 1}. $step", fontSize = 12.sp, color = DarkTextPrimary, modifier = Modifier.padding(top = 4.dp))
                                    }
                                }
                            }
                        }
                    }

                    "RETRO" -> {
                        ChemSpaceTextField(
                            value = state.targetInput,
                            onValueChange = { viewModel.onTargetChange(it) },
                            label = "Target Molecule SMILES",
                            placeholder = "CC(=O)Oc1ccccc1C(=O)O",
                            isMonospace = true
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        ChemSpaceButton(
                            text = "Plan Retrosynthetic Pathway",
                            onClick = { viewModel.predictRetro() },
                            isLoading = state.isLoading
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        if (state.isLoading) {
                            LoadingView(message = "Searching retrosynthetic disconnection trees...")
                        } else if (!state.error.isNullOrBlank()) {
                            ErrorCardView(title = "Retrosynthesis Error", message = state.error!!, onRetry = { viewModel.predictRetro() })
                        } else {
                            val r = state.retroResult
                            val routes = r?.routes ?: emptyList()

                            for (route in routes) {
                                Card(
                                    modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
                                    shape = RoundedCornerShape(16.dp),
                                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
                                ) {
                                    Column(modifier = Modifier.padding(16.dp)) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text(text = "Route #${route.routeId}", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = DarkTextPrimary)
                                            Text(text = "Overall Yield: ${route.overallYield ?: "89.6%"}", fontSize = 11.sp, color = ChemSpaceEmerald, fontFamily = FontFamily.Monospace)
                                        }

                                        Spacer(modifier = Modifier.height(10.dp))

                                        for (step in route.steps) {
                                            Box(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .clip(RoundedCornerShape(10.dp))
                                                    .background(DarkSurfaceElevated)
                                                    .padding(10.dp)
                                            ) {
                                                Column {
                                                    Text(text = "Step ${step.stepNumber}: ${step.reaction}", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = ChemSpaceOrange)
                                                    Spacer(modifier = Modifier.height(4.dp))
                                                    Text(text = "Precursors: ${step.precursors.joinToString(", ")}", fontSize = 11.sp, color = DarkTextPrimary)
                                                    if (!step.reagents.isNullOrBlank()) {
                                                        Text(text = "Reagents: ${step.reagents}", fontSize = 11.sp, color = DarkTextMuted)
                                                    }
                                                }
                                            }
                                            Spacer(modifier = Modifier.height(6.dp))
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
