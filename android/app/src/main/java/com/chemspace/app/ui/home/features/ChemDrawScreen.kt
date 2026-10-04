package com.chemspace.app.ui.home.features

import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Architecture
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import com.chemspace.app.ui.components.ButtonVariant
import com.chemspace.app.ui.components.ChemSpaceButton
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
import kotlin.math.cos
import kotlin.math.sin

data class TemplateItem(val name: String, val formula: String, val smiles: String)

private val DRAW_TEMPLATES = listOf(
    TemplateItem("Benzene", "C6H6", "c1ccccc1"),
    TemplateItem("Cyclohexane", "C6H12", "C1CCCCC1"),
    TemplateItem("Pyridine", "C5H5N", "c1ccncc1"),
    TemplateItem("Naphthalene", "C10H8", "c1ccc2ccccc2c1"),
    TemplateItem("Acetone", "C3H6O", "CC(=O)C"),
    TemplateItem("Ethanol", "C2H6O", "CCO")
)

@Composable
fun ChemDrawScreen(
    onNavigateBack: () -> Unit
) {
    var selectedTemplate by remember { mutableStateOf(DRAW_TEMPLATES[0]) }
    var activeMode by remember { mutableStateOf("2D Drafting") }

    Scaffold(
        topBar = {
            ChemSpaceTopBar(
                title = "ChemDraw CAD Studio",
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
            // Header Info
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Vector 2D Drafting & MMFF94",
                        color = ChemSpaceTextPrimaryDark,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Precision bond angle geometry with automatic Kekulé valence verification.",
                        color = ChemSpaceTextSecondaryDark,
                        fontSize = 12.sp,
                        lineHeight = 16.sp,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(ChemSpaceOrangePrimary.copy(alpha = 0.15f))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "sp³ · MMFF94",
                        color = ChemSpaceOrangeLight,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Mode Selector (2D Drafting vs 3D Conformer)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(40.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(ChemSpaceSurfaceDark)
                    .padding(4.dp)
            ) {
                listOf("2D Drafting", "3D Conformer").forEach { mode ->
                    val isSelected = activeMode == mode
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(6.dp))
                            .background(if (isSelected) ChemSpaceSurfaceElevatedDark else Color.Transparent)
                            .clickable { activeMode = mode },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = mode,
                            color = if (isSelected) ChemSpaceOrangePrimary else ChemSpaceTextSecondaryDark,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Canvas Workspace
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(260.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(ChemSpaceCardDark)
                    .border(1.dp, ChemSpaceBorderDark, RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                // Chemical structure vector render
                Canvas(modifier = Modifier.size(200.dp)) {
                    val cx = size.width / 2f
                    val cy = size.height / 2f
                    val radius = 60.dp.toPx()

                    // Draw ring geometry
                    val sides = if (selectedTemplate.name == "Pyridine" || selectedTemplate.name == "Benzene" || selectedTemplate.name == "Cyclohexane") 6 else 4
                    val points = List(sides) { i ->
                        val angle = Math.toRadians((i * (360.0 / sides) - 90.0))
                        Offset(
                            x = cx + radius * cos(angle).toFloat(),
                            y = cy + radius * sin(angle).toFloat()
                        )
                    }

                    for (i in points.indices) {
                        val p1 = points[i]
                        val p2 = points[(i + 1) % points.size]
                        drawLine(
                            color = ChemSpaceOrangePrimary,
                            start = p1,
                            end = p2,
                            strokeWidth = 3.dp.toPx(),
                            cap = StrokeCap.Round
                        )
                    }

                    for (p in points) {
                        drawCircle(
                            color = ChemSpaceEmeraldAccent,
                            radius = 5.dp.toPx(),
                            center = p
                        )
                    }
                }

                // Watermark info
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(10.dp)
                ) {
                    Text(
                        text = "SMILES: ${selectedTemplate.smiles}",
                        color = ChemSpaceTextSecondaryDark.copy(alpha = 0.7f),
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "Molecular Ring Templates",
                color = ChemSpaceTextPrimaryDark,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold
            )

            // Ring Templates List
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(vertical = 8.dp)
            ) {
                items(DRAW_TEMPLATES) { template ->
                    val isSelected = template.name == selectedTemplate.name
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isSelected) ChemSpaceOrangePrimary.copy(alpha = 0.2f) else ChemSpaceSurfaceDark)
                            .border(1.dp, if (isSelected) ChemSpaceOrangePrimary else ChemSpaceBorderDark, RoundedCornerShape(8.dp))
                            .clickable { selectedTemplate = template }
                            .padding(horizontal = 12.dp, vertical = 8.dp)
                    ) {
                        Column {
                            Text(
                                text = template.name,
                                color = if (isSelected) ChemSpaceOrangeLight else Color.White,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = template.formula,
                                color = ChemSpaceTextSecondaryDark,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                ChemSpaceButton(
                    text = "Generate 3D Conformer",
                    onClick = { /* Optimize conformer */ },
                    modifier = Modifier.weight(1f),
                    variant = ButtonVariant.PRIMARY
                )

                ChemSpaceButton(
                    text = "Export SMILES",
                    onClick = { /* Export */ },
                    modifier = Modifier.weight(1f),
                    variant = ButtonVariant.SECONDARY
                )
            }
        }
    }
}
