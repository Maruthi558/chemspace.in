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
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
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
import com.chemspace.app.ui.theme.ChemSpaceError
import com.chemspace.app.ui.theme.ChemSpaceOrange
import com.chemspace.app.ui.theme.DarkBackground
import com.chemspace.app.ui.theme.DarkBorder
import com.chemspace.app.ui.theme.DarkSurface
import com.chemspace.app.ui.theme.DarkSurfaceElevated
import com.chemspace.app.ui.theme.DarkTextMuted
import com.chemspace.app.ui.theme.DarkTextPrimary

@Composable
fun RdkitLabScreen(
    viewModel: RdkitLabViewModel,
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
                title = "RDKit Laboratory",
                subtitle = "High-Throughput Descriptors",
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
                    val tabs = listOf("PROPERTIES" to "Descriptors & Lipinski", "PYTHON_RUNNER" to "Python RDKit Sandbox")
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
                    "PROPERTIES" -> {
                        // Chemical Input
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            ChemSpaceTextField(
                                value = state.smilesInput,
                                onValueChange = { viewModel.onSmilesChange(it) },
                                label = "Molecular SMILES",
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
                                    .clickable(enabled = !state.isLoadingProperties) {
                                        viewModel.calculateProperties()
                                    },
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.PlayArrow, contentDescription = "Compute", tint = Color.White)
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        if (state.isLoadingProperties) {
                            LoadingView(message = "Evaluating Morgan fingerprints & topological descriptors...")
                        } else if (!state.error.isNullOrBlank()) {
                            ErrorCardView(title = "Descriptor Error", message = state.error!!, onRetry = { viewModel.calculateProperties() })
                        } else {
                            val p = state.properties
                            // Lipinski Status Card
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
                                        Text(
                                            text = "Lipinski Rule of 5 Compliance",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 14.sp,
                                            color = DarkTextPrimary
                                        )
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(6.dp))
                                                .background(if (p?.lipinskiPassed != false) ChemSpaceEmerald.copy(alpha = 0.2f) else ChemSpaceError.copy(alpha = 0.2f))
                                                .padding(horizontal = 8.dp, vertical = 4.dp)
                                        ) {
                                            Text(
                                                text = if (p?.lipinskiPassed != false) "PASSED" else "VIOLATED",
                                                fontFamily = FontFamily.Monospace,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 11.sp,
                                                color = if (p?.lipinskiPassed != false) ChemSpaceEmerald else ChemSpaceError
                                            )
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = "Criteria: MW ≤ 500, LogP ≤ 5, HBD ≤ 5, HBA ≤ 10",
                                        fontSize = 11.sp,
                                        color = DarkTextMuted
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(14.dp))

                            // Descriptors Grid
                            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                    DescriptorCard(label = "Molecular Weight", value = "${p?.molWeight ?: 180.16} g/mol", sub = "Rule ≤ 500", modifier = Modifier.weight(1f))
                                    DescriptorCard(label = "LogP (Lipophilicity)", value = "${p?.logP ?: 1.24}", sub = "Rule ≤ 5.0", modifier = Modifier.weight(1f))
                                }
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                    DescriptorCard(label = "TPSA (Polar Surface)", value = "${p?.tpsa ?: 63.6} Å²", sub = "Optimal < 140 Å²", modifier = Modifier.weight(1f))
                                    DescriptorCard(label = "QED Drug-likeness", value = "${p?.qed ?: 0.65}", sub = "Scale 0.0 - 1.0", modifier = Modifier.weight(1f))
                                }
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                    DescriptorCard(label = "H-Bond Donors (HBD)", value = "${p?.hbd ?: 1}", sub = "Rule ≤ 5", modifier = Modifier.weight(1f))
                                    DescriptorCard(label = "H-Bond Acceptors (HBA)", value = "${p?.hba ?: 4}", sub = "Rule ≤ 10", modifier = Modifier.weight(1f))
                                }
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                    DescriptorCard(label = "Rotatable Bonds", value = "${p?.rotatableBonds ?: 3}", sub = "Flexibility", modifier = Modifier.weight(1f))
                                    DescriptorCard(label = "Aromatic Rings", value = "${p?.aromaticRings ?: 1}", sub = "Conjugation", modifier = Modifier.weight(1f))
                                }
                            }
                        }
                    }

                    "PYTHON_RUNNER" -> {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
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
                                        text = "Python RDKit Editor",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        color = DarkTextPrimary
                                    )
                                    Text(
                                        text = "Python 3.11 Sandboxed",
                                        fontSize = 11.sp,
                                        fontFamily = FontFamily.Monospace,
                                        color = ChemSpaceCyan
                                    )
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                OutlinedTextField(
                                    value = state.pythonCode,
                                    onValueChange = { viewModel.onPythonCodeChange(it) },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(180.dp),
                                    textStyle = TextStyle(
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = 12.sp,
                                        color = DarkTextPrimary,
                                        lineHeight = 16.sp
                                    ),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedContainerColor = DarkSurfaceElevated,
                                        unfocusedContainerColor = DarkSurfaceElevated,
                                        focusedBorderColor = ChemSpaceOrange,
                                        unfocusedBorderColor = DarkBorder
                                    )
                                )

                                Spacer(modifier = Modifier.height(12.dp))

                                ChemSpaceButton(
                                    text = "Execute RDKit Script",
                                    onClick = { viewModel.runPythonScript() },
                                    isLoading = state.isRunningScript
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // Console Output Terminal
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF030507)),
                            border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text(
                                    text = "Terminal Output",
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = DarkTextMuted
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = state.pythonResult?.stdout ?: state.pythonResult?.stderr ?: "Click 'Execute RDKit Script' to run Python code against chemistry backend engine.",
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 12.sp,
                                    lineHeight = 16.sp,
                                    color = if (state.pythonResult?.stderr != null) ChemSpaceError else ChemSpaceEmerald
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun DescriptorCard(
    label: String,
    value: String,
    sub: String,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(DarkSurface)
            .border(1.dp, DarkBorder, RoundedCornerShape(12.dp))
            .padding(12.dp)
    ) {
        Column {
            Text(text = label, fontSize = 11.sp, color = DarkTextMuted)
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = ChemSpaceOrange,
                fontFamily = FontFamily.Monospace
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = sub, fontSize = 10.sp, color = ChemSpaceEmerald)
        }
    }
}
