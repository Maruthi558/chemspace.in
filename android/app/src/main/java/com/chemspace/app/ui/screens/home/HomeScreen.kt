package com.chemspace.app.ui.screens.home

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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Science
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chemspace.app.domain.model.Molecule
import com.chemspace.app.ui.components.ChemSpaceButton
import com.chemspace.app.ui.components.ChemSpaceButtonStyle
import com.chemspace.app.ui.components.ChemSpaceLogoMark
import com.chemspace.app.ui.components.ChemSpaceTopBar
import com.chemspace.app.ui.navigation.Screen
import com.chemspace.app.ui.theme.ChemSpaceCyan
import com.chemspace.app.ui.theme.ChemSpaceEmerald
import com.chemspace.app.ui.theme.ChemSpaceOrange
import com.chemspace.app.ui.theme.ChemSpaceOrangeLight
import com.chemspace.app.ui.theme.ChemSpacePurple
import com.chemspace.app.ui.theme.DarkBackground
import com.chemspace.app.ui.theme.DarkBorder
import com.chemspace.app.ui.theme.DarkSurface
import com.chemspace.app.ui.theme.DarkSurfaceElevated
import com.chemspace.app.ui.theme.DarkTextMuted
import com.chemspace.app.ui.theme.DarkTextPrimary

data class HomeModuleItem(
    val title: String,
    val subtitle: String,
    val route: String,
    val accentColor: Color,
    val iconName: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onNavigate: (String) -> Unit,
    onLogout: () -> Unit
) {
    val currentUser by viewModel.currentUser.collectAsState()
    val isDark by viewModel.isDarkTheme.collectAsState()
    val state by viewModel.uiState.collectAsState()

    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    val modules = listOf(
        HomeModuleItem("ChemNova AI", "Local Scientific Assistant", Screen.AiBot.route, ChemSpaceOrange, "AI"),
        HomeModuleItem("ChemDraw 2D/3D", "Molecular Structure & Conformer", Screen.ChemDraw.route, ChemSpaceEmerald, "3D"),
        HomeModuleItem("RDKit Laboratory", "Property Calculator & Python Sandbox", Screen.RdkitLab.route, ChemSpaceCyan, "LAB"),
        HomeModuleItem("Spectroscopy", "FT-IR, UV-Vis, 1H/13C NMR & MS", Screen.Spectroscopy.route, ChemSpacePurple, "SPEC"),
        HomeModuleItem("Quantum Engine", "DFT & HF Electronic Energy", Screen.Quantum.route, ChemSpaceOrange, "DFT"),
        HomeModuleItem("IBM RXN Synthesis", "Forward Prediction & Retrosynthesis", Screen.IbmRxn.route, ChemSpaceEmerald, "RXN"),
        HomeModuleItem("Periodic Matrix", "Interactive 118 Elements", Screen.PeriodicTable.route, ChemSpaceCyan, "118"),
        HomeModuleItem("Chemistry Search", "Morgan Fingerprint Similarity", Screen.ChemistrySearch.route, ChemSpacePurple, "SRCH"),
        HomeModuleItem("My Workspace", "History, Activity & Downloads", Screen.Workspace.route, ChemSpaceOrange, "WS")
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // App Bar
            ChemSpaceTopBar(
                title = "ChemSpace",
                subtitle = "Overview",
                actions = {
                    IconButton(onClick = { viewModel.toggleTheme() }, modifier = Modifier.size(36.dp)) {
                        Icon(
                            imageVector = if (isDark) Icons.Default.LightMode else Icons.Default.DarkMode,
                            contentDescription = "Toggle Theme",
                            tint = DarkTextPrimary
                        )
                    }
                    IconButton(onClick = { onNavigate(Screen.Settings.route) }, modifier = Modifier.size(36.dp)) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings", tint = DarkTextPrimary)
                    }
                    IconButton(onClick = { viewModel.logout(onLogout) }, modifier = Modifier.size(36.dp)) {
                        Icon(Icons.Default.ExitToApp, contentDescription = "Sign Out", tint = DarkTextMuted)
                    }
                }
            )

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            ) {
                // User & Workplace Banner
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
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(DarkSurfaceElevated)
                                .border(1.5.dp, ChemSpaceOrange, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = (currentUser?.name ?: currentUser?.username ?: "S").take(1).uppercase(),
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp,
                                color = ChemSpaceOrange
                            )
                        }

                        Spacer(modifier = Modifier.width(14.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = currentUser?.name ?: currentUser?.username ?: "Verified Scientist",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = DarkTextPrimary
                            )
                            Text(
                                text = currentUser?.workplace ?: "ChemSpace Molecular Institute",
                                fontSize = 12.sp,
                                color = DarkTextMuted
                            )
                        }

                        // Live Engine Status
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (state.isServerOnline) ChemSpaceEmerald.copy(alpha = 0.15f) else Color(0x33EF4444))
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = if (state.isServerOnline) "ONLINE" else "LOCAL",
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                color = if (state.isServerOnline) ChemSpaceEmerald else Color(0xFFEF4444)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Curated Molecular Specimens Section
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "MOLECULAR SPECIMENS",
                        fontSize = 12.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.SemiBold,
                        color = ChemSpaceOrange,
                        letterSpacing = 0.8.sp
                    )
                    Text(
                        text = "5 Reference Targets",
                        fontSize = 11.sp,
                        color = DarkTextMuted
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    contentPadding = PaddingValues(end = 8.dp)
                ) {
                    items(viewModel.curatedSpecimens) { specimen ->
                        SpecimenCard(
                            molecule = specimen,
                            onClick = { viewModel.selectMolecule(specimen) }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Scientific Tools Grid
                Text(
                    text = "CHEMISTRY TOOLKIT",
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.SemiBold,
                    color = ChemSpaceOrange,
                    letterSpacing = 0.8.sp
                )

                Spacer(modifier = Modifier.height(12.dp))

                // 2-Column Responsive Module Grid
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    val chunked = modules.chunked(2)
                    for (row in chunked) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            for (module in row) {
                                ModuleCard(
                                    item = module,
                                    onClick = { onNavigate(module.route) },
                                    modifier = Modifier.weight(1f)
                                )
                            }
                            if (row.size == 1) {
                                Spacer(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))
            }
        }

        // Molecule Detail Sheet
        state.selectedMolecule?.let { mol ->
            ModalBottomSheet(
                onDismissRequest = { viewModel.selectMolecule(null) },
                sheetState = sheetState,
                containerColor = DarkSurfaceElevated,
                contentColor = DarkTextPrimary
            ) {
                MoleculeDetailSheetContent(
                    molecule = mol,
                    onOpenChemDraw = {
                        viewModel.selectMolecule(null)
                        onNavigate(Screen.ChemDraw.route)
                    },
                    onOpenSpectra = {
                        viewModel.selectMolecule(null)
                        onNavigate(Screen.Spectroscopy.route)
                    },
                    onOpenQuantum = {
                        viewModel.selectMolecule(null)
                        onNavigate(Screen.Quantum.route)
                    },
                    onClose = { viewModel.selectMolecule(null) }
                )
            }
        }
    }
}

@Composable
private fun SpecimenCard(
    molecule: Molecule,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .width(140.dp)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = molecule.name,
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp,
                color = DarkTextPrimary
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = molecule.formula,
                fontFamily = FontFamily.Monospace,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = ChemSpaceOrange
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "${molecule.mw} g/mol",
                fontSize = 11.sp,
                color = DarkTextMuted
            )
        }
    }
}

@Composable
private fun ModuleCard(
    item: HomeModuleItem,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .height(115.dp)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(14.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(item.accentColor.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = item.iconName,
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        color = item.accentColor
                    )
                }

                Box(
                    modifier = Modifier
                        .size(6.dp)
                        .clip(CircleShape)
                        .background(item.accentColor)
                )
            }

            Column {
                Text(
                    text = item.title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = DarkTextPrimary
                )
                Text(
                    text = item.subtitle,
                    fontSize = 10.sp,
                    color = DarkTextMuted,
                    maxLines = 1
                )
            }
        }
    }
}

@Composable
private fun MoleculeDetailSheetContent(
    molecule: Molecule,
    onOpenChemDraw: () -> Unit,
    onOpenSpectra: () -> Unit,
    onOpenQuantum: () -> Unit,
    onClose: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = molecule.name,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = DarkTextPrimary
                )
                Text(
                    text = molecule.iupac,
                    fontSize = 12.sp,
                    color = ChemSpaceEmerald
                )
            }
            IconButton(onClick = onClose) {
                Icon(Icons.Default.Close, contentDescription = "Close", tint = DarkTextMuted)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Properties Grid
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(DarkSurface)
                    .padding(12.dp)
            ) {
                Column {
                    Text(text = "Formula", fontSize = 10.sp, color = DarkTextMuted)
                    Text(text = molecule.formula, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = ChemSpaceOrange, fontFamily = FontFamily.Monospace)
                }
            }
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(DarkSurface)
                    .padding(12.dp)
            ) {
                Column {
                    Text(text = "Molecular Weight", fontSize = 10.sp, color = DarkTextMuted)
                    Text(text = "${molecule.mw} g/mol", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = DarkTextPrimary)
                }
            }
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(DarkSurface)
                    .padding(12.dp)
            ) {
                Column {
                    Text(text = "Lipinski Rule of 5", fontSize = 10.sp, color = DarkTextMuted)
                    Text(text = if (molecule.ro5) "PASSED" else "VIOLATED", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = ChemSpaceEmerald, fontFamily = FontFamily.Monospace)
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Canonical SMILES
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(DarkSurface)
                .padding(12.dp)
        ) {
            Column {
                Text(text = "Canonical SMILES", fontSize = 10.sp, color = DarkTextMuted)
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = molecule.smiles,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    color = ChemSpaceOrangeLight
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Action Buttons to open in tools
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            ChemSpaceButton(
                text = "ChemDraw 3D",
                onClick = onOpenChemDraw,
                modifier = Modifier.weight(1f)
            )
            ChemSpaceButton(
                text = "Spectroscopy",
                onClick = onOpenSpectra,
                style = ChemSpaceButtonStyle.OUTLINE,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        ChemSpaceButton(
            text = "Calculate Quantum DFT",
            onClick = onOpenQuantum,
            style = ChemSpaceButtonStyle.SECONDARY
        )

        Spacer(modifier = Modifier.height(16.dp))
    }
}
