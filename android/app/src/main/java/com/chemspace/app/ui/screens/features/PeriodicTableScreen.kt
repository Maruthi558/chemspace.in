package com.chemspace.app.ui.screens.features

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
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
import com.chemspace.app.domain.model.PeriodicElement
import com.chemspace.app.ui.components.ChemSpaceTopBar
import com.chemspace.app.ui.theme.ChemSpaceEmerald
import com.chemspace.app.ui.theme.ChemSpaceOrange
import com.chemspace.app.ui.theme.DarkBackground
import com.chemspace.app.ui.theme.DarkBorder
import com.chemspace.app.ui.theme.DarkSurface
import com.chemspace.app.ui.theme.DarkSurfaceElevated
import com.chemspace.app.ui.theme.DarkTextMuted
import com.chemspace.app.ui.theme.DarkTextPrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PeriodicTableScreen(
    viewModel: PeriodicTableViewModel,
    onBack: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val filtered = viewModel.getFilteredElements()
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            ChemSpaceTopBar(
                title = "Periodic Matrix",
                subtitle = "118 Chemical Elements",
                onBackClick = onBack
            )

            // Search Bar
            OutlinedTextField(
                value = state.searchQuery,
                onValueChange = { viewModel.onSearchChange(it) },
                placeholder = { Text("Search by element, symbol, atomic number...", fontSize = 12.sp, color = DarkTextMuted) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = DarkTextMuted, modifier = Modifier.size(18.dp)) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = DarkSurface,
                    unfocusedContainerColor = DarkSurface,
                    focusedBorderColor = ChemSpaceOrange,
                    unfocusedBorderColor = DarkBorder,
                    cursorColor = ChemSpaceOrange
                ),
                singleLine = true
            )

            // Category Filter Chips
            LazyRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(viewModel.categories) { cat ->
                    val isSelected = state.selectedCategory == cat
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isSelected) ChemSpaceOrange else DarkSurfaceElevated)
                            .border(1.dp, if (isSelected) ChemSpaceOrange else DarkBorder, RoundedCornerShape(8.dp))
                            .clickable { viewModel.onCategoryChange(cat) }
                            .padding(horizontal = 10.dp, vertical = 5.dp)
                    ) {
                        Text(
                            text = cat,
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            color = if (isSelected) Color.White else DarkTextPrimary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Grid of Elements
            LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = 78.dp),
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(vertical = 8.dp)
            ) {
                items(filtered) { el ->
                    ElementTile(
                        element = el,
                        onClick = { viewModel.selectElement(el) }
                    )
                }
            }
        }

        // Element Inspector Sheet
        state.selectedElement?.let { el ->
            ModalBottomSheet(
                onDismissRequest = { viewModel.selectElement(null) },
                sheetState = sheetState,
                containerColor = DarkSurfaceElevated,
                contentColor = DarkTextPrimary
            ) {
                ElementDetailContent(element = el, onClose = { viewModel.selectElement(null) })
            }
        }
    }
}

@Composable
private fun ElementTile(
    element: PeriodicElement,
    onClick: () -> Unit
) {
    val catColor = try {
        Color(android.graphics.Color.parseColor(element.colorHex))
    } catch (e: Exception) {
        ChemSpaceOrange
    }

    Card(
        modifier = Modifier
            .height(84.dp)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        border = androidx.compose.foundation.BorderStroke(1.dp, catColor.copy(alpha = 0.5f))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(6.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "${element.z}",
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace,
                    color = DarkTextMuted
                )
                Box(
                    modifier = Modifier
                        .size(6.dp)
                        .clip(RoundedCornerShape(3.dp))
                        .background(catColor)
                )
            }

            Text(
                text = element.symbol,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                fontFamily = FontFamily.Monospace,
                color = catColor,
                modifier = Modifier.align(Alignment.CenterHorizontally)
            )

            Text(
                text = element.name,
                fontSize = 9.sp,
                color = DarkTextPrimary,
                maxLines = 1,
                modifier = Modifier.align(Alignment.CenterHorizontally)
            )
        }
    }
}

@Composable
private fun ElementDetailContent(
    element: PeriodicElement,
    onClose: () -> Unit
) {
    val catColor = try {
        Color(android.graphics.Color.parseColor(element.colorHex))
    } catch (e: Exception) {
        ChemSpaceOrange
    }

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
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(54.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(catColor.copy(alpha = 0.15f))
                        .border(1.5.dp, catColor, RoundedCornerShape(12.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = element.symbol,
                        fontWeight = FontWeight.Bold,
                        fontSize = 24.sp,
                        fontFamily = FontFamily.Monospace,
                        color = catColor
                    )
                }

                Spacer(modifier = Modifier.width(14.dp))

                Column {
                    Text(
                        text = element.name,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = DarkTextPrimary
                    )
                    Text(
                        text = "${element.category} • Z = ${element.z}",
                        fontSize = 12.sp,
                        color = catColor
                    )
                }
            }

            IconButton(onClick = onClose) {
                Icon(Icons.Default.Close, contentDescription = "Close", tint = DarkTextMuted)
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Properties Grid
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(10.dp))
                    .background(DarkSurface)
                    .padding(10.dp)
            ) {
                Column {
                    Text(text = "Atomic Mass", fontSize = 10.sp, color = DarkTextMuted)
                    Text(text = "${element.mass} u", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = DarkTextPrimary, fontFamily = FontFamily.Monospace)
                }
            }
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(10.dp))
                    .background(DarkSurface)
                    .padding(10.dp)
            ) {
                Column {
                    Text(text = "Electronegativity", fontSize = 10.sp, color = DarkTextMuted)
                    Text(text = "${element.electronegativity ?: "N/A"}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = ChemSpaceEmerald, fontFamily = FontFamily.Monospace)
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(10.dp))
                .background(DarkSurface)
                .padding(12.dp)
        ) {
            Column {
                Text(text = "Electron Configuration", fontSize = 10.sp, color = DarkTextMuted)
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = element.electronConfig.ifBlank { "[Core] Valence Orbitals" },
                    fontSize = 13.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.SemiBold,
                    color = ChemSpaceOrange
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(10.dp))
                .background(DarkSurface)
                .padding(12.dp)
        ) {
            Column {
                Text(text = "Scientific Summary & Properties", fontSize = 10.sp, color = DarkTextMuted)
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = element.summary,
                    fontSize = 12.sp,
                    lineHeight = 18.sp,
                    color = DarkTextPrimary
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
    }
}
