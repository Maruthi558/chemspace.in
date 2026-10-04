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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
fun QuantumScreen(
    onNavigateBack: () -> Unit
) {
    val functionals = listOf("B3LYP", "PBE0", "HF", "ωB97X-D")
    val basisSets = listOf("6-31G(d)", "6-311+G(d,p)", "def2-SVP", "cc-pVDZ")
    var selectedFunctional by remember { mutableStateOf(functionals[0]) }
    var selectedBasis by remember { mutableStateOf(basisSets[0]) }

    Scaffold(
        topBar = {
            ChemSpaceTopBar(
                title = "DFT Quantum Chemistry",
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
                text = "Ab-Initio Electronic Wavefunctions & Orbitals",
                color = ChemSpaceTextPrimaryDark,
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Compute HOMO-LUMO electronic bandgaps, Slater basis wavefunctions, and dipole moments using Density Functional Theory.",
                color = ChemSpaceTextSecondaryDark,
                fontSize = 12.sp,
                lineHeight = 16.sp,
                modifier = Modifier.padding(top = 2.dp, bottom = 14.dp)
            )

            // Functional Selector
            Text("Exchange-Correlation Functional", color = ChemSpaceTextSecondaryDark, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                functionals.forEach { f ->
                    val isSelected = f == selectedFunctional
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isSelected) ChemSpaceOrangePrimary else ChemSpaceSurfaceDark)
                            .border(1.dp, if (isSelected) ChemSpaceOrangeLight else ChemSpaceBorderDark, RoundedCornerShape(8.dp))
                            .clickable { selectedFunctional = f }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(f, color = if (isSelected) Color.White else ChemSpaceTextSecondaryDark, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Basis Set Selector
            Text("Atomic Orbital Basis Set", color = ChemSpaceTextSecondaryDark, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                basisSets.forEach { b ->
                    val isSelected = b == selectedBasis
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isSelected) ChemSpaceEmeraldAccent.copy(alpha = 0.2f) else ChemSpaceSurfaceDark)
                            .border(1.dp, if (isSelected) ChemSpaceEmeraldAccent else ChemSpaceBorderDark, RoundedCornerShape(8.dp))
                            .clickable { selectedBasis = b }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(b, color = if (isSelected) ChemSpaceEmeraldAccent else ChemSpaceTextSecondaryDark, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, fontFamily = FontFamily.Monospace)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // DFT Calculated Results Card
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(ChemSpaceCardDark)
                    .border(1.dp, ChemSpaceBorderDark, RoundedCornerShape(12.dp))
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Ground State Convergence (SCF)",
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.weight(1f)
                    )
                    Text(
                        text = "10⁻⁸ Hartree",
                        color = ChemSpaceEmeraldAccent,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }

                QuantumMetricRow("Total Electronic Energy (E_tot)", "-648.29144 Hartree")
                QuantumMetricRow("Highest Occupied Orbital (HOMO)", "-0.2642 Hartree (-7.19 eV)")
                QuantumMetricRow("Lowest Unoccupied Orbital (LUMO)", "-0.0521 Hartree (-1.42 eV)")
                QuantumMetricRow("HOMO-LUMO Energy Gap (ΔE_HL)", "5.77 eV (46,538 cm⁻¹)")
                QuantumMetricRow("Dipole Moment (|μ|)", "2.84 Debye")
                QuantumMetricRow("Polarizability (α_iso)", "112.4 a.u.")
            }

            Spacer(modifier = Modifier.height(16.dp))

            ChemSpaceButton(
                text = "Run Electronic SCF Calculation",
                onClick = { /* Run SCF */ },
                modifier = Modifier.fillMaxWidth(),
                variant = ButtonVariant.PRIMARY
            )
        }
    }
}

@Composable
private fun QuantumMetricRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(ChemSpaceSurfaceDark)
            .padding(horizontal = 12.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, color = ChemSpaceTextSecondaryDark, fontSize = 11.sp, modifier = Modifier.weight(1f))
        Text(value, color = ChemSpaceOrangeLight, fontSize = 12.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
    }
}
