package com.chemspace.app.ui.home.features

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
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chemspace.app.ui.components.ChemSpaceButton
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

data class ElementItem(
    val z: Int,
    val symbol: String,
    val name: String,
    val mass: Double,
    val category: String,
    val electronConfig: String,
    val electronegativity: Double? = null,
    val color: Color
)

private val SAMPLE_ELEMENTS = listOf(
    ElementItem(1, "H", "Hydrogen", 1.008, "Nonmetal", "1s¹", 2.20, Color(0xFF38BDF8)),
    ElementItem(2, "He", "Helium", 4.003, "Noble Gas", "1s²", null, Color(0xFFF43F5E)),
    ElementItem(3, "Li", "Lithium", 6.941, "Alkali Metal", "[He] 2s¹", 0.98, Color(0xFFEF4444)),
    ElementItem(4, "Be", "Beryllium", 9.012, "Alkaline Earth", "[He] 2s²", 1.57, Color(0xFFF59E0B)),
    ElementItem(5, "B", "Boron", 10.81, "Metalloid", "[He] 2s² 2p¹", 2.04, Color(0xFF10B981)),
    ElementItem(6, "C", "Carbon", 12.011, "Nonmetal", "[He] 2s² 2p²", 2.55, Color(0xFF38BDF8)),
    ElementItem(7, "N", "Nitrogen", 14.007, "Nonmetal", "[He] 2s² 2p³", 3.04, Color(0xFF38BDF8)),
    ElementItem(8, "O", "Oxygen", 15.999, "Nonmetal", "[He] 2s² 2p⁴", 3.44, Color(0xFF38BDF8)),
    ElementItem(9, "F", "Fluorine", 18.998, "Halogen", "[He] 2s² 2p⁵", 3.98, Color(0xFF8B5CF6)),
    ElementItem(10, "Ne", "Neon", 20.180, "Noble Gas", "[He] 2s² 2p⁶", null, Color(0xFFF43F5E)),
    ElementItem(11, "Na", "Sodium", 22.990, "Alkali Metal", "[Ne] 3s¹", 0.93, Color(0xFFEF4444)),
    ElementItem(12, "Mg", "Magnesium", 24.305, "Alkaline Earth", "[Ne] 3s²", 1.31, Color(0xFFF59E0B)),
    ElementItem(13, "Al", "Aluminum", 26.982, "Post-Transition", "[Ne] 3s² 3p¹", 1.61, Color(0xFF64748B)),
    ElementItem(14, "Si", "Silicon", 28.085, "Metalloid", "[Ne] 3s² 3p²", 1.90, Color(0xFF10B981)),
    ElementItem(15, "P", "Phosphorus", 30.974, "Nonmetal", "[Ne] 3s² 3p³", 2.19, Color(0xFF38BDF8)),
    ElementItem(16, "S", "Sulfur", 32.06, "Nonmetal", "[Ne] 3s² 3p⁴", 2.58, Color(0xFF38BDF8)),
    ElementItem(17, "Cl", "Chlorine", 35.45, "Halogen", "[Ne] 3s² 3p⁵", 3.16, Color(0xFF8B5CF6)),
    ElementItem(18, "Ar", "Argon", 39.948, "Noble Gas", "[Ne] 3s² 3p⁶", null, Color(0xFFF43F5E)),
    ElementItem(19, "K", "Potassium", 39.098, "Alkali Metal", "[Ar] 4s¹", 0.82, Color(0xFFEF4444)),
    ElementItem(20, "Ca", "Calcium", 40.078, "Alkaline Earth", "[Ar] 4s²", 1.00, Color(0xFFF59E0B)),
    ElementItem(26, "Fe", "Iron", 55.845, "Transition Metal", "[Ar] 3d⁶ 4s²", 1.83, Color(0xFFF97316)),
    ElementItem(29, "Cu", "Copper", 63.546, "Transition Metal", "[Ar] 3d¹⁰ 4s¹", 1.90, Color(0xFFF97316)),
    ElementItem(30, "Zn", "Zinc", 65.38, "Transition Metal", "[Ar] 3d¹⁰ 4s²", 1.65, Color(0xFFF97316)),
    ElementItem(47, "Ag", "Silver", 107.87, "Transition Metal", "[Kr] 4d¹⁰ 5s¹", 1.93, Color(0xFFF97316)),
    ElementItem(79, "Au", "Gold", 196.97, "Transition Metal", "[Xe] 4f¹⁴ 5d¹⁰ 6s¹", 2.54, Color(0xFFF97316)),
    ElementItem(82, "Pb", "Lead", 207.2, "Post-Transition", "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²", 2.33, Color(0xFF64748B)),
    ElementItem(92, "U", "Uranium", 238.03, "Actinide", "[Rn] 5f³ 6d¹ 7s²", 1.38, Color(0xFFD946EF))
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PeriodicTableScreen(
    onNavigateBack: () -> Unit
) {
    val categories = listOf("All", "Nonmetal", "Noble Gas", "Alkali Metal", "Alkaline Earth", "Metalloid", "Transition Metal", "Halogen")
    var selectedCategory by remember { mutableStateOf("All") }
    var inspectedElement by remember { mutableStateOf<ElementItem?>(null) }
    val sheetState = rememberModalBottomSheetState()

    val filtered = remember(selectedCategory) {
        if (selectedCategory == "All") SAMPLE_ELEMENTS
        else SAMPLE_ELEMENTS.filter { it.category == selectedCategory }
    }

    Scaffold(
        topBar = {
            ChemSpaceTopBar(
                title = "Dynamic Periodic Table",
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
                .padding(horizontal = 14.dp)
        ) {
            Text(
                text = "118 Elements IUPAC Matrix",
                color = ChemSpaceTextPrimaryDark,
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(top = 10.dp)
            )

            // Category filter chips
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(vertical = 10.dp)
            ) {
                items(categories) { category ->
                    val isSelected = category == selectedCategory
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .background(if (isSelected) ChemSpaceOrangePrimary else ChemSpaceSurfaceDark)
                            .border(1.dp, if (isSelected) ChemSpaceOrangeLight else ChemSpaceBorderDark, RoundedCornerShape(16.dp))
                            .clickable { selectedCategory = category }
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = category,
                            color = if (isSelected) Color.White else ChemSpaceTextSecondaryDark,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            // Elements Grid
            LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = 100.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(bottom = 20.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(filtered, key = { it.z }) { element ->
                    ElementGridCard(
                        element = element,
                        onClick = { inspectedElement = element }
                    )
                }
            }
        }

        // Element Inspector Sheet
        if (inspectedElement != null) {
            ModalBottomSheet(
                onDismissRequest = { inspectedElement = null },
                sheetState = sheetState,
                containerColor = ChemSpaceCardDark
            ) {
                ElementDetailSheet(
                    element = inspectedElement!!,
                    onDismiss = { inspectedElement = null }
                )
            }
        }
    }
}

@Composable
private fun ElementGridCard(
    element: ElementItem,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(10.dp))
            .background(ChemSpaceCardDark)
            .border(1.dp, element.color.copy(alpha = 0.35f), RoundedCornerShape(10.dp))
            .clickable(onClick = onClick)
            .padding(10.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${element.z}",
                    color = ChemSpaceTextSecondaryDark,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier.weight(1f)
                )

                Box(
                    modifier = Modifier
                        .size(6.dp)
                        .clip(RoundedCornerShape(3.dp))
                        .background(element.color)
                )
            }

            Text(
                text = element.symbol,
                color = Color.White,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.SansSerif,
                modifier = Modifier.padding(vertical = 2.dp)
            )

            Text(
                text = element.name,
                color = ChemSpaceTextSecondaryDark,
                fontSize = 11.sp,
                maxLines = 1
            )

            Text(
                text = "${element.mass}",
                color = ChemSpaceOrangeLight,
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
                modifier = Modifier.padding(top = 2.dp)
            )
        }
    }
}

@Composable
private fun ElementDetailSheet(
    element: ElementItem,
    onDismiss: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(ChemSpaceSurfaceDark)
                    .border(2.dp, element.color, RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(text = "${element.z}", color = ChemSpaceTextSecondaryDark, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                    Text(text = element.symbol, color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column {
                Text(text = element.name, color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                Text(text = element.category, color = element.color, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Properties table
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(10.dp))
                .background(ChemSpaceSurfaceDark)
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            PropertyRow("Atomic Number (Z)", "${element.z}")
            PropertyRow("Standard Atomic Weight", "${element.mass} u")
            PropertyRow("Ground State Electron Config", element.electronConfig)
            PropertyRow("Pauling Electronegativity", element.electronegativity?.toString() ?: "N/A (Noble gas)")
        }

        Spacer(modifier = Modifier.height(20.dp))

        ChemSpaceButton(
            text = "Close Inspector",
            onClick = onDismiss,
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
private fun PropertyRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, color = ChemSpaceTextSecondaryDark, fontSize = 12.sp, modifier = Modifier.weight(1f))
        Text(text = value, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, fontFamily = FontFamily.Monospace)
    }
}
