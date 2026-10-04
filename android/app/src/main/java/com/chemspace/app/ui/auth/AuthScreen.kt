package com.chemspace.app.ui.auth

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chemspace.app.ui.components.ButtonVariant
import com.chemspace.app.ui.components.ChemSpaceButton
import com.chemspace.app.ui.components.ChemSpaceLogoMark
import com.chemspace.app.ui.components.ChemSpaceTextField
import com.chemspace.app.ui.components.MolecularBackgroundCanvas
import com.chemspace.app.ui.theme.ChemSpaceBackgroundDark
import com.chemspace.app.ui.theme.ChemSpaceBorderDark
import com.chemspace.app.ui.theme.ChemSpaceCardDark
import com.chemspace.app.ui.theme.ChemSpaceError
import com.chemspace.app.ui.theme.ChemSpaceOrangePrimary
import com.chemspace.app.ui.theme.ChemSpaceSurfaceElevatedDark
import com.chemspace.app.ui.theme.ChemSpaceTextPrimaryDark
import com.chemspace.app.ui.theme.ChemSpaceTextSecondaryDark
import kotlinx.coroutines.flow.collectLatest

@Composable
fun AuthScreen(
    viewModel: AuthViewModel,
    onAuthSuccess: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val focusManager = LocalFocusManager.current
    val scrollState = rememberScrollState()

    LaunchedEffect(viewModel) {
        viewModel.loginSuccessEvent.collectLatest {
            onAuthSuccess()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(ChemSpaceBackgroundDark)
    ) {
        MolecularBackgroundCanvas(
            modifier = Modifier.fillMaxSize(),
            particleCount = 14,
            isAnimated = true
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .imePadding()
                .verticalScroll(scrollState)
                .padding(horizontal = 24.dp, vertical = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Spacer(modifier = Modifier.height(20.dp))

            // ChemSpace Logo
            ChemSpaceLogoMark(size = 56.dp, animated = false)

            Spacer(modifier = Modifier.height(14.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "Chem",
                    color = Color.White,
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Space",
                    color = ChemSpaceOrangePrimary,
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Text(
                text = "Computational Chemistry Platform",
                color = ChemSpaceTextSecondaryDark,
                fontSize = 13.sp,
                fontWeight = FontWeight.Normal,
                modifier = Modifier.padding(top = 4.dp, bottom = 28.dp)
            )

            // Auth Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(ChemSpaceCardDark)
                    .padding(20.dp)
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    // Mode Toggle (Login vs Signup)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(ChemSpaceBackgroundDark)
                            .padding(4.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (uiState.mode == AuthMode.LOGIN) ChemSpaceSurfaceElevatedDark else Color.Transparent)
                                .clickable { viewModel.setMode(AuthMode.LOGIN) },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Sign In",
                                color = if (uiState.mode == AuthMode.LOGIN) ChemSpaceOrangePrimary else ChemSpaceTextSecondaryDark,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }

                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (uiState.mode == AuthMode.SIGNUP) ChemSpaceSurfaceElevatedDark else Color.Transparent)
                                .clickable { viewModel.setMode(AuthMode.SIGNUP) },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Create Account",
                                color = if (uiState.mode == AuthMode.SIGNUP) ChemSpaceOrangePrimary else ChemSpaceTextSecondaryDark,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    if (uiState.mode == AuthMode.LOGIN) {
                        // Identifier field
                        ChemSpaceTextField(
                            value = uiState.identifier,
                            onValueChange = { viewModel.onIdentifierChange(it) },
                            label = "Email or Username",
                            placeholder = "scientist@chemspace.org",
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Default.Email,
                                    contentDescription = null,
                                    tint = ChemSpaceTextSecondaryDark,
                                    modifier = Modifier.size(18.dp)
                                )
                            },
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Email,
                                imeAction = ImeAction.Next
                            )
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        // Password field
                        ChemSpaceTextField(
                            value = uiState.password,
                            onValueChange = { viewModel.onPasswordChange(it) },
                            label = "Password",
                            placeholder = "Enter your password",
                            isPassword = true,
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Default.Lock,
                                    contentDescription = null,
                                    tint = ChemSpaceTextSecondaryDark,
                                    modifier = Modifier.size(18.dp)
                                )
                            },
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Password,
                                imeAction = ImeAction.Done
                            ),
                            keyboardActions = KeyboardActions(
                                onDone = {
                                    focusManager.clearFocus()
                                    viewModel.submit()
                                }
                            )
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        // Forgot Password Link
                        Box(
                            modifier = Modifier.fillMaxWidth(),
                            contentAlignment = Alignment.CenterEnd
                        ) {
                            Text(
                                text = "Forgot password?",
                                color = ChemSpaceTextSecondaryDark,
                                fontSize = 12.sp,
                                modifier = Modifier
                                    .padding(vertical = 4.dp)
                                    .clickable { /* Reset password flow */ }
                            )
                        }
                    } else {
                        // SIGNUP FORM
                        ChemSpaceTextField(
                            value = uiState.username,
                            onValueChange = { viewModel.onUsernameChange(it) },
                            label = "Scientist / User Name",
                            placeholder = "m_curie",
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Default.Person,
                                    contentDescription = null,
                                    tint = ChemSpaceTextSecondaryDark,
                                    modifier = Modifier.size(18.dp)
                                )
                            },
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next)
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        ChemSpaceTextField(
                            value = uiState.email,
                            onValueChange = { viewModel.onEmailChange(it) },
                            label = "Email Address",
                            placeholder = "curie@radium.org",
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Default.Email,
                                    contentDescription = null,
                                    tint = ChemSpaceTextSecondaryDark,
                                    modifier = Modifier.size(18.dp)
                                )
                            },
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Email,
                                imeAction = ImeAction.Next
                            )
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        ChemSpaceTextField(
                            value = uiState.password,
                            onValueChange = { viewModel.onPasswordChange(it) },
                            label = "Password (min 6 chars)",
                            placeholder = "Create a secure password",
                            isPassword = true,
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Default.Lock,
                                    contentDescription = null,
                                    tint = ChemSpaceTextSecondaryDark,
                                    modifier = Modifier.size(18.dp)
                                )
                            },
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Password,
                                imeAction = ImeAction.Done
                            ),
                            keyboardActions = KeyboardActions(
                                onDone = {
                                    focusManager.clearFocus()
                                    viewModel.submit()
                                }
                            )
                        )
                    }

                    // Error message
                    AnimatedVisibility(
                        visible = uiState.errorMessage != null,
                        enter = fadeIn(),
                        exit = fadeOut()
                    ) {
                        Text(
                            text = uiState.errorMessage ?: "",
                            color = ChemSpaceError,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(top = 10.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Action Button
                    ChemSpaceButton(
                        text = if (uiState.mode == AuthMode.LOGIN) "Sign In to ChemSpace" else "Register Scientist Account",
                        onClick = {
                            focusManager.clearFocus()
                            viewModel.submit()
                        },
                        modifier = Modifier.fillMaxWidth(),
                        variant = ButtonVariant.PRIMARY,
                        state = uiState.buttonState
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Footer
            Text(
                text = "Secure Scientific Computing • ChemSpace v1.0.0",
                color = ChemSpaceTextSecondaryDark.copy(alpha = 0.5f),
                fontSize = 11.sp
            )
        }
    }
}
