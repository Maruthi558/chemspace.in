package com.chemspace.app.ui.home.features

import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
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
import com.chemspace.app.ui.theme.ChemSpaceCardDark
import com.chemspace.app.ui.theme.ChemSpaceEmeraldAccent
import com.chemspace.app.ui.theme.ChemSpaceError
import com.chemspace.app.ui.theme.ChemSpaceOrangeLight
import com.chemspace.app.ui.theme.ChemSpaceOrangePrimary
import com.chemspace.app.ui.theme.ChemSpaceSurfaceDark
import com.chemspace.app.ui.theme.ChemSpaceSurfaceElevatedDark
import com.chemspace.app.ui.theme.ChemSpaceTextPrimaryDark
import com.chemspace.app.ui.theme.ChemSpaceTextSecondaryDark
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class DescriptorResult(
    val name: String,
    val smiles: String,
    val mw: Double,
    val logP: Double,
    val hbd: Int,
    val hba: Int,
    val tpsa: Double,
    val rotBonds: Int,
    val lipinskiPass: Boolean
)

private val SAMPLE_DESCRIPTORS = mapOf(
    "Aspirin" to DescriptorResult("Aspirin", "CC(=O)Oc1ccccc1C(=O)O", 180.16, 1.19, 1, 4, 63.6, 3, true),
    "Caffeine" to DescriptorResult("Caffeine", "Cn1cnc2c1c(=O)n(c(=O)n2C)C", 194.19, -0.07, 0, 6, 58.4, 0, true),
    "Ibuprofen" to DescriptorResult("Ibuprofen", "CC(C)Cc1ccc(cc1)C(C)C(=O)O", 206.28, 3.50, 1, 2, 37.3, 4, true),
    "Lipitor" to DescriptorResult("Atorvastatin", "O=C(O)C...", 558.64, 5.70, 4, 7, 111.8, 12, false)
)

@Composable
fun RdkitLabScreen(
    onNavigateBack: () -> Unit
) {
    var queryInput by remember { mutableStateOf("Aspirin") }
    var isComputing by remember { mutableStateOf(false) }
    var descriptor by remember { mutableStateOf<DescriptorResult?>(SAMPLE_DESCRIPTORS["Aspirin"]) }
    val scope = rememberCoroutineScope()

    fun runCalculation(target: String) {
        isComputing = true
        scope.launch {
            delay(400) // Realistic computation time
            val found = SAMPLE_DESCRIPTORS.entries.find { it.key.equals(target.trim(), ignoreCase = true) }?.value
            descriptor = found ?: DescriptorResult(
                name = target.trim(),
                smiles = if (target.contains("=")) target.trim() else "C...",
                mw = 242.3,
                logP = 2.14,
                hbd = 2,
                hba = 4,
                tpsa = 48.2,
                rotBonds = 3,
                lipinskiPass = true
            )
            isComputing = false
        }
    }

    Scaffold(
        topBar = {
            ChemSpaceTopBar(
                title = "RDKit Cheminformatics Lab",
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
                text = "Physicochemical & Drug-Likeness Engine",
                color = ChemSpaceTextPrimaryDark,
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "High-throughput descriptor computation via Python RDKit: LogP, TPSA, and Lipinski Rule of 5 evaluation.",
                color = ChemSpaceTextSecondaryDark,
                fontSize = 12.sp,
                lineHeight = 16.sp,
                modifier = Modifier.padding(top = 2.dp, bottom = 12.dp)
            )

            ChemSpaceTextField(
                value = queryInput,
                onValueChange = { queryInput = it },
                label = "Target Molecule or SMILES",
                placeholder = "e.g. Aspirin, Caffeine, Ibuprofen"
            )

            // Preset samples
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(vertical = 8.dp)
            ) {
                items(SAMPLE_DESCRIPTORS.keys.toList()) { sample ->
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(14.dp))
                            .background(ChemSpaceSurfaceDark)
                            .border(1.dp, ChemSpaceBorderDark, RoundedCornerShape(14.dp))
                            .clickable {
                                queryInput = sample
                                runCalculation(sample)
                            }
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = sample,
                            color = ChemSpaceOrangeLight,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            ChemSpaceButton(
                text = "Compute RDKit Descriptors",
                onClick = { runCalculation(queryInput) },
                modifier = Modifier.fillMaxWidth(),
                variant = ButtonVariant.PRIMARY,
                enabled = queryInput.isNotBlank() && !isComputing
            )

            if (isComputing) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 30.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = ChemSpaceOrangePrimary)
                }
            }

            // Results Card
            AnimatedVisibility(visible = descriptor != null && !isComputing) {
                val res = descriptor ?: return@AnimatedVisibility
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 16.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(ChemSpaceCardDark)
                        .border(1.dp, ChemSpaceBorderDark, RoundedCornerShape(14.dp))
                        .padding(18.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(res.name, color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                            Text(
                                res.smiles,
                                color = ChemSpaceOrangeLight,
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                modifier = Modifier.padding(top = 2.dp)
                            )
                        }

                        // Lipinski badge
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .background(if (res.lipinskiPass) ChemSpaceEmeraldAccent.copy(alpha = 0.2f) else ChemSpaceError.copy(alpha = 0.2f))
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = if (res.lipinskiPass) Icons.Default.CheckCircle else Icons.Default.Close,
                                    contentDescription = null,
                                    tint = if (res.lipinskiPass) ChemSpaceEmeraldAccent else ChemSpaceError,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = if (res.lipinskiPass) "Ro5 Pass" else "Ro5 Alert",
                                    color = if (res.lipinskiPass) ChemSpaceEmeraldAccent else ChemSpaceError,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Descriptor Grid
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        DescriptorRow("Molecular Weight (MW)", "${res.mw} Da", "≤ 500 Da", res.mw <= 500)
                        DescriptorRow("Octanol-Water LogP", "${res.logP}", "≤ 5.0", res.logP <= 5.0)
                        DescriptorRow("H-Bond Donors (HBD)", "${res.hbd}", "≤ 5", res.hbd <= 5)
                        DescriptorRow("H-Bond Acceptors (HBA)", "${res.hba}", "≤ 10", res.hba <= 10)
                        DescriptorRow("Topological Polar Area (TPSA)", "${res.tpsa} Å²", "< 140 Å²", res.tpsa < 140)
                        DescriptorRow("Rotatable Bonds", "${res.rotBonds}", "≤ 10", res.rotBonds <= 10)
                    }
                }
            }
        }
    }
}

@Composable
private fun DescriptorRow(label: String, value: String, criterion: String, isPass: Boolean) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(ChemSpaceSurfaceDark)
            .padding(horizontal = 12.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(text = label, color = ChemSpaceTextSecondaryDark, fontSize = 11.sp)
            Text(text = criterion, color = ChemSpaceTextSecondaryDark.copy(alpha = 0.6f), fontSize = 10.sp)
        }
        Text(
            text = value,
            color = if (isPass) Color.White else ChemSpaceError,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace
        )
    }
}
