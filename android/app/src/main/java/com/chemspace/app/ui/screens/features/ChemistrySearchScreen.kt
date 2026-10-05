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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.LinearProgressIndicator
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
fun ChemistrySearchScreen(
    viewModel: ChemistrySearchViewModel,
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
                title = "Chemistry Search",
                subtitle = "Tanimoto & Substructure Matching",
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
                    val tabs = listOf("SIMILARITY" to "Morgan Similarity", "SUBSTRUCTURE" to "SMARTS Substructure")
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
                    "SIMILARITY" -> {
                        ChemSpaceTextField(
                            value = state.queryInput,
                            onValueChange = { viewModel.onQueryChange(it) },
                            label = "Query Molecular SMILES",
                            placeholder = "CC(=O)Oc1ccccc1C(=O)O",
                            isMonospace = true
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        ChemSpaceButton(
                            text = "Calculate Tanimoto Similarity",
                            onClick = { viewModel.runSimilaritySearch() },
                            isLoading = state.isLoading
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        if (state.isLoading) {
                            LoadingView(message = "Generating Morgan bit vectors & calculating Tanimoto coefficients...")
                        } else if (!state.error.isNullOrBlank()) {
                            ErrorCardView(title = "Search Error", message = state.error!!, onRetry = { viewModel.runSimilaritySearch() })
                        } else {
                            Text(
                                text = "MATCHED CANDIDATES (${state.similarityResults.size})",
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                color = ChemSpaceOrange,
                                fontWeight = FontWeight.SemiBold
                            )
                            Spacer(modifier = Modifier.height(8.dp))

                            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                for (hit in state.similarityResults) {
                                    Card(
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = RoundedCornerShape(14.dp),
                                        colors = CardDefaults.cardColors(containerColor = DarkSurface),
                                        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
                                    ) {
                                        Column(modifier = Modifier.padding(14.dp)) {
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.SpaceBetween,
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Text(
                                                    text = hit.name ?: "Candidate Compound",
                                                    fontWeight = FontWeight.Bold,
                                                    fontSize = 13.sp,
                                                    color = DarkTextPrimary
                                                )
                                                Text(
                                                    text = "${(hit.score * 100).toInt()}% Match",
                                                    fontSize = 12.sp,
                                                    fontFamily = FontFamily.Monospace,
                                                    fontWeight = FontWeight.Bold,
                                                    color = if (hit.score >= 0.8) ChemSpaceEmerald else ChemSpaceOrange
                                                )
                                            }

                                            Spacer(modifier = Modifier.height(8.dp))

                                            LinearProgressIndicator(
                                                progress = { hit.score.toFloat() },
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .height(6.dp)
                                                    .clip(RoundedCornerShape(3.dp)),
                                                color = if (hit.score >= 0.8) ChemSpaceEmerald else ChemSpaceOrange,
                                                trackColor = DarkSurfaceElevated
                                            )

                                            Spacer(modifier = Modifier.height(8.dp))

                                            Text(
                                                text = hit.smiles,
                                                fontFamily = FontFamily.Monospace,
                                                fontSize = 11.sp,
                                                color = DarkTextMuted
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    "SUBSTRUCTURE" -> {
                        ChemSpaceTextField(
                            value = state.smartsInput,
                            onValueChange = { viewModel.onSmartsChange(it) },
                            label = "SMARTS Query Pattern",
                            placeholder = "c1ccccc1 (Aromatic 6-ring)",
                            isMonospace = true
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        ChemSpaceButton(
                            text = "Find Substructure Matches",
                            onClick = { viewModel.runSubstructureSearch() },
                            isLoading = state.isLoading
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        if (state.isLoading) {
                            LoadingView(message = "Matching Subgraph Isomorphisms...")
                        } else if (!state.error.isNullOrBlank()) {
                            ErrorCardView(title = "Substructure Error", message = state.error!!, onRetry = { viewModel.runSubstructureSearch() })
                        } else {
                            Text(
                                text = "SCREENED SPECIMENS (${state.substructureResults.size})",
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                color = ChemSpaceOrange,
                                fontWeight = FontWeight.SemiBold
                            )
                            Spacer(modifier = Modifier.height(8.dp))

                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                for (sub in state.substructureResults) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(DarkSurface)
                                            .border(1.dp, DarkBorder, RoundedCornerShape(12.dp))
                                            .padding(12.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = sub.smiles,
                                            fontFamily = FontFamily.Monospace,
                                            fontSize = 11.sp,
                                            color = DarkTextPrimary,
                                            modifier = Modifier.weight(1f)
                                        )
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(6.dp))
                                                .background(if (sub.matches) ChemSpaceEmerald.copy(alpha = 0.15f) else Color(0x33EF4444))
                                                .padding(horizontal = 8.dp, vertical = 4.dp)
                                        ) {
                                            Text(
                                                text = if (sub.matches) "MATCH" else "NO MATCH",
                                                fontFamily = FontFamily.Monospace,
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = if (sub.matches) ChemSpaceEmerald else Color(0xFFEF4444)
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
