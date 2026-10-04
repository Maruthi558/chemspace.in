package com.chemspace.app.ui.home.features

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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material3.Icon
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chemspace.app.ui.components.ButtonVariant
import com.chemspace.app.ui.components.ChemSpaceButton
import com.chemspace.app.ui.components.ChemSpaceTextField
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

@Composable
fun IbmRxnScreen(
    onNavigateBack: () -> Unit
) {
    var targetMolecule by remember { mutableStateOf("Aspirin (C9H8O4)") }

    Scaffold(
        topBar = {
            ChemSpaceTopBar(
                title = "IBM RXN Retrosynthesis",
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
            Text(
                text = "Algorithmic Reaction Synthesis & Precursors",
                color = ChemSpaceTextPrimaryDark,
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Break down complex organic targets into commercially available precursor blocks with rule-based reaction mechanisms.",
                color = ChemSpaceTextSecondaryDark,
                fontSize = 12.sp,
                lineHeight = 16.sp,
                modifier = Modifier.padding(top = 2.dp, bottom = 14.dp)
            )

            ChemSpaceTextField(
                value = targetMolecule,
                onValueChange = { targetMolecule = it },
                label = "Target Molecule for Retrosynthesis",
                placeholder = "e.g. Aspirin, Paracetamol, Penicillin"
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Disconnection Tree Visualization
            Text("Retrosynthetic Pathway (Tree Depth: 1)", color = ChemSpaceTextPrimaryDark, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(10.dp))

            // Target Node
            RxnNode(
                title = "Target: Acetylsalicylic Acid (Aspirin)",
                formula = "C9H8O4",
                badge = "Target Product",
                badgeColor = ChemSpaceOrangePrimary
            )

            // Disconnection arrow
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("O-Acetylation (H₂SO₄ Cat., 60°C)", color = ChemSpaceEmeraldAccent, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                    Icon(
                        imageVector = Icons.Default.ArrowDownward,
                        contentDescription = null,
                        tint = ChemSpaceEmeraldAccent,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            // Precursors
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                RxnNode(
                    title = "Salicylic Acid",
                    formula = "C7H6O3",
                    badge = "Precursor 1",
                    badgeColor = ChemSpaceEmeraldAccent,
                    modifier = Modifier.weight(1f)
                )

                RxnNode(
                    title = "Acetic Anhydride",
                    formula = "C4H6O3",
                    badge = "Reagent 2",
                    badgeColor = Color(0xFF38BDF8),
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(18.dp))

            ChemSpaceButton(
                text = "Generate Multi-Step Pathway",
                onClick = { /* Run retrosynthesis */ },
                modifier = Modifier.fillMaxWidth(),
                variant = ButtonVariant.PRIMARY
            )
        }
    }
}

@Composable
private fun RxnNode(
    title: String,
    formula: String,
    badge: String,
    badgeColor: Color,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(ChemSpaceCardDark)
            .border(1.dp, ChemSpaceBorderDark, RoundedCornerShape(10.dp))
            .padding(12.dp)
    ) {
        Column {
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(4.dp))
                    .background(badgeColor.copy(alpha = 0.15f))
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            ) {
                Text(badge, color = badgeColor, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            }

            Text(
                text = title,
                color = Color.White,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(top = 6.dp)
            )

            Text(
                text = formula,
                color = ChemSpaceTextSecondaryDark,
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
                modifier = Modifier.padding(top = 2.dp)
            )
        }
    }
}
