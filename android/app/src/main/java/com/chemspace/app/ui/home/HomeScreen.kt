package com.chemspace.app.ui.home

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.Science
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chemspace.app.domain.model.ChemistryTool
import com.chemspace.app.domain.model.Molecule
import com.chemspace.app.ui.components.ChemSpaceButton
import com.chemspace.app.ui.components.ChemSpaceLogoMark
import com.chemspace.app.ui.components.ChemSpaceTopBar
import com.chemspace.app.ui.theme.ChemSpaceBackgroundDark
import com.chemspace.app.ui.theme.ChemSpaceBorderDark
import com.chemspace.app.ui.theme.ChemSpaceBorderSubtleDark
import com.chemspace.app.ui.theme.ChemSpaceCardDark
import com.chemspace.app.ui.theme.ChemSpaceEmeraldAccent
import com.chemspace.app.ui.theme.ChemSpaceOrangeLight
import com.chemspace.app.ui.theme.ChemSpaceOrangePrimary
import com.chemspace.app.ui.theme.ChemSpaceSurfaceDark
import com.chemspace.app.ui.theme.ChemSpaceSurfaceElevatedDark
import com.chemspace.app.ui.theme.ChemSpaceTextPrimaryDark
import com.chemspace.app.ui.theme.ChemSpaceTextSecondaryDark

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onNavigateToTool: (String) -> Unit,
    onLogout: () -> Unit
) {
    val user by viewModel.currentUser.collectAsState()
    val uiState by viewModel.uiState.collectAsState()
    val sheetState = rememberModalBottomSheetState()

    Scaffold(
        topBar = {
            ChemSpaceTopBar(
                title = "ChemSpace",
                showBackButton = false,
                actions = {
                    IconButton(onClick = { viewModel.logout(onLogout) }) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                            contentDescription = "Sign Out",
                            tint = ChemSpaceTextSecondaryDark
                        )
                    }
                }
            )
        },
        containerColor = ChemSpaceBackgroundDark
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 14.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 1. Hero Scientific Workspace Card
            item {
                HeroWorkspaceCard(
                    username = user?.username ?: "Scientist",
                    isOnline = uiState.isServerOnline,
                    latencyMs = uiState.serverLatencyMs
                )
            }

            // 2. Quick Scientific Metrics Ribbon
            item {
                ScientificMetricsRibbon()
            }

            // 3. Section Title: Core Chemistry Modules
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp, bottom = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Scientific Modules",
                        color = ChemSpaceTextPrimaryDark,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.weight(1f))
                    Text(
                        text = "8 Active Tools",
                        color = ChemSpaceOrangePrimary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // 4. The 8 Core ChemSpace Tools
            items(viewModel.tools, key = { it.id }) { tool ->
                ChemistryToolCard(
                    tool = tool,
                    onClick = { onNavigateToTool(tool.route) }
                )
            }

            // 5. Curated Specimens Section
            item {
                Text(
                    text = "Curated Molecular Specimens",
                    color = ChemSpaceTextPrimaryDark,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(top = 10.dp, bottom = 2.dp)
                )
            }

            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    contentPadding = PaddingValues(vertical = 4.dp)
                ) {
                    items(viewModel.curatedSpecimens, key = { it.name }) { molecule ->
                        SpecimenChipCard(
                            molecule = molecule,
                            onClick = { viewModel.selectSpecimen(molecule) }
                        )
                    }
                }
            }

            // Spacer for clean scrolling padding at the bottom
            item {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }

        // Molecule Details Bottom Sheet
        if (uiState.selectedSpecimen != null) {
            ModalBottomSheet(
                onDismissRequest = { viewModel.dismissSpecimen() },
                sheetState = sheetState,
                containerColor = ChemSpaceCardDark
            ) {
                MoleculeDetailSheet(
                    molecule = uiState.selectedSpecimen!!,
                    onDismiss = { viewModel.dismissSpecimen() }
                )
            }
        }
    }
}

@Composable
private fun HeroWorkspaceCard(
    username: String,
    isOnline: Boolean,
    latencyMs: Long
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(
                Brush.linearGradient(
                    colors = listOf(
                        ChemSpaceSurfaceElevatedDark,
                        ChemSpaceCardDark
                    )
                )
            )
            .border(1.dp, ChemSpaceBorderDark, RoundedCornerShape(16.dp))
            .padding(18.dp)
    ) {
        Column {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                ChemSpaceLogoMark(size = 38.dp, animated = false)

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Welcome, $username",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "ChemSpace Unified Scientific Environment",
                        color = ChemSpaceTextSecondaryDark,
                        fontSize = 12.sp
                    )
                }

                // Status pill
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(if (isOnline) ChemSpaceEmeraldAccent.copy(alpha = 0.15f) else Color(0x33EF4444))
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(6.dp)
                                .clip(CircleShape)
                                .background(if (isOnline) ChemSpaceEmeraldAccent else Color(0xFFEF4444))
                        )
                        Spacer(modifier = Modifier.width(5.dp))
                        Text(
                            text = if (isOnline) "Active" else "Offline",
                            color = if (isOnline) ChemSpaceEmeraldAccent else Color(0xFFEF4444),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "Access high-precision 2D/3D CAD drafting, RDKit cheminformatics descriptors, multi-modal spectroscopy, and quantum electronic structure solvers.",
                color = ChemSpaceTextSecondaryDark,
                fontSize = 13.sp,
                lineHeight = 18.sp
            )
        }
    }
}

@Composable
private fun ScientificMetricsRibbon() {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        MetricItem(title = "Modules", value = "8 Active", modifier = Modifier.weight(1f))
        MetricItem(title = "Elements", value = "118 IUPAC", modifier = Modifier.weight(1f))
        MetricItem(title = "CAD Core", value = "MMFF94", modifier = Modifier.weight(1f))
        MetricItem(title = "Solvers", value = "DFT / RXN", modifier = Modifier.weight(1f))
    }
}

@Composable
private fun MetricItem(
    title: String,
    value: String,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(ChemSpaceSurfaceDark)
            .border(1.dp, ChemSpaceBorderSubtleDark, RoundedCornerShape(10.dp))
            .padding(vertical = 10.dp, horizontal = 6.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = value,
                color = ChemSpaceOrangePrimary,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = title,
                color = ChemSpaceTextSecondaryDark,
                fontSize = 11.sp
            )
        }
    }
}

@Composable
private fun ChemistryToolCard(
    tool: ChemistryTool,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = ChemSpaceCardDark),
        border = BorderStroke(1.dp, ChemSpaceBorderDark)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = tool.title,
                        color = Color.White,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    // Badge
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(ChemSpaceOrangePrimary.copy(alpha = 0.15f))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = tool.badge,
                            color = ChemSpaceOrangeLight,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    Spacer(modifier = Modifier.width(6.dp))

                    // Formula watermark tag
                    Text(
                        text = tool.formulaTag,
                        color = ChemSpaceTextSecondaryDark.copy(alpha = 0.6f),
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }

                Text(
                    text = tool.subtitle,
                    color = ChemSpaceEmeraldAccent,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(top = 2.dp)
                )

                Text(
                    text = tool.description,
                    color = ChemSpaceTextSecondaryDark,
                    fontSize = 12.sp,
                    lineHeight = 16.sp,
                    modifier = Modifier.padding(top = 6.dp)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(ChemSpaceSurfaceElevatedDark),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = "Open ${tool.title}",
                    tint = ChemSpaceOrangePrimary,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}

@Composable
private fun SpecimenChipCard(
    molecule: Molecule,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .width(160.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(ChemSpaceSurfaceDark)
            .border(1.dp, ChemSpaceBorderDark, RoundedCornerShape(12.dp))
            .clickable(onClick = onClick)
            .padding(12.dp)
    ) {
        Column {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = molecule.name,
                    color = Color.White,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
            }

            Text(
                text = molecule.formula,
                color = ChemSpaceOrangePrimary,
                fontSize = 12.sp,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(top = 4.dp)
            )

            Text(
                text = "MW: ${molecule.molecularWeight} g/mol",
                color = ChemSpaceTextSecondaryDark,
                fontSize = 11.sp,
                modifier = Modifier.padding(top = 2.dp)
            )
        }
    }
}

@Composable
private fun MoleculeDetailSheet(
    molecule: Molecule,
    onDismiss: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp)
    ) {
        Text(
            text = molecule.name,
            color = Color.White,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold
        )

        Text(
            text = molecule.iupac,
            color = ChemSpaceEmeraldAccent,
            fontSize = 13.sp,
            fontWeight = FontWeight.Medium,
            modifier = Modifier.padding(top = 4.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Molecular properties grid
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(8.dp))
                    .background(ChemSpaceSurfaceDark)
                    .padding(10.dp)
            ) {
                Column {
                    Text("Formula", color = ChemSpaceTextSecondaryDark, fontSize = 11.sp)
                    Text(molecule.formula, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                }
            }

            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(8.dp))
                    .background(ChemSpaceSurfaceDark)
                    .padding(10.dp)
            ) {
                Column {
                    Text("Molar Mass", color = ChemSpaceTextSecondaryDark, fontSize = 11.sp)
                    Text("${molecule.molecularWeight} g/mol", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // SMILES Box
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(8.dp))
                .background(ChemSpaceSurfaceDark)
                .padding(12.dp)
        ) {
            Text("Canonical SMILES Notation", color = ChemSpaceTextSecondaryDark, fontSize = 11.sp)
            Text(
                text = molecule.smiles,
                color = ChemSpaceOrangeLight,
                fontSize = 13.sp,
                fontFamily = FontFamily.Monospace,
                modifier = Modifier.padding(top = 4.dp)
            )
        }

        if (molecule.description.isNotEmpty()) {
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = molecule.description,
                color = ChemSpaceTextSecondaryDark,
                fontSize = 13.sp,
                lineHeight = 18.sp
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        ChemSpaceButton(
            text = "Done",
            onClick = onDismiss,
            modifier = Modifier.fillMaxWidth()
        )
    }
}
