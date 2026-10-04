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
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Search
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
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chemspace.app.data.repository.ChemistryRepository
import com.chemspace.app.domain.model.Molecule
import com.chemspace.app.ui.components.ButtonVariant
import com.chemspace.app.ui.components.ChemSpaceButton
import com.chemspace.app.ui.components.ChemSpaceTextField
import com.chemspace.app.ui.components.ChemSpaceTopBar
import com.chemspace.app.ui.theme.ChemSpaceBackgroundDark
import com.chemspace.app.ui.theme.ChemSpaceBorderDark
import com.chemspace.app.ui.theme.ChemSpaceBorderSubtleDark
import com.chemspace.app.ui.theme.ChemSpaceCardDark
import com.chemspace.app.ui.theme.ChemSpaceEmeraldAccent
import com.chemspace.app.ui.theme.ChemSpaceError
import com.chemspace.app.ui.theme.ChemSpaceOrangeLight
import com.chemspace.app.ui.theme.ChemSpaceOrangePrimary
import com.chemspace.app.ui.theme.ChemSpaceSurfaceDark
import com.chemspace.app.ui.theme.ChemSpaceSurfaceElevatedDark
import com.chemspace.app.ui.theme.ChemSpaceTextPrimaryDark
import com.chemspace.app.ui.theme.ChemSpaceTextSecondaryDark
import kotlinx.coroutines.launch

@Composable
fun ChemistrySearchScreen(
    repository: ChemistryRepository,
    onNavigateBack: () -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var resolvedMolecule by remember { mutableStateOf<Molecule?>(null) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val clipboardManager = LocalClipboardManager.current
    val focusManager = LocalFocusManager.current

    val quickQueries = listOf("Aspirin", "Caffeine", "Benzene", "Paracetamol", "Ethanol", "Glucose", "Ibuprofen")

    fun performSearch(query: String) {
        if (query.isBlank()) return
        focusManager.clearFocus()
        isLoading = true
        errorMessage = null
        scope.launch {
            val result = repository.resolveMolecule(query)
            result.fold(
                onSuccess = { mol ->
                    resolvedMolecule = mol
                    isLoading = false
                },
                onFailure = { err ->
                    errorMessage = err.message ?: "Molecule not found."
                    isLoading = false
                }
            )
        }
    }

    Scaffold(
        topBar = {
            ChemSpaceTopBar(
                title = "Chemistry Search • Resolver",
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
                text = "Molecular Resolver & CIR Gateway",
                color = ChemSpaceTextPrimaryDark,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Search canonical chemical names, IUPAC nomenclature, or SMILES to resolve 2D/3D structures and molecular descriptors.",
                color = ChemSpaceTextSecondaryDark,
                fontSize = 12.sp,
                lineHeight = 16.sp,
                modifier = Modifier.padding(top = 4.dp, bottom = 14.dp)
            )

            // Search Bar
            ChemSpaceTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                label = "Chemical Query",
                placeholder = "e.g. Aspirin, C9H8O4, CC(=O)Oc1ccccc1C(=O)O",
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = null,
                        tint = ChemSpaceTextSecondaryDark,
                        modifier = Modifier.size(18.dp)
                    )
                },
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                keyboardActions = KeyboardActions(onSearch = { performSearch(searchQuery) })
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Quick suggestion chips
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(vertical = 4.dp)
            ) {
                items(quickQueries) { item ->
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .background(ChemSpaceSurfaceDark)
                            .border(1.dp, ChemSpaceBorderDark, RoundedCornerShape(16.dp))
                            .clickable {
                                searchQuery = item
                                performSearch(item)
                            }
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = item,
                            color = ChemSpaceOrangeLight,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            ChemSpaceButton(
                text = "Resolve Chemical Structure",
                onClick = { performSearch(searchQuery) },
                modifier = Modifier.fillMaxWidth(),
                variant = ButtonVariant.PRIMARY,
                enabled = searchQuery.isNotBlank() && !isLoading
            )

            if (isLoading) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = ChemSpaceOrangePrimary)
                }
            }

            if (errorMessage != null) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 16.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color(0x22EF4444))
                        .border(1.dp, ChemSpaceError, RoundedCornerShape(10.dp))
                        .padding(14.dp)
                ) {
                    Text(
                        text = errorMessage ?: "",
                        color = ChemSpaceError,
                        fontSize = 13.sp
                    )
                }
            }

            // Results Card
            AnimatedVisibility(visible = resolvedMolecule != null && !isLoading) {
                val mol = resolvedMolecule ?: return@AnimatedVisibility
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 20.dp)
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
                            Text(
                                text = mol.name,
                                color = Color.White,
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = mol.iupac,
                                color = ChemSpaceEmeraldAccent,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                modifier = Modifier.padding(top = 2.dp)
                            )
                        }

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(ChemSpaceOrangePrimary.copy(alpha = 0.15f))
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = mol.formula,
                                color = ChemSpaceOrangeLight,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

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
                                Text("Molar Mass", color = ChemSpaceTextSecondaryDark, fontSize = 11.sp)
                                Text("${mol.molecularWeight} g/mol", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            }
                        }

                        if (!mol.cas.isNullOrBlank()) {
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(ChemSpaceSurfaceDark)
                                    .padding(10.dp)
                            ) {
                                Column {
                                    Text("CAS Registry", color = ChemSpaceTextSecondaryDark, fontSize = 11.sp)
                                    Text(mol.cas, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Canonical SMILES block with Copy Action
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(ChemSpaceSurfaceDark)
                            .padding(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Canonical SMILES",
                                color = ChemSpaceTextSecondaryDark,
                                fontSize = 11.sp,
                                modifier = Modifier.weight(1f)
                            )
                            Row(
                                modifier = Modifier.clickable {
                                    clipboardManager.setText(AnnotatedString(mol.smiles))
                                },
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ContentCopy,
                                    contentDescription = "Copy SMILES",
                                    tint = ChemSpaceOrangeLight,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Copy", color = ChemSpaceOrangeLight, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }

                        Text(
                            text = mol.smiles,
                            color = ChemSpaceOrangeLight,
                            fontSize = 12.sp,
                            fontFamily = FontFamily.Monospace,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }

                    if (mol.description.isNotBlank()) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = mol.description,
                            color = ChemSpaceTextSecondaryDark,
                            fontSize = 12.sp,
                            lineHeight = 16.sp
                        )
                    }
                }
            }
        }
    }
}
